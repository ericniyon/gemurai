import { SoromaModuleDashboard } from "@/components/soroma/module-dashboard"
import { getPlatformEcosystemDashboard } from "@/lib/soroma/dashboard-data"
import { getPlatformKpis } from "@/lib/soroma/kpi-engine"

export default async function EcosystemAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ scope?: string }>
}) {
  const { scope = "30d" } = await searchParams
  const [data, kpiEngine] = await Promise.all([
    getPlatformEcosystemDashboard(),
    getPlatformKpis(scope),
  ])
  return (
    <SoromaModuleDashboard
      title="Ecosystem Analytics"
      moduleTag="P-06 · Ecosystem Analytics"
      description="Platform-wide trade value, orders, jobs supported, regions, and value chains."
      showScopeBanner={false}
      kpis={kpiEngine.kpis.map((k) => ({
        title: k.title,
        value: k.value,
        severity: k.severity,
        drilldownUrl: `/soroma/platform/analytics/drilldown?kpi=${k.drilldownKey}&scope=${kpiEngine.scope}`,
      }))}
      tableTitle="Top Agroprocessors"
      columns={[
        { key: "name", header: "Tenant" },
        { key: "region", header: "Region" },
        { key: "valueChain", header: "Value Chain" },
        { key: "status", header: "Status", status: true },
        { key: "compliance", header: "Compliance" },
      ]}
      rows={data.rows}
      quickActions={[
        { label: "Export", variant: "default" },
        { label: "Scope 7d", href: "?scope=7d" },
        { label: "Scope 30d", href: "?scope=30d" },
        { label: "Scope YTD", href: "?scope=ytd" },
      ]}
    />
  )
}
