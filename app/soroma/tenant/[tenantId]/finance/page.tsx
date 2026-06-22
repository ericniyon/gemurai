import { FinanceModuleClient } from "@/components/soroma/modules/finance-module"
import { getFinanceDashboardFull } from "@/lib/soroma/module-dashboards"
import { requireTenantSession } from "@/lib/soroma/server-session"
import { prisma } from "@/lib/database"

export default async function FinancePage({
  params,
}: {
  params: Promise<{ tenantId: string }>
}) {
  const { tenantId } = await params
  await requireTenantSession(tenantId)
  const [data, tenant] = await Promise.all([
    getFinanceDashboardFull(tenantId),
    prisma.soromaTenant.findUnique({ where: { id: tenantId } }),
  ])

  return <FinanceModuleClient tenantId={tenantId} tenantName={tenant?.name} data={data} />
}
