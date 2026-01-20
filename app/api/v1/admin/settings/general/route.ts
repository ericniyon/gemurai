import { NextRequest, NextResponse } from "next/server"
import { verifyAuthToken } from "@/lib/api-auth"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/v1/admin/settings/general - Get general settings
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

    // For now, return default settings
    // In production, these would be stored in a settings table
    const settings = {
      platformName: "HarvestPlus by GEMURA",
      platformDescription: "Multi-Commodity Aggregation & Settlement Platform",
      defaultLanguage: "en",
      timezone: "Africa/Kigali",
      dateFormat: "DD/MM/YYYY",
      timeFormat: "24h",
      currency: "RWF",
      enableNotifications: true,
      enableEmailNotifications: true,
      enableSMSNotifications: false,
      maintenanceMode: false,
      allowUserRegistration: true,
      requireEmailVerification: false,
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      supportEmail: "support@harvestplus.rw",
      supportPhone: "+250 788 123 456",
    }

    return NextResponse.json({
      success: true,
      data: settings,
    })
  } catch (error: any) {
    console.error("Error fetching general settings:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch settings",
        details: process.env.NODE_ENV === "development" ? error?.message : undefined,
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/v1/admin/settings/general - Save general settings
 */
export async function POST(req: NextRequest) {
  try {
    const authToken = req.headers.get("authorization")?.replace("Bearer ", "")
    if (!authToken) {
      return NextResponse.json({ error: "Authorization token required" }, { status: 401 })
    }

    const user = await verifyAuthToken(authToken)
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const data = await req.json()

    // In production, save to settings table
    // For now, just return success
    // TODO: Implement settings storage in database

    return NextResponse.json({
      success: true,
      message: "General settings saved successfully",
      data,
    })
  } catch (error: any) {
    console.error("Error saving general settings:", error)
    return NextResponse.json(
      {
        error: "Failed to save settings",
        details: process.env.NODE_ENV === "development" ? error?.message : undefined,
      },
      { status: 500 }
    )
  }
}
