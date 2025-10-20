import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { compare } from "bcryptjs"
import { generateAuthToken } from "@/lib/token"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    
    console.log("🔍 Testing DCC login for:", email)
    
    // Find the DCC user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        userRole: {
          include: {
            role: true
          }
        }
      }
    })
    
    if (!user) {
      return NextResponse.json({
        success: false,
        error: "User not found"
      })
    }
    
    console.log("✅ User found:", {
      id: user.id,
      email: user.email,
      role: user.userRole?.role?.name,
      hasPassword: !!user.password
    })
    
    // Verify password
    const isValidPassword = await compare(password, user.password)
    
    if (!isValidPassword) {
      return NextResponse.json({
        success: false,
        error: "Invalid password"
      })
    }
    
    console.log("✅ Password verified successfully")
    
    // Generate token
    const token = await generateAuthToken({
      id: user.id,
      email: user.email,
      role: user.userRole?.role?.name || 'DCC',
      name: user.name || 'DCC User',
      permissions: [],
      rolePermissions: [],
      databasePermissions: [],
      avatar: user.avatar
    })
    
    console.log("✅ Token generated successfully")
    
    // Create response
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.userRole?.role?.name || 'DCC',
        name: user.name || 'DCC User',
        avatar: user.avatar
      },
      token
    })
    
    // Set cookie
    response.cookies.set("Gemurai_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })
    
    console.log("✅ Cookie set successfully")
    
    return response
    
  } catch (error) {
    console.error("❌ DCC login test error:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    })
  }
} 