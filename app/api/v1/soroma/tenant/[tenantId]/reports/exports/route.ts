import { NextRequest, NextResponse } from "next/server"
import {
  handleSoromaApiError,
  parseSoromaBody,
  soromaJson,
  withSoromaTenantAuth,
} from "@/lib/soroma/api-handler"
import { checkApiPermission, requireTenantScope } from "@/lib/soroma/guards"
import { createExportJob, generateExportFile } from "@/lib/soroma/reporting"
import { exportRequestSchema } from "@/lib/soroma/validators"
import { logSoromaAudit } from "@/lib/soroma/audit"
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
      const permErr = checkApiPermission(session, "reports:GET")
      if (permErr) return permErr

      const jobs = await prisma.soromaExportJob.findMany({
        where: { workspaceType: "TENANT", tenantId },
        orderBy: { createdAt: "desc" },
        take: 100,
      })
      return soromaJson(jobs)
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
    const payload = await parseSoromaBody(request, exportRequestSchema)
    const { tenantId } = await params

    return withSoromaTenantAuth(request, tenantId, async (_req, session) => {
      const scopeErr = await requireTenantScope(session, tenantId)
      if (scopeErr) return scopeErr
      const permErr = checkApiPermission(session, "reports:POST")
      if (permErr) return permErr

      if (payload.async) {
        const job = await createExportJob({
          dataset: payload.dataset,
          format: payload.format,
          scope: "tenant",
          tenantId,
          requestedById: session.userId,
          filters: payload.filters,
        })
        await logSoromaAudit({
          userId: session.userId,
          tenantId,
          workspaceType: "TENANT",
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
        scope: "tenant",
        tenantId,
        filters: payload.filters,
        generatedBy: session.userId,
      })
      await logSoromaAudit({
        userId: session.userId,
        tenantId,
        workspaceType: "TENANT",
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
