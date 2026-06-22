import { cookies, headers } from "next/headers"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/database"
import {
  getSoromaSessionForTenantRoute,
  getSoromaSessionFromToken,
  type SoromaSession,
} from "./auth"
import { SOROMA_ROUTES } from "./constants"
import { getRoutePermissionRule } from "./route-permissions"
import { sessionHasPermission } from "./rbac"
import { logSoromaAudit } from "./audit"

const WORKSPACE_COOKIE = "soroma_workspace"
const TENANT_COOKIE = "soroma_tenant_id"

async function getToken(): Promise<string | undefined> {
  return (await cookies()).get("Gemurai_token")?.value
}

async function getWorkspacePrefs() {
  const store = await cookies()
  return {
    workspace: store.get(WORKSPACE_COOKIE)?.value as
      | "platform"
      | "tenant"
      | undefined,
    tenantId: store.get(TENANT_COOKIE)?.value,
  }
}

export async function requireSoromaSession(): Promise<SoromaSession> {
  const token = await getToken()
  if (!token) redirect(SOROMA_ROUTES.login)
  const prefs = await getWorkspacePrefs()
  const session = await getSoromaSessionFromToken(token, {
    workspace: prefs.workspace,
    preferredTenantId: prefs.tenantId,
  })
  if (!session) redirect(SOROMA_ROUTES.login)
  return session
}

export async function requirePlatformSession(): Promise<SoromaSession> {
  const token = await getToken()
  if (!token) redirect(SOROMA_ROUTES.login)
  const session = await getSoromaSessionFromToken(token, { workspace: "platform" })
  if (!session || session.workspaceType !== "platform") {
    const fallback = await getSoromaSessionFromToken(token)
    if (fallback?.tenantId) {
      redirect(SOROMA_ROUTES.tenant(fallback.tenantId).overview)
    }
    redirect(SOROMA_ROUTES.login)
  }
  return session
}

export async function requireTenantSession(
  tenantId: string
): Promise<SoromaSession & { tenantId: string }> {
  const token = await getToken()
  if (!token) redirect(SOROMA_ROUTES.login)

  const session = await getSoromaSessionForTenantRoute(token, tenantId)
  if (!session) redirect(SOROMA_ROUTES.login)

  const tenant = await prisma.soromaTenant.findUnique({
    where: { id: tenantId },
  })
  if (!tenant) redirect(SOROMA_ROUTES.login)

  return {
    ...session,
    workspaceType: "tenant",
    tenantId,
    tenantName: tenant.name,
  }
}

/** Enforce route-level permission from pathname header */
export async function requireRoutePermission(
  session: SoromaSession
): Promise<void> {
  const pathname = (await headers()).get("x-pathname") ?? ""
  const rule = getRoutePermissionRule(pathname)
  if (!rule) return
  if (
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
}

export async function requirePermission(
  session: SoromaSession,
  permission: string | string[]
): Promise<void> {
  if (!sessionHasPermission(session.permissions, permission, "any")) {
    redirect(SOROMA_ROUTES.login)
  }
}

export async function getUserTenants(userId: string) {
  const memberships = await prisma.soromaTenantMembership.findMany({
    where: { userId, isActive: true },
    include: { tenant: true },
  })
  return memberships.map((m) => ({ id: m.tenant.id, name: m.tenant.name }))
}

export async function getOpenAlertsCount(
  tenantId?: string,
  platform = false
) {
  return prisma.soromaAlert.count({
    where: {
      status: { in: ["OPEN", "IN_PROGRESS"] },
      ...(platform ? { scope: "PLATFORM" } : tenantId ? { tenantId } : {}),
    },
  })
}

export async function setWorkspaceCookies(
  workspace: "platform" | "tenant",
  tenantId?: string
) {
  const store = await cookies()
  store.set(WORKSPACE_COOKIE, workspace, {
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    sameSite: "lax",
  })
  if (workspace === "tenant" && tenantId) {
    store.set(TENANT_COOKIE, tenantId, {
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
      sameSite: "lax",
    })
  } else {
    store.delete(TENANT_COOKIE)
  }
}
