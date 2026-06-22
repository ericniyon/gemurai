"use client"

import type { ReactNode } from "react"
import { useSoromaPermissions } from "@/hooks/soroma/use-soroma-permissions"

type RoleGuardProps = {
  roles: string[]
  workspace?: "platform" | "tenant"
  fallback?: ReactNode
  children: ReactNode
}

export function RoleGuard({
  roles,
  workspace,
  fallback = null,
  children,
}: RoleGuardProps) {
  const { role, workspaceType } = useSoromaPermissions()
  if (workspace && workspaceType !== workspace) return <>{fallback}</>
  if (!role || !roles.includes(role)) return <>{fallback}</>
  return <>{children}</>
}
