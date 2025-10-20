"use client"

import { type ReactNode } from "react"
import { useAuth } from "@/hooks/use-auth"
import { hasAnyPermission, type UserRole } from "@/lib/auth"

interface PermissionGuardProps {
  children: ReactNode
  requiredRole?: UserRole[]
  requiredPermissions?: string[]
  fallback?: ReactNode
}

export function PermissionGuard({
  children,
  requiredRole,
  requiredPermissions,
  fallback = null
}: PermissionGuardProps) {
  const { user } = useAuth()

  // Check role if required
  if (requiredRole && (!user || !requiredRole.includes(user.role))) {
    return fallback
  }

  // Check permissions if required
  if (requiredPermissions && !hasAnyPermission(user, requiredPermissions)) {
    return fallback
  }

  return <>{children}</>
}

// Convenience components for common use cases
export function DCCOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionGuard requiredRole={["DCC"]} fallback={fallback}>
      {children}
    </PermissionGuard>
  )
}

export function EmployerOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionGuard requiredRole={["EMPLOYER"]} fallback={fallback}>
      {children}
    </PermissionGuard>
  )
}
