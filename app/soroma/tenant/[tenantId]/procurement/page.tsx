import { ProcurementModuleClient } from "@/components/soroma/modules/procurement-module"
import { getProcurementDashboardFull } from "@/lib/soroma/module-dashboards"
import { requireTenantSession } from "@/lib/soroma/server-session"
import { getProcurementWorkflowData } from "@/lib/soroma/workflows/page-data"
import { prisma } from "@/lib/database"

export default async function ProcurementPage({
  params,
}: {
  params: Promise<{ tenantId: string }>
}) {
  const { tenantId } = await params
  const session = await requireTenantSession(tenantId)
  const [data, tenant, workflow] = await Promise.all([
    getProcurementDashboardFull(tenantId),
    prisma.soromaTenant.findUnique({ where: { id: tenantId } }),
    getProcurementWorkflowData(tenantId, session),
  ])

  return (
    <ProcurementModuleClient
      tenantId={tenantId}
      tenantName={tenant?.name}
      data={data}
      workflowItems={workflow.items}
      recentEvents={workflow.recentEvents}
    />
  )
}
