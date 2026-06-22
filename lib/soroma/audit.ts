import { prisma } from "@/lib/database"
import type { SoromaWorkspaceType } from "@prisma/client"

export async function logSoromaAudit(params: {
  userId?: string
  tenantId?: string
  workspaceType?: SoromaWorkspaceType
  action: string
  entityType?: string
  entityId?: string
  beforeState?: unknown
  afterState?: unknown
  ipAddress?: string
  userAgent?: string
}) {
  try {
    await prisma.soromaAuditLog.create({
      data: {
        userId: params.userId,
        tenantId: params.tenantId,
        workspaceType: params.workspaceType,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        beforeState: params.beforeState
          ? JSON.parse(JSON.stringify(params.beforeState))
          : undefined,
        afterState: params.afterState
          ? JSON.parse(JSON.stringify(params.afterState))
          : undefined,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      },
    })
  } catch (e) {
    console.error("[SOROMA audit]", e)
  }
}
