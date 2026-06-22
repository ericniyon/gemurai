import { InventoryModuleClient } from "@/components/soroma/modules/inventory-module"
import { getInventoryDashboardFull } from "@/lib/soroma/module-dashboards"
import { requireTenantSession } from "@/lib/soroma/server-session"
import { prisma } from "@/lib/database"

export default async function InventoryPage({
  params,
}: {
  params: Promise<{ tenantId: string }>
}) {
  const { tenantId } = await params
  await requireTenantSession(tenantId)
  const [data, tenant] = await Promise.all([
    getInventoryDashboardFull(tenantId),
    prisma.soromaTenant.findUnique({ where: { id: tenantId } }),
  ])

  return <InventoryModuleClient tenantId={tenantId} tenantName={tenant?.name} data={data} />
}
