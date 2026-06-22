import { NextRequest } from "next/server"
import {
  handleSoromaApiError,
  parseSoromaBody,
  soromaError,
  soromaJson,
  withSoromaAuth,
} from "@/lib/soroma/api-handler"
import { applyAlertAction } from "@/lib/soroma/alerts"
import { requirePermission, requireTenantScope } from "@/lib/soroma/guards"
import { alertActionSchema } from "@/lib/soroma/validators"
import { prisma } from "@/lib/database"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    return withSoromaAuth(request, async (req, session) => {
      const permErr = requirePermission(session, "soroma.alerts.manage")
      if (permErr) return permErr

      const existing = await prisma.soromaAlert.findUnique({ where: { id } })
      if (!existing) return soromaError("Alert not found", 404, undefined, "NOT_FOUND")
      if (existing.tenantId) {
        const scopeErr = await requireTenantScope(session, existing.tenantId)
        if (scopeErr) return scopeErr
      }

      const body = await parseSoromaBody(req, alertActionSchema)
      const updated = await applyAlertAction({
        alertId: id,
        action: body.action,
        assignedToId: body.assignedToId,
        slaHours: body.slaHours,
        comment: body.comment,
        userId: session.userId,
      })
      if (!updated) return soromaError("Alert not found", 404, undefined, "NOT_FOUND")
      return soromaJson(updated)
    })
  } catch (error) {
    return handleSoromaApiError(error)
  }
}
