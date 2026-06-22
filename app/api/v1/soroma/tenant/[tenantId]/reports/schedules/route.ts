import { NextRequest } from "next/server"
import {
  handleSoromaApiError,
  parseSoromaBody,
  soromaJson,
  withSoromaTenantAuth,
} from "@/lib/soroma/api-handler"
import { checkApiPermission, requireTenantScope } from "@/lib/soroma/guards"
import { createReportSchedule } from "@/lib/soroma/reporting"
import { reportScheduleCreateSchema } from "@/lib/soroma/validators"
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
      const permErr = checkApiPermission(session, "reports:GET")
      if (permErr) return permErr

      const schedules = await prisma.soromaReportSchedule.findMany({
        where: { workspaceType: "TENANT", tenantId },
        orderBy: { createdAt: "desc" },
        take: 100,
      })
      return soromaJson(schedules)
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
    const payload = await parseSoromaBody(request, reportScheduleCreateSchema)
    const { tenantId } = await params
    return withSoromaTenantAuth(request, tenantId, async (_req, session) => {
      const scopeErr = await requireTenantScope(session, tenantId)
      if (scopeErr) return scopeErr
      const permErr = checkApiPermission(session, "reports:POST")
      if (permErr) return permErr

      const schedule = await createReportSchedule({
        ...payload,
        scope: "tenant",
        tenantId,
        createdById: session.userId,
      })
      await logSoromaAudit({
        userId: session.userId,
        tenantId,
        workspaceType: "TENANT",
        action: "REPORT_SCHEDULE_CREATED",
        entityType: "SoromaReportSchedule",
        entityId: schedule.id,
        afterState: payload,
      })
      return soromaJson(schedule, 201)
    })
  } catch (error) {
    return handleSoromaApiError(error)
  }
}
