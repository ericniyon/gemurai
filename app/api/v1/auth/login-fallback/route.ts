import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { compare } from "bcryptjs"
import { generateAuthToken } from "@/lib/token"
import { getRolePermissions } from "@/lib/roles"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    console.log("FALLBACK: Login attempt for email:", email)

    // Validate input
    if (!email || !password) {
      console.log("FALLBACK: Missing credentials")
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    // Simple user lookup using basic role field
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        role: true, // Use basic role field instead of userRole relation
        avatar: true,
      },
    })

    if (!user) {
      console.log("FALLBACK: User not found for email:", email)
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      )
    }

    // Use basic role field, default to CONSUMER if null
    const roleName = user.role || 'CONSUMER'
    
    console.log("FALLBACK: Found user:", { 
      id: user.id, 
      email: user.email, 
      role: roleName
    })

    // Verify password
    const isValidPassword = await compare(password, user.password)
    console.log("FALLBACK: Password validation result:", isValidPassword)

    if (!isValidPassword) {
      console.log("FALLBACK: Invalid password for user:", email)
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      )
    }

    // Get role permissions from code-based system
    const permissions = getRolePermissions(roleName)
    console.log("FALLBACK: Role permissions:", permissions)

    // Create JWT token
    const token = await generateAuthToken({
      id: user.id,
      email: user.email,
      role: roleName,
      name: user.name,
      permissions: permissions,
      rolePermissions: permissions, // For backward compatibility
      databasePermissions: permissions, // For backward compatibility
      avatar: user.avatar
    })

    // Create response
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: roleName,
        name: user.name,
        permissions: permissions,
        rolePermissions: permissions, // For backward compatibility
        databasePermissions: permissions, // For backward compatibility
        avatar: user.avatar
      },
      token,
    })

    // Set cookie
    response.cookies.set("Gemurai_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    console.log("FALLBACK: Login successful for user:", email)
    return response

  } catch (error) {
    console.error("FALLBACK: Login error:", error)
    return NextResponse.json(
      { 
        error: "Internal server error", 
        details: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
} 