import { NextRequest } from "next/server"
import {
  withSoromaTenantAuth,
  soromaJson,
  parseSoromaBody,
  handleSoromaApiError,
} from "@/lib/soroma/api-handler"
import { requireTenantScope } from "@/lib/soroma/guards"
import { applyOrderTransition } from "@/lib/soroma/workflows/apply"
import { orderTransitionSchema } from "@/lib/soroma/validators"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tenantId: string; id: string }> }
) {
  try {
    const { tenantId, id } = await params
    return withSoromaTenantAuth(request, tenantId, async (req, session) => {
      const scopeErr = await requireTenantScope(session, tenantId)
      if (scopeErr) return scopeErr

      const body = await parseSoromaBody(req, orderTransitionSchema)
      const result = await applyOrderTransition(tenantId, id, body.action, session, body.comment)
      if (!result.ok) return soromaJson({ error: result.error }, result.status)

      return soromaJson(result)
    })
  } catch (error) {
    return handleSoromaApiError(error)
  }
}
