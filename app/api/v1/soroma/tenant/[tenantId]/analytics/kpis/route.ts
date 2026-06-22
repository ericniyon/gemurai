import { NextRequest } from "next/server"
import {
  handleSoromaApiError,
  soromaJson,
  withSoromaTenantAuth,
} from "@/lib/soroma/api-handler"
import { requirePermission, requireTenantScope } from "@/lib/soroma/guards"
import { getTenantKpis } from "@/lib/soroma/kpi-engine"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  try {
    const { tenantId } = await params
    const { searchParams } = new URL(request.url)
    const scope = searchParams.get("scope")

    return withSoromaTenantAuth(request, tenantId, async (_req, session) => {
      const scopeErr = await requireTenantScope(session, tenantId)
      if (scopeErr) return scopeErr
      const permErr = requirePermission(session, "soroma.tenant.view")
      if (permErr) return permErr

      const data = await getTenantKpis(tenantId, scope)
      return soromaJson(data)
    })
  } catch (error) {
    return handleSoromaApiError(error)
  }
}
