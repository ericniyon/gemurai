import { NextRequest } from "next/server"
import {
  handleSoromaApiError,
  parseSoromaBody,
  soromaJson,
  withSoromaTenantAuth,
} from "@/lib/soroma/api-handler"
import { checkApiPermission, requireTenantScope } from "@/lib/soroma/guards"
import { auditCreateSchema } from "@/lib/soroma/validators"
import { prisma } from "@/lib/database"
import { logSoromaAudit } from "@/lib/soroma/audit"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  try {
    const { tenantId } = await params
    return withSoromaTenantAuth(request, tenantId, async (_req, session) => {
      const scopeErr = await requireTenantScope(session, tenantId)
      if (scopeErr) return scopeErr
      const permErr = checkApiPermission(session, "compliance:GET")
      if (permErr) return permErr

      const rows = await prisma.soromaAudit.findMany({
        where: { tenantId },
        orderBy: { scheduledAt: "asc" },
        take: 100,
      })
      return soromaJson(rows)
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
      const permErr = checkApiPermission(session, "compliance:POST")
      if (permErr) return permErr

      const body = await parseSoromaBody(req, auditCreateSchema)
      const audit = await prisma.soromaAudit.create({
        data: {
          tenantId,
          auditType: body.auditType,
          scheduledAt: new Date(body.scheduledAt),
          result: body.result,
          score: body.score,
          notes: body.notes,
        },
      })

      await logSoromaAudit({
        userId: session.userId,
        tenantId,
        workspaceType: "TENANT",
        action: "compliance.audit.created",
        entityType: "SoromaAudit",
        entityId: audit.id,
        afterState: audit,
      })

      return soromaJson(audit, 201)
    })
  } catch (error) {
    return handleSoromaApiError(error)
  }
}
