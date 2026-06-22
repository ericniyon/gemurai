import { SoromaModuleDashboard } from "@/components/soroma/module-dashboard"
import { getPlatformIntegrationHealthDashboard } from "@/lib/soroma/dashboard-data"
import { prisma } from "@/lib/database"

export default async function IntegrationHealthPage() {
  const [data, deadLetterJobs] = await Promise.all([
    getPlatformIntegrationHealthDashboard(),
    prisma.soromaSyncJob.findMany({
      where: { status: "DEAD_LETTER" },
      include: {
        connection: {
          include: { tenant: true, connector: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ])
  return (
    <div className="space-y-6">
      <SoromaModuleDashboard
        title="Integration Health by Tenant"
        moduleTag="P-10 · Integration Health"
        description="Synchronization health matrix across tenants and connectors."
        showScopeBanner={false}
        kpis={data.kpis}
        tableTitle="Tenant × Connector Matrix"
        columns={[
          { key: "tenant", header: "Tenant" },
          { key: "connector", header: "Connector" },
          { key: "status", header: "Status", status: true },
          { key: "successRate", header: "Success Rate" },
        ]}
        rows={data.rows}
        quickActions={[{ label: "Export", variant: "default", permission: "soroma.integration_health.view" }]}
      />

      <SoromaModuleDashboard
        title="Dead-Letter Queue"
        moduleTag="P-10A · Failed Sync Recovery"
        description="Jobs requiring manual retry or connector intervention."
        showScopeBanner={false}
        kpis={[
          {
            title: "Dead-Letter Jobs",
            value: String(deadLetterJobs.length),
            severity: deadLetterJobs.length > 0 ? ("critical" as const) : ("success" as const),
          },
        ]}
        tableTitle="Dead-Letter Jobs"
        columns={[
          { key: "tenant", header: "Tenant" },
          { key: "connector", header: "Connector" },
          { key: "jobType", header: "Job Type" },
          { key: "status", header: "Status", status: true },
          { key: "error", header: "Error" },
          { key: "createdAt", header: "Created" },
        ]}
        rows={deadLetterJobs.map((j) => ({
          id: j.id,
          tenant: j.connection.tenant.name,
          connector: j.connection.connector.name,
          jobType: j.jobType,
          status: j.status,
          error: j.errorMessage ?? "—",
          createdAt: j.createdAt.toISOString().slice(0, 16).replace("T", " "),
        }))}
      />
    </div>
  )
}
