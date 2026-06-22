import { NextRequest } from "next/server"
import {
  handleSoromaApiError,
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
    return withSoromaTenantAuth(request, tenantId, async (_req, session) => {
      const scopeErr = await requireTenantScope(session, tenantId)
      if (scopeErr) return scopeErr
      const permErr = checkApiPermission(session, "integrations:GET")
      if (permErr) return permErr

      const jobs = await prisma.soromaSyncJob.findMany({
        where: { connection: { tenantId } },
        include: {
          connection: { include: { connector: true } },
          logs: {
            orderBy: { createdAt: "desc" },
            take: 5,
          },
        },
        orderBy: { createdAt: "desc" },
        take: 100,
      })

      return soromaJson(jobs)
    })
  } catch (error) {
    return handleSoromaApiError(error)
  }
}
