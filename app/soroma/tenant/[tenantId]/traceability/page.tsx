import { TraceabilityModuleClient } from "@/components/soroma/modules/traceability-module"
import { getTraceabilityDashboardFull } from "@/lib/soroma/module-dashboards"
import { getPassportGenealogy } from "@/lib/soroma/traceability"
import { requireTenantSession } from "@/lib/soroma/server-session"
import { prisma } from "@/lib/database"

export default async function TraceabilityPage({
  params,
}: {
  params: Promise<{ tenantId: string }>
}) {
  const { tenantId } = await params
  await requireTenantSession(tenantId)
  const [data, tenant] = await Promise.all([
    getTraceabilityDashboardFull(tenantId),
    prisma.soromaTenant.findUnique({ where: { id: tenantId } }),
  ])
  const firstPassportId = data.passportIds[0]
  const genealogy = firstPassportId
    ? await getPassportGenealogy(tenantId, firstPassportId)
    : null

  return (
    <TraceabilityModuleClient
      tenantId={tenantId}
      tenantName={tenant?.name}
      data={data}
      initialGenealogy={genealogy}
    />
  )
}
