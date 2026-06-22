import { NextRequest } from "next/server"
import {
  handleSoromaApiError,
  parseSoromaBody,
  soromaError,
  soromaJson,
  withSoromaTenantAuth,
} from "@/lib/soroma/api-handler"
import { checkApiPermission, requireTenantScope } from "@/lib/soroma/guards"
import { applyCapaTransition } from "@/lib/soroma/workflows/apply"
import { capaTransitionSchema } from "@/lib/soroma/validators"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tenantId: string; id: string }> }
) {
  try {
    const { tenantId, id } = await params
    return withSoromaTenantAuth(request, tenantId, async (req, session) => {
      const scopeErr = await requireTenantScope(session, tenantId)
      if (scopeErr) return scopeErr
      const permErr = checkApiPermission(session, "capa:TRANSITION")
      if (permErr) return permErr

      const body = await parseSoromaBody(req, capaTransitionSchema)
      const result = await applyCapaTransition(
        tenantId,
        id,
        body.action,
        session,
        body.comment
      )
      if (!result.ok) return soromaError(result.error, result.status)
      return soromaJson(result)
    })
  } catch (error) {
    return handleSoromaApiError(error)
  }
}
