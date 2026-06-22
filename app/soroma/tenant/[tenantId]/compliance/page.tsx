import { ComplianceModuleClient } from "@/components/soroma/modules/compliance-module"
import { getComplianceOperationalData } from "@/lib/soroma/compliance"
import { requireTenantSession } from "@/lib/soroma/server-session"
import { prisma } from "@/lib/database"

export default async function CompliancePage({
  params,
}: {
  params: Promise<{ tenantId: string }>
}) {
  const { tenantId } = await params
  const session = await requireTenantSession(tenantId)
  const [data, tenant] = await Promise.all([
    getComplianceOperationalData(tenantId, session),
    prisma.soromaTenant.findUnique({ where: { id: tenantId } }),
  ])

  return (
    <ComplianceModuleClient
      tenantId={tenantId}
      tenantName={tenant?.name}
      data={data}
      workflowItems={data.capaItems}
      recentEvents={data.recentEvents}
    />
  )
}
