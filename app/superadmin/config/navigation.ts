import {
  LayoutDashboard,
  Users,
  FileText,
  Store,
  Briefcase,
  GraduationCap,
  Settings,
  Shield,
  Wallet,
  BookOpen,
  Building2,
  FormInput,
  ShoppingCart,
  ClipboardList,
  Package,
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
    name: "Applications",
    href: "/superadmin/applications",
    icon: FileText,
    requiredPermissions: ["applications.view"],
  },
  {
    name: "Forms",
    href: "/superadmin/forms",
    icon: FormInput,
    requiredPermissions: ["admin.forms"],
    roles: ["SUPER_ADMIN", "ADMIN"],
  },
  {
    name: "DCCs",
    href: "/superadmin/dccs",
    icon: Store,
    requiredPermissions: ["admin.users"],
    roles: ["SUPER_ADMIN", "ADMIN"],
  },
  {
    name: "Employers",
    href: "/superadmin/employers",
    icon: Briefcase,
    requiredPermissions: ["admin.users"],
    roles: ["SUPER_ADMIN", "ADMIN"],
  },
  {
    name: "Courses",
    href: "/superadmin/courses",
    icon: GraduationCap,
    requiredPermissions: ["learning.manage"],
  },
  {
    name: "Products",
    href: "/superadmin/products",
    icon: Store,
    requiredPermissions: ["products.view"],
  },
  {
    name: "Jobs",
    href: "/superadmin/jobs",
    icon: Briefcase,
    requiredPermissions: ["jobs.view"],
  },
  {
    name: "Finance",
    href: "/superadmin/finance",
    icon: Wallet,
    requiredPermissions: ["finance.view"],
  },
  {
    name: "Reports",
    href: "/superadmin/reports",
    icon: FileText,
    requiredPermissions: ["admin.reports"],
    roles: ["SUPER_ADMIN", "ADMIN"],
  },
  {
    name: "Settings",
    href: "/superadmin/settings",
    icon: Settings,
    requiredPermissions: ["admin.system"],
    roles: ["SUPER_ADMIN", "ADMIN"],
  },
  {
    name: "Inventory",
    href: "/superadmin/inventory",
    icon: Building2,
    requiredPermissions: ["products.manage"],
    roles: ["SUPER_ADMIN", "ADMIN"],
  },
  {
    name: "Notifications",
    href: "/superadmin/notifications",
    icon: FileText,
    requiredPermissions: ["admin.system"],
    roles: ["SUPER_ADMIN", "ADMIN"],
  },
  // SUPER_ADMIN specific items
  {
    name: "System Administration",
    href: "/superadmin/system",
    icon: Shield,
    requiredPermissions: ["admin.system"],
    roles: ["SUPER_ADMIN"],
  },
  {
    name: "Database Management",
    href: "/superadmin/database",
    icon: Settings,
    requiredPermissions: ["admin.system"],
    roles: ["SUPER_ADMIN"],
  },
  {
    name: "API Management",
    href: "/superadmin/api",
    icon: Settings,
    requiredPermissions: ["admin.system"],
    roles: ["SUPER_ADMIN"],
  },
  {
    name: "Security Settings",
    href: "/superadmin/security",
    icon: Shield,
    requiredPermissions: ["admin.system"],
    roles: ["SUPER_ADMIN"],
  },
  {
    name: "Test Role Editing",
    href: "/superadmin/test-role-editing",
    icon: Shield,
    requiredPermissions: ["admin.users"],
    roles: ["SUPER_ADMIN"],
  },
  {
    name: "Interview Criteria",
    href: "/superadmin/interview-criteria",
    icon: ClipboardList,
    requiredPermissions: ["applications.manage"],
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
  
  // Add role-specific navigation items
  if (userRole === "DCC") {
    // Add DCC-specific navigation items
    const dccItems: NavigationItem[] = [
      {
        name: "Products",
        href: "/dashboard/dcc",
        icon: Package,
        requiredPermissions: [],
      },
      {
        name: "Stock Management",
        href: "/superadmin/inventory",
        icon: Building2,
        requiredPermissions: ["stock.create"],
      },
      {
        name: "Sales",
        href: "/superadmin/sales",
        icon: ShoppingCart,
        requiredPermissions: ["sales.view"],
      },
    ]
    
    // Add DCC items that user has permissions for
    dccItems.forEach(item => {
      if (hasRequiredPermissions(permissionsToUse, item.requiredPermissions, userRole)) {
        filteredItems.push(item)
      }
    })
  }
  
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