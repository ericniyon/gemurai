import { NextRequest } from "next/server"
import { prisma } from "@/lib/database"
import {
  withSoromaAuth,
  soromaJson,
  soromaError,
  parseSoromaBody,
  handleSoromaApiError,
} from "@/lib/soroma/api-handler"
import { logSoromaAudit } from "@/lib/soroma/audit"
import { checkApiPermission, requireTenantScope } from "@/lib/soroma/guards"
import { alertPatchSchema } from "@/lib/soroma/validators"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    return withSoromaAuth(request, async (req, session) => {
      const permErr = checkApiPermission(session, "alerts:PATCH")
      if (permErr) return permErr

      const body = await parseSoromaBody(req, alertPatchSchema)
      const existing = await prisma.soromaAlert.findUnique({ where: { id } })
      if (!existing) return soromaError("Alert not found", 404, undefined, "NOT_FOUND")

      if (existing.tenantId) {
        const scopeErr = await requireTenantScope(session, existing.tenantId)
        if (scopeErr) return scopeErr
      }

      const updated = await prisma.soromaAlert.update({
        where: { id },
        data: {
          status: body.status,
          assignedToId: body.assignedToId ?? undefined,
          resolvedAt: body.status === "RESOLVED" ? new Date() : undefined,
        },
      })

      await logSoromaAudit({
        userId: session.userId,
        tenantId: existing.tenantId ?? undefined,
        workspaceType: existing.scope,
        action: "alert.updated",
        entityType: "SoromaAlert",
        entityId: id,
        beforeState: { status: existing.status },
        afterState: { status: updated.status },
      })

      return soromaJson(updated)
    })
  } catch (error) {
    return handleSoromaApiError(error)
  }
}
