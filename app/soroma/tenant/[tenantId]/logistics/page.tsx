import { LogisticsModuleClient } from "@/components/soroma/modules/logistics-module"
import { getLogisticsDashboardFull } from "@/lib/soroma/module-dashboards"
import { requireTenantSession } from "@/lib/soroma/server-session"
import { getLogisticsWorkflowData } from "@/lib/soroma/workflows/page-data"
import { prisma } from "@/lib/database"

export default async function LogisticsPage({
  params,
}: {
  params: Promise<{ tenantId: string }>
}) {
  const { tenantId } = await params
  const session = await requireTenantSession(tenantId)
  const [data, tenant, workflow] = await Promise.all([
    getLogisticsDashboardFull(tenantId),
    prisma.soromaTenant.findUnique({ where: { id: tenantId } }),
    getLogisticsWorkflowData(tenantId, session),
  ])

  return (
    <LogisticsModuleClient
      tenantId={tenantId}
      tenantName={tenant?.name}
      data={data}
      workflowItems={workflow.items}
      recentEvents={workflow.recentEvents}
    />
  )
}
