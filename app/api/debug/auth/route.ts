import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyAuthToken } from "@/lib/token"

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Debug endpoint called")
    
    // Check environment variables
    const jwtSecret = process.env.JWT_SECRET
    console.log("🔑 JWT_SECRET available:", !!jwtSecret)
    console.log("🔑 JWT_SECRET length:", jwtSecret?.length || 0)
    
    // Get the token from cookies
    const cookieStore = await cookies()
    const token = cookieStore.get("Gemurai_token")
    
    console.log("🍪 Gemurai_token cookie found:", !!token)
    if (token) {
      console.log("🍪 Token length:", token.value.length)
      console.log("🍪 Token starts with:", token.value.substring(0, 20) + "...")
    }
    
    if (!token) {
      return NextResponse.json({
        success: false,
        message: "No Gemurai_token cookie found",
        debug: {
          jwtSecretAvailable: !!jwtSecret,
          jwtSecretLength: jwtSecret?.length || 0
        }
      }, { status: 401 })
    }
    
    // Try to verify the token
    console.log("🔍 Attempting token verification...")
    const user = await verifyAuthToken(token.value)
    
    if (!user) {
      return NextResponse.json({
        success: false,
        message: "Token verification failed",
        debug: {
          jwtSecretAvailable: !!jwtSecret,
          jwtSecretLength: jwtSecret?.length || 0,
          tokenLength: token.value.length,
          tokenStart: token.value.substring(0, 20) + "..."
        }
      }, { status: 401 })
    }
    
    return NextResponse.json({
      success: true,
      message: "Token verification successful",
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      },
      debug: {
        jwtSecretAvailable: !!jwtSecret,
        jwtSecretLength: jwtSecret?.length || 0,
        tokenLength: token.value.length
      }
    })
    
  } catch (error: any) {
    console.error("❌ Debug endpoint error:", error)
    return NextResponse.json({
      success: false,
      message: "Debug endpoint error",
      error: error.message,
      debug: {
        jwtSecretAvailable: !!process.env.JWT_SECRET,
        jwtSecretLength: process.env.JWT_SECRET?.length || 0
      }
    }, { status: 500 })
  }
}

