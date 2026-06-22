import { SoromaShell } from "@/components/soroma/soroma-shell"
import { SoromaRouteGuard } from "@/components/soroma/soroma-route-guard"
import { SoromaPermissionsProvider } from "@/hooks/soroma/use-soroma-permissions"
import {
  getOpenAlertsCount,
  getUserTenants,
  requirePlatformSession,
} from "@/lib/soroma/server-session"
import type { ReactNode } from "react"

/** PlatformLayout — platform workspace shell + RBAC context */
export async function SoromaPlatformLayout({ children }: { children: ReactNode }) {
  const session = await requirePlatformSession()

  const [tenants, alertsCount] = await Promise.all([
    getUserTenants(session.userId),
    getOpenAlertsCount(undefined, true),
  ])

  const role = session.platformRole ?? "PLATFORM_OPERATOR"

  return (
    <SoromaPermissionsProvider
      value={{
        permissions: session.permissions,
        role,
        workspaceType: "platform",
      }}
    >
      <SoromaShell
        workspaceType="platform"
        userName={session.name}
        userRole={role}
        permissions={session.permissions}
        tenants={tenants}
        alertsCount={alertsCount}
        canSwitchWorkspace={tenants.length > 0}
      >
        <SoromaRouteGuard session={session}>{children}</SoromaRouteGuard>
      </SoromaShell>
    </SoromaPermissionsProvider>
  )
}
