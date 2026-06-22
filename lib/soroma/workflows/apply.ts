import { prisma } from "@/lib/database"
import type { SoromaSession } from "../auth"
import { permissionSatisfies } from "../permissions"
import { recordWorkflowEvent } from "../workflow-events"
import { getAvailableActions, resolveTransition } from "./engine"
import { CAPA_TRANSITIONS } from "./compliance"
import { LOGISTICS_TRANSITIONS } from "./logistics"
import { ORDER_TRANSITIONS } from "./orders"
import { PROCUREMENT_TRANSITIONS } from "./procurement"
import { PRODUCTION_TRANSITIONS } from "./production"
import type { WorkflowEntityType, WorkflowTransition } from "./types"

export async function applyPurchaseOrderTransition(
  tenantId: string,
  poId: string,
  action: string,
  session: SoromaSession,
  comment?: string
) {
  const po = await prisma.soromaPurchaseOrder.findFirst({
    where: { id: poId, tenantId },
  })
  if (!po) return { ok: false as const, error: "Purchase order not found", status: 404 }

  const resolved = resolveTransition(po.status, action, PROCUREMENT_TRANSITIONS)
  if (!resolved.ok) return { ok: false as const, error: resolved.error, status: 400 }

  if (
    resolved.transition.permission &&
    !permissionSatisfies(session.permissions, resolved.transition.permission)
  ) {
    return { ok: false as const, error: "Insufficient permissions", status: 403 }
  }

  const updated = await prisma.soromaPurchaseOrder.update({
    where: { id: poId },
    data: { status: resolved.to as typeof po.status },
    include: { supplier: { select: { name: true } } },
  })

  await recordWorkflowEvent({
    tenantId,
    entityType: "SoromaPurchaseOrder",
    entityId: poId,
    fromStatus: po.status,
    toStatus: resolved.to,
    action,
    userId: session.userId,
    comment,
  })

  return {
    ok: true as const,
    entity: updated,
    actions: getAvailableActions(updated.status, PROCUREMENT_TRANSITIONS, session),
  }
}

export async function applyProductionBatchTransition(
  tenantId: string,
  batchId: string,
  action: string,
  session: SoromaSession,
  comment?: string
) {
  const batch = await prisma.soromaProductionBatch.findFirst({
    where: { id: batchId, tenantId },
  })
  if (!batch) return { ok: false as const, error: "Batch not found", status: 404 }

  const resolved = resolveTransition(batch.status, action, PRODUCTION_TRANSITIONS)
  if (!resolved.ok) return { ok: false as const, error: resolved.error, status: 400 }

  if (
    resolved.transition.permission &&
    !permissionSatisfies(session.permissions, resolved.transition.permission)
  ) {
    return { ok: false as const, error: "Insufficient permissions", status: 403 }
  }

  const now = new Date()
  const data: {
    status: typeof batch.status
    startedAt?: Date
    completedAt?: Date
  } = { status: resolved.to as typeof batch.status }

  if (resolved.to === "STARTED" || resolved.to === "IN_PROGRESS") {
    data.startedAt = batch.startedAt ?? now
  }
  if (resolved.to === "COMPLETED" || resolved.to === "ARCHIVED") {
    data.completedAt = now
  }

  const updated = await prisma.soromaProductionBatch.update({
    where: { id: batchId },
    data,
  })

  await recordWorkflowEvent({
    tenantId,
    entityType: "SoromaProductionBatch",
    entityId: batchId,
    fromStatus: batch.status,
    toStatus: resolved.to,
    action,
    userId: session.userId,
    comment,
  })

  if (resolved.to === "COMPLETED") {
    const { applyProductionCompletionEffects } = await import("../production-effects")
    await applyProductionCompletionEffects(tenantId, batchId, session.userId)
  }

  return {
    ok: true as const,
    entity: updated,
    actions: getAvailableActions(updated.status, PRODUCTION_TRANSITIONS, session),
  }
}

export async function applyShipmentTransition(
  tenantId: string,
  shipmentId: string,
  action: string,
  session: SoromaSession,
  comment?: string
) {
  const shipment = await prisma.soromaShipment.findFirst({
    where: { id: shipmentId, tenantId },
  })
  if (!shipment) return { ok: false as const, error: "Shipment not found", status: 404 }

  const resolved = resolveTransition(shipment.status, action, LOGISTICS_TRANSITIONS)
  if (!resolved.ok) return { ok: false as const, error: resolved.error, status: 400 }

  if (
    resolved.transition.permission &&
    !permissionSatisfies(session.permissions, resolved.transition.permission)
  ) {
    return { ok: false as const, error: "Insufficient permissions", status: 403 }
  }

  const now = new Date()
  const data: {
    status: typeof shipment.status
    dispatchAt?: Date
    deliveredAt?: Date
    podStatus?: string
  } = { status: resolved.to as typeof shipment.status }

  if (resolved.to === "IN_TRANSIT") data.dispatchAt = shipment.dispatchAt ?? now
  if (resolved.to === "DELIVERED") data.deliveredAt = now
  if (resolved.to === "POD_RECEIVED") data.podStatus = "RECEIVED"

  const updated = await prisma.soromaShipment.update({
    where: { id: shipmentId },
    data,
  })

  await recordWorkflowEvent({
    tenantId,
    entityType: "SoromaShipment",
    entityId: shipmentId,
    fromStatus: shipment.status,
    toStatus: resolved.to,
    action,
    userId: session.userId,
    comment,
  })

  return {
    ok: true as const,
    entity: updated,
    actions: getAvailableActions(updated.status, LOGISTICS_TRANSITIONS, session),
  }
}

export async function applyOrderTransition(
  tenantId: string,
  orderId: string,
  action: string,
  session: SoromaSession,
  comment?: string
) {
  const order = await prisma.soromaOrder.findFirst({
    where: { id: orderId, tenantId },
    include: { lines: true },
  })
  if (!order) return { ok: false as const, error: "Order not found", status: 404 }

  const resolved = resolveTransition(order.status, action, ORDER_TRANSITIONS)
  if (!resolved.ok) return { ok: false as const, error: resolved.error, status: 400 }

  if (
    resolved.transition.permission &&
    !permissionSatisfies(session.permissions, resolved.transition.permission)
  ) {
    return { ok: false as const, error: "Insufficient permissions", status: 403 }
  }

  const fulfillmentMap: Record<string, string> = {
    QUOTED: "QUOTE_SENT",
    CONFIRMED: "CONFIRMED",
    IN_FULFILLMENT: "RESERVED",
    SHIPPED: "DISPATCHED",
    DELIVERED: "DELIVERED",
  }

  let fulfillmentStatus = fulfillmentMap[resolved.to] ?? order.fulfillmentStatus
  if (action === "invoice") fulfillmentStatus = "INVOICED"
  if (action === "mark_receivable") fulfillmentStatus = "RECEIVABLE"

  const updated = await prisma.soromaOrder.update({
    where: { id: orderId },
    data: {
      status: resolved.to === order.status ? order.status : (resolved.to as typeof order.status),
      fulfillmentStatus,
    },
  })

  if (action === "invoice") {
    const invoiceNo = `INV-${order.orderNumber}`
    const existing = await prisma.soromaInvoice.findFirst({
      where: { tenantId, orderId },
    })
    if (!existing) {
      await prisma.soromaInvoice.create({
        data: {
          tenantId,
          orderId,
          invoiceNo,
          amount: order.amount,
          currency: order.currency,
          status: "OPEN",
          dueDate: new Date(Date.now() + 30 * 86400000),
        },
      })
    }
  }

  if (action === "mark_receivable") {
    await prisma.soromaFinanceRecord.create({
      data: {
        tenantId,
        recordType: "RECEIVABLE",
        amount: order.amount,
        currency: order.currency,
        reference: order.orderNumber,
        orderId: order.id,
        dueDate: new Date(Date.now() + 30 * 86400000),
      },
    })
  }

  if (action === "reserve_inventory") {
    for (const line of order.lines) {
      const lots = await prisma.soromaStockLot.findMany({
        where: { tenantId, skuCode: line.skuCode, availableQty: { gt: 0 } },
        orderBy: { createdAt: "asc" },
        take: 1,
      })
      if (lots[0]) {
        const commit = Math.min(lots[0].availableQty, line.quantity)
        await prisma.soromaStockLot.update({
          where: { id: lots[0].id },
          data: {
            availableQty: lots[0].availableQty - commit,
            committedQty: lots[0].committedQty + commit,
          },
        })
      }
    }
  }

  await recordWorkflowEvent({
    tenantId,
    entityType: "SoromaOrder",
    entityId: orderId,
    fromStatus: order.status,
    toStatus: resolved.to,
    action,
    userId: session.userId,
    comment,
  })

  return {
    ok: true as const,
    entity: updated,
    actions: getAvailableActions(updated.status, ORDER_TRANSITIONS, session),
  }
}

export async function applyCapaTransition(
  tenantId: string,
  capaId: string,
  action: string,
  session: SoromaSession,
  comment?: string
) {
  const capa = await prisma.soromaCAPA.findFirst({
    where: { id: capaId, tenantId },
  })
  if (!capa) return { ok: false as const, error: "CAPA not found", status: 404 }

  const latest = await prisma.soromaWorkflowEvent.findFirst({
    where: { tenantId, entityType: "SoromaCAPA", entityId: capaId },
    orderBy: { createdAt: "desc" },
    select: { toStatus: true },
  })
  const currentStage =
    latest?.toStatus ?? (capa.status === "RESOLVED" ? "CLOSED" : "OPEN")

  const resolved = resolveTransition(currentStage, action, CAPA_TRANSITIONS)
  if (!resolved.ok) return { ok: false as const, error: resolved.error, status: 400 }

  if (
    resolved.transition.permission &&
    !permissionSatisfies(session.permissions, resolved.transition.permission)
  ) {
    return { ok: false as const, error: "Insufficient permissions", status: 403 }
  }

  const updated = await prisma.soromaCAPA.update({
    where: { id: capaId },
    data: {
      status: resolved.to === "CLOSED" ? "RESOLVED" : "IN_PROGRESS",
      closedAt: resolved.to === "CLOSED" ? new Date() : null,
      closedById: resolved.to === "CLOSED" ? session.userId : null,
    },
  })

  await recordWorkflowEvent({
    tenantId,
    entityType: "SoromaCAPA",
    entityId: capaId,
    fromStatus: currentStage,
    toStatus: resolved.to,
    action,
    userId: session.userId,
    comment,
  })

  return {
    ok: true as const,
    entity: updated,
    stage: resolved.to,
    actions: getAvailableActions(resolved.to, CAPA_TRANSITIONS, session),
  }
}

export function buildWorkflowItems<T extends { id: string; status: string }>(
  entities: T[],
  labelFn: (e: T) => string,
  transitions: WorkflowTransition[],
  session: SoromaSession,
  entityType: WorkflowEntityType
) {
  return entities.map((e) => ({
    id: e.id,
    label: labelFn(e),
    status: e.status,
    entityType,
    actions: getAvailableActions(e.status, transitions, session),
  }))
}
