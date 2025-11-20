import {
  LayoutDashboard,
  Users,
  Settings,
  Shield,
  Milk,
} from "lucide-react"

export type NavigationItem = {
  name: string
  href: string
  icon: any
  requiredPermissions?: string[]
  roles?: string[]
}

export const navigationConfig: NavigationItem[] = [
  {
    name: "Dashboard",
    href: "/superadmin/dashboard",
    icon: LayoutDashboard,
    requiredPermissions: [], // No permissions required - every user should have access to Dashboard
  },
  {
    name: "MCCs",
    href: "/superadmin/mccs",
    icon: Milk,
    requiredPermissions: ["mcc.view"],
    roles: ["SUPER_ADMIN", "ADMIN"],
  },
  {
    name: "Users",
    href: "/superadmin/users",
    icon: Users,
    requiredPermissions: ["admin.users"],
    roles: ["SUPER_ADMIN", "ADMIN"],
  },
  {
    name: "Roles",
    href: "/superadmin/roles",
    icon: Shield,
    requiredPermissions: ["admin.users"],
    roles: ["SUPER_ADMIN"],
  },
  {
    name: "Settings",
    href: "/superadmin/settings",
    icon: Settings,
    requiredPermissions: ["admin.system"],
    roles: ["SUPER_ADMIN", "ADMIN"],
  },
  {
    name: "System Administration",
    href: "/superadmin/system",
    icon: Shield,
    requiredPermissions: ["admin.system"],
    roles: ["SUPER_ADMIN"],
  },
]

// Dashboard configurations for different roles
export const roleSpecificDashboards: Record<string, string> = {
  SUPER_ADMIN: "/superadmin/dashboard",
  ADMIN: "/admin/dashboard",
  EMPLOYER: "/dashboard/employer",
  DCC: "/dashboard/dcc",
  AGENT: "/dashboard/agent",
  CUSTOMER: "/dashboard",
}

// Helper function to check if user has required permissions
export function hasRequiredPermissions(
  userPermissions: string[],
  requiredPermissions?: string[],
  userRole?: string,
): boolean {
  // If no required permissions, allow access
  if (!requiredPermissions || !requiredPermissions.length) return true
  
  // SUPER_ADMIN has full access
  if (userRole === "SUPER_ADMIN") return true
  
  // Ensure userPermissions is an array
  const permissions = Array.isArray(userPermissions) ? userPermissions : []
  
  // Check if user has wildcard permission
  if (permissions.includes("*")) return true
  
  // Check if user has any of the required permissions (OR logic)
  return requiredPermissions.some(permission => permissions.includes(permission))
}

// Helper function to check if user has required role
export function hasRequiredRole(userRole: string, allowedRoles?: string[]): boolean {
  // SUPER_ADMIN can access everything
  if (userRole === "SUPER_ADMIN") return true
  if (!allowedRoles || !allowedRoles.length) return true
  return allowedRoles.includes(userRole)
}

// Get navigation items based on user's role and permissions
export function getAuthorizedNavigation(
  userRole: string,
  userPermissions: string[],
  databasePermissions?: string[],
  rolePermissions?: string[],
): NavigationItem[] {
  // Use database permissions (userPermissions) instead of rolePermissions
  const permissionsToUse = userPermissions
  
  const filteredItems = navigationConfig.filter(
    item =>
      hasRequiredPermissions(permissionsToUse, item.requiredPermissions, userRole) &&
      hasRequiredRole(userRole, item.roles),
  )
  
  
  // Debug logging (remove in production)
  if (process.env.NODE_ENV === "development") {
    console.log("SuperAdmin Navigation filtering:", {
      userRole,
      isSuperAdmin: userRole === "SUPER_ADMIN",
      combinedPermissions: userPermissions,
      databasePermissions,
      rolePermissions,
      usingPermissions: permissionsToUse,
      totalItems: navigationConfig.length,
      filteredItems: filteredItems.length,
      itemNames: filteredItems.map(item => item.name)
    })
  }
  
  return filteredItems
} 