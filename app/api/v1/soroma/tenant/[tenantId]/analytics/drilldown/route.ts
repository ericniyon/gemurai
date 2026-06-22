import { NextRequest } from "next/server"
import {
  handleSoromaApiError,
  soromaError,
  soromaJson,
  withSoromaTenantAuth,
} from "@/lib/soroma/api-handler"
import { requirePermission, requireTenantScope } from "@/lib/soroma/guards"
import { getTenantKpiDrilldown } from "@/lib/soroma/kpi-engine"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  try {
    const { tenantId } = await params
    const { searchParams } = new URL(request.url)
    const kpi = searchParams.get("kpi")
    const scope = searchParams.get("scope")
    if (!kpi) return soromaError("kpi query parameter is required", 400, undefined, "VALIDATION")

    return withSoromaTenantAuth(request, tenantId, async (_req, session) => {
      const scopeErr = await requireTenantScope(session, tenantId)
      if (scopeErr) return scopeErr
      const permErr = requirePermission(session, "soroma.tenant.view")
      if (permErr) return permErr

      const data = await getTenantKpiDrilldown(tenantId, kpi, scope)
      return soromaJson(data)
    })
  } catch (error) {
    return handleSoromaApiError(error)
  }
}
