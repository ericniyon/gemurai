import { prisma } from "@/lib/database"
import { verifyAuthToken } from "@/lib/api-auth"
import type { PlatformRole, TenantRole } from "./constants"
import { PLATFORM_ROLES, TENANT_ROLES } from "./constants"
import { loadRolePermissions } from "./rbac-resolver"
import { sessionHasPermission } from "./rbac"
import { permissionSatisfies } from "./permissions"

export type SoromaSession = {
  userId: string
  email: string
  name: string
  workspaceType: "platform" | "tenant"
  platformRole?: PlatformRole
  tenantId?: string
  tenantRole?: TenantRole
  tenantName?: string
  permissions: string[]
  /** Platform user viewing a tenant workspace */
  isTenantImpersonation?: boolean
}

export async function getSoromaSessionFromToken(
  token: string,
  options?: { preferredTenantId?: string; workspace?: "platform" | "tenant" }
): Promise<SoromaSession | null> {
  const auth = await verifyAuthToken(token)
  if (!auth?.id) return null

  const [platformMembership, tenantMemberships] = await Promise.all([
    prisma.soromaPlatformMembership.findUnique({
      where: { userId: auth.id },
    }),
    prisma.soromaTenantMembership.findMany({
      where: { userId: auth.id, isActive: true },
      include: { tenant: true },
      orderBy: { createdAt: "asc" },
    }),
  ])

  const isSuperAdmin =
    auth.role === "SUPER_ADMIN" || auth.permissions?.includes("superadmin.access")

  const hasPlatform = !!(platformMembership || isSuperAdmin)
  const wantTenant = options?.workspace === "tenant"

  if (wantTenant && tenantMemberships.length > 0) {
    const preferredId = options?.preferredTenantId
    const primary =
      (preferredId
        ? tenantMemberships.find((m) => m.tenantId === preferredId)
        : null) ?? tenantMemberships[0]
    const role = primary.role as TenantRole
    const tenantRole = TENANT_ROLES.includes(role) ? role : "TENANT_ADMIN"
    return {
      userId: auth.id,
      email: auth.email,
      name: auth.name,
      workspaceType: "tenant",
      tenantId: primary.tenantId,
      tenantRole,
      tenantName: primary.tenant.name,
      permissions: await loadRolePermissions(tenantRole, "tenant"),
    }
  }

  if (hasPlatform && options?.workspace !== "tenant") {
    const role = (platformMembership?.role ??
      "PLATFORM_SUPER_ADMIN") as PlatformRole
    return {
      userId: auth.id,
      email: auth.email,
      name: auth.name,
      workspaceType: "platform",
      platformRole: PLATFORM_ROLES.includes(role) ? role : "PLATFORM_OPERATOR",
      permissions: await loadRolePermissions(role, "platform", isSuperAdmin),
    }
  }

  if (tenantMemberships.length > 0) {
    const preferredId = options?.preferredTenantId
    const primary =
      (preferredId
        ? tenantMemberships.find((m) => m.tenantId === preferredId)
        : null) ?? tenantMemberships[0]
    const role = primary.role as TenantRole
    const tenantRole = TENANT_ROLES.includes(role) ? role : "TENANT_ADMIN"
    return {
      userId: auth.id,
      email: auth.email,
      name: auth.name,
      workspaceType: "tenant",
      tenantId: primary.tenantId,
      tenantRole,
      tenantName: primary.tenant.name,
      permissions: await loadRolePermissions(tenantRole, "tenant"),
    }
  }

  if (hasPlatform) {
    const role = (platformMembership?.role ??
      "PLATFORM_SUPER_ADMIN") as PlatformRole
    const platformRole = PLATFORM_ROLES.includes(role) ? role : "PLATFORM_OPERATOR"
    return {
      userId: auth.id,
      email: auth.email,
      name: auth.name,
      workspaceType: "platform",
      platformRole,
      permissions: await loadRolePermissions(platformRole, "platform", isSuperAdmin),
    }
  }

  return null
}

export async function getSoromaSessionForTenantRoute(
  token: string,
  tenantId: string
): Promise<SoromaSession | null> {
  const auth = await verifyAuthToken(token)
  if (!auth?.id) return null

  const [platformMembership, tenantMembership] = await Promise.all([
    prisma.soromaPlatformMembership.findUnique({ where: { userId: auth.id } }),
    prisma.soromaTenantMembership.findUnique({
      where: { userId_tenantId: { userId: auth.id, tenantId } },
      include: { tenant: true },
    }),
  ])

  const isSuperAdmin =
    auth.role === "SUPER_ADMIN" || auth.permissions?.includes("superadmin.access")

  if (tenantMembership?.isActive) {
    const role = tenantMembership.role as TenantRole
    return {
      userId: auth.id,
      email: auth.email,
      name: auth.name,
      workspaceType: "tenant",
      tenantId,
      tenantRole: TENANT_ROLES.includes(role) ? role : "TENANT_ADMIN",
      tenantName: tenantMembership.tenant.name,
      permissions: await loadRolePermissions(
        TENANT_ROLES.includes(role) ? role : "TENANT_ADMIN",
        "tenant"
      ),
    }
  }

  if (platformMembership || isSuperAdmin) {
    const role = (platformMembership?.role ??
      "PLATFORM_SUPER_ADMIN") as PlatformRole
    const tenant = await prisma.soromaTenant.findUnique({ where: { id: tenantId } })
    if (!tenant) return null
    return {
      userId: auth.id,
      email: auth.email,
      name: auth.name,
      workspaceType: "tenant",
      tenantId,
      tenantName: tenant.name,
      platformRole: PLATFORM_ROLES.includes(role) ? role : "PLATFORM_OPERATOR",
      permissions: await loadRolePermissions(
        PLATFORM_ROLES.includes(role) ? role : "PLATFORM_OPERATOR",
        "platform",
        isSuperAdmin
      ),
      isTenantImpersonation: true,
    }
  }

  return null
}

export async function assertTenantAccess(
  userId: string,
  tenantId: string,
  isPlatformUser = false
): Promise<boolean> {
  if (isPlatformUser) {
    const platform = await prisma.soromaPlatformMembership.findUnique({
      where: { userId },
    })
    if (platform?.isActive) return true
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    })
    return user?.role === "SUPER_ADMIN"
  }
  const membership = await prisma.soromaTenantMembership.findUnique({
    where: { userId_tenantId: { userId, tenantId } },
  })
  return !!membership?.isActive
}

export function hasSoromaPermission(
  session: SoromaSession,
  permission: string
): boolean {
  return permissionSatisfies(session.permissions, permission)
}

export function hasSoromaPermissions(
  session: SoromaSession,
  permissions: string[],
  mode: "any" | "all" = "any"
): boolean {
  return sessionHasPermission(session.permissions, permissions, mode)
}
