import { NextRequest } from "next/server"
import {
  handleSoromaApiError,
  parseSoromaBody,
  soromaError,
  soromaJson,
  withSoromaTenantAuth,
} from "@/lib/soroma/api-handler"
import { checkApiPermission, requireTenantScope } from "@/lib/soroma/guards"
import { enqueueSyncJob } from "@/lib/soroma/integrations"
import { syncJobCreateSchema } from "@/lib/soroma/validators"
import { prisma } from "@/lib/database"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tenantId: string; connectionId: string }> }
) {
  try {
    const { tenantId, connectionId } = await params
    return withSoromaTenantAuth(request, tenantId, async (req, session) => {
      const scopeErr = await requireTenantScope(session, tenantId)
      if (scopeErr) return scopeErr
      const permErr = checkApiPermission(session, "integrations:POST")
      if (permErr) return permErr

      const connection = await prisma.soromaTenantConnection.findFirst({
        where: { id: connectionId, tenantId },
      })
      if (!connection) {
        return soromaError("Connection not found for tenant", 404, undefined, "NOT_FOUND")
      }

      const body = await parseSoromaBody(req, syncJobCreateSchema)
      const job = await enqueueSyncJob({
        connectionId,
        jobType: body.jobType,
        payload: body.payload,
        userId: session.userId,
      })
      return soromaJson(job, 201)
    })
  } catch (error) {
    return handleSoromaApiError(error)
  }
}
