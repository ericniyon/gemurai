import { NextRequest } from "next/server"
import { prisma } from "@/lib/database"
import {
  withSoromaTenantAuth,
  soromaJson,
  parseSoromaBody,
  handleSoromaApiError,
} from "@/lib/soroma/api-handler"
import { checkApiPermission, requireTenantScope } from "@/lib/soroma/guards"
import { downtimeCreateSchema, qcExceptionCreateSchema } from "@/lib/soroma/validators"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  try {
    const { tenantId } = await params
    return withSoromaTenantAuth(request, tenantId, async (req, session) => {
      const scopeErr = await requireTenantScope(session, tenantId)
      if (scopeErr) return scopeErr
      const permErr = checkApiPermission(session, "production:POST")
      if (permErr) return permErr

      const url = new URL(req.url)
      const action = url.searchParams.get("action")

      if (action === "downtime") {
        const body = await parseSoromaBody(req, downtimeCreateSchema)
        const event = await prisma.soromaDowntimeEvent.create({
          data: {
            batchId: body.batchId,
            reason: body.reason,
            minutes: body.durationMinutes,
          },
        })
        return soromaJson(event, 201)
      }

      if (action === "qc") {
        const body = await parseSoromaBody(req, qcExceptionCreateSchema)
        const event = await prisma.soromaQCException.create({
          data: {
            batchId: body.batchId,
            testType: body.exceptionType,
            result: "FAILED",
            severity: body.severity,
            notes: body.notes,
          },
        })
        return soromaJson(event, 201)
      }

      return soromaJson({ error: "Unknown action" }, 400)
    })
  } catch (error) {
    return handleSoromaApiError(error)
  }
}
