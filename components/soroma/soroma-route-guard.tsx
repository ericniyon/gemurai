import { headers } from "next/headers"
import { redirect } from "next/navigation"
import type { SoromaSession } from "@/lib/soroma/auth"
import { getRoutePermissionRule } from "@/lib/soroma/route-permissions"
import { sessionHasPermission } from "@/lib/soroma/rbac"
import { SOROMA_ROUTES } from "@/lib/soroma/constants"

/** Server route guard — checks x-pathname permission rule */
export async function SoromaRouteGuard({
  session,
  children,
}: {
  session: SoromaSession
  children: React.ReactNode
}) {
  const pathname = (await headers()).get("x-pathname") ?? ""
  const rule = getRoutePermissionRule(pathname)
  if (
    rule &&
    !sessionHasPermission(session.permissions, rule.permissions, "any")
  ) {
    redirect(
      session.workspaceType === "platform"
        ? SOROMA_ROUTES.platform.overview
        : session.tenantId
          ? SOROMA_ROUTES.tenant(session.tenantId).overview
          : SOROMA_ROUTES.login
    )
  }
  return <>{children}</>
}
