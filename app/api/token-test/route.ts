import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { jwtVerify } from "jose"

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Testing token verification...")
    
    // Check environment variables
    const jwtSecret = process.env.JWT_SECRET
    console.log("🔑 JWT_SECRET available:", !!jwtSecret)
    console.log("🔑 JWT_SECRET length:", jwtSecret?.length || 0)
    
    if (!jwtSecret) {
      return NextResponse.json({
        success: false,
        message: "JWT_SECRET not available",
        error: "Environment variable JWT_SECRET is missing"
      }, { status: 500 })
    }
    
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
        message: "No Gemurai_token cookie found"
      }, { status: 401 })
    }
    
    // Try to verify the token using jose (same as the real function)
    console.log("🔍 Attempting JWT verification with jose...")
    const { payload } = await jwtVerify(
      token.value, 
      new TextEncoder().encode(jwtSecret)
    )
    
    console.log("✅ JWT verification successful!")
    console.log("📋 Payload keys:", Object.keys(payload))
    
    return NextResponse.json({
      success: true,
      message: "Token verification successful",
      payload: {
        sub: payload.sub,
        email: payload.email,
        role: payload.role,
        exp: payload.exp,
        iat: payload.iat
      },
      debug: {
        jwtSecretAvailable: !!jwtSecret,
        jwtSecretLength: jwtSecret?.length || 0,
        tokenLength: token.value.length
      }
    })
    
  } catch (error: any) {
    console.error("❌ Token verification error:", error)
    
    return NextResponse.json({
      success: false,
      message: "Token verification failed",
      error: error.message,
      errorName: error.name,
      debug: {
        jwtSecretAvailable: !!process.env.JWT_SECRET,
        jwtSecretLength: process.env.JWT_SECRET?.length || 0
      }
    }, { status: 401 })
  }
}

