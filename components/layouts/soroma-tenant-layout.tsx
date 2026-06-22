import { SoromaShell } from "@/components/soroma/soroma-shell"
import { SoromaRouteGuard } from "@/components/soroma/soroma-route-guard"
import { SoromaPermissionsProvider } from "@/hooks/soroma/use-soroma-permissions"
import {
  getOpenAlertsCount,
  getUserTenants,
  requireTenantSession,
} from "@/lib/soroma/server-session"
import type { ReactNode } from "react"

/** TenantLayout — tenant workspace shell + scoped RBAC */
export async function SoromaTenantLayout({
  children,
  tenantId,
}: {
  children: ReactNode
  tenantId: string
}) {
  const session = await requireTenantSession(tenantId)

  const [tenants, alertsCount] = await Promise.all([
    getUserTenants(session.userId),
    getOpenAlertsCount(tenantId),
  ])

  const role = session.tenantRole ?? "TENANT_ADMIN"

  return (
    <SoromaPermissionsProvider
      value={{
        permissions: session.permissions,
        role,
        workspaceType: "tenant",
        tenantId,
      }}
    >
      <SoromaShell
        workspaceType="tenant"
        tenantId={tenantId}
        tenantName={session.tenantName}
        userName={session.name}
        userRole={role}
        permissions={session.permissions}
        tenants={tenants}
        alertsCount={alertsCount}
        isImpersonating={session.isTenantImpersonation}
        canSwitchWorkspace
      >
        <SoromaRouteGuard session={session}>{children}</SoromaRouteGuard>
      </SoromaShell>
    </SoromaPermissionsProvider>
  )
}
