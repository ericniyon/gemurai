import type { NextRequest } from "next/server"
import { prisma } from "@/lib/database"
import { cookies } from "next/headers"
import { getRolePermissions } from "./roles"

let jwtModule: any = null

async function loadJWT() {
  if (!jwtModule) {
    const { default: jwt } = await import("jsonwebtoken")
    jwtModule = jwt
  }
  return jwtModule
}

// Check if a table exists
async function tableExists(tableName: string): Promise<boolean> {
  try {
    const result = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = ${tableName}
      )
    ` as any[];
    return result[0]?.exists || false;
  } catch (error) {
    console.error(`Error checking if table ${tableName} exists:`, error);
    return false;
  }
}

export async function verifyAuthToken(token: string): Promise<any> {
  try {
    const jwt = await loadJWT()
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || "fallback-secret-do-not-use-in-production")

    // Check if new role system tables exist
    const [rolesTableExists, userRoleTableExists] = await Promise.all([
      tableExists('roles'),
      tableExists('user_role_assignments')
    ]);

    if (rolesTableExists && userRoleTableExists) {
      // Use new schema
      const user = await prisma.user.findUnique({
        where: { id: decoded.sub || decoded.userId },
        select: {
          id: true,
          email: true,
          name: true,
          mccId: true,
          createdAt: true,
          updatedAt: true,
          isActive: true,
          staff: { select: { mccId: true } },
          userRole: {
            select: {
              role: {
                select: {
                  id: true,
                  name: true,
                  description: true,
                  rolePermissions: {
                    select: {
                      permission: {
                        select: {
                          name: true
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      })

      if (!user) {
        throw new Error("User not found")
      }

      if (!user.isActive) {
        throw new Error("User account is not active")
      }

      // Transform to match expected format
      const roleName = user.userRole?.role?.name || 'CONSUMER'
      const permissions = user.userRole?.role?.rolePermissions?.map(rp => rp.permission.name) || []
      // mccId: from token (set at login), or user record, or staff assignment
      const mccId = (decoded.mccId as string) || user.mccId || user.staff?.mccId || null

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: roleName,
        permissions: permissions,
        mccId,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        isActive: user.isActive
      }
    } else {
      // Use old schema as fallback
      const user = await prisma.user.findUnique({
        where: { id: decoded.sub || decoded.userId },
        select: {
          id: true,
          email: true,
          name: true,
          mccId: true,
          createdAt: true,
          updatedAt: true,
          staff: { select: { mccId: true } },
          roleAssignments: {
            include: {
              role: {
                include: {
                  rolePermissions: {
                    include: {
                      permission: true
                    }
                  }
                }
              }
            }
          }
        }
      })

      if (!user) {
        throw new Error("User not found")
      }

      // Extract role and permissions from the new structure
      const primaryRole = user.roleAssignments?.[0]?.role
      const permissions = user.roleAssignments?.flatMap(assignment => 
        assignment.role.rolePermissions.map(rp => rp.permission.name)
      ) || []
      const mccId = (decoded.mccId as string) || user.mccId || user.staff?.mccId || null

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: primaryRole?.name || 'USER',
        permissions: permissions,
        mccId,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    }
  } catch (error) {
    console.error("Token verification error:", error)
    throw error
  }
}

export async function verifyAuth(request: NextRequest, requiredPermissions: string[] = []): Promise<AuthResult> {
  try {
    let token: string | undefined

    // Try to get token from session cookie first
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get("next-auth.session-token")?.value
    const djyhCookieToken = cookieStore.get("Gemurai_token")?.value
    
    if (sessionToken) {
      token = sessionToken
    } else if (djyhCookieToken) {
      // Support auth via Gemurai_token cookie used by the app
      token = djyhCookieToken
    } else {
      // Fallback to Authorization header
      const authHeader = request.headers.get("Authorization")
      if (authHeader?.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1]
      }
    }

    if (!token) {
      return {
        success: false,
        message: "Authentication required",
        status: 401,
      }
    }

    const user = await verifyAuthToken(token)

    // Check permissions if required
    if (requiredPermissions.length > 0) {
      // Admin role has all permissions
      if (user.role !== "ADMIN") {
        // Check if user has all required permissions
        const hasAllPermissions = requiredPermissions.every((permission) => user.permissions.includes(permission))

        if (!hasAllPermissions) {
          return {
            success: false,
            message: "Insufficient permissions",
            status: 403,
          }
        }
      }
    }

    return {
      success: true,
      message: "Authentication successful",
      status: 200,
      user,
    }
  } catch (error: any) {
    console.error("Authentication error:", error)
    
    if (error.name === "TokenExpiredError") {
      return {
        success: false,
        message: "Session expired",
        status: 401,
      }
    }

    return {
      success: false,
      message: "Authentication failed",
      status: 401,
    }
  }
}

interface AuthResult {
  success: boolean
  message: string
  status: number
  user?: any
}

export async function getAuthUser(request: NextRequest): Promise<any> {
  try {
    let token: string | undefined

    // Try to get token from cookies first (use request.cookies for API routes)
    const djyhToken = request.cookies.get("Gemurai_token")?.value
    
    if (djyhToken) {
      token = djyhToken
    } else {
      // Fallback to Authorization header
      const authHeader = request.headers.get("Authorization")
      if (authHeader?.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1]
      }
    }

    if (!token) {
      return null
    }

    const user = await verifyAuthToken(token)
    
    // Assign permissions based on role
    if (user && user.role) {
      const rolePermissions = getRolePermissions(user.role)
      
      // If role has "*" permission (like SUPER_ADMIN), assign all possible permissions
      if (rolePermissions.includes("*")) {
        user.permissions = [
          "*",
          // Add all inventory permissions explicitly for compatibility
          "inventory.warehouse.create",
          "inventory.warehouse.edit",
          "inventory.warehouse.delete",
          "inventory.warehouse.view",
          "inventory.location.create",
          "inventory.location.edit",
          "inventory.location.delete",
          "inventory.location.view",
          "inventory.move.create",
          "inventory.move.edit",
          "inventory.move.delete",
          "inventory.move.view",
          "inventory.move.confirm",
          "inventory.adjustment.create",
          "inventory.adjustment.edit",
          "inventory.adjustment.delete",
          "inventory.adjustment.view",
          "inventory.adjustment.approve",
          "inventory.cyclecount.create",
          "inventory.cyclecount.edit",
          "inventory.cyclecount.delete",
          "inventory.cyclecount.view",
          "inventory.manage",
          "inventory.view",
          // Add all other permissions
          "dashboard.view",
          "dashboard.analytics",
          "users.view",
          "users.create",
          "users.edit",
          "users.delete",
          "products.view",
          "products.create",
          "products.edit",
          "products.delete",
          "products.manage",
          "orders.view",
          "orders.create",
          "orders.manage",
          "applications.view",
          "applications.create",
          "applications.edit",
          "applications.delete",
          "applications.manage",
          "applications.review",
          "applications.approve",
          "applications.reject",
          "admin.users",
          "admin.system",
          "admin.reports",
          "admin.forms"
        ]
      } else {
        // Merge existing permissions with role-based permissions
        const existingPermissions = user.permissions || []
        user.permissions = [...new Set([...existingPermissions, ...rolePermissions])]
      }
    }
    
    return user
  } catch (error) {
    console.error("getAuthUser error:", error)
    return null
  }
}
