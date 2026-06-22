import { NextRequest } from "next/server"
import {
  handleSoromaApiError,
  soromaError,
  soromaJson,
  withSoromaTenantAuth,
} from "@/lib/soroma/api-handler"
import { checkApiPermission, requireTenantScope } from "@/lib/soroma/guards"
import { prisma } from "@/lib/database"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  try {
    const { tenantId } = await params
    const { searchParams } = new URL(request.url)
    const entityType = searchParams.get("entityType")
    const entityId = searchParams.get("entityId")
    if (!entityType || !entityId) {
      return soromaError("entityType and entityId are required", 400, undefined, "VALIDATION")
    }

    return withSoromaTenantAuth(request, tenantId, async (_req, session) => {
      const scopeErr = await requireTenantScope(session, tenantId)
      if (scopeErr) return scopeErr
      const permErr = checkApiPermission(session, "audit:GET")
      if (permErr) return permErr

      const history = await prisma.soromaAuditLog.findMany({
        where: { tenantId, entityType, entityId },
        orderBy: { createdAt: "asc" },
        take: 1000,
      })
      return soromaJson(history)
    })
  } catch (error) {
    return handleSoromaApiError(error)
  }
}
