import { prisma } from "@/lib/database"
import {
  PLATFORM_ROLE_PERMISSIONS,
  TENANT_ROLE_PERMISSIONS,
  resolvePlatformPermissions,
  resolveTenantPermissions,
} from "./rbac"
import { SOROMA_PERMISSIONS } from "./permissions"

const PERMISSION_META: Record<
  string,
  { name: string; category: string; workspace: string }
> = {
  [SOROMA_PERMISSIONS.PLATFORM_VIEW]: {
    name: "Platform View",
    category: "SOROMA",
    workspace: "PLATFORM",
  },
  [SOROMA_PERMISSIONS.TENANT_VIEW]: {
    name: "Tenant View",
    category: "SOROMA",
    workspace: "TENANT",
  },
  [SOROMA_PERMISSIONS.PO_APPROVE]: {
    name: "Approve Purchase Orders",
    category: "SOROMA",
    workspace: "TENANT",
  },
}

function metaForPermission(key: string) {
  return (
    PERMISSION_META[key] ?? {
      name: key.replace(/^soroma\./, "").replace(/\./g, " "),
      category: "SOROMA",
      workspace: key.includes("platform") ? "PLATFORM" : key.includes("tenant") ? "TENANT" : "BOTH",
    }
  )
}

/** Load permissions for a role from DB, fallback to code maps */
export async function loadRolePermissions(
  roleKey: string,
  workspace: "platform" | "tenant",
  isSuperAdmin = false
): Promise<string[]> {
  if (isSuperAdmin && workspace === "platform") {
    return resolvePlatformPermissions("PLATFORM_SUPER_ADMIN", true)
  }

  try {
    const role = await prisma.soromaRole.findUnique({
      where: { key: roleKey },
      include: {
        permissions: { include: { permission: true } },
      },
    })
    if (role && role.permissions.length > 0) {
      return role.permissions.map((rp) => rp.permission.key)
    }
  } catch {
    // Tables may not exist until migration — use code fallback
  }

  return workspace === "platform"
    ? resolvePlatformPermissions(roleKey, false)
    : resolveTenantPermissions(roleKey)
}

export async function seedSoromaRbacFromCode(): Promise<void> {
  const allKeys = Object.values(SOROMA_PERMISSIONS)

  for (const key of allKeys) {
    const meta = metaForPermission(key)
    await prisma.soromaPermission.upsert({
      where: { key },
      create: {
        key,
        name: meta.name,
        category: meta.category,
        workspace: meta.workspace,
      },
      update: { name: meta.name, category: meta.category, workspace: meta.workspace },
    })
  }

  const roleDefs: { key: string; name: string; workspace: string; perms: string[] }[] =
    []

  for (const [key, perms] of Object.entries(PLATFORM_ROLE_PERMISSIONS)) {
    roleDefs.push({
      key,
      name: key.replace(/_/g, " "),
      workspace: "PLATFORM",
      perms,
    })
  }
  for (const [key, perms] of Object.entries(TENANT_ROLE_PERMISSIONS)) {
    roleDefs.push({
      key,
      name: key.replace(/^TENANT_/, "").replace(/_/g, " "),
      workspace: "TENANT",
      perms,
    })
  }

  for (const def of roleDefs) {
    const role = await prisma.soromaRole.upsert({
      where: { key: def.key },
      create: {
        key: def.key,
        name: def.name,
        workspace: def.workspace,
      },
      update: { name: def.name, workspace: def.workspace },
    })

    await prisma.soromaRolePermission.deleteMany({ where: { roleId: role.id } })

    for (const permKey of def.perms) {
      const perm = await prisma.soromaPermission.findUnique({
        where: { key: permKey },
      })
      if (!perm) continue
      await prisma.soromaRolePermission.create({
        data: { roleId: role.id, permissionId: perm.id },
      })
    }
  }
}
