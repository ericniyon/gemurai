import { NextRequest } from "next/server"
import {
  handleSoromaApiError,
  soromaJson,
  withSoromaAuth,
} from "@/lib/soroma/api-handler"
import { requirePermission } from "@/lib/soroma/guards"
import { runPlatformAlertRules, runTenantAlertRules } from "@/lib/soroma/alerts"
import { prisma } from "@/lib/database"

/**
 * Runs alert rule orchestration across platform and tenants.
 * Protected to alerts.manage users.
 */
export async function POST(request: NextRequest) {
  try {
    return withSoromaAuth(request, async (_req, session) => {
      const permErr = requirePermission(session, "soroma.alerts.manage")
      if (permErr) return permErr

      await runPlatformAlertRules()
      const tenants = await prisma.soromaTenant.findMany({
        where: { status: { in: ["ACTIVE", "ONBOARDING"] } },
        select: { id: true },
      })
      for (const tenant of tenants) {
        await runTenantAlertRules(tenant.id)
      }

      return soromaJson({
        processedTenants: tenants.length,
      })
    })
  } catch (error) {
    return handleSoromaApiError(error)
  }
}
