import { NextRequest } from "next/server"
import {
  handleSoromaApiError,
  parseSoromaBody,
  soromaError,
  soromaJson,
  withSoromaAuth,
} from "@/lib/soroma/api-handler"
import { addAlertEvidence } from "@/lib/soroma/alerts"
import { requirePermission, requireTenantScope } from "@/lib/soroma/guards"
import { alertEvidenceSchema } from "@/lib/soroma/validators"
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

      const body = await parseSoromaBody(req, alertEvidenceSchema)
      const updated = await addAlertEvidence({
        alertId: id,
        label: body.label,
        url: body.url,
        note: body.note,
        userId: session.userId,
      })
      if (!updated) return soromaError("Alert not found", 404, undefined, "NOT_FOUND")
      return soromaJson(updated)
    })
  } catch (error) {
    return handleSoromaApiError(error)
  }
}
