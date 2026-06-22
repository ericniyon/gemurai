import { prisma } from "@/lib/database"
import { logSoromaAudit } from "./audit"

/** When a batch completes, create inventory lots, traceability events, and audit records. */
export async function applyProductionCompletionEffects(
  tenantId: string,
  batchId: string,
  userId: string
) {
  const batch = await prisma.soromaProductionBatch.findFirst({
    where: { id: batchId, tenantId },
    include: { line: true },
  })
  if (!batch) return

  const warehouse = await prisma.soromaWarehouse.findFirst({
    where: { tenantId },
    orderBy: { createdAt: "asc" },
  })

  const skuCode = batch.productName
    ? batch.productName.replace(/\s+/g, "-").toUpperCase().slice(0, 20)
    : `BATCH-${batch.batchNumber}`
  const outputQty = batch.outputQty ?? batch.expectedQty ?? 100

  const existingLot = await prisma.soromaStockLot.findFirst({
    where: { tenantId, batchId: batch.id },
  })

  let stockLotId = existingLot?.id

  if (!existingLot) {
    const stockLot = await prisma.soromaStockLot.create({
      data: {
        tenantId,
        warehouseId: warehouse?.id,
        skuCode,
        skuName: batch.productName ?? batch.batchNumber,
        category: "FINISHED",
        quantity: outputQty,
        availableQty: outputQty,
        committedQty: 0,
        batchId: batch.id,
        status: "AVAILABLE",
      },
    })
    stockLotId = stockLot.id

    await prisma.soromaFinishedSkuLot.create({
      data: {
        tenantId,
        batchId: batch.id,
        skuCode,
        skuName: batch.productName ?? batch.batchNumber,
        quantity: outputQty,
        stockLotId: stockLot.id,
      },
    })

    await prisma.soromaStockMovement.create({
      data: {
        tenantId,
        stockLotId: stockLot.id,
        movementType: "IN",
        quantity: outputQty,
        reference: `Production batch ${batch.batchNumber}`,
        createdById: userId,
      },
    })
  }

  const passport = await prisma.soromaPassport.findFirst({
    where: { tenantId, batchId: batch.id },
  })

  if (!passport) {
    const passportNo = `PP-${batch.batchNumber}`
    const created = await prisma.soromaPassport.create({
      data: {
        tenantId,
        batchId: batch.id,
        passportNo,
        status: "ISSUED",
        issuedAt: new Date(),
        issuedById: userId,
        qrCode: `/api/v1/soroma/verify/${passportNo}?tenantId=${tenantId}`,
        version: 1,
      },
    })

    await prisma.soromaTraceabilityEvent.create({
      data: {
        tenantId,
        passportId: created.id,
        eventType: "PASSPORT_ISSUED",
        entityType: "SoromaProductionBatch",
        entityId: batch.id,
        payload: { batchNumber: batch.batchNumber, stockLotId },
      },
    })
  } else {
    await prisma.soromaTraceabilityEvent.create({
      data: {
        tenantId,
        passportId: passport.id,
        eventType: "BATCH_COMPLETED",
        entityType: "SoromaProductionBatch",
        entityId: batch.id,
        payload: { batchNumber: batch.batchNumber, stockLotId },
      },
    })
  }

  await logSoromaAudit({
    userId,
    tenantId,
    workspaceType: "TENANT",
    action: "production.batch.completed",
    entityType: "SoromaProductionBatch",
    entityId: batch.id,
    afterState: { status: "COMPLETED", stockLotId, outputQty },
  })
}
