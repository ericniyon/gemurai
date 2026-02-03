import { PrismaClient } from "@prisma/client"
import { prisma } from "@/lib/prisma"

export interface CropCollectionInput {
  farmerId: string
  mccId: string
  cropPeriodId?: string
  collectionDate: Date
  cropTypeId: string
  quantity: number
  unit: string
  qualityTests?: {
    moisture?: number
    grade?: string
    foreignMatter?: number
    [key: string]: any
  }
  pricePerUnit: number
  deductions?: {
    products?: Array<{
      id: string
      productId: string
      productName: string
      quantity: number
      unitPrice: number
      totalPrice: number
    }>
    others?: {
      transport?: number
      storage?: number
      processing?: number
      [key: string]: number
    }
  }
  advances?: number
  warehouseId?: string
  locationId?: string
  productId?: string
  notes?: string
}

export interface CropQualityValidationResult {
  passed: boolean
  rejected: boolean
  qualityStatus: "pending" | "accepted" | "rejected"
  issues: string[]
  qualityScore?: number
}

export class CropCollectionService {
  /**
   * Validate crop quality based on quality tests
   */
  static validateQuality(
    qualityTests: CropCollectionInput["qualityTests"],
    cropType: any
  ): CropQualityValidationResult {
    const issues: string[] = []
    let qualityScore = 100

    if (!qualityTests) {
      return {
        passed: true,
        rejected: false,
        qualityStatus: "pending",
        issues: [],
      }
    }

    // Moisture content validation (common for grains)
    if (qualityTests.moisture != null) {
      const maxMoisture = (cropType?.qualityStandards as any)?.maxMoisture || 14
      if (qualityTests.moisture > maxMoisture) {
        issues.push(`Moisture content too high: ${qualityTests.moisture}% (max: ${maxMoisture}%)`)
        qualityScore -= 20
      }
    }

    // Grade validation
    if (qualityTests.grade) {
      const acceptableGrades = (cropType?.qualityStandards as any)?.acceptableGrades || ["A", "B"]
      if (!acceptableGrades.includes(qualityTests.grade)) {
        issues.push(`Grade not acceptable: ${qualityTests.grade}`)
        qualityScore -= 30
      }
    }

    // Foreign matter validation
    if (qualityTests.foreignMatter != null) {
      const maxForeignMatter = (cropType?.qualityStandards as any)?.maxForeignMatter || 2
      if (qualityTests.foreignMatter > maxForeignMatter) {
        issues.push(`Foreign matter too high: ${qualityTests.foreignMatter}% (max: ${maxForeignMatter}%)`)
        qualityScore -= 15
      }
    }

    const rejected = qualityScore < 50
    const passed = issues.length === 0

    return {
      passed,
      rejected,
      qualityStatus: rejected ? "rejected" : passed ? "accepted" : "pending",
      issues,
      qualityScore,
    }
  }

  /**
   * Record crop collection
   */
  static async recordCollection(
    data: CropCollectionInput
  ): Promise<{
    collection: any
    qualityResult: CropQualityValidationResult
    payment?: any
  }> {
    return await prisma.$transaction(async (tx) => {
      // Get crop type
      const cropType = await tx.crop_types.findUnique({
        where: { id: data.cropTypeId },
      })

      if (!cropType) {
        throw new Error("Crop type not found")
      }

      // Validate quality
      const qualityResult = this.validateQuality(data.qualityTests, cropType)

      // Calculate amounts
      const totalAmount = data.quantity * data.pricePerUnit

      // Calculate deductions (ensure plain object for Prisma Json)
      const rawDeductions = data.deductions && typeof data.deductions === "object" ? data.deductions : {}
      const deductions =
        typeof rawDeductions === "object" && rawDeductions !== null
          ? (JSON.parse(JSON.stringify(rawDeductions)) as Record<string, unknown>)
          : {}
      const productDeductionsTotal =
        Array.isArray(deductions.products) &&
        deductions.products.every((p: any) => typeof p === "object" && p !== null)
          ? (deductions.products as any[]).reduce((sum, p) => sum + (p.totalPrice || 0), 0)
          : 0
      const othersTotal =
        deductions.others && typeof deductions.others === "object" && !Array.isArray(deductions.others)
          ? Object.values(deductions.others as Record<string, unknown>).reduce(
              (sum: number,
              amount: unknown) => sum + (typeof amount === "number" ? amount : 0),
              0
            )
          : 0
      const totalDeductions = productDeductionsTotal + othersTotal
      const advances = data.advances || 0
      const netPayment = totalAmount - totalDeductions - advances

      // Determine status
      const status = qualityResult.rejected
        ? "REJECTED"
        : qualityResult.passed
        ? "APPROVED"
        : "PENDING"

      // Normalize qualityTests for Prisma Json
      const qualityTestsJson =
        data.qualityTests && typeof data.qualityTests === "object"
          ? (JSON.parse(JSON.stringify(data.qualityTests)) as Record<string, unknown>)
          : {}

      // Create crop collection
      const collection = await tx.crop_collections.create({
        data: {
          farmerId: data.farmerId,
          mccId: data.mccId,
          cropPeriodId: data.cropPeriodId ?? null,
          collectionDate: data.collectionDate,
          cropTypeId: data.cropTypeId,
          quantity: data.quantity,
          unit: data.unit,
          qualityTests: qualityTestsJson,
          pricePerUnit: data.pricePerUnit,
          totalAmount,
          deductions,
          advances,
          totalDeductions,
          netPayment,
          status,
          warehouseId: data.warehouseId ?? null,
          locationId: data.locationId ?? null,
          productId: data.productId ?? null,
          notes: data.notes ?? null,
        },
        include: {
          farmer: true,
          mcc: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          cropType: true,
        },
      })

      // Create stock move only when warehouse, product, and createdByUserId are provided (createdBy must be User id)
      if (data.warehouseId && data.productId && (data as any).createdByUserId) {
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
            reference: `CROP-${collection.id}`,
            notes: `Crop collection: ${cropType.name}`,
            createdBy: (data as any).createdByUserId,
          },
        })
        await tx.crop_collections.update({
          where: { id: collection.id },
          data: { stockMoveId: stockMove.id },
        })
      }

      // Update farmer account if not rejected
      if (!qualityResult.rejected && netPayment > 0) {
        await this.updateFarmerAccount(tx, data.farmerId, netPayment, "CROP_COLLECTION", collection.id)
      }

      return {
        collection,
        qualityResult,
      }
    })
  }

  /**
   * Update farmer account and ledger
   */
  static async updateFarmerAccount(
    tx: PrismaClient | typeof prisma,
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
        notes: `Crop collection: ${type}`,
      },
    })
  }

  /**
   * Get crop collections for MCC
   */
  static async getMCCCropCollections(mccId: string, filters?: {
    farmerId?: string
    cropTypeId?: string
    status?: string
    startDate?: Date
    endDate?: Date
  }) {
    const where: any = { mccId }

    if (filters?.farmerId) where.farmerId = filters.farmerId
    if (filters?.cropTypeId) where.cropTypeId = filters.cropTypeId
    if (filters?.status) where.status = filters.status
    if (filters?.startDate || filters?.endDate) {
      where.collectionDate = {}
      if (filters.startDate) where.collectionDate.gte = filters.startDate
      if (filters.endDate) where.collectionDate.lte = filters.endDate
    }

    return await prisma.crop_collections.findMany({
      where,
      include: {
        farmer: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        cropType: true,
        mcc: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
      orderBy: { collectionDate: "desc" },
    })
  }

  /**
   * List crop periods for an MCC
   */
  static async getCropPeriods(mccId: string) {
    return await prisma.crop_periods.findMany({
      where: { mccId },
      orderBy: [{ startDate: "desc" }, { periodNumber: "desc" }],
    })
  }

  /**
   * Create crop period
   */
  static async createCropPeriod(
    mccId: string,
    periodNumber: number,
    startDate: Date,
    endDate: Date
  ) {
    return await prisma.crop_periods.create({
      data: {
        mccId,
        periodNumber,
        startDate,
        endDate,
        status: "ACTIVE",
      },
    })
  }

  /**
   * Get crop types
   */
  static async getCropTypes(activeOnly: boolean = true) {
    return await prisma.crop_types.findMany({
      where: activeOnly ? { isActive: true } : {},
      orderBy: { name: "asc" },
    })
  }
}
