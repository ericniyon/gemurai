import { SoromaScopeBanner } from "@/components/soroma/scope-banner"
import { SoromaDashboardCard } from "@/components/soroma/dashboard-card"
import { SoromaPageHeader } from "@/components/soroma/page-header"
import { SoromaStatusBadge } from "@/components/soroma/status-badge"
import { prisma } from "@/lib/database"

export default async function TenantSettingsPage({
  params,
}: {
  params: Promise<{ tenantId: string }>
}) {
  const { tenantId } = await params
  const tenant = await prisma.soromaTenant.findUnique({
    where: { id: tenantId },
    include: {
      memberships: { include: { user: { select: { name: true, email: true } } } },
    },
  })
  if (!tenant) return null

  return (
    <div className="space-y-6">
      <SoromaPageHeader
        title="Workspace Settings"
        moduleTag="Tenant Configuration"
        description="Configure tenant profile, users, currency (RWF default), and timezone."
      />
      <SoromaScopeBanner tenantName={tenant.name} />
      <div className="sf-dashboard-grid">
        <div className="sf-col-6">
          <SoromaDashboardCard title="Tenant Profile">
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm" style={{ color: "var(--sf-text-muted)" }}>Name</dt>
                <dd className="font-semibold">{tenant.name}</dd>
              </div>
              <div>
                <dt className="text-sm" style={{ color: "var(--sf-text-muted)" }}>Status</dt>
                <dd>
                  <SoromaStatusBadge status={tenant.status} />
                </dd>
              </div>
              <div>
                <dt className="text-sm" style={{ color: "var(--sf-text-muted)" }}>Currency</dt>
                <dd className="font-semibold">{tenant.currency}</dd>
              </div>
              <div>
                <dt className="text-sm" style={{ color: "var(--sf-text-muted)" }}>Timezone</dt>
                <dd className="font-semibold">{tenant.timezone}</dd>
              </div>
              <div>
                <dt className="text-sm" style={{ color: "var(--sf-text-muted)" }}>Value Chain</dt>
                <dd className="font-semibold">{tenant.valueChain ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-sm" style={{ color: "var(--sf-text-muted)" }}>District</dt>
                <dd className="font-semibold">{tenant.district ?? "—"}</dd>
              </div>
            </dl>
          </SoromaDashboardCard>
        </div>
        <div className="sf-col-6">
          <SoromaDashboardCard title="Team Members">
            <ul className="divide-y" style={{ borderColor: "var(--sf-border)" }}>
              {tenant.memberships.map((m) => (
                <li
                  key={m.id}
                  className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm"
                >
                  <span className="font-medium">
                    {m.user.name} · {m.user.email}
                  </span>
                  <span
                    className="rounded-full px-2 py-0.5 text-xs font-medium"
                    style={{ background: "var(--sf-green-100)", color: "var(--sf-green-900)" }}
                  >
                    {m.role.replace(/_/g, " ")}
                  </span>
                </li>
              ))}
            </ul>
          </SoromaDashboardCard>
        </div>
      </div>
    </div>
  )
}
