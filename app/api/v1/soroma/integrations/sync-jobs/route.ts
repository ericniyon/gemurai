import { NextRequest } from "next/server"
import {
  handleSoromaApiError,
  soromaJson,
  withSoromaAuth,
} from "@/lib/soroma/api-handler"
import { requirePermission } from "@/lib/soroma/guards"
import { processSyncJob } from "@/lib/soroma/integrations"
import { prisma } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    return withSoromaAuth(request, async (_req, session) => {
      const permErr = requirePermission(session, [
        "soroma.integration_health.view",
        "soroma.integrations.manage",
      ])
      if (permErr) return permErr

      const jobs = await prisma.soromaSyncJob.findMany({
        include: {
          connection: {
            include: { tenant: true, connector: true },
          },
          logs: { orderBy: { createdAt: "desc" }, take: 3 },
        },
        orderBy: { createdAt: "desc" },
        take: 200,
      })
      return soromaJson(jobs)
    })
  } catch (error) {
    return handleSoromaApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    return withSoromaAuth(request, async (_req, session) => {
      const permErr = requirePermission(session, [
        "soroma.integrations.retry",
        "soroma.integrations.manage",
      ])
      if (permErr) return permErr

      const pending = await prisma.soromaSyncJob.findMany({
        where: { status: { in: ["PENDING", "RETRYING"] } },
        orderBy: { createdAt: "asc" },
        take: 20,
        select: { id: true },
      })

      const processed = []
      for (const job of pending) {
        const result = await processSyncJob(job.id, session.userId)
        if (result) processed.push({ id: job.id, status: result.status })
      }
      return soromaJson({ processed: processed.length, jobs: processed })
    })
  } catch (error) {
    return handleSoromaApiError(error)
  }
}
