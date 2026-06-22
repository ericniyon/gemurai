import { OrdersModuleClient } from "@/components/soroma/modules/orders-module"
import { getOrdersDashboardFull } from "@/lib/soroma/module-dashboards"
import { requireTenantSession } from "@/lib/soroma/server-session"
import { getOrdersWorkflowData } from "@/lib/soroma/workflows/page-data"
import { prisma } from "@/lib/database"

export default async function OrdersPage({
  params,
}: {
  params: Promise<{ tenantId: string }>
}) {
  const { tenantId } = await params
  const session = await requireTenantSession(tenantId)
  const [data, tenant, workflow] = await Promise.all([
    getOrdersDashboardFull(tenantId),
    prisma.soromaTenant.findUnique({ where: { id: tenantId } }),
    getOrdersWorkflowData(tenantId, session),
  ])

  return (
    <OrdersModuleClient
      tenantId={tenantId}
      tenantName={tenant?.name}
      data={data}
      workflowItems={workflow.items}
      recentEvents={workflow.recentEvents}
    />
  )
}
