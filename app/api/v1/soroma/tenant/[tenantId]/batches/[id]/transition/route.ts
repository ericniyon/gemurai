import { NextRequest } from "next/server"
import { z } from "zod"
import {
  handleSoromaApiError,
  parseSoromaBody,
  soromaError,
  soromaJson,
  withSoromaTenantAuth,
} from "@/lib/soroma/api-handler"
import { requireTenantScope } from "@/lib/soroma/guards"
import { applyProductionBatchTransition } from "@/lib/soroma/workflows/apply"

const bodySchema = z.object({
  action: z.string().min(1),
  comment: z.string().optional(),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tenantId: string; id: string }> }
) {
  try {
    const { tenantId, id } = await params
    return withSoromaTenantAuth(request, tenantId, async (req, session) => {
      const scopeErr = await requireTenantScope(session, tenantId)
      if (scopeErr) return scopeErr

      const body = await parseSoromaBody(req, bodySchema)
      const result = await applyProductionBatchTransition(
        tenantId,
        id,
        body.action,
        session,
        body.comment
      )

      if (!result.ok) {
        return soromaError(result.error, result.status)
      }

      return soromaJson(result)
    })
  } catch (error) {
    return handleSoromaApiError(error)
  }
}
