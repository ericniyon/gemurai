import { NextRequest } from "next/server"
import {
  handleSoromaApiError,
  soromaJson,
  withSoromaTenantAuth,
} from "@/lib/soroma/api-handler"
import { checkApiPermission, requireTenantScope } from "@/lib/soroma/guards"
import { runTenantAlertRules } from "@/lib/soroma/alerts"
import { prisma } from "@/lib/database"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  try {
    const { tenantId } = await params
    return withSoromaTenantAuth(request, tenantId, async (req, session) => {
      const scopeErr = await requireTenantScope(session, tenantId)
      if (scopeErr) return scopeErr
      const permErr = checkApiPermission(session, "alerts:GET")
      if (permErr) return permErr

      const refresh = new URL(req.url).searchParams.get("refresh")
      if (refresh === "1" || refresh === "true") {
        await runTenantAlertRules(tenantId)
      }

      const alerts = await prisma.soromaAlert.findMany({
        where: { tenantId },
        orderBy: { createdAt: "desc" },
        take: 200,
      })
      return soromaJson(alerts)
    })
  } catch (error) {
    return handleSoromaApiError(error)
  }
}
