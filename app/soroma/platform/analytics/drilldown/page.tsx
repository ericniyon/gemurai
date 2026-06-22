import { SoromaModuleDashboard } from "@/components/soroma/module-dashboard"
import { getPlatformKpiDrilldown } from "@/lib/soroma/kpi-engine"

export default async function PlatformAnalyticsDrilldownPage({
  searchParams,
}: {
  searchParams: Promise<{ kpi?: string; scope?: string }>
}) {
  const { kpi = "ecosystem_trade_value", scope = "30d" } = await searchParams
  const drilldown = await getPlatformKpiDrilldown(kpi, scope)
  const rows = drilldown.rows as Array<Record<string, unknown>>
  const columns = drilldown.columns.map((col) => ({
    key: col,
    header: col.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
  }))

  return (
    <SoromaModuleDashboard
      title={`Platform KPI Drilldown · ${kpi.replace(/_/g, " ")}`}
      moduleTag="P-Analytics Drilldown"
      description={`Scope: ${drilldown.scope}`}
      showScopeBanner={false}
      kpis={[
        {
          title: "Rows",
          value: String(rows.length),
          severity: "info",
        },
      ]}
      tableTitle="Drilldown Records"
      columns={columns}
      rows={rows}
      quickActions={[
        { label: "Last 7 days", href: `?kpi=${kpi}&scope=7d` },
        { label: "Last 30 days", href: `?kpi=${kpi}&scope=30d`, variant: "default" },
        { label: "Last 90 days", href: `?kpi=${kpi}&scope=90d` },
        { label: "YTD", href: `?kpi=${kpi}&scope=ytd` },
      ]}
      emptyMessage="No records available for this KPI scope."
    />
  )
}
