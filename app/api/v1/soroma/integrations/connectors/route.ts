import { NextRequest } from "next/server"
import {
  handleSoromaApiError,
  parseSoromaBody,
  soromaJson,
  withSoromaAuth,
} from "@/lib/soroma/api-handler"
import { requirePermission } from "@/lib/soroma/guards"
import { connectorCreateSchema } from "@/lib/soroma/validators"
import { prisma } from "@/lib/database"
import { registerConnector } from "@/lib/soroma/integrations"

export async function GET(request: NextRequest) {
  try {
    return withSoromaAuth(request, async (_req, session) => {
      const permErr = requirePermission(session, [
        "soroma.integrations.manage",
        "soroma.integration_health.view",
      ])
      if (permErr) return permErr

      const connectors = await prisma.soromaConnector.findMany({
        orderBy: { name: "asc" },
      })
      return soromaJson(connectors)
    })
  } catch (error) {
    return handleSoromaApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    return withSoromaAuth(request, async (req, session) => {
      const permErr = requirePermission(session, "soroma.integrations.manage")
      if (permErr) return permErr

      const body = await parseSoromaBody(req, connectorCreateSchema)
      const connector = await registerConnector({
        ...body,
        userId: session.userId,
      })
      return soromaJson(connector, 201)
    })
  } catch (error) {
    return handleSoromaApiError(error)
  }
}
