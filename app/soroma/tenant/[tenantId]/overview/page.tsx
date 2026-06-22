import { TenantOverviewModule } from "@/components/soroma/modules/tenant-overview-module"
import {
  getCachedTenantOverviewCharts,
  getCachedTenantRecentAlerts,
} from "@/lib/soroma/dashboard-cache"
import { getTenantOverviewSnapshot } from "@/lib/soroma/dashboard-data"
import { getTenantKpis, type SoromaDateScope } from "@/lib/soroma/kpi-engine"

export default async function TenantOverviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ tenantId: string }>
  searchParams: Promise<{ scope?: string }>
}) {
  const { tenantId } = await params
  const { scope: scopeParam = "30d" } = await searchParams
  const scope = (["7d", "30d", "90d", "ytd"].includes(scopeParam)
    ? scopeParam
    : "30d") as SoromaDateScope

  const [overview, charts, alerts, snapshot] = await Promise.all([
    getTenantKpis(tenantId, scope),
    getCachedTenantOverviewCharts(tenantId),
    getCachedTenantRecentAlerts(tenantId),
    getTenantOverviewSnapshot(tenantId),
  ])

  return (
    <TenantOverviewModule
      tenantId={tenantId}
      tenantName={snapshot.tenant?.name}
      scope={scope}
      kpis={overview.kpis.map((k) => ({
        title: k.title,
        value: k.value,
        severity: k.severity,
        drilldownUrl: `/soroma/tenant/${tenantId}/analytics/drilldown?kpi=${k.drilldownKey}&scope=${overview.scope}`,
      }))}
      charts={charts}
      alerts={alerts}
      snapshot={snapshot}
    />
  )
}
