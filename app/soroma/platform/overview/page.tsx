import { SoromaModuleDashboard } from "@/components/soroma/module-dashboard"
import { SoromaMapWidget } from "@/components/soroma/map-widget"
import {
  getCachedPlatformOverviewCharts,
  getCachedPlatformOverviewKpis,
  getCachedPlatformRecentAlerts,
} from "@/lib/soroma/dashboard-cache"
import { SOROMA_ROUTES } from "@/lib/soroma/constants"
import { prisma } from "@/lib/database"

export default async function PlatformOverviewPage() {
  const [overview, charts, alerts, topTenants] = await Promise.all([
    getCachedPlatformOverviewKpis(),
    getCachedPlatformOverviewCharts(),
    getCachedPlatformRecentAlerts(),
    prisma.soromaTenant.findMany({
      take: 8,
      orderBy: { complianceScore: "desc" },
      select: {
        id: true,
        name: true,
        status: true,
        valueChain: true,
        district: true,
        complianceScore: true,
      },
    }),
  ])

  const regionalPoints = Object.entries(
    topTenants.reduce<Record<string, number>>((acc, tenant) => {
      const district = tenant.district ?? "Unknown"
      acc[district] = (acc[district] ?? 0) + 1
      return acc
    }, {})
  ).map(([district, count]) => ({ id: district, label: district, value: count }))

  return (
    <div className="space-y-6">
      <SoromaModuleDashboard
        title="Platform Overview"
        moduleTag="P-01 · Ecosystem Command"
        description="Cross-tenant performance, onboarding pipeline, integration health, and program impact across the SOROMA FOODS network."
        showScopeBanner={false}
        kpis={overview.kpis}
        charts={charts.slice(0, 2)}
        alerts={alerts}
        alertsViewAllHref={SOROMA_ROUTES.platform.alerts}
        tableTitle="Top Agroprocessors"
        tableDescription="Ranked by compliance score"
        columns={[
          { key: "name", header: "Tenant" },
          { key: "valueChain", header: "Value Chain" },
          { key: "district", header: "Region" },
          { key: "compliance", header: "Compliance" },
          { key: "status", header: "Status", status: true },
        ]}
        rows={topTenants.map((t) => ({
          id: t.id,
          name: t.name,
          valueChain: t.valueChain ?? "—",
          district: t.district ?? "—",
          compliance: t.complianceScore ? `${t.complianceScore}%` : "—",
          status: t.status,
        }))}
        quickActions={[
          {
            label: "Manage Tenants",
            description: "Add, suspend, assign programs",
            href: SOROMA_ROUTES.platform.tenants,
            variant: "tile",
          },
          {
            label: "Onboarding Pipeline",
            description: "Applications and provisioning",
            href: SOROMA_ROUTES.platform.onboarding,
            variant: "tile",
          },
          {
            label: "View Alerts",
            description: "Cross-platform issues",
            href: SOROMA_ROUTES.platform.alerts,
            variant: "tile",
          },
          {
            label: "Integrations Hub",
            description: "Connectors and sync jobs",
            href: SOROMA_ROUTES.platform.integrations,
            variant: "tile",
          },
        ]}
      />
      <SoromaMapWidget
        title="Tenant Distribution by Region"
        description="Regional footprint snapshot aligned with platform map requirement."
        metricLabel="tenants"
        points={regionalPoints}
      />
    </div>
  )
}
