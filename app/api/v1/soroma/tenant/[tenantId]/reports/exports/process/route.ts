import { NextRequest } from "next/server"
import {
  handleSoromaApiError,
  soromaJson,
  withSoromaTenantAuth,
} from "@/lib/soroma/api-handler"
import { checkApiPermission, requireTenantScope } from "@/lib/soroma/guards"
import { processExportJob } from "@/lib/soroma/reporting"
import { prisma } from "@/lib/database"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  try {
    const { tenantId } = await params
    return withSoromaTenantAuth(request, tenantId, async (_req, session) => {
      const scopeErr = await requireTenantScope(session, tenantId)
      if (scopeErr) return scopeErr
      const permErr = checkApiPermission(session, "reports:POST")
      if (permErr) return permErr

      const pending = await prisma.soromaExportJob.findMany({
        where: { workspaceType: "TENANT", tenantId, status: "PENDING" },
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
