import { NextRequest } from "next/server"
import {
  handleSoromaApiError,
  soromaJson,
  withSoromaAuth,
} from "@/lib/soroma/api-handler"
import { requirePermission } from "@/lib/soroma/guards"
import { processExportJob } from "@/lib/soroma/reporting"
import { prisma } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    return withSoromaAuth(request, async (_req, session) => {
      const permErr = requirePermission(session, ["soroma.reports.manage", "soroma.exports.manage"])
      if (permErr) return permErr

      const pending = await prisma.soromaExportJob.findMany({
        where: { workspaceType: "PLATFORM", status: "PENDING" },
        orderBy: { createdAt: "asc" },
        take: 30,
        select: { id: true },
      })
      const processed: string[] = []
      for (const job of pending) {
        const result = await processExportJob(job.id, session.userId)
        if (result) processed.push(job.id)
      }
      return soromaJson({ queued: pending.length, processed })
    })
  } catch (error) {
    return handleSoromaApiError(error)
  }
}
