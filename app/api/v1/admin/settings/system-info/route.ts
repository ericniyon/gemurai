import { NextRequest, NextResponse } from "next/server"
import { verifyAuthToken } from "@/lib/api-auth"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/v1/admin/settings/system-info - Get system information
 */
export async function GET(req: NextRequest) {
  try {
    const authToken = req.headers.get("authorization")?.replace("Bearer ", "")
    if (!authToken) {
      return NextResponse.json({ error: "Authorization token required" }, { status: 401 })
    }

    const user = await verifyAuthToken(authToken)
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Test database connection
    let databaseStatus = "Unknown"
    try {
      await prisma.$queryRaw`SELECT 1`
      databaseStatus = "Connected"
    } catch (error) {
      databaseStatus = "Disconnected"
    }

    return NextResponse.json({
      success: true,
      data: {
        databaseStatus,
        version: "1.0.0",
        environment: process.env.NODE_ENV || "development",
        uptime: "N/A", // Could calculate from process start time
      },
    })
  } catch (error: any) {
    console.error("Error fetching system info:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch system information",
        details: process.env.NODE_ENV === "development" ? error?.message : undefined,
      },
      { status: 500 }
    )
  }
}
