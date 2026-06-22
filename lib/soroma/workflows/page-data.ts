import { prisma } from "@/lib/database"
import type { SoromaSession } from "../auth"
import { getWorkflowTimeline } from "../workflow-events"
import { buildWorkflowItems } from "./apply"
import { getAvailableActions } from "./engine"
import { CAPA_TRANSITIONS } from "./compliance"
import { LOGISTICS_TRANSITIONS } from "./logistics"
import { ORDER_TRANSITIONS } from "./orders"
import { PROCUREMENT_TRANSITIONS } from "./procurement"
import { PRODUCTION_TRANSITIONS } from "./production"

export async function getProcurementWorkflowData(
  tenantId: string,
  session: SoromaSession
) {
  const pos = await prisma.soromaPurchaseOrder.findMany({
    where: { tenantId },
    include: { supplier: { select: { name: true } } },
    orderBy: { orderDate: "desc" },
    take: 15,
  })
  const items = buildWorkflowItems(
    pos,
    (p) => `${p.poNumber} · ${p.supplier.name}`,
    PROCUREMENT_TRANSITIONS,
    session,
    "SoromaPurchaseOrder"
  )
  const recentEvents = await prisma.soromaWorkflowEvent.findMany({
    where: { tenantId, entityType: "SoromaPurchaseOrder" },
    orderBy: { createdAt: "desc" },
    take: 8,
  })
  return { items, recentEvents }
}

export async function getProductionWorkflowData(
  tenantId: string,
  session: SoromaSession
) {
  const batches = await prisma.soromaProductionBatch.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
    take: 15,
  })
  const items = buildWorkflowItems(
    batches,
    (b) => b.batchNumber + (b.productName ? ` · ${b.productName}` : ""),
    PRODUCTION_TRANSITIONS,
    session,
    "SoromaProductionBatch"
  )
  const recentEvents = await prisma.soromaWorkflowEvent.findMany({
    where: { tenantId, entityType: "SoromaProductionBatch" },
    orderBy: { createdAt: "desc" },
    take: 8,
  })
  return { items, recentEvents }
}

export async function getLogisticsWorkflowData(
  tenantId: string,
  session: SoromaSession
) {
  const shipments = await prisma.soromaShipment.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
    take: 15,
  })
  const items = buildWorkflowItems(
    shipments,
    (s) => s.shipmentNumber,
    LOGISTICS_TRANSITIONS,
    session,
    "SoromaShipment"
  )
  const recentEvents = await prisma.soromaWorkflowEvent.findMany({
    where: { tenantId, entityType: "SoromaShipment" },
    orderBy: { createdAt: "desc" },
    take: 8,
  })
  return { items, recentEvents }
}

export async function getEntityTimeline(
  tenantId: string,
  entityType:
    | "SoromaPurchaseOrder"
    | "SoromaProductionBatch"
    | "SoromaShipment"
    | "SoromaCAPA",
  entityId: string
) {
  return getWorkflowTimeline(tenantId, entityType, entityId)
}

export async function getComplianceWorkflowData(
  tenantId: string,
  session: SoromaSession
) {
  const capas = await prisma.soromaCAPA.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
    take: 20,
  })
  const latestEvents = await prisma.soromaWorkflowEvent.findMany({
    where: { tenantId, entityType: "SoromaCAPA" },
    orderBy: { createdAt: "desc" },
    take: 100,
  })

  const stageMap = new Map<string, string>()
  for (const ev of latestEvents) {
    if (!stageMap.has(ev.entityId)) stageMap.set(ev.entityId, ev.toStatus)
  }

  const items = capas.map((c) => {
    const stage = stageMap.get(c.id) ?? (c.status === "RESOLVED" ? "CLOSED" : "OPEN")
    return {
      id: c.id,
      label: c.title,
      status: stage,
      entityType: "SoromaCAPA" as const,
      actions: getAvailableActions(stage, CAPA_TRANSITIONS, session),
    }
  })
  const recentEvents = latestEvents.slice(0, 10)
  return { items, recentEvents }
}

export async function getOrdersWorkflowData(tenantId: string, session: SoromaSession) {
  const orders = await prisma.soromaOrder.findMany({
    where: { tenantId },
    include: { buyer: { select: { name: true } } },
    orderBy: { orderDate: "desc" },
    take: 15,
  })
  const items = buildWorkflowItems(
    orders,
    (o) => `${o.orderNumber} · ${o.buyer.name}`,
    ORDER_TRANSITIONS,
    session,
    "SoromaOrder"
  )
  const recentEvents = await prisma.soromaWorkflowEvent.findMany({
    where: { tenantId, entityType: "SoromaOrder" },
    orderBy: { createdAt: "desc" },
    take: 8,
  })
  return { items, recentEvents }
}
