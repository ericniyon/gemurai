import { NextResponse } from "next/server"
import { getDatabaseHealth } from "@/lib/database"

export const runtime = "nodejs"

export async function GET() {
  try {
    // Test database connection using Prisma
    const health = await getDatabaseHealth()

    if (health.success) {
      return NextResponse.json({
        success: true,
        message: "Database connection successful",
        data: health.data,
        database: process.env.POSTGRES_DATABASE || process.env.PGDATABASE || "unknown",
        connection_url: process.env.DATABASE_URL ? "Set" : "Not set",
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "Database connection failed",
          error: health.error,
        },
        { status: 500 },
      )
    }
  } catch (error: any) {
    console.error("Database connection test failed:", error)

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Database connection failed",
        error: {
          name: error.name,
          code: error.code,
          detail: error.detail,
          hint: error.hint,
        },
        environment: {
          database_url: process.env.DATABASE_URL ? "Set" : "Not set",
          postgres_url: process.env.POSTGRES_URL ? "Set" : "Not set",
          node_env: process.env.NODE_ENV,
        },
      },
      { status: 500 },
    )
  }
}
