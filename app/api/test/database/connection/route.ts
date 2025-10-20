import { type NextRequest, NextResponse } from "next/server"
import { getDatabaseHealth } from "@/lib/database"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  try {
    // Test database connection with fallback mechanisms
    const health = await getDatabaseHealth()

    if (health.success) {
      return NextResponse.json({
        success: true,
        connected: true,
        message: "Database connection successful",
        data: health.data,
        method: health.method,
        database: process.env.POSTGRES_DATABASE || process.env.PGDATABASE || "unknown",
        timestamp: health.timestamp,
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          connected: false,
          message: health.error || "Database connection failed",
          timestamp: health.timestamp,
        },
        { status: 500 },
      )
    }
  } catch (error: any) {
    console.error("Database connection test failed:", error)

    return NextResponse.json(
      {
        success: false,
        connected: false,
        message: error.message || "Database connection failed",
        error: {
          name: error.name,
          code: error.code,
          detail: error.detail,
          hint: error.hint,
        },
      },
      { status: 500 },
    )
  }
}
