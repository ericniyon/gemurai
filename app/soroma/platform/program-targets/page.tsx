import { SoromaModuleDashboard } from "@/components/soroma/module-dashboard"
import { getPlatformProgramTargetsDashboard } from "@/lib/soroma/dashboard-data"

export default async function ProgramTargetsPage() {
  const data = await getPlatformProgramTargetsDashboard()
  return (
    <SoromaModuleDashboard
      title="Program Targets & KPI Tracking"
      moduleTag="P-04 · Program Targets"
      description="Annual and quarterly program targets, KPI progress, and achievement."
      showScopeBanner={false}
      kpis={data.kpis}
      tableTitle="Quarterly Targets"
      columns={[
        { key: "period", header: "Period" },
        { key: "year", header: "Year" },
        { key: "target", header: "Target" },
        { key: "actual", header: "Actual" },
        { key: "status", header: "Status", status: true },
      ]}
      rows={data.rows}
      quickActions={[{ label: "Export", variant: "default" }]}
    />
  )
}
