import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Testing environment variables...")
    
    const envVars = {
      DATABASE_URL: process.env.DATABASE_URL ? "Set" : "Not set",
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PHASE: process.env.NEXT_PHASE,
      JWT_SECRET: process.env.JWT_SECRET ? "Set" : "Not set",
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "Set" : "Not set",
    }
    
    console.log("Environment variables:", envVars)
    
    return NextResponse.json({
      success: true,
      message: "Environment variables check",
      data: envVars,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error("❌ Error checking environment variables:", error)
    return NextResponse.json({
      success: false,
      message: "Error checking environment variables",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
