import { SoromaModuleDashboard } from "@/components/soroma/module-dashboard"
import {
  safeSoromaExportJobFindMany,
  safeSoromaReportScheduleFindMany,
} from "@/lib/soroma/reporting"
import { prisma } from "@/lib/database"

export default async function TenantReportsPage({
  params,
}: {
  params: Promise<{ tenantId: string }>
}) {
  const { tenantId } = await params
  const [tenant, exportJobs, schedules] = await Promise.all([
    prisma.soromaTenant.findUnique({ where: { id: tenantId }, select: { name: true } }),
    safeSoromaExportJobFindMany({
      where: { workspaceType: "TENANT", tenantId },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    safeSoromaReportScheduleFindMany({
      where: { workspaceType: "TENANT", tenantId },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ])

  return (
    <SoromaModuleDashboard
      title="Tenant Reports"
      moduleTag="T-09 · Reporting & Exports"
      description="Filter-aware reporting, scheduled exports, and governance-ready reporting for this tenant."
      tenantName={tenant?.name}
      kpis={[
        { title: "Export Jobs", value: String(exportJobs.length), severity: "info" },
        {
          title: "Pending Jobs",
          value: String(exportJobs.filter((j) => j.status === "PENDING").length),
          severity: "warning",
        },
        {
          title: "Active Schedules",
          value: String(schedules.filter((s) => s.isActive).length),
          severity: "success",
        },
        {
          title: "Failed Jobs",
          value: String(exportJobs.filter((j) => j.status === "FAILED").length),
          severity: "critical",
        },
      ]}
      tableTitle="Recent Tenant Exports"
      columns={[
        { key: "dataset", header: "Dataset" },
        { key: "format", header: "Format" },
        { key: "status", header: "Status", status: true },
        { key: "rows", header: "Rows" },
        { key: "createdAt", header: "Created" },
      ]}
      rows={exportJobs.map((job) => ({
        id: job.id,
        dataset: job.dataset,
        format: job.format,
        status: job.status,
        rows: job.rowCount ?? "—",
        createdAt: job.createdAt.toISOString().slice(0, 19).replace("T", " "),
      }))}
      quickActions={[
        { label: "Export Jobs API", href: `/api/v1/soroma/tenant/${tenantId}/reports/exports`, variant: "default" },
        { label: "Schedules API", href: `/api/v1/soroma/tenant/${tenantId}/reports/schedules` },
        { label: "Audit Logs", href: `/soroma/tenant/${tenantId}/audit` },
      ]}
      emptyMessage="No tenant exports generated yet."
    />
  )
}
