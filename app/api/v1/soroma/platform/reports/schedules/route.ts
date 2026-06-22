import { NextRequest } from "next/server"
import {
  handleSoromaApiError,
  parseSoromaBody,
  soromaJson,
  withSoromaAuth,
} from "@/lib/soroma/api-handler"
import { requirePermission } from "@/lib/soroma/guards"
import { createReportSchedule } from "@/lib/soroma/reporting"
import { reportScheduleCreateSchema } from "@/lib/soroma/validators"
import { prisma } from "@/lib/database"
import { logSoromaAudit } from "@/lib/soroma/audit"

export async function GET(request: NextRequest) {
  try {
    return withSoromaAuth(request, async (_req, session) => {
      const permErr = requirePermission(session, ["soroma.reports.view", "soroma.reports.manage"])
      if (permErr) return permErr

      const schedules = await prisma.soromaReportSchedule.findMany({
        where: { workspaceType: "PLATFORM" },
        orderBy: { createdAt: "desc" },
        take: 100,
      })
      return soromaJson(schedules)
    })
  } catch (error) {
    return handleSoromaApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await parseSoromaBody(request, reportScheduleCreateSchema)
    return withSoromaAuth(request, async (_req, session) => {
      const permErr = requirePermission(session, "soroma.reports.manage")
      if (permErr) return permErr

      const schedule = await createReportSchedule({
        ...payload,
        scope: "platform",
        createdById: session.userId,
      })
      await logSoromaAudit({
        userId: session.userId,
        workspaceType: "PLATFORM",
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
