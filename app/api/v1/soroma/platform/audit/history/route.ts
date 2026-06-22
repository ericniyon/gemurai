import { NextRequest } from "next/server"
import {
  handleSoromaApiError,
  soromaError,
  soromaJson,
  withSoromaAuth,
} from "@/lib/soroma/api-handler"
import { requirePermission } from "@/lib/soroma/guards"
import { prisma } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const entityType = searchParams.get("entityType")
    const entityId = searchParams.get("entityId")
    if (!entityType || !entityId) {
      return soromaError("entityType and entityId are required", 400, undefined, "VALIDATION")
    }

    return withSoromaAuth(request, async (_req, session) => {
      const permErr = requirePermission(session, ["soroma.audit.view", "soroma.audit.manage"])
      if (permErr) return permErr

      const history = await prisma.soromaAuditLog.findMany({
        where: { entityType, entityId },
        orderBy: { createdAt: "asc" },
        take: 1000,
      })
      return soromaJson(history)
    })
  } catch (error) {
    return handleSoromaApiError(error)
  }
}
