import React from "react"
import { renderToBuffer } from "@react-pdf/renderer"
import * as XLSX from "xlsx"
import { prisma } from "@/lib/database"
import { logSoromaAudit } from "./audit"
import { SoromaExportPDFDocument } from "./export-pdf-template"

export type SoromaExportFormat = "CSV" | "XLSX" | "PDF"
export type SoromaReportCadence = "DAILY" | "WEEKLY" | "MONTHLY"
export type SoromaDataset =
  | "alerts"
  | "audit_logs"
  | "workflows"
  | "integrations"
  | "orders"
  | "finance"

type ReportScope = "platform" | "tenant"

type DateFilters = {
  startDate?: string
  endDate?: string
  search?: string
  status?: string
}

function asDate(input?: string | null): Date | undefined {
  if (!input) return undefined
  const date = new Date(input)
  return Number.isNaN(date.getTime()) ? undefined : date
}

function sanitizeCell(value: unknown): string | number | boolean {
  if (value === null || value === undefined) return ""
  if (typeof value === "number" || typeof value === "boolean") return value
  if (value instanceof Date) return value.toISOString()
  if (typeof value === "object") return JSON.stringify(value)
  return String(value)
}

function normalizeRows(rows: Array<Record<string, unknown>>): Array<Record<string, string | number | boolean>> {
  return rows.map((row) =>
    Object.fromEntries(Object.entries(row).map(([key, value]) => [key, sanitizeCell(value)]))
  )
}

function rowsToCsv(
  rows: Array<Record<string, unknown>>,
  scopeBanner?: Record<string, string>
) {
  if (!rows.length) return "No records\n"
  const normalized = normalizeRows(rows)
  const headers = Object.keys(normalized[0])
  const escape = (value: string | number | boolean) =>
    `"${String(value).replace(/"/g, '""')}"`
  const lines = normalized.map((row) => headers.map((h) => escape(row[h] ?? "")).join(","))
  const scopeLines = scopeBanner
    ? Object.entries(scopeBanner).map(([key, value]) => `# ${key}: ${value}`)
    : []
  return [...scopeLines, ...(scopeLines.length ? [""] : []), headers.join(","), ...lines].join("\n")
}

function nextRunFromCadence(cadence: SoromaReportCadence, from = new Date()) {
  const next = new Date(from)
  if (cadence === "DAILY") next.setDate(next.getDate() + 1)
  if (cadence === "WEEKLY") next.setDate(next.getDate() + 7)
  if (cadence === "MONTHLY") next.setMonth(next.getMonth() + 1)
  return next
}

export async function queryDataset(params: {
  dataset: SoromaDataset
  scope: ReportScope
  tenantId?: string
  filters?: DateFilters
  take?: number
}): Promise<Array<Record<string, unknown>>> {
  const { dataset, scope, tenantId, filters, take = 1500 } = params
  const startDate = asDate(filters?.startDate)
  const endDate = asDate(filters?.endDate)
  const dateRange = startDate || endDate ? { gte: startDate, lte: endDate } : undefined
  const search = filters?.search?.trim()

  if (dataset === "alerts") {
    const rows = await prisma.soromaAlert.findMany({
      where: {
        ...(scope === "tenant" ? { tenantId } : {}),
        ...(filters?.status ? { status: filters.status } : {}),
        ...(search
          ? {
              OR: [
                { title: { contains: search, mode: "insensitive" } },
                { type: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
        ...(dateRange ? { createdAt: dateRange } : {}),
      },
      include: { tenant: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take,
    })
    return rows.map((row) => ({
      id: row.id,
      tenant: row.tenant?.name ?? row.tenantId ?? "platform",
      severity: row.severity,
      type: row.type,
      title: row.title,
      status: row.status,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }))
  }

  if (dataset === "audit_logs") {
    const rows = await prisma.soromaAuditLog.findMany({
      where: {
        ...(scope === "tenant" ? { tenantId } : {}),
        ...(filters?.status ? { action: filters.status } : {}),
        ...(search
          ? {
              OR: [
                { action: { contains: search, mode: "insensitive" } },
                { entityType: { contains: search, mode: "insensitive" } },
                { entityId: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
        ...(dateRange ? { createdAt: dateRange } : {}),
      },
      orderBy: { createdAt: "desc" },
      take,
    })
    return rows.map((row) => ({
      id: row.id,
      workspaceType: row.workspaceType,
      tenantId: row.tenantId,
      userId: row.userId,
      action: row.action,
      entityType: row.entityType,
      entityId: row.entityId,
      createdAt: row.createdAt,
    }))
  }

  if (dataset === "workflows") {
    const rows = await prisma.soromaWorkflowEvent.findMany({
      where: {
        ...(scope === "tenant" ? { tenantId } : {}),
        ...(filters?.status ? { toStatus: filters.status } : {}),
        ...(search
          ? {
              OR: [
                { action: { contains: search, mode: "insensitive" } },
                { entityType: { contains: search, mode: "insensitive" } },
                { entityId: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
        ...(dateRange ? { createdAt: dateRange } : {}),
      },
      orderBy: { createdAt: "desc" },
      take,
    })
    return rows.map((row) => ({
      id: row.id,
      tenantId: row.tenantId,
      entityType: row.entityType,
      entityId: row.entityId,
      fromStatus: row.fromStatus,
      toStatus: row.toStatus,
      action: row.action,
      userId: row.userId,
      createdAt: row.createdAt,
    }))
  }

  if (dataset === "integrations") {
    const rows = await prisma.soromaSyncJob.findMany({
      where: {
        ...(scope === "tenant" ? { connection: { tenantId } } : {}),
        ...(filters?.status ? { status: filters.status } : {}),
        ...(dateRange ? { createdAt: dateRange } : {}),
      },
      include: {
        connection: {
          include: {
            connector: true,
            tenant: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take,
    })
    return rows.map((row) => ({
      id: row.id,
      tenant: row.connection.tenant.name,
      connector: row.connection.connector.name,
      jobType: row.jobType,
      status: row.status,
      startedAt: row.startedAt,
      completedAt: row.completedAt,
      errorMessage: row.errorMessage,
      createdAt: row.createdAt,
    }))
  }

  if (dataset === "orders") {
    const rows = await prisma.soromaOrder.findMany({
      where: {
        ...(scope === "tenant" ? { tenantId } : {}),
        ...(filters?.status ? { status: filters.status } : {}),
        ...(search
          ? {
              OR: [
                { orderNumber: { contains: search, mode: "insensitive" } },
                { buyerName: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
        ...(dateRange ? { orderDate: dateRange } : {}),
      },
      include: { tenant: { select: { name: true } } },
      orderBy: { orderDate: "desc" },
      take,
    })
    return rows.map((row) => ({
      id: row.id,
      tenant: row.tenant.name,
      orderNumber: row.orderNumber,
      buyerName: row.buyerName,
      amount: Number(row.amount),
      currency: row.currency,
      status: row.status,
      orderDate: row.orderDate,
      deliveryDate: row.deliveryDate,
    }))
  }

  const rows = await prisma.soromaFinanceRecord.findMany({
    where: {
      ...(scope === "tenant" ? { tenantId } : {}),
      ...(filters?.status ? { recordType: filters.status } : {}),
      ...(search ? { reference: { contains: search, mode: "insensitive" } } : {}),
      ...(dateRange ? { createdAt: dateRange } : {}),
    },
    orderBy: { createdAt: "desc" },
    take,
  })
  return rows.map((row) => ({
    id: row.id,
    tenantId: row.tenantId,
    recordType: row.recordType,
    amount: Number(row.amount),
    currency: row.currency,
    reference: row.reference,
    dueDate: row.dueDate,
    paidAt: row.paidAt,
    createdAt: row.createdAt,
  }))
}

export async function generateExportFile(params: {
  dataset: SoromaDataset
  format: SoromaExportFormat
  scope: ReportScope
  tenantId?: string
  filters?: DateFilters
  title?: string
  generatedBy?: string
}) {
  const rows = await queryDataset({
    dataset: params.dataset,
    scope: params.scope,
    tenantId: params.tenantId,
    filters: params.filters,
  })
  const normalized = normalizeRows(rows)
  const generatedAt = new Date().toISOString()
  const fileStem = `soroma_${params.scope}_${params.dataset}_${generatedAt.slice(0, 10)}`
  const summary = {
    rows: normalized.length,
    generatedAt,
    dataset: params.dataset,
    scope: params.scope,
    tenantId: params.tenantId ?? null,
  }
  const scopeBanner = {
    scope: params.scope,
    tenant: params.tenantId ?? "all",
    generatedBy: params.generatedBy ?? "system",
    generatedAt,
    filters: JSON.stringify(params.filters ?? {}),
  }

  if (params.format === "CSV") {
    return {
      fileName: `${fileStem}.csv`,
      contentType: "text/csv; charset=utf-8",
      body: rowsToCsv(normalized, scopeBanner),
      summary: { ...summary, scopeBanner },
      rows: normalized,
    }
  }

  if (params.format === "XLSX") {
    const workbook = XLSX.utils.book_new()
    const scopeSheet = XLSX.utils.json_to_sheet(
      Object.entries(scopeBanner).map(([key, value]) => ({ key, value }))
    )
    const sheet = XLSX.utils.json_to_sheet(normalized)
    XLSX.utils.book_append_sheet(workbook, scopeSheet, "Scope")
    XLSX.utils.book_append_sheet(workbook, sheet, "Report")
    const body = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer
    return {
      fileName: `${fileStem}.xlsx`,
      contentType:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      body,
      summary: { ...summary, scopeBanner },
      rows: normalized,
    }
  }

  const columns = normalized.length ? Object.keys(normalized[0]) : ["result"]
  const pdf = await renderToBuffer(
    React.createElement(SoromaExportPDFDocument, {
      title: params.title ?? `SOROMA ${params.dataset.toUpperCase()} REPORT`,
      subtitle: `Scope: ${params.scope}${params.tenantId ? ` · Tenant: ${params.tenantId}` : ""} · By: ${params.generatedBy ?? "system"}`,
      columns,
      rows: normalized,
    })
  )
  return {
    fileName: `${fileStem}.pdf`,
    contentType: "application/pdf",
    body: pdf,
    summary: { ...summary, scopeBanner },
    rows: normalized,
  }
}

export async function createExportJob(params: {
  dataset: SoromaDataset
  format: SoromaExportFormat
  scope: ReportScope
  tenantId?: string
  requestedById?: string
  filters?: DateFilters
}) {
  return prisma.soromaExportJob.create({
    data: {
      dataset: params.dataset,
      format: params.format,
      workspaceType: params.scope === "tenant" ? "TENANT" : "PLATFORM",
      tenantId: params.tenantId,
      requestedById: params.requestedById,
      filters: params.filters,
      status: "PENDING",
    },
  })
}

export async function processExportJob(jobId: string, actorId?: string) {
  const job = await prisma.soromaExportJob.findUnique({ where: { id: jobId } })
  if (!job) return null
  await prisma.soromaExportJob.update({
    where: { id: jobId },
    data: { status: "PROCESSING", startedAt: new Date() },
  })

  try {
    const file = await generateExportFile({
      dataset: job.dataset as SoromaDataset,
      format: job.format as SoromaExportFormat,
      scope: job.workspaceType === "TENANT" ? "tenant" : "platform",
      tenantId: job.tenantId ?? undefined,
      filters: (job.filters as DateFilters | null) ?? undefined,
      generatedBy: actorId ?? job.requestedById ?? undefined,
    })

    const updated = await prisma.soromaExportJob.update({
      where: { id: jobId },
      data: {
        status: "COMPLETED",
        rowCount: file.rows.length,
        summary: file.summary,
        completedAt: new Date(),
      },
    })

    await logSoromaAudit({
      userId: actorId ?? job.requestedById ?? undefined,
      tenantId: job.tenantId ?? undefined,
      workspaceType: job.workspaceType,
      action: "REPORT_EXPORT_PROCESSED",
      entityType: "SoromaExportJob",
      entityId: job.id,
      beforeState: { status: "PROCESSING" },
      afterState: { status: "COMPLETED", rowCount: file.rows.length },
    })

    return updated
  } catch (error) {
    const message = error instanceof Error ? error.message : "Export processing failed"
    await prisma.soromaExportJob.update({
      where: { id: jobId },
      data: { status: "FAILED", errorMessage: message, completedAt: new Date() },
    })
    return null
  }
}

export async function createReportSchedule(params: {
  name: string
  dataset: SoromaDataset
  format: SoromaExportFormat
  cadence: SoromaReportCadence
  scope: ReportScope
  tenantId?: string
  createdById?: string
  filters?: DateFilters
}) {
  return prisma.soromaReportSchedule.create({
    data: {
      name: params.name,
      dataset: params.dataset,
      format: params.format,
      cadence: params.cadence,
      workspaceType: params.scope === "tenant" ? "TENANT" : "PLATFORM",
      tenantId: params.tenantId,
      createdById: params.createdById,
      filters: params.filters,
      nextRunAt: nextRunFromCadence(params.cadence),
    },
  })
}

export async function runDueSchedules(params?: {
  actorId?: string
  scope?: ReportScope
  tenantId?: string
}) {
  const now = new Date()
  const due = await prisma.soromaReportSchedule.findMany({
    where: {
      isActive: true,
      nextRunAt: { lte: now },
      ...(params?.scope
        ? { workspaceType: params.scope === "tenant" ? "TENANT" : "PLATFORM" }
        : {}),
      ...(params?.tenantId ? { tenantId: params.tenantId } : {}),
    },
    orderBy: { nextRunAt: "asc" },
    take: 50,
  })

  const created: string[] = []
  for (const schedule of due) {
    const job = await createExportJob({
      dataset: schedule.dataset as SoromaDataset,
      format: schedule.format as SoromaExportFormat,
      scope: schedule.workspaceType === "TENANT" ? "tenant" : "platform",
      tenantId: schedule.tenantId ?? undefined,
      requestedById: params?.actorId ?? schedule.createdById ?? undefined,
      filters: (schedule.filters as DateFilters | null) ?? undefined,
    })
    await processExportJob(job.id, params?.actorId ?? schedule.createdById ?? undefined)
    created.push(job.id)

    await prisma.soromaReportSchedule.update({
      where: { id: schedule.id },
      data: {
        lastRunAt: now,
        nextRunAt: nextRunFromCadence(schedule.cadence as SoromaReportCadence, now),
      },
    })
  }
  return { schedules: due.length, exportJobs: created }
}

export async function recoverStuckExportJobs(params?: {
  scope?: ReportScope
  tenantId?: string
  maxAgeMinutes?: number
  limit?: number
}) {
  const maxAgeMinutes = params?.maxAgeMinutes ?? 30
  const limit = params?.limit ?? 100
  const cutoff = new Date(Date.now() - maxAgeMinutes * 60 * 1000)

  const stuck = await prisma.soromaExportJob.findMany({
    where: {
      status: "PROCESSING",
      startedAt: { lte: cutoff },
      ...(params?.scope
        ? { workspaceType: params.scope === "tenant" ? "TENANT" : "PLATFORM" }
        : {}),
      ...(params?.tenantId ? { tenantId: params.tenantId } : {}),
    },
    orderBy: { startedAt: "asc" },
    take: Math.min(limit, 500),
    select: { id: true },
  })

  if (!stuck.length) return { recovered: 0, jobs: [] as string[] }

  await prisma.soromaExportJob.updateMany({
    where: { id: { in: stuck.map((job) => job.id) } },
    data: {
      status: "PENDING",
      startedAt: null,
      errorMessage: "Recovered from stale processing state by resilience sweep",
    },
  })

  return { recovered: stuck.length, jobs: stuck.map((job) => job.id) }
}
