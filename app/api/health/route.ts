import { NextRequest, NextResponse } from "next/server"
import { ensureDatabaseConnected, getDatabaseHealth } from "@/lib/database"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Health check endpoint called")
    
    // Test database connection using the robust health check function
    const health = await getDatabaseHealth()
    
    return NextResponse.json({
      success: health.success,
      timestamp: new Date().toISOString(),
      status: health.success ? "healthy" : "unhealthy",
      database: {
        status: health.success ? "working" : "failed",
        error: health.success ? null : health.error,
        method: health.method,
        data: health.data
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        databaseUrl: process.env.DATABASE_URL ? "configured" : "not configured"
      }
    })
    
  } catch (error) {
    console.error("❌ Health check failed:", error)
    return NextResponse.json({
      success: false,
      timestamp: new Date().toISOString(),
      status: "unhealthy",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
} 