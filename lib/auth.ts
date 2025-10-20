import { authConfig } from "./auth.config"
import bcrypt from "bcryptjs"
import { type UserRole, type AuthUser, verifyAuthToken } from "./token"

export const authOptions = authConfig

export interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface LoginResult {
  success: boolean
  user?: AuthUser
  token?: string
  message: string
}

export interface AuthResult {
  success: boolean
  message: string
  user?: AuthUser
  token?: string
}

// Route-based route access definitions
export const ROUTE_PERMISSIONS = {
  "/dashboard": ["dashboard.view"],
  "/[lang]/dashboard": ["dashboard.view"],
  "/dashboard/analytics": ["dashboard.analytics"],
  "/[lang]/dashboard/analytics": ["dashboard.analytics"],
  "/dashboard/users": ["users.view"],
  "/[lang]/dashboard/users": ["users.view"],
  "/dashboard/applications": ["applications.view"],
  "/[lang]/dashboard/applications": ["applications.view"],
  "/dashboard/applications/:id": ["applications.view"],
  "/[lang]/dashboard/applications/:id": ["applications.view"],
  "/dashboard/my-application": [], // Special case - only for DCC role
  "/[lang]/dashboard/my-application": [], // Special case - only for DCC role
  "/dashboard/dccs": ["users.view", "applications.view"],
  "/[lang]/dashboard/dccs": ["users.view", "applications.view"],
  "/dashboard/jobs": ["jobs.view", "jobs.manage", "jobs.post"],
  "/[lang]/dashboard/jobs": ["jobs.view", "jobs.manage", "jobs.post"],
  "/dashboard/marketplace": ["products.view", "products.create", "products.edit", "products.delete", "products.manage"],
  "/[lang]/dashboard/marketplace": ["products.view", "products.create", "products.edit", "products.delete", "products.manage"],
  "/dashboard/marketplace/stock": ["stock.create"],
  "/[lang]/dashboard/marketplace/stock": ["stock.create"],
  "/dashboard/products": ["products.view", "products.create", "products.edit", "products.delete", "products.manage"],
  "/[lang]/dashboard/products": ["products.view", "products.create", "products.edit", "products.delete", "products.manage"],
  "/dashboard/learning": ["learning.view", "learning.manage"],
  "/[lang]/dashboard/learning": ["learning.view", "learning.manage"],
  "/dashboard/settings": ["dashboard.view"],
  "/[lang]/dashboard/settings": ["dashboard.view"],
  "/dashboard/wallet": ["wallet.view", "wallet.withdraw"],
  "/[lang]/dashboard/wallet": ["wallet.view", "wallet.withdraw"],
  "/dashboard/record-sale": ["sales.create"],
  "/[lang]/dashboard/record-sale": ["sales.create"],
  "/dashboard/record-sale/rewards": ["sales.view"],
  "/[lang]/dashboard/record-sale/rewards": ["sales.view"]
} as const

export function hasPermission(user: AuthUser | null, permission: string): boolean {
  if (!user) return false
  return user.permissions.includes(permission)
}

export function hasAnyPermission(user: AuthUser | null, permissions: string[]): boolean {
  if (!user) return false
  return permissions.some(permission => user.permissions.includes(permission))
}

export function hasAllPermissions(user: AuthUser | null, permissions: string[]): boolean {
  if (!user) return false
  return permissions.every(permission => user.permissions.includes(permission))
}

export function canAccessRoute(user: AuthUser | null, route: string): boolean {
  if (!user) return false
  
  // Special case for DCC-only routes
  if (route.endsWith("/my-application") && user.role !== "DCC") {
    return false
  }

  // Special case for EMPLOYER role and applications route
  if (route.endsWith("/applications") && user.role === "EMPLOYER") {
    return true
  }

  // Handle language parameter in route
  const normalizedRoute = route.replace(/^\/[^\/]+\//, "/")

  // Handle dynamic routes
  const routePattern = normalizedRoute.replace(/\/[^\/]+$/, "/:id")
  const routePermissions = ROUTE_PERMISSIONS[routePattern as keyof typeof ROUTE_PERMISSIONS] || 
                         ROUTE_PERMISSIONS[normalizedRoute as keyof typeof ROUTE_PERMISSIONS] ||
                         ROUTE_PERMISSIONS[route as keyof typeof ROUTE_PERMISSIONS]

  if (!routePermissions) return true // If no permissions defined, allow access

  return hasAnyPermission(user, [...routePermissions])
}

export function isDCC(user: AuthUser | null): boolean {
  return user?.role === "DCC"
}

export function canManageApplications(user: AuthUser | null): boolean {
  return hasPermission(user, "applications.manage")
}

export function canReviewApplications(user: AuthUser | null): boolean {
  return hasPermission(user, "applications.review")
}

export function canViewApplications(user: AuthUser | null): boolean {
  return hasPermission(user, "applications.view")
}

export function getUserRoleLevel(user: AuthUser | null): number {
  if (!user) return 0
  
  const roleLevels: Record<UserRole, number> = {
    "SUPER_ADMIN": 4,
    "EMPLOYER": 3,
    "DCC": 2,
    "AGENT": 1,
    "CONSUMER": 0
  }
  
  return roleLevels[user.role] || 0
}

export function canManageUser(currentUser: AuthUser | null, targetUser: AuthUser | null): boolean {
  if (!currentUser || !targetUser) return false
  
  // User can manage themselves
  if (currentUser.id === targetUser.id) return true
  
  // Check role levels
  return getUserRoleLevel(currentUser) > getUserRoleLevel(targetUser)
}

export async function comparePasswords(plainPassword: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword)
}
