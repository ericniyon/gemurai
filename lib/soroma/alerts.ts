import { prisma } from "@/lib/database"
import { logSoromaAudit } from "./audit"

type AlertMetadata = {
  slaDueAt?: string
  escalationLevel?: number
  comments?: Array<{
    id: string
    text: string
    userId?: string
    createdAt: string
  }>
  evidence?: Array<{
    id: string
    label: string
    url: string
    note?: string
    userId?: string
    createdAt: string
  }>
  [key: string]: unknown
}

function asMetadata(value: unknown): AlertMetadata {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {}
  return { ...(value as AlertMetadata) }
}

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`
}

export async function addAlertComment(params: {
  alertId: string
  comment: string
  userId?: string
}) {
  const existing = await prisma.soromaAlert.findUnique({ where: { id: params.alertId } })
  if (!existing) return null

  const metadata = asMetadata(existing.metadata)
  const comments = metadata.comments ?? []
  comments.unshift({
    id: uid("cmt"),
    text: params.comment,
    userId: params.userId,
    createdAt: new Date().toISOString(),
  })

  const updated = await prisma.soromaAlert.update({
    where: { id: params.alertId },
    data: {
      metadata: { ...metadata, comments: comments.slice(0, 100) },
    },
  })

  await logSoromaAudit({
    userId: params.userId,
    tenantId: updated.tenantId ?? undefined,
    workspaceType: updated.scope,
    action: "alert.comment_added",
    entityType: "SoromaAlert",
    entityId: updated.id,
    afterState: { comment: params.comment },
  })

  return updated
}

export async function addAlertEvidence(params: {
  alertId: string
  label: string
  url: string
  note?: string
  userId?: string
}) {
  const existing = await prisma.soromaAlert.findUnique({ where: { id: params.alertId } })
  if (!existing) return null

  const metadata = asMetadata(existing.metadata)
  const evidence = metadata.evidence ?? []
  evidence.unshift({
    id: uid("evd"),
    label: params.label,
    url: params.url,
    note: params.note,
    userId: params.userId,
    createdAt: new Date().toISOString(),
  })

  const updated = await prisma.soromaAlert.update({
    where: { id: params.alertId },
    data: {
      metadata: { ...metadata, evidence: evidence.slice(0, 100) },
    },
  })

  await logSoromaAudit({
    userId: params.userId,
    tenantId: updated.tenantId ?? undefined,
    workspaceType: updated.scope,
    action: "alert.evidence_added",
    entityType: "SoromaAlert",
    entityId: updated.id,
    afterState: { label: params.label, url: params.url },
  })

  return updated
}

export async function applyAlertAction(params: {
  alertId: string
  action: "assign" | "set_sla" | "escalate" | "in_progress" | "resolve" | "reopen"
  assignedToId?: string
  slaHours?: number
  comment?: string
  userId?: string
}) {
  const existing = await prisma.soromaAlert.findUnique({ where: { id: params.alertId } })
  if (!existing) return null

  const metadata = asMetadata(existing.metadata)
  const now = new Date()
  let status = existing.status
  let assignedToId = existing.assignedToId ?? undefined
  let resolvedAt = existing.resolvedAt ?? undefined
  let escalationLevel = Number(metadata.escalationLevel ?? 0)
  let slaDueAt = metadata.slaDueAt

  if (params.action === "assign") {
    assignedToId = params.assignedToId
  } else if (params.action === "set_sla") {
    if (params.slaHours) {
      slaDueAt = new Date(now.getTime() + params.slaHours * 60 * 60 * 1000).toISOString()
    }
  } else if (params.action === "escalate") {
    escalationLevel += 1
    status = "IN_PROGRESS"
  } else if (params.action === "in_progress") {
    status = "IN_PROGRESS"
  } else if (params.action === "resolve") {
    status = "RESOLVED"
    resolvedAt = now
  } else if (params.action === "reopen") {
    status = "OPEN"
    resolvedAt = undefined
  }

  const updated = await prisma.soromaAlert.update({
    where: { id: params.alertId },
    data: {
      status,
      assignedToId,
      resolvedAt,
      metadata: {
        ...metadata,
        escalationLevel,
        slaDueAt,
      },
    },
  })

  if (params.comment) {
    await addAlertComment({
      alertId: updated.id,
      comment: params.comment,
      userId: params.userId,
    })
  }

  await logSoromaAudit({
    userId: params.userId,
    tenantId: updated.tenantId ?? undefined,
    workspaceType: updated.scope,
    action: `alert.${params.action}`,
    entityType: "SoromaAlert",
    entityId: updated.id,
    beforeState: {
      status: existing.status,
      assignedToId: existing.assignedToId,
      escalationLevel: metadata.escalationLevel,
      slaDueAt: metadata.slaDueAt,
    },
    afterState: {
      status: updated.status,
      assignedToId: updated.assignedToId,
      escalationLevel,
      slaDueAt,
    },
  })

  return updated
}

export async function createAlertIfMissing(params: {
  scope: "PLATFORM" | "TENANT"
  tenantId?: string
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  type: string
  title: string
  entityType?: string
  entityId?: string
  metadata?: Record<string, unknown>
}) {
  const existing = await prisma.soromaAlert.findFirst({
    where: {
      scope: params.scope,
      tenantId: params.tenantId,
      type: params.type,
      entityType: params.entityType,
      entityId: params.entityId,
      status: { in: ["OPEN", "IN_PROGRESS"] },
    },
    select: { id: true },
  })
  if (existing) return existing

  return prisma.soromaAlert.create({
    data: {
      scope: params.scope,
      tenantId: params.tenantId,
      severity: params.severity,
      type: params.type,
      title: params.title,
      entityType: params.entityType,
      entityId: params.entityId,
      metadata: {
        ...(params.metadata ?? {}),
        escalationLevel: 0,
      },
    },
  })
}

export async function runTenantAlertRules(tenantId: string) {
  // Low stock
  const lowStock = await prisma.soromaStockLot.findMany({
    where: { tenantId, availableQty: { lt: 20 } },
    take: 50,
  })
  for (const stock of lowStock) {
    await createAlertIfMissing({
      scope: "TENANT",
      tenantId,
      severity: "HIGH",
      type: "LOW_STOCK",
      title: `Low stock: ${stock.skuName}`,
      entityType: "SoromaStockLot",
      entityId: stock.id,
      metadata: { availableQty: stock.availableQty, skuCode: stock.skuCode },
    })
  }

  // Integration failures
  const downConnections = await prisma.soromaTenantConnection.findMany({
    where: { tenantId, status: "DOWN" },
    include: { connector: true },
  })
  for (const conn of downConnections) {
    await createAlertIfMissing({
      scope: "TENANT",
      tenantId,
      severity: "CRITICAL",
      type: "INTEGRATION_FAILURE",
      title: `Integration down: ${conn.connector.name}`,
      entityType: "SoromaTenantConnection",
      entityId: conn.id,
      metadata: { connectorId: conn.connectorId, connector: conn.connector.name },
    })
  }

  // Traceability gaps: shipped orders without passport
  const shippedOrders = await prisma.soromaOrder.findMany({
    where: { tenantId, status: { in: ["SHIPPED", "DELIVERED"] } },
    include: { lines: true, shipments: true },
    take: 50,
  })
  const passportCount = await prisma.soromaPassport.count({ where: { tenantId } })
  if (shippedOrders.length > 0 && passportCount === 0) {
    await createAlertIfMissing({
      scope: "TENANT",
      tenantId,
      severity: "HIGH",
      type: "TRACEABILITY_GAP",
      title: "Traceability gap detected: shipped orders without passports",
      entityType: "SoromaOrder",
      metadata: { affectedOrders: shippedOrders.length },
    })
  }

  // Overdue invoices
  const overdueInvoices = await prisma.soromaInvoice.findMany({
    where: {
      tenantId,
      dueDate: { lt: new Date() },
      paidAt: null,
      status: { in: ["OPEN", "OVERDUE"] },
    },
    take: 50,
  })
  for (const invoice of overdueInvoices) {
    await createAlertIfMissing({
      scope: "TENANT",
      tenantId,
      severity: "MEDIUM",
      type: "OVERDUE_INVOICE",
      title: `Overdue invoice: ${invoice.invoiceNo}`,
      entityType: "SoromaInvoice",
      entityId: invoice.id,
      metadata: { dueDate: invoice.dueDate, amount: invoice.amount.toString() },
    })
  }
}

export async function runPlatformAlertRules() {
  // Delayed onboarding applications
  const delayedOnboarding = await prisma.soromaOnboardingApplication.findMany({
    where: {
      stage: { notIn: ["COMPLETED", "REJECTED"] },
      createdAt: { lt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) },
    },
    take: 50,
  })
  for (const app of delayedOnboarding) {
    await createAlertIfMissing({
      scope: "PLATFORM",
      severity: "MEDIUM",
      type: "ONBOARDING_DELAY",
      title: `Onboarding delayed: ${app.orgName}`,
      entityType: "SoromaOnboardingApplication",
      entityId: app.id,
      metadata: { stage: app.stage, createdAt: app.createdAt },
    })
  }
}
