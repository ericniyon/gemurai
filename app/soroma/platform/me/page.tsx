import { SoromaModuleDashboard } from "@/components/soroma/module-dashboard"
import { getPlatformMEDashboard } from "@/lib/soroma/dashboard-data"
import { getPlatformKpis } from "@/lib/soroma/kpi-engine"

export default async function MEDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ scope?: string }>
}) {
  const { scope = "30d" } = await searchParams
  const [data, kpiEngine] = await Promise.all([
    getPlatformMEDashboard(),
    getPlatformKpis(scope),
  ])
  return (
    <SoromaModuleDashboard
      title="M&E Dashboard"
      moduleTag="P-05 · Monitoring & Evaluation"
      description="Program outcomes: digital PO adoption, beneficiaries, farmer value, and reporting."
      showScopeBanner={false}
      kpis={kpiEngine.kpis.map((k) => ({
        title: k.title,
        value: k.value,
        severity: k.severity,
        drilldownUrl: `/soroma/platform/analytics/drilldown?kpi=${k.drilldownKey}&scope=${kpiEngine.scope}`,
      }))}
      tableTitle="Outcome Indicators"
      columns={[
        { key: "name", header: "Indicator" },
        { key: "code", header: "Code" },
        { key: "unit", header: "Unit" },
        { key: "target", header: "Target" },
      ]}
      rows={data.rows}
      quickActions={[
        { label: "Export M&E Report", variant: "default" },
        { label: "Run Data Validation" },
        { label: "Scope 7d", href: "?scope=7d" },
        { label: "Scope 30d", href: "?scope=30d" },
        { label: "Scope 90d", href: "?scope=90d" },
      ]}
    />
  )
}
