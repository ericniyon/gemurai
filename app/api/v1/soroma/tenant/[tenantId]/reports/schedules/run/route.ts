import { NextRequest } from "next/server"
import {
  handleSoromaApiError,
  soromaJson,
  withSoromaTenantAuth,
} from "@/lib/soroma/api-handler"
import { checkApiPermission, requireTenantScope } from "@/lib/soroma/guards"
import { runDueSchedules } from "@/lib/soroma/reporting"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  try {
    const { tenantId } = await params
    return withSoromaTenantAuth(request, tenantId, async (_req, session) => {
      const scopeErr = await requireTenantScope(session, tenantId)
      if (scopeErr) return scopeErr
      const permErr = checkApiPermission(session, "reports:POST")
      if (permErr) return permErr

      const result = await runDueSchedules({
        actorId: session.userId,
        scope: "tenant",
        tenantId,
      })
      return soromaJson(result)
    })
  } catch (error) {
    return handleSoromaApiError(error)
  }
}
