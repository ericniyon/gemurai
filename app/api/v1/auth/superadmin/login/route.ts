import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import { comparePasswords } from "@/lib/auth"
import { generateAuthToken } from "@/lib/token"
import { ROLE_PERMISSIONS } from "@/lib/permissions"

// Simple in-memory rate limiting (in production, use Redis)
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>()

const RATE_LIMIT_WINDOW = 15 * 60 * 1000 // 15 minutes
const MAX_ATTEMPTS = 5

function isRateLimited(email: string): boolean {
  const now = Date.now()
  const attempts = loginAttempts.get(email)
  
  if (!attempts) {
    loginAttempts.set(email, { count: 1, lastAttempt: now })
    return false
  }
  
  // Reset if window has passed
  if (now - attempts.lastAttempt > RATE_LIMIT_WINDOW) {
    loginAttempts.set(email, { count: 1, lastAttempt: now })
    return false
  }
  
  // Increment attempts
  attempts.count++
  attempts.lastAttempt = now
  
  return attempts.count > MAX_ATTEMPTS
}

function logSecurityEvent(event: string, email: string, details?: any) {
  const timestamp = new Date().toISOString()
  console.log(`[SECURITY] ${timestamp} - ${event}`, {
    email,
    userAgent: details?.userAgent,
    ip: details?.ip,
    ...details
  })
}

export async function POST(request: Request) {
  const startTime = Date.now()
  
  try {
    const body = await request.json()
    const { email, password } = body

    // Input validation
    if (!email || !password) {
      logSecurityEvent("LOGIN_ATTEMPT_FAILED_MISSING_CREDENTIALS", email || "unknown")
      return NextResponse.json(
        { success: false, message: "Email and password are required" },
        { status: 400 }
      )
    }

    // Rate limiting check
    if (isRateLimited(email)) {
      logSecurityEvent("LOGIN_ATTEMPT_RATE_LIMITED", email)
      return NextResponse.json(
        { 
          success: false, 
          message: "Too many login attempts. Please try again in 15 minutes." 
        },
        { status: 429 }
      )
    }

    logSecurityEvent("LOGIN_ATTEMPT_STARTED", email)

    // Find the user with role assignment
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        name: true,
        avatar: true,
        isActive: true,
        userRole: {
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
      },
    })

    // Log user lookup result
    if (!user) {
      logSecurityEvent("LOGIN_ATTEMPT_FAILED_USER_NOT_FOUND", email)
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      )
    }

    // Check if user is active
    if (!user.isActive) {
      logSecurityEvent("LOGIN_ATTEMPT_FAILED_INACTIVE_ACCOUNT", email)
      return NextResponse.json(
        { success: false, message: "Account is not active" },
        { status: 401 }
      )
    }

    // Get user role
    const userRole = user.userRole?.role
    const roleName = userRole?.name || 'CONSUMER'
    
    // Check if user is a superadmin
    if (roleName !== "SUPER_ADMIN") {
      logSecurityEvent("LOGIN_ATTEMPT_FAILED_INSUFFICIENT_PRIVILEGES", email, { role: roleName })
      return NextResponse.json(
        { success: false, message: "You do not have permission to access this area" },
        { status: 403 }
      )
    }

    // Verify password
    const isValidPassword = await comparePasswords(password, user.password)
    if (!isValidPassword) {
      logSecurityEvent("LOGIN_ATTEMPT_FAILED_INVALID_PASSWORD", email)
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      )
    }

    // Clear rate limiting for successful login
    loginAttempts.delete(email)
    
    const loginDuration = Date.now() - startTime
    logSecurityEvent("LOGIN_ATTEMPT_SUCCESSFUL", email, { 
      duration: loginDuration,
      userId: user.id 
    })

    // Get permissions from the user's assigned role
    const rolePermissions = userRole?.rolePermissions?.map(rp => rp.permission.name) || []
    console.log("Role permissions from database:", rolePermissions)
    
    // Get role-based permissions from code (fallback)
    const codeRolePermissions = ROLE_PERMISSIONS[roleName] || []
    console.log(`Code role permissions for ${roleName}:`, codeRolePermissions)
    
    // Use database permissions if available, otherwise use code permissions
    const finalPermissions = rolePermissions.length > 0 ? rolePermissions : codeRolePermissions
    console.log("Final permissions:", finalPermissions)

    // Generate JWT token
    const token = await generateAuthToken({
      id: user.id,
      email: user.email,
      role: roleName,
      name: user.name || "",
      permissions: finalPermissions,
      rolePermissions: finalPermissions, // For backward compatibility
      databasePermissions: finalPermissions, // For backward compatibility
      avatar: user.avatar,
    })

    // Set cookie with enhanced security
    const cookieStore = await cookies()
    cookieStore.set("Gemurai_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    return NextResponse.json(
      {
        success: true,
        message: "Logged in successfully",
        user: {
          id: user.id,
          email: user.email,
          role: roleName,
          name: user.name || "",
          permissions: finalPermissions,
          rolePermissions: finalPermissions, // For backward compatibility
          databasePermissions: finalPermissions, // For backward compatibility
          avatar: user.avatar,
        }
      },
      { status: 200 }
    )
  } catch (error) {
    const errorDuration = Date.now() - startTime
    console.error("Login error:", error)
    logSecurityEvent("LOGIN_ATTEMPT_ERROR", "unknown", { 
      error: error instanceof Error ? error.message : "Unknown error",
      duration: errorDuration
    })
    
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : "An unexpected error occurred" 
      },
      { status: 500 }
    )
  }
} 