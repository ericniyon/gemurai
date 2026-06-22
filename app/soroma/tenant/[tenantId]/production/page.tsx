import { ProductionModuleClient } from "@/components/soroma/modules/production-module"
import { getProductionDashboardFull } from "@/lib/soroma/module-dashboards"
import { requireTenantSession } from "@/lib/soroma/server-session"
import { getProductionWorkflowData } from "@/lib/soroma/workflows/page-data"
import { prisma } from "@/lib/database"

export default async function ProductionPage({
  params,
}: {
  params: Promise<{ tenantId: string }>
}) {
  const { tenantId } = await params
  const session = await requireTenantSession(tenantId)
  const [data, tenant, workflow] = await Promise.all([
    getProductionDashboardFull(tenantId),
    prisma.soromaTenant.findUnique({ where: { id: tenantId } }),
    getProductionWorkflowData(tenantId, session),
  ])

  return (
    <ProductionModuleClient
      tenantId={tenantId}
      tenantName={tenant?.name}
      data={data}
      workflowItems={workflow.items}
      recentEvents={workflow.recentEvents}
    />
  )
}
