import { jwtVerify, SignJWT } from "jose"
import { getRolePermissions } from "./roles"

// Ensure we have a valid JWT secret
const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || "fallback-secret-do-not-use-in-production"
const JWT_EXPIRES_IN = "7d"

// Validate JWT_SECRET
if (!JWT_SECRET || typeof JWT_SECRET !== 'string' || JWT_SECRET.length < 10) {
  throw new Error('JWT_SECRET must be a string with at least 10 characters')
}

export type UserRole = "DCC" | "EMPLOYER" | "CONSUMER" | "SUPER_ADMIN" | "ADMIN" | "AGENT" | "DIGITAL_SERVICE" | "BRANCH_MANAGER"

export interface AuthUser {
  id: string
  email: string
  phone?: string
  role: UserRole
  name: string
  permissions: string[]
  rolePermissions?: string[] // Add role permissions
  databasePermissions?: string[] // Add database permissions
  avatar: string | null
  mccId?: string | null
}

export async function verifyAuthToken(token: string): Promise<AuthUser | null> {
  try {
    if (!token) {
      console.error("No token provided")
      return null
    }

    // Debug: Log JWT_SECRET availability (without exposing the actual secret)
    console.log("JWT_SECRET available:", !!JWT_SECRET)
    console.log("JWT_SECRET length:", JWT_SECRET?.length || 0)

    const { payload } = await jwtVerify(
      token, 
      new TextEncoder().encode(JWT_SECRET)
    )
    
    console.log("Token verification successful, payload keys:", Object.keys(payload))
    
    if (!payload.sub || !payload.email || !payload.role) {
      console.error("Invalid token payload:", payload)
      return null
    }
    
    // Verify role is a valid role
    const role = (payload.role as string).toUpperCase() as UserRole
    const validRoles: UserRole[] = ["DCC", "EMPLOYER", "CONSUMER", "SUPER_ADMIN", "ADMIN", "AGENT", "DIGITAL_SERVICE", "BRANCH_MANAGER", "MCC_MANAGER", "FIELD_AGENT", "COOP_ADMIN", "FARMER", "ACCOUNTANT"]
    if (!validRoles.includes(role)) {
      console.error("Invalid role in token:", role)
      return null
    }

    // For now, return minimal user data without permissions
    // Permissions will be fetched separately when needed
    const user: AuthUser = {
      id: payload.sub,
      email: payload.email as string,
      phone: (payload.phone as string) || null,
      role: role,
      name: (payload.name as string) || "",
      permissions: [], // Will be fetched separately
      rolePermissions: [], // Will be fetched separately
      databasePermissions: [], // Will be fetched separately
      avatar: (payload.avatar as string) || null,
      mccId: (payload.mccId as string) || null,
    }

    console.log("Token verification completed successfully for user:", user.email)
    return user
  } catch (error) {
    if (error instanceof Error) {
      // Check if it's a JWT signature verification error
      if (error.name === 'JWSSignatureVerificationFailed' || 
          error.message.includes('signature verification failed')) {
        console.warn("JWT signature verification failed - token may be corrupted or expired")
        console.warn("Error details:", {
          name: error.name,
          message: error.message
        })
      } else {
        console.error("Error verifying auth token:", error.message)
        console.error("Error name:", error.name)
        console.error("Error stack:", error.stack)
      }
    } else {
      console.error("Unknown error verifying auth token:", error)
    }
    return null
  }
}

export async function generateAuthToken(
  user: Pick<AuthUser, "id" | "email" | "phone" | "role" | "name" | "permissions" | "avatar" | "rolePermissions" | "databasePermissions" | "mccId">
): Promise<string> {
  console.log("🔑 Starting token generation for user:", user.email)
  console.log("🔑 JWT_SECRET available:", !!JWT_SECRET)
  console.log("🔑 JWT_SECRET length:", JWT_SECRET?.length || 0)
  
  // Create a minimal token payload to avoid cookie size limits
  // Permissions will be fetched from the database when needed
  const tokenPayload = {
    email: user.email,
    phone: user.phone,
    role: user.role,
    name: user.name || "",
    avatar: user.avatar,
    // Only include a flag to indicate if user has permissions (not the actual permissions)
    hasPermissions: (user.permissions && user.permissions.length > 0) || 
                   (user.rolePermissions && user.rolePermissions.length > 0) ||
                   (user.databasePermissions && user.databasePermissions.length > 0),
    mccId: user.mccId,
  }
  
  const token = await new SignJWT(tokenPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(new TextEncoder().encode(JWT_SECRET))

  console.log("✅ Token generated successfully, length:", token.length)
  return token
}

// Note: getUserPermissions function removed because it requires Prisma Client
// which cannot be used in Edge Runtime (middleware). Permissions should be
// fetched in API routes or server components instead. 