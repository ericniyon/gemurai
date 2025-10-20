import { NextRequest, NextResponse } from "next/server"
import { getDatabaseHealth } from "@/lib/database"

export async function GET(req: NextRequest) {
  try {
    const health = await getDatabaseHealth()
    
    if (health.success) {
      return NextResponse.json({
        status: "healthy",
        timestamp: health.timestamp,
        method: health.method,
        data: health.data
      })
    } else {
      return NextResponse.json({
        status: "unhealthy",
        timestamp: health.timestamp,
        error: health.error
      }, { status: 503 })
    }
  } catch (error: any) {
    console.error("Database health check failed:", error)
    return NextResponse.json({
      status: "error",
      timestamp: new Date().toISOString(),
      error: error.message || "Unknown error"
    }, { status: 500 })
  }
}
