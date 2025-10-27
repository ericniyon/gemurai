import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { compare } from "bcryptjs"
import { generateAuthToken } from "@/lib/token"
import { getRolePermissions } from "@/lib/roles"

const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || "fallback-secret-do-not-use-in-production"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  // Create a fresh Prisma client instance (declare at function level for finally block)
  let prisma: PrismaClient | null = null
  
  try {
    const { email, phone, password } = await request.json()
    
    // Determine if user is logging in with email or phone
    const identifier = email || phone
    const loginType = email ? "email" : "phone"
    
    console.log(`Login attempt for ${loginType}:`, identifier)

    // Validate input
    if (!identifier || !password) {
      console.log("Missing credentials - Email/phone or password not provided")
      return NextResponse.json(
        { error: "Email/phone and password are required" },
        { status: 400 }
      )
    }

    // Create Prisma client
    try {
      console.log("🔌 Creating fresh Prisma client...")
      prisma = new PrismaClient({
        datasources: {
          db: {
            url: process.env.DATABASE_URL
          }
        },
        log: ['error']
      })
      
      console.log("🔌 Connecting to database...")
      await prisma.$connect()
      console.log("✅ Database connected successfully")
    } catch (connectionError) {
      console.error("❌ Database connection failed:", connectionError)
      return NextResponse.json(
        { 
          error: "Database connection error", 
          details: "Unable to connect to database. Please try again.",
          code: "DB_CONNECTION_ERROR"
        },
        { status: 503 }
      )
    }

    // Find user by email or phone with role assignment
    let user;
    try {
      console.log("🔍 Searching for user with identifier:", identifier)
      
      // Try to find user by email first, then by phone
      user = await prisma.user.findFirst({
        where: {
          OR: [
            { email: identifier },
            { phone: identifier }
          ]
        },
        select: {
          id: true,
          email: true,
          phone: true,
          name: true,
          password: true,
          avatar: true,
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
      
      console.log("✅ User query completed successfully")
    } catch (userQueryError) {
      console.error("❌ User query failed:", userQueryError)
      console.error("Error details:", {
        message: userQueryError.message,
        stack: userQueryError.stack,
        name: userQueryError.name
      })
      
      // Check if it's a connection error
      if (userQueryError.message?.includes('Engine is not yet connected') || 
          userQueryError.message?.includes('not yet connected')) {
        return NextResponse.json(
          { 
            error: "Database connection error", 
            details: "The database is not yet connected. Please try again.",
            code: "DB_CONNECTION_ERROR"
          },
          { status: 503 }
        )
      }
      
      return NextResponse.json(
        { 
          error: "User lookup failed", 
          details: userQueryError.message,
          code: "USER_QUERY_ERROR"
        },
        { status: 500 }
      )
    }

    if (!user) {
      console.log(`User not found for ${loginType}:`, identifier)
      return NextResponse.json(
        { error: "Invalid email/phone or password" },
        { status: 401 }
      )
    }

    // Get user role and permissions
    const userRole = user.userRole?.role
    const roleName = userRole?.name || 'CONSUMER' // Default to CONSUMER if no role assigned
    
    console.log("Found user:", { 
      id: user.id, 
      email: user.email, 
      phone: user.phone,
      role: roleName,
      hasRole: !!userRole 
    })

    // Verify password
    let isValidPassword;
    try {
      isValidPassword = await compare(password, user.password)
      console.log("Password validation result:", isValidPassword)
    } catch (passwordError) {
      console.error("Password comparison failed:", passwordError)
      return NextResponse.json(
        { error: "Password validation failed", details: passwordError.message },
        { status: 500 }
      )
    }

    if (!isValidPassword) {
      console.log(`Invalid password for ${loginType}:`, identifier)
      return NextResponse.json(
        { error: "Invalid email/phone or password" },
        { status: 401 }
      )
    }

    // Get permissions from the user's assigned role
    const rolePermissions = userRole?.rolePermissions?.map(rp => rp.permission.name) || []
    console.log("Role permissions from database:", rolePermissions)
    
    // Get role permissions from code as fallback
    let codeRolePermissions = [];
    try {
      codeRolePermissions = getRolePermissions(roleName)
      console.log("Code role permissions:", codeRolePermissions)
    } catch (permissionError) {
      console.error("Role permissions lookup failed:", permissionError)
      // Continue without code permissions
    }
    
    // Use database permissions if available, otherwise use code permissions
    const finalPermissions = rolePermissions.length > 0 ? rolePermissions : codeRolePermissions
    console.log("Final permissions:", finalPermissions)

    // Create JWT token with role and permissions
    let token;
    try {
      console.log("🔑 Generating auth token for user:", user.email)
      console.log("🔑 Token payload:", {
        id: user.id,
        email: user.email,
        phone: user.phone,
        role: roleName,
        name: user.name,
        permissionsCount: finalPermissions.length
      })
      
      token = await generateAuthToken({
        id: user.id,
        email: user.email,
        phone: user.phone,
        role: roleName,
        name: user.name,
        permissions: finalPermissions,
        rolePermissions: finalPermissions, // For backward compatibility
        databasePermissions: finalPermissions, // For backward compatibility
        avatar: user.avatar
      })
      
      console.log("✅ Token generated successfully, length:", token.length)
    } catch (tokenError) {
      console.error("❌ Token generation failed:", tokenError)
      return NextResponse.json(
        { error: "Token generation failed", details: tokenError.message },
        { status: 500 }
      )
    }

    // Create response
    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: roleName,
        permissions: finalPermissions
      },
      token,
    })

    // Set cookie
    try {
      response.cookies.set("Gemurai_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60, // 7 days
      })
    } catch (cookieError) {
      console.error("Cookie setting failed:", cookieError)
      // Continue without setting cookie
    }

    return response
  } catch (error) {
    console.error("Login error:", error)
    console.error("Error stack:", error.stack)
    
    // Return detailed error information for debugging
    return NextResponse.json(
      { 
        error: "Internal server error", 
        details: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  } finally {
    // Clean up Prisma client
    if (prisma) {
      try {
        await prisma.$disconnect()
        console.log("✅ Database disconnected successfully")
      } catch (disconnectError) {
        console.error("❌ Error disconnecting from database:", disconnectError)
      }
    }
  }
}
