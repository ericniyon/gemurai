"use client"

import type { ReactNode } from "react"
import { useSoromaPermissions } from "@/hooks/soroma/use-soroma-permissions"
import { hasAnyPermission } from "@/lib/soroma/permissions"

type PermissionGuardProps = {
  permission: string | string[]
  mode?: "any" | "all"
  fallback?: ReactNode
  children: ReactNode
}

/** Hides UI when user lacks permission (widget/action guard). */
export function PermissionGuard({
  permission,
  mode = "any",
  fallback = null,
  children,
}: PermissionGuardProps) {
  const { permissions } = useSoromaPermissions()
  const allowed =
    mode === "all" && Array.isArray(permission)
      ? permission.every((p) => hasAnyPermission(permissions, p))
      : hasAnyPermission(permissions, permission)

  if (!allowed) return <>{fallback}</>
  return <>{children}</>
}
