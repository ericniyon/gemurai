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
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")?.trim()
    const action = searchParams.get("action")?.trim()
    const entityType = searchParams.get("entityType")?.trim()
    const entityId = searchParams.get("entityId")?.trim()
    const from = searchParams.get("from")
    const to = searchParams.get("to")
    const limit = Number(searchParams.get("limit") ?? "200")

    return withSoromaTenantAuth(request, tenantId, async (_req, session) => {
      const scopeErr = await requireTenantScope(session, tenantId)
      if (scopeErr) return scopeErr
      const permErr = checkApiPermission(session, "audit:GET")
      if (permErr) return permErr

      const logs = await prisma.soromaAuditLog.findMany({
        where: {
          tenantId,
          ...(action ? { action } : {}),
          ...(entityType ? { entityType } : {}),
          ...(entityId ? { entityId } : {}),
          ...(from || to
            ? {
                createdAt: {
                  gte: from ? new Date(from) : undefined,
                  lte: to ? new Date(to) : undefined,
                },
              }
            : {}),
          ...(search
            ? {
                OR: [
                  { action: { contains: search, mode: "insensitive" } },
                  { entityType: { contains: search, mode: "insensitive" } },
                  { entityId: { contains: search, mode: "insensitive" } },
                  { userId: { contains: search, mode: "insensitive" } },
                ],
              }
            : {}),
        },
        orderBy: { createdAt: "desc" },
        take: Math.min(Math.max(limit, 1), 1000),
      })
      return soromaJson(logs)
    })
  } catch (error) {
    return handleSoromaApiError(error)
  }
}
