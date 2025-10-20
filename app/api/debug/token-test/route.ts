import { NextRequest, NextResponse } from "next/server"
import { verifyAuthToken } from "@/lib/token"

export async function GET(request: NextRequest) {
  try {
    // Get token from cookies
    const token = request.cookies.get("Gemurai_token")?.value
    
    if (!token) {
      return NextResponse.json({
        success: false,
        message: "No token found in cookies",
        debug: {
          cookies: request.cookies.getAll().map(c => c.name),
          hasGemurai_token: !!request.cookies.get("Gemurai_token")
        }
      })
    }

    // Test token verification
    const user = await verifyAuthToken(token)
    
    if (!user) {
      return NextResponse.json({
        success: false,
        message: "Token verification failed",
        debug: {
          tokenLength: token.length,
          tokenPrefix: token.substring(0, 20) + "...",
          hasJWTSecret: !!process.env.JWT_SECRET,
          jwtSecretLength: process.env.JWT_SECRET?.length || 0
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: "Token verification successful",
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        permissionsCount: user.permissions.length
      }
    })

  } catch (error) {
    console.error("Token test error:", error)
    return NextResponse.json({
      success: false,
      message: "Error testing token",
      error: error instanceof Error ? error.message : "Unknown error",
      debug: {
        hasJWTSecret: !!process.env.JWT_SECRET,
        jwtSecretLength: process.env.JWT_SECRET?.length || 0
      }
    }, { status: 500 })
  }
} 