import { NextRequest } from "next/server"
import {
  handleSoromaApiError,
  soromaJson,
  withSoromaAuth,
} from "@/lib/soroma/api-handler"
import { requirePermission } from "@/lib/soroma/guards"
import { prisma } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    return withSoromaAuth(request, async (_req, session) => {
      const permErr = requirePermission(session, ["soroma.platform.manage", "soroma.audit.view"])
      if (permErr) return permErr

      const now = new Date()
      const [tenantCount, openAlerts, pendingExports, stuckExports, pendingSyncJobs] =
        await Promise.all([
          prisma.soromaTenant.count(),
          prisma.soromaAlert.count({ where: { status: { in: ["OPEN", "IN_PROGRESS"] } } }),
          prisma.soromaExportJob.count({ where: { status: "PENDING" } }),
          prisma.soromaExportJob.count({
            where: { status: "PROCESSING", startedAt: { lte: new Date(now.getTime() - 30 * 60 * 1000) } },
          }),
          prisma.soromaSyncJob.count({ where: { status: { in: ["PENDING", "RETRYING"] } } }),
        ])

      const health =
        stuckExports > 0 ? "degraded" : pendingSyncJobs > 200 || pendingExports > 200 ? "warning" : "healthy"

      return soromaJson({
        health,
        checkedAt: now.toISOString(),
        metrics: {
          tenantCount,
          openAlerts,
          pendingExports,
          stuckExports,
          pendingSyncJobs,
        },
      })
    })
  } catch (error) {
    return handleSoromaApiError(error)
  }
}
