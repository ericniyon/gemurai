import { SoromaModuleDashboard } from "@/components/soroma/module-dashboard"
import { getTenantKpiDrilldown } from "@/lib/soroma/kpi-engine"
import { prisma } from "@/lib/database"

export default async function TenantAnalyticsDrilldownPage({
  params,
  searchParams,
}: {
  params: Promise<{ tenantId: string }>
  searchParams: Promise<{ kpi?: string; scope?: string }>
}) {
  const { tenantId } = await params
  const { kpi = "gross_margin", scope = "30d" } = await searchParams
  const [tenant, drilldown] = await Promise.all([
    prisma.soromaTenant.findUnique({ where: { id: tenantId }, select: { name: true } }),
    getTenantKpiDrilldown(tenantId, kpi, scope),
  ])

  const sampleRows = drilldown.rows as Array<Record<string, unknown>>
  const columns = drilldown.columns.map((col) => ({
    key: col,
    header: col.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
  }))

  return (
    <SoromaModuleDashboard
      title={`KPI Drilldown · ${kpi.replace(/_/g, " ")}`}
      moduleTag="T-Analytics Drilldown"
      description={`Scope: ${drilldown.scope}`}
      tenantName={tenant?.name}
      kpis={[
        {
          title: "Rows",
          value: String(sampleRows.length),
          severity: "info",
        },
      ]}
      tableTitle="Drilldown Records"
      columns={columns}
      rows={sampleRows}
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
