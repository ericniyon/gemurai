import { ReconciliationStatus } from "@prisma/client"
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
   * Uses commodity_collections (primary) + legacy milk/crop collections
   */
  static async reconcileCollections(
    mccId: string,
    periodId?: string
  ): Promise<ReconciliationResult> {
    const discrepancies: ReconciliationResult["discrepancies"] = []

    // 1. Commodity collections (primary model)
    const commodityCollections = await prisma.commodity_collections.findMany({
      where: {
        mccId,
        status: { in: ["APPROVED", "PENDING", "PAID"] },
        ...(periodId ? { periodId } : {}),
      },
    })

    // 2. Legacy milk + crop collections (optional - may be empty)
    let milkCollections: { totalAmount?: number; netPayment?: number }[] = []
    let cropCollections: { totalAmount?: number; netPayment?: number }[] = []
    try {
      milkCollections = await prisma.milk_collections.findMany({
        where: { mccId, ...(periodId ? { mccPeriodId: periodId } : {}) },
      })
      cropCollections = await prisma.crop_collections.findMany({
        where: { mccId, ...(periodId ? { cropPeriodId: periodId } : {}) },
      })
    } catch {
      // Legacy tables may not exist or have different schema
    }

    // Calculate expected totals
    const expectedCommodity = commodityCollections.reduce(
      (sum, c) => sum + (c.totalAmount || c.netPayment || 0),
      0
    )
    const expectedMilk = milkCollections.reduce(
      (sum, c) => sum + (c.totalAmount || c.netPayment || 0),
      0
    )
    const expectedCrop = cropCollections.reduce(
      (sum, c) => sum + (c.totalAmount || c.netPayment || 0),
      0
    )
    const totalExpected = expectedCommodity + expectedMilk + expectedCrop

    // Get actual payments (commodity + legacy)
    const payments = await prisma.mcc_payments.findMany({
      where: { mccId },
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

    // Check commodity collection vs payment matching
    for (const collection of commodityCollections) {
      const payment = payments.find((p) => p.commodityCollectionId === collection.id)
      const expectedAmount = collection.netPayment ?? collection.totalAmount ?? 0
      if (!payment) {
        if (expectedAmount > 0) {
          discrepancies.push({
            id: collection.id,
            type: "MISSING_PAYMENT",
            expected: expectedAmount,
            actual: 0,
            difference: expectedAmount,
            description: `Commodity collection ${collection.id} has no payment record`,
          })
        }
      } else if (Math.abs(expectedAmount - (payment.netPayment || 0)) > 0.01) {
        discrepancies.push({
          id: collection.id,
          type: "AMOUNT_MISMATCH",
          expected: expectedAmount,
          actual: payment.netPayment || 0,
          difference: expectedAmount - (payment.netPayment || 0),
          description: `Commodity collection ${collection.id} payment amount mismatch`,
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

    const moveWhere: { moveType: string; state: string; warehouseId?: string } = {
      moveType: "INCOMING",
      state: "DONE",
    }
    if (warehouseId) moveWhere.warehouseId = warehouseId

    const qtyWhere: { warehouseId?: string } = {}
    if (warehouseId) qtyWhere.warehouseId = warehouseId

    // Get stock moves
    const stockMoves = await prisma.stockMove.findMany({
      where: moveWhere,
      include: {
        product: true,
      },
    })

    // Get stock quantities
    const stockQuantities = await prisma.stockQuantity.findMany({
      where: qtyWhere,
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
    const totalExpected = Number.isFinite(result.totalExpected) ? result.totalExpected : 0
    const totalActual = Number.isFinite(result.totalActual) ? result.totalActual : 0
    const discrepancy = Number.isFinite(result.discrepancy) ? result.discrepancy : 0
    const hasDiscrepancies = result.discrepancies && result.discrepancies.length > 0
    const status = hasDiscrepancies ? ReconciliationStatus.PENDING : ReconciliationStatus.RESOLVED

    // Ensure discrepancies is JSON-serializable (no NaN, undefined, etc.)
    const discrepanciesJson = (result.discrepancies || []).map((d) => ({
      id: String(d.id),
      type: String(d.type),
      expected: Number.isFinite(d.expected) ? d.expected : 0,
      actual: Number.isFinite(d.actual) ? d.actual : 0,
      difference: Number.isFinite(d.difference) ? d.difference : 0,
      description: String(d.description || ""),
    }))

    return await prisma.reconciliation_records.create({
      data: {
        mccId,
        periodId: periodId || undefined,
        type,
        totalExpected,
        totalActual,
        discrepancy,
        discrepancies: discrepanciesJson,
        status,
        ...(!hasDiscrepancies && resolvedBy
          ? { resolvedBy, resolvedAt: new Date() }
          : {}),
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
