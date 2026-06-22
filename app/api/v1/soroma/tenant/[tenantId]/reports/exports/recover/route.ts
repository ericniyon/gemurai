import { NextRequest } from "next/server"
import {
  handleSoromaApiError,
  soromaJson,
  withSoromaTenantAuth,
} from "@/lib/soroma/api-handler"
import { checkApiPermission, requireTenantScope } from "@/lib/soroma/guards"
import { recoverStuckExportJobs } from "@/lib/soroma/reporting"

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
      const result = await recoverStuckExportJobs({
        scope: "tenant",
        tenantId,
        maxAgeMinutes: 30,
      })
      return soromaJson(result)
    })
  } catch (error) {
    return handleSoromaApiError(error)
  }
}
