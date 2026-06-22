import { IntegrationsModuleClient } from "@/components/soroma/modules/integrations-module"
import { getIntegrationsDashboard } from "@/lib/soroma/dashboard-data"
import { requireTenantSession } from "@/lib/soroma/server-session"
import { prisma } from "@/lib/database"

export default async function IntegrationsPage({
  params,
}: {
  params: Promise<{ tenantId: string }>
}) {
  const { tenantId } = await params
  await requireTenantSession(tenantId)
  const [data, tenant, connections, syncJobs] = await Promise.all([
    getIntegrationsDashboard(tenantId),
    prisma.soromaTenant.findUnique({ where: { id: tenantId } }),
    prisma.soromaTenantConnection.findMany({
      where: { tenantId },
      include: { connector: true },
    }),
    prisma.soromaSyncJob.findMany({
      where: { connection: { tenantId } },
      include: { connection: { include: { connector: true } } },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ])

  return (
    <IntegrationsModuleClient
      tenantId={tenantId}
      tenantName={tenant?.name}
      data={{ ...data, connections, syncJobs }}
    />
  )
}
