import { prisma } from "@/lib/database"
import { logSoromaAudit } from "./audit"
import type { WorkflowEntityType } from "./workflows/types"

export async function recordWorkflowEvent(params: {
  tenantId: string
  entityType: WorkflowEntityType
  entityId: string
  fromStatus: string | null
  toStatus: string
  action: string
  userId?: string
  comment?: string
  metadata?: Record<string, unknown>
}) {
  await prisma.soromaWorkflowEvent.create({
    data: {
      tenantId: params.tenantId,
      entityType: params.entityType,
      entityId: params.entityId,
      fromStatus: params.fromStatus,
      toStatus: params.toStatus,
      action: params.action,
      userId: params.userId,
      comment: params.comment,
      metadata: params.metadata
        ? JSON.parse(JSON.stringify(params.metadata))
        : undefined,
    },
  })

  await logSoromaAudit({
    userId: params.userId,
    tenantId: params.tenantId,
    workspaceType: "TENANT",
    action: `workflow.${params.action}`,
    entityType: params.entityType,
    entityId: params.entityId,
    beforeState: { status: params.fromStatus },
    afterState: { status: params.toStatus, comment: params.comment },
  })
}

export async function getWorkflowTimeline(
  tenantId: string,
  entityType: WorkflowEntityType,
  entityId: string,
  limit = 20
) {
  return prisma.soromaWorkflowEvent.findMany({
    where: { tenantId, entityType, entityId },
    orderBy: { createdAt: "desc" },
    take: limit,
  })
}
