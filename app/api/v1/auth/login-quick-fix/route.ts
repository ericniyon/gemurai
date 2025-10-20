import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { compare } from "bcryptjs"
import { generateAuthToken } from "@/lib/token"
import { getRolePermissions } from "@/lib/roles"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  const { email, password } = await request.json()
  
  // Validate input
  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 }
    )
  }

  // Try complex role system first (main endpoint logic)
  try {
    console.log("QUICK-FIX: Attempting complex role system login for:", email)
    
    // Test database connection
    await prisma.$connect()
    
    // Find user with complex role system
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
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

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      )
    }

    // Verify password
    const isValidPassword = await compare(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      )
    }

    // Get role and permissions
    const userRole = user.userRole?.role
    const roleName = userRole?.name || 'CONSUMER'
    const rolePermissions = userRole?.rolePermissions?.map(rp => rp.permission.name) || []
    const codeRolePermissions = getRolePermissions(roleName)
    const finalPermissions = rolePermissions.length > 0 ? rolePermissions : codeRolePermissions

    // Generate token
    const token = await generateAuthToken({
      id: user.id,
      email: user.email,
      role: roleName,
      name: user.name,
      permissions: finalPermissions,
      rolePermissions: finalPermissions,
      databasePermissions: finalPermissions,
      avatar: user.avatar
    })

    // Success response
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: roleName,
        name: user.name,
        permissions: finalPermissions,
        rolePermissions: finalPermissions,
        databasePermissions: finalPermissions,
        avatar: user.avatar
      },
      token,
      method: "complex-role-system"
    })

    response.cookies.set("Gemurai_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    })

    console.log("QUICK-FIX: Complex role system login successful for:", email)
    return response

  } catch (complexError) {
    console.log("QUICK-FIX: Complex role system failed, trying fallback:", complexError.message)
    
    // Fallback to simple role system
    try {
      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          name: true,
          password: true,
          role: true,
          avatar: true,
        },
      })

      if (!user) {
        return NextResponse.json(
          { error: "Invalid email or password" },
          { status: 401 }
        )
      }

      // Verify password
      const isValidPassword = await compare(password, user.password)
      if (!isValidPassword) {
        return NextResponse.json(
          { error: "Invalid email or password" },
          { status: 401 }
        )
      }

      // Use basic role system
      const roleName = user.role || 'CONSUMER'
      const permissions = getRolePermissions(roleName)

      // Generate token
      const token = await generateAuthToken({
        id: user.id,
        email: user.email,
        role: roleName,
        name: user.name,
        permissions: permissions,
        rolePermissions: permissions,
        databasePermissions: permissions,
        avatar: user.avatar
      })

      // Success response
      const response = NextResponse.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          role: roleName,
          name: user.name,
          permissions: permissions,
          rolePermissions: permissions,
          databasePermissions: permissions,
          avatar: user.avatar
        },
        token,
        method: "fallback-simple-role"
      })

      response.cookies.set("Gemurai_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60,
      })

      console.log("QUICK-FIX: Fallback login successful for:", email)
      return response

    } catch (fallbackError) {
      console.error("QUICK-FIX: Both complex and fallback failed:", fallbackError)
      
      return NextResponse.json(
        { 
          error: "Login failed", 
          details: {
            complex_error: complexError.message,
            fallback_error: fallbackError.message
          },
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      )
    }
  }
} 