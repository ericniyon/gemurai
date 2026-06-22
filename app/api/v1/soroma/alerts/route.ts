import { NextRequest } from "next/server"
import {
  handleSoromaApiError,
  soromaJson,
  withSoromaAuth,
} from "@/lib/soroma/api-handler"
import { requirePermission } from "@/lib/soroma/guards"
import { runPlatformAlertRules } from "@/lib/soroma/alerts"
import { prisma } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    return withSoromaAuth(request, async (req, session) => {
      const permErr = requirePermission(session, ["soroma.alerts.view", "soroma.alerts.manage"])
      if (permErr) return permErr

      const refresh = new URL(req.url).searchParams.get("refresh")
      if (refresh === "1" || refresh === "true") {
        await runPlatformAlertRules()
      }

      const alerts = await prisma.soromaAlert.findMany({
        where: session.workspaceType === "platform"
          ? { OR: [{ scope: "PLATFORM" }, { tenantId: null }] }
          : session.tenantId
            ? { tenantId: session.tenantId }
            : {},
        orderBy: { createdAt: "desc" },
        take: 200,
        include: { tenant: { select: { name: true } } },
      })

      return soromaJson(
        alerts.map((a) => ({
          ...a,
          tenantName: a.tenant?.name ?? null,
        }))
      )
    })
  } catch (error) {
    return handleSoromaApiError(error)
  }
}
