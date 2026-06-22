import { NextRequest } from "next/server"
import {
  handleSoromaApiError,
  parseSoromaBody,
  soromaJson,
  withSoromaTenantAuth,
} from "@/lib/soroma/api-handler"
import { checkApiPermission, requireTenantScope } from "@/lib/soroma/guards"
import {
  connectTenantToConnector,
  enqueueSyncJob,
} from "@/lib/soroma/integrations"
import { tenantConnectionCreateSchema } from "@/lib/soroma/validators"
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

      const rows = await prisma.soromaTenantConnection.findMany({
        where: { tenantId },
        include: { connector: true },
        orderBy: { updatedAt: "desc" },
      })
      return soromaJson(
        rows.map((r) => ({
          ...r,
          config: {
            ...(typeof r.config === "object" && r.config ? (r.config as object) : {}),
            credentials: undefined,
          },
        }))
      )
    })
  } catch (error) {
    return handleSoromaApiError(error)
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  try {
    const { tenantId } = await params
    return withSoromaTenantAuth(request, tenantId, async (req, session) => {
      const scopeErr = await requireTenantScope(session, tenantId)
      if (scopeErr) return scopeErr
      const permErr = checkApiPermission(session, "integrations:POST")
      if (permErr) return permErr

      const body = await parseSoromaBody(req, tenantConnectionCreateSchema)
      const raw = body as typeof body & { connectorCode?: string }
      let connectorId = body.connectorId
      if (!connectorId && raw.connectorCode) {
        const connector = await prisma.soromaConnector.findFirst({
          where: { code: raw.connectorCode },
        })
        if (!connector) return soromaJson({ error: "Connector not found" }, 404)
        connectorId = connector.id
      }
      const connection = await connectTenantToConnector({
        tenantId,
        connectorId,
        externalAccountId: body.externalAccountId,
        config: body.config,
        apiKey: body.apiKey,
        apiSecret: body.apiSecret,
        userId: session.userId,
      })

      await enqueueSyncJob({
        connectionId: connection.id,
        jobType: "INITIAL_SYNC",
        payload: { trigger: "connection_created" },
        userId: session.userId,
      })

      return soromaJson(connection, 201)
    })
  } catch (error) {
    return handleSoromaApiError(error)
  }
}
