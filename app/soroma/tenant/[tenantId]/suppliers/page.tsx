import { SuppliersModuleClient } from "@/components/soroma/modules/suppliers-module"
import { getSuppliersDashboardFull } from "@/lib/soroma/module-dashboards"
import { prisma } from "@/lib/database"

export default async function SuppliersPage({
  params,
}: {
  params: Promise<{ tenantId: string }>
}) {
  const { tenantId } = await params
  const [data, tenant] = await Promise.all([
    getSuppliersDashboardFull(tenantId),
    prisma.soromaTenant.findUnique({ where: { id: tenantId } }),
  ])

  return (
    <SuppliersModuleClient tenantId={tenantId} tenantName={tenant?.name} data={data} />
  )
}
