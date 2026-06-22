import { SoromaModuleDashboard } from "@/components/soroma/module-dashboard"
import { SoromaIntegrationSyncCenter } from "@/components/soroma/integration-sync-center"
import { getPlatformIntegrationsDashboard } from "@/lib/soroma/dashboard-data"
import { prisma } from "@/lib/database"

export default async function PlatformIntegrationsPage() {
  const [data, connections, jobs] = await Promise.all([
    getPlatformIntegrationsDashboard(),
    prisma.soromaTenantConnection.findMany({
      include: { connector: true, tenant: true },
      orderBy: { updatedAt: "desc" },
      take: 30,
    }),
    prisma.soromaSyncJob.findMany({
      include: {
        connection: {
          include: { connector: true, tenant: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ])
  return (
    <div className="space-y-6">
      <SoromaModuleDashboard
        title="Integrations Hub"
        moduleTag="P-09 · Integrations Hub"
        description="Platform connector registry, webhook orchestration, retry queue, and sync logs."
        showScopeBanner={false}
        kpis={data.kpis}
        tableTitle="Tenant Connections"
        columns={[
          { key: "tenant", header: "Tenant" },
          { key: "connector", header: "Connector" },
          { key: "status", header: "Status", status: true },
          { key: "lastSync", header: "Last Sync" },
        ]}
        rows={data.rows}
        quickActions={[
          { label: "Add Connector", variant: "default", permission: "soroma.integrations.manage" },
          { label: "View Sync Logs", permission: "soroma.integration_health.view" },
        ]}
      />

      <SoromaIntegrationSyncCenter
        mode="platform"
        connections={connections.map((c) => ({
          id: c.id,
          connectorName: c.connector.name,
          tenantName: c.tenant.name,
          status: c.status,
          successRate: c.successRate,
          lastSyncAt: c.lastSyncAt?.toISOString() ?? null,
        }))}
        jobs={jobs.map((j) => ({
          id: j.id,
          status: j.status,
          jobType: j.jobType,
          connectorName: j.connection.connector.name,
          tenantName: j.connection.tenant.name,
          errorMessage: j.errorMessage,
          createdAt: j.createdAt.toISOString(),
        }))}
      />
    </div>
  )
}
