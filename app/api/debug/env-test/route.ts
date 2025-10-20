import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const envInfo = {
      JWT_SECRET: {
        exists: !!process.env.JWT_SECRET,
        length: process.env.JWT_SECRET?.length || 0,
        prefix: process.env.JWT_SECRET?.substring(0, 10) + "..." || "undefined"
      },
      NEXTAUTH_SECRET: {
        exists: !!process.env.NEXTAUTH_SECRET,
        length: process.env.NEXTAUTH_SECRET?.length || 0
      },
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL: {
        exists: !!process.env.DATABASE_URL,
        length: process.env.DATABASE_URL?.length || 0
      }
    }

    return NextResponse.json({
      success: true,
      message: "Environment variables test",
      envInfo,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error("Environment test error:", error)
    return NextResponse.json({
      success: false,
      message: "Error testing environment variables",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
} 