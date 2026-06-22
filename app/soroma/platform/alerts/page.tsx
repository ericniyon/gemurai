import { SoromaModuleDashboard } from "@/components/soroma/module-dashboard"
import { SoromaAlertCenter } from "@/components/soroma/alert-center"
import { getCachedPlatformAlertsDashboard } from "@/lib/soroma/dashboard-cache"

export default async function PlatformAlertsPage() {
  const data = await getCachedPlatformAlertsDashboard()
  return (
    <div className="space-y-6">
      <SoromaModuleDashboard
        title="Alerts & Issues"
        moduleTag="P-08 · Alerts"
        description="Cross-platform operational issues across tenants and integrations."
        showScopeBanner={false}
        kpis={data.kpis}
        tableTitle="Alerts"
        columns={[
          { key: "title", header: "Title" },
          { key: "type", header: "Type" },
          { key: "severity", header: "Severity", status: true },
          { key: "status", header: "Status", status: true },
          { key: "tenant", header: "Tenant" },
        ]}
        rows={data.rows}
        quickActions={[
          { label: "Export", variant: "default" },
          { label: "Assign" },
        ]}
      />
      <SoromaAlertCenter
        title="Platform Alert Center"
        alerts={data.rows as any}
        runRulesPath="/api/v1/soroma/alerts/rules"
      />
    </div>
  )
}
