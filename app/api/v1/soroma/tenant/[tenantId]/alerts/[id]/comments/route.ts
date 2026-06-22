import { NextRequest } from "next/server"
import {
  handleSoromaApiError,
  parseSoromaBody,
  soromaError,
  soromaJson,
  withSoromaTenantAuth,
} from "@/lib/soroma/api-handler"
import { checkApiPermission, requireTenantScope } from "@/lib/soroma/guards"
import { alertCommentSchema } from "@/lib/soroma/validators"
import { addAlertComment } from "@/lib/soroma/alerts"
import { prisma } from "@/lib/database"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tenantId: string; id: string }> }
) {
  try {
    const { tenantId, id } = await params
    return withSoromaTenantAuth(request, tenantId, async (req, session) => {
      const scopeErr = await requireTenantScope(session, tenantId)
      if (scopeErr) return scopeErr
      const permErr = checkApiPermission(session, "alerts:PATCH")
      if (permErr) return permErr

      const alert = await prisma.soromaAlert.findFirst({
        where: { id, tenantId },
        select: { id: true },
      })
      if (!alert) return soromaError("Alert not found", 404, undefined, "NOT_FOUND")

      const body = await parseSoromaBody(req, alertCommentSchema)
      const updated = await addAlertComment({
        alertId: id,
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
