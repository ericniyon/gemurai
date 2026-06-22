import { SoromaAlertCenter } from "@/components/soroma/alert-center"
import { SoromaModuleDashboard } from "@/components/soroma/module-dashboard"
import { getCachedTenantAlertsDashboard } from "@/lib/soroma/dashboard-cache"
import { prisma } from "@/lib/database"

export default async function TenantAlertsPage({
  params,
}: {
  params: Promise<{ tenantId: string }>
}) {
  const { tenantId } = await params
  const [data, tenant] = await Promise.all([
    getCachedTenantAlertsDashboard(tenantId),
    prisma.soromaTenant.findUnique({ where: { id: tenantId }, select: { name: true } }),
  ])

  return (
    <div className="space-y-6">
      <SoromaModuleDashboard
        title="Alerts & Notifications"
        moduleTag="T-11 · Alert Engine"
        description="Low stock, integrations, traceability, compliance and finance issue monitoring."
        tenantName={tenant?.name}
        kpis={data.kpis}
        tableTitle="Tenant Alerts"
        columns={[
          { key: "title", header: "Title" },
          { key: "type", header: "Type" },
          { key: "severity", header: "Severity", status: true },
          { key: "status", header: "Status", status: true },
        ]}
        rows={data.rows}
      />

      <SoromaAlertCenter
        title="Tenant Alert Center"
        alerts={data.rows as any}
        runRulesPath={`/api/v1/soroma/tenant/${tenantId}/alerts/refresh`}
      />
    </div>
  )
}
