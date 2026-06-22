import { NextRequest } from "next/server"
import {
  handleSoromaApiError,
  soromaError,
  soromaJson,
  withSoromaTenantAuth,
} from "@/lib/soroma/api-handler"
import { checkApiPermission, requireTenantScope } from "@/lib/soroma/guards"
import { getPassportGenealogy } from "@/lib/soroma/traceability"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tenantId: string; passportId: string }> }
) {
  try {
    const { tenantId, passportId } = await params
    return withSoromaTenantAuth(request, tenantId, async (_req, session) => {
      const scopeErr = await requireTenantScope(session, tenantId)
      if (scopeErr) return scopeErr
      const permErr = checkApiPermission(session, "traceability:GET")
      if (permErr) return permErr

      const lineage = await getPassportGenealogy(tenantId, passportId)
      if (!lineage) {
        return soromaError("Passport genealogy not found", 404, undefined, "NOT_FOUND")
      }

      return soromaJson(lineage)
    })
  } catch (error) {
    return handleSoromaApiError(error)
  }
}
