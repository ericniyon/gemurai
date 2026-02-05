import { prisma } from "@/lib/prisma"
import { CommodityStudioService } from "./CommodityStudioService"
import { IDVerificationService } from "./IDVerificationService"
import { AgentPrepaymentService } from "./AgentPrepaymentService"

export interface CommodityCollectionInput {
  commodityId: string
  farmerId: string
  mccId: string
  periodId?: string
  collectionDate: Date
  quantity: number
  unit: string
  qualityData: Record<string, any>
  pricePerUnit: number
  deductions?: {
    products?: Array<{
      productId: string
      quantity: number
      unitPrice: number
      totalPrice: number
    }>
    others?: Record<string, number>
  }
  advances?: number
  agentAdvance?: number
  agentId?: string
  warehouseId?: string
  locationId?: string
  productId?: string
  createdByUserId?: string
  batchId?: string
  notes?: string
}

export class CommodityCollectionService {
  /**
   * Record commodity collection
   * Validation/prefetch runs outside transaction to avoid timeout; only DB writes run inside.
   */
  static async recordCollection(data: CommodityCollectionInput) {
    // --- Run validation and prefetch OUTSIDE transaction (avoids 5s timeout) ---
    const skipIdVerification = process.env.ALLOW_COLLECTION_WITHOUT_ID_VERIFICATION === "true"
    if (!skipIdVerification) {
      const paymentCheck = await IDVerificationService.canReceivePayment(
        "farmer",
        data.farmerId
      )
      if (!paymentCheck.allowed) {
        throw new Error(
          `Cannot record collection: ${paymentCheck.reason}. Please verify farmer's National ID first.`
        )
      }
    }

    const commodity = await prisma.commodities.findUnique({
      where: { id: data.commodityId },
      include: {
        qualityFields: { orderBy: { displayOrder: "asc" } },
      },
    })
    if (!commodity) {
      throw new Error("Commodity not found")
    }

    const qualityResult = await CommodityStudioService.validateQuality(
      data.commodityId,
      data.qualityData
    )

    const totalAmount = data.quantity * data.pricePerUnit * qualityResult.pricingMultiplier
    const deductions = data.deductions || {}
    const productDeductionsTotal = deductions.products
      ? deductions.products.reduce((sum, p) => sum + (p.totalPrice || 0), 0)
      : 0
    const othersTotal = deductions.others
      ? Object.values(deductions.others).reduce((sum: number, amount: any) => sum + (amount || 0), 0)
      : 0
    const totalDeductions = productDeductionsTotal + othersTotal
    const advances = data.advances || 0

    let agentAdvance = data.agentAdvance || 0
    const settledPrepayments: any[] = []
    try {
      const pendingPrepayments = await AgentPrepaymentService.getPendingPrepayments(
        data.farmerId,
        data.commodityId
      )
      if (pendingPrepayments.length > 0) {
        agentAdvance = pendingPrepayments.reduce((sum, p) => sum + p.amount, 0)
      }
    } catch (error) {
      console.error("Error fetching pending prepayments:", error)
    }

    const netPayment = totalAmount - totalDeductions - advances - agentAdvance
    const status = qualityResult.rejected
      ? "REJECTED"
      : qualityResult.passed
      ? "APPROVED"
      : "PENDING"

    // --- Transaction: only DB writes (fast, avoids timeout) ---
    return await prisma.$transaction(
      async (tx) => {
        const collection = await tx.commodity_collections.create({
        data: {
          commodityId: data.commodityId,
          farmerId: data.farmerId,
          mccId: data.mccId,
          periodId: data.periodId,
          collectionDate: data.collectionDate,
          quantity: data.quantity,
          unit: data.unit,
          qualityData: data.qualityData,
          qualityScore: qualityResult.qualityScore,
          pricePerUnit: data.pricePerUnit,
          totalAmount,
          deductions: deductions,
          advances,
          agentAdvance,
          totalDeductions,
          netPayment,
          status,
          warehouseId: data.warehouseId,
          locationId: data.locationId,
          productId: data.productId,
          agentId: data.agentId,
          batchId: data.batchId,
          notes: data.notes,
        },
        include: {
          commodity: {
            include: {
              category: true,
            },
          },
          farmer: {
            select: {
              id: true,
              name: true,
              phone: true,
            },
          },
          mcc: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      })

      // Create stock move if warehouse, product, and user specified; link to collection
      let stockMoveId: string | null = null
      if (data.warehouseId && data.productId && data.createdByUserId) {
        const stockMove = await tx.stockMove.create({
          data: {
            productId: data.productId,
            warehouseId: data.warehouseId,
            locationId: data.locationId ?? null,
            quantity: data.quantity,
            unitPrice: data.pricePerUnit,
            moveType: "INCOMING",
            state: "CONFIRMED",
            date: data.collectionDate,
            reference: `${commodity.code}-${collection.id}`,
            notes: `Commodity collection: ${commodity.name}`,
            createdBy: data.createdByUserId,
          },
        })
        stockMoveId = stockMove.id
        await tx.commodity_collections.update({
          where: { id: collection.id },
          data: { stockMoveId },
        })
      }

      // Note: Prepayment settlement happens after collection is created
      // This is handled by the API endpoint /api/v1/agent-prepayments/settle-collection
      // to avoid transaction conflicts

      // Update farmer account if not rejected
      if (!qualityResult.rejected && netPayment > 0) {
        await this.updateFarmerAccount(
          tx,
          data.farmerId,
          netPayment,
          "COMMODITY_COLLECTION",
          collection.id
        )
      }

        return {
          collection,
          qualityResult,
          settledPrepayments,
        }
      },
      { timeout: 15000 }
    )
  }

  /**
   * Update farmer account and ledger
   */
  static async updateFarmerAccount(
    tx: any,
    farmerId: string,
    amount: number,
    type: string,
    refId: string
  ) {
    // Get or create farmer account
    let farmerAccount = await tx.farmer_accounts.findUnique({
      where: { farmerId },
    })

    if (!farmerAccount) {
      farmerAccount = await tx.farmer_accounts.create({
        data: {
          farmerId,
          balance: 0,
        },
      })
    }

    // Update balance
    const newBalance = farmerAccount.balance + amount
    await tx.farmer_accounts.update({
      where: { farmerId },
      data: {
        balance: newBalance,
        lastUpdated: new Date(),
      },
    })

    // Create ledger entry
    await tx.farmer_ledger.create({
      data: {
        farmerId,
        type,
        amount,
        balanceAfter: newBalance,
        refId,
        notes: `Commodity collection: ${type}`,
      },
    })
  }

  /**
   * Get collections for MCC
   */
  static async getMCCCollections(mccId: string, filters?: {
    commodityId?: string
    farmerId?: string
    status?: string
    startDate?: Date
    endDate?: Date
  }) {
    const where: any = { mccId }

    if (filters?.commodityId) where.commodityId = filters.commodityId
    if (filters?.farmerId) where.farmerId = filters.farmerId
    if (filters?.status) where.status = filters.status
    if (filters?.startDate || filters?.endDate) {
      where.collectionDate = {}
      if (filters.startDate) where.collectionDate.gte = filters.startDate
      if (filters.endDate) where.collectionDate.lte = filters.endDate
    }

    return await prisma.commodity_collections.findMany({
      where,
      include: {
        commodity: {
          include: {
            category: true,
            qualityFields: { orderBy: { displayOrder: "asc" } },
          },
        },
        farmer: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        mcc: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        agent: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { collectionDate: "desc" },
    })
  }
}
