import { SoromaModuleDashboard } from "@/components/soroma/module-dashboard"
import {
  safeSoromaExportJobFindMany,
  safeSoromaReportScheduleFindMany,
} from "@/lib/soroma/reporting"

export default async function PlatformReportsPage() {
  const [exportJobs, schedules] = await Promise.all([
    safeSoromaExportJobFindMany({
      where: { workspaceType: "PLATFORM" },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    safeSoromaReportScheduleFindMany({
      where: { workspaceType: "PLATFORM" },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ])

  return (
    <SoromaModuleDashboard
      title="Reports & Exports"
      moduleTag="P-09 · Governance Reporting"
      description="Scheduled reporting, asynchronous exports, and governance-ready data delivery."
      showScopeBanner={false}
      kpis={[
        { title: "Export Jobs", value: String(exportJobs.length), severity: "info" },
        {
          title: "Queued Jobs",
          value: String(exportJobs.filter((j) => j.status === "PENDING").length),
          severity: "warning",
        },
        {
          title: "Active Schedules",
          value: String(schedules.filter((s) => s.isActive).length),
          severity: "success",
        },
        {
          title: "Failed Exports",
          value: String(exportJobs.filter((j) => j.status === "FAILED").length),
          severity: "critical",
        },
      ]}
      tableTitle="Recent Export Jobs"
      tableDescription="Track async job execution and delivery states"
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
        { label: "View Export Jobs API", href: "/api/v1/soroma/platform/reports/exports", variant: "default" },
        { label: "View Schedules API", href: "/api/v1/soroma/platform/reports/schedules" },
        { label: "Ops Health", href: "/api/v1/soroma/ops/health" },
        { label: "Audit Dashboard", href: "/soroma/platform/audit" },
      ]}
      emptyMessage="No exports generated yet."
    />
  )
}
