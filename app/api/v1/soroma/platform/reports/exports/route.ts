import { NextRequest, NextResponse } from "next/server"
import {
  handleSoromaApiError,
  parseSoromaBody,
  soromaJson,
  withSoromaAuth,
} from "@/lib/soroma/api-handler"
import { requirePermission } from "@/lib/soroma/guards"
import { logSoromaAudit } from "@/lib/soroma/audit"
import { createExportJob, generateExportFile } from "@/lib/soroma/reporting"
import { exportRequestSchema } from "@/lib/soroma/validators"
import { prisma } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    return withSoromaAuth(request, async (_req, session) => {
      const permErr = requirePermission(session, ["soroma.reports.view", "soroma.reports.manage"])
      if (permErr) return permErr

      const jobs = await prisma.soromaExportJob.findMany({
        where: { workspaceType: "PLATFORM" },
        orderBy: { createdAt: "desc" },
        take: 100,
      })
      return soromaJson(jobs)
    })
  } catch (error) {
    return handleSoromaApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await parseSoromaBody(request, exportRequestSchema)

    return withSoromaAuth(request, async (_req, session) => {
      const permErr = requirePermission(session, ["soroma.reports.manage", "soroma.exports.manage"])
      if (permErr) return permErr

      if (payload.async) {
        const job = await createExportJob({
          dataset: payload.dataset,
          format: payload.format,
          scope: "platform",
          requestedById: session.userId,
          filters: payload.filters,
        })
        await logSoromaAudit({
          userId: session.userId,
          workspaceType: "PLATFORM",
          action: "REPORT_EXPORT_QUEUED",
          entityType: "SoromaExportJob",
          entityId: job.id,
          afterState: { dataset: payload.dataset, format: payload.format },
        })
        return soromaJson(job, 202)
      }

      const file = await generateExportFile({
        dataset: payload.dataset,
        format: payload.format,
        scope: "platform",
        filters: payload.filters,
        generatedBy: session.userId,
      })
      await logSoromaAudit({
        userId: session.userId,
        workspaceType: "PLATFORM",
        action: "REPORT_EXPORT_DOWNLOAD",
        entityType: "SoromaExport",
        afterState: { dataset: payload.dataset, format: payload.format, rows: file.rows.length },
      })

      return new NextResponse(file.body, {
        status: 200,
        headers: {
          "Content-Type": file.contentType,
          "Content-Disposition": `attachment; filename="${file.fileName}"`,
        },
      })
    })
  } catch (error) {
    return handleSoromaApiError(error)
  }
}
