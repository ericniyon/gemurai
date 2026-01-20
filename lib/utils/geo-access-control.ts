/**
 * Geo-location Access Control
 * Role-based access enforcement for geo-data operations
 */

export type UserRole =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "MCC_MANAGER"
  | "FIELD_AGENT"
  | "AGENT"
  | "ACCOUNTANT"
  | "FARMER"
  | "CONSUMER"
  | "DCC"
  | "EMPLOYER"
  | "COOP_ADMIN"

export type GeoOperation = "VIEW" | "CREATE" | "UPDATE" | "DELETE" | "EXPORT"

export interface AccessCheckResult {
  allowed: boolean
  reason?: string
}

/**
 * Check if user can perform geo-operation
 */
export function canPerformGeoOperation(
  role: UserRole | null | undefined,
  operation: GeoOperation,
  entityType?: string
): AccessCheckResult {
  if (!role) {
    return {
      allowed: false,
      reason: "User role not found",
    }
  }

  // SUPER_ADMIN has full access
  if (role === "SUPER_ADMIN") {
    return { allowed: true }
  }

  // ADMIN has full access
  if (role === "ADMIN") {
    return { allowed: true }
  }

  // View operations - most roles can view
  if (operation === "VIEW") {
    const viewAllowedRoles: UserRole[] = [
      "MCC_MANAGER",
      "FIELD_AGENT",
      "AGENT",
      "ACCOUNTANT",
      "COOP_ADMIN",
    ]
    if (viewAllowedRoles.includes(role)) {
      return { allowed: true }
    }
  }

  // Create/Update/Delete operations - restricted to admins and managers
  if (operation === "CREATE" || operation === "UPDATE" || operation === "DELETE") {
    const editAllowedRoles: UserRole[] = ["MCC_MANAGER", "COOP_ADMIN"]
    if (editAllowedRoles.includes(role)) {
      return { allowed: true }
    }
    return {
      allowed: false,
      reason: "Only administrators and managers can modify geo-location data",
    }
  }

  // Export operations - restricted to admins and managers
  if (operation === "EXPORT") {
    const exportAllowedRoles: UserRole[] = [
      "MCC_MANAGER",
      "ACCOUNTANT",
      "COOP_ADMIN",
    ]
    if (exportAllowedRoles.includes(role)) {
      return { allowed: true }
    }
    return {
      allowed: false,
      reason: "Only administrators and managers can export geo-location data",
    }
  }

  return {
    allowed: false,
    reason: "Operation not permitted for this role",
  }
}

/**
 * Check if user can view geo-data for specific entity
 */
export function canViewGeoData(
  role: UserRole | null | undefined,
  entityType: string,
  entityOwnerId?: string,
  userId?: string
): AccessCheckResult {
  // Admins can view all
  if (role === "SUPER_ADMIN" || role === "ADMIN") {
    return { allowed: true }
  }

  // Check basic view permission
  const viewCheck = canPerformGeoOperation(role, "VIEW", entityType)
  if (!viewCheck.allowed) {
    return viewCheck
  }

  // For farmers - can view their own data
  if (role === "FARMER" && entityType === "farmer" && entityOwnerId === userId) {
    return { allowed: true }
  }

  // MCC managers can view data for their MCC
  if (role === "MCC_MANAGER" && entityType === "farmer") {
    return { allowed: true }
  }

  // Field agents can view data for their assigned entities
  if (role === "FIELD_AGENT" || role === "AGENT") {
    return { allowed: true }
  }

  return { allowed: true }
}

/**
 * Check if user can edit geo-data for specific entity
 */
export function canEditGeoData(
  role: UserRole | null | undefined,
  entityType: string,
  entityOwnerId?: string,
  userId?: string
): AccessCheckResult {
  // Admins can edit all
  if (role === "SUPER_ADMIN" || role === "ADMIN") {
    return { allowed: true }
  }

  // Check basic edit permission
  const editCheck = canPerformGeoOperation(role, "UPDATE", entityType)
  if (!editCheck.allowed) {
    return editCheck
  }

  // MCC managers can edit data for their MCC
  if (role === "MCC_MANAGER") {
    return { allowed: true }
  }

  return {
    allowed: false,
    reason: "Only administrators can edit geo-location data",
  }
}

/**
 * Get required permissions for operation
 */
export function getRequiredPermissions(
  operation: GeoOperation
): string[] {
  switch (operation) {
    case "VIEW":
      return ["geo.view"]
    case "CREATE":
      return ["geo.create"]
    case "UPDATE":
      return ["geo.update"]
    case "DELETE":
      return ["geo.delete"]
    case "EXPORT":
      return ["geo.export"]
    default:
      return []
  }
}
