import { NextRequest } from "next/server"
import {
  handleSoromaApiError,
  parseSoromaBody,
  soromaJson,
  withSoromaTenantAuth,
} from "@/lib/soroma/api-handler"
import { checkApiPermission, requireTenantScope } from "@/lib/soroma/guards"
import { capaCreateSchema } from "@/lib/soroma/validators"
import { prisma } from "@/lib/database"
import { logSoromaAudit } from "@/lib/soroma/audit"
import { getCurrentCapaStageMap } from "@/lib/soroma/compliance"

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

      const capas = await prisma.soromaCAPA.findMany({
        where: { tenantId },
        orderBy: { createdAt: "desc" },
        take: 100,
      })
      const stageMap = await getCurrentCapaStageMap(
        tenantId,
        capas.map((c) => c.id)
      )
      return soromaJson(
        capas.map((c) => ({
          ...c,
          stage: stageMap.get(c.id) ?? (c.status === "RESOLVED" ? "CLOSED" : "OPEN"),
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
      const permErr = checkApiPermission(session, "compliance:POST")
      if (permErr) return permErr

      const body = await parseSoromaBody(req, capaCreateSchema)
      const capa = await prisma.soromaCAPA.create({
        data: {
          tenantId,
          title: body.title,
          ownerId: body.ownerId,
          dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
          severity: body.severity,
          evidenceUrl: body.evidenceUrl,
          status: "OPEN",
        },
      })

      await prisma.soromaWorkflowEvent.create({
        data: {
          tenantId,
          entityType: "SoromaCAPA",
          entityId: capa.id,
          fromStatus: null,
          toStatus: "OPEN",
          action: "capa.created",
          userId: session.userId,
        },
      })

      await logSoromaAudit({
        userId: session.userId,
        tenantId,
        workspaceType: "TENANT",
        action: "compliance.capa.created",
        entityType: "SoromaCAPA",
        entityId: capa.id,
        afterState: capa,
      })

      return soromaJson(capa, 201)
    })
  } catch (error) {
    return handleSoromaApiError(error)
  }
}
