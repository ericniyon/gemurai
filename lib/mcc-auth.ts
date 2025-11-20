import { verifyAuthToken } from "./api-auth"
import { hasPermission } from "./roles"

/**
 * Check if user has MCC-related permissions
 * SUPER_ADMIN has full access to all MCC features
 */
export async function checkMCCPermission(
  authToken: string | null,
  requiredPermission: string
): Promise<{ authorized: boolean; user: any | null; error?: string }> {
  if (!authToken) {
    return { authorized: false, user: null, error: "Authorization token required" }
  }

  const user = await verifyAuthToken(authToken)
  if (!user) {
    return { authorized: false, user: null, error: "Invalid or expired token" }
  }

  // SUPER_ADMIN has full access to all MCC features
  if (user.role === "SUPER_ADMIN") {
    return { authorized: true, user }
  }

  // Check if user has the required permission
  const hasAccess = hasPermission(user.role, requiredPermission)
  if (!hasAccess) {
    return { authorized: false, user, error: "Insufficient permissions" }
  }

  return { authorized: true, user }
}

/**
 * Get MCC roles that have access
 */
export const MCC_ROLES = [
  "SUPER_ADMIN",
  "MCC_MANAGER",
  "FIELD_AGENT",
  "COOP_ADMIN",
  "ACCOUNTANT",
  "ADMIN", // Admin also has some MCC access
] as const

/**
 * Check if user role is an MCC role
 */
export function isMCCRole(role: string): boolean {
  return MCC_ROLES.includes(role as any)
}

