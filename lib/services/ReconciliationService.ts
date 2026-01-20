import { PrismaClient } from "@prisma/client"
import { prisma } from "@/lib/prisma"

export interface ReconciliationResult {
  type: "COLLECTION" | "PAYMENT" | "INVENTORY" | "PERIOD"
  totalExpected: number
  totalActual: number
  discrepancy: number
  discrepancies: Array<{
    id: string
    type: string
    expected: number
    actual: number
    difference: number
    description: string
  }>
}

export class ReconciliationService {
  /**
   * Reconcile collections for a period
   */
  static async reconcileCollections(
    mccId: string,
    periodId?: string
  ): Promise<ReconciliationResult> {
    const discrepancies: ReconciliationResult["discrepancies"] = []

    // Get milk collections
    const milkCollections = await prisma.milk_collections.findMany({
      where: {
        mccId,
        ...(periodId ? { mccPeriodId: periodId } : {}),
      },
    })

    // Get crop collections
    const cropCollections = await prisma.crop_collections.findMany({
      where: {
        mccId,
        ...(periodId ? { cropPeriodId: periodId } : {}),
      },
    })

    // Calculate expected totals
    const expectedMilkTotal = milkCollections.reduce(
      (sum, c) => sum + (c.totalAmount || 0),
      0
    )
    const expectedCropTotal = cropCollections.reduce(
      (sum, c) => sum + (c.totalAmount || 0),
      0
    )
    const totalExpected = expectedMilkTotal + expectedCropTotal

    // Get actual payments
    const payments = await prisma.mcc_payments.findMany({
      where: {
        mccId,
        ...(periodId
          ? {
              milk_collections: {
                mccPeriodId: periodId,
              },
            }
          : {}),
      },
    })

    const totalActual = payments.reduce((sum, p) => sum + (p.netPayment || 0), 0)

    // Find discrepancies
    const discrepancy = totalExpected - totalActual

    if (Math.abs(discrepancy) > 0.01) {
      discrepancies.push({
        id: "total",
        type: "TOTAL",
        expected: totalExpected,
        actual: totalActual,
        difference: discrepancy,
        description: `Total collection vs payment discrepancy`,
      })
    }

    // Check individual collection vs payment matching
    for (const collection of milkCollections) {
      const payment = payments.find((p) => p.collectionId === collection.id)
      if (!payment) {
        discrepancies.push({
          id: collection.id,
          type: "MISSING_PAYMENT",
          expected: collection.netPayment || 0,
          actual: 0,
          difference: collection.netPayment || 0,
          description: `Milk collection ${collection.id} has no payment record`,
        })
      } else if (Math.abs((collection.netPayment || 0) - (payment.netPayment || 0)) > 0.01) {
        discrepancies.push({
          id: collection.id,
          type: "AMOUNT_MISMATCH",
          expected: collection.netPayment || 0,
          actual: payment.netPayment || 0,
          difference: (collection.netPayment || 0) - (payment.netPayment || 0),
          description: `Milk collection ${collection.id} payment amount mismatch`,
        })
      }
    }

    return {
      type: "COLLECTION",
      totalExpected,
      totalActual,
      discrepancy,
      discrepancies,
    }
  }

  /**
   * Reconcile inventory
   */
  static async reconcileInventory(
    mccId: string,
    warehouseId?: string
  ): Promise<ReconciliationResult> {
    const discrepancies: ReconciliationResult["discrepancies"] = []

    // Get stock moves for MCC
    const stockMoves = await prisma.stockMove.findMany({
      where: {
        warehouseId: warehouseId || undefined,
        moveType: "INCOMING",
        state: "DONE",
      },
      include: {
        product: true,
      },
    })

    // Get stock quantities
    const stockQuantities = await prisma.stockQuantity.findMany({
      where: {
        warehouseId: warehouseId || undefined,
      },
      include: {
        product: true,
      },
    })

    // Calculate expected inventory from moves
    const expectedInventory = new Map<string, number>()
    stockMoves.forEach((move) => {
      const key = move.productId
      expectedInventory.set(
        key,
        (expectedInventory.get(key) || 0) + move.quantity
      )
    })

    // Calculate actual inventory from quantities
    const actualInventory = new Map<string, number>()
    stockQuantities.forEach((sq) => {
      actualInventory.set(sq.productId, sq.quantity)
    })

    // Find discrepancies
    let totalExpected = 0
    let totalActual = 0

    expectedInventory.forEach((expected, productId) => {
      const actual = actualInventory.get(productId) || 0
      totalExpected += expected
      totalActual += actual

      if (Math.abs(expected - actual) > 0.01) {
        discrepancies.push({
          id: productId,
          type: "INVENTORY_MISMATCH",
          expected,
          actual,
          difference: expected - actual,
          description: `Product ${productId} inventory mismatch`,
        })
      }
    })

    return {
      type: "INVENTORY",
      totalExpected,
      totalActual,
      discrepancy: totalExpected - totalActual,
      discrepancies,
    }
  }

  /**
   * Create reconciliation record
   */
  static async createReconciliationRecord(
    mccId: string,
    periodId: string | null,
    type: "COLLECTION" | "PAYMENT" | "INVENTORY" | "PERIOD",
    result: ReconciliationResult,
    resolvedBy?: string
  ) {
    return await prisma.reconciliation_records.create({
      data: {
        mccId,
        periodId: periodId || undefined,
        type,
        totalExpected: result.totalExpected,
        totalActual: result.totalActual,
        discrepancy: result.discrepancy,
        discrepancies: result.discrepancies as any,
        status: result.discrepancies.length === 0 ? "RESOLVED" : "PENDING",
        resolvedBy: resolvedBy || undefined,
        resolvedAt: result.discrepancies.length === 0 ? new Date() : undefined,
      },
    })
  }

  /**
   * Get reconciliation records
   */
  static async getReconciliationRecords(filters?: {
    mccId?: string
    type?: string
    status?: string
    startDate?: Date
    endDate?: Date
  }) {
    const where: any = {}

    if (filters?.mccId) where.mccId = filters.mccId
    if (filters?.type) where.type = filters.type
    if (filters?.status) where.status = filters.status
    if (filters?.startDate || filters?.endDate) {
      where.reconciliationDate = {}
      if (filters.startDate) where.reconciliationDate.gte = filters.startDate
      if (filters.endDate) where.reconciliationDate.lte = filters.endDate
    }

    return await prisma.reconciliation_records.findMany({
      where,
      include: {
        mcc: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        resolvedByUser: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { reconciliationDate: "desc" },
    })
  }
}
