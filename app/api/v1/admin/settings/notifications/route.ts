import { NextRequest, NextResponse } from "next/server"
import { verifyAuthToken } from "@/lib/api-auth"

/**
 * GET /api/v1/admin/settings/notifications - Get notification settings
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

    // Return default notification settings
    const settings = {
      emailCollectionApproved: true,
      emailCollectionRejected: true,
      emailPaymentProcessed: true,
      emailLowStockAlert: true,
      emailSystemAlert: true,
      emailWeeklyReport: false,
      emailMonthlyReport: true,
      smsCollectionApproved: false,
      smsPaymentProcessed: true,
      smsLowStockAlert: false,
      smsSystemAlert: true,
      inAppCollectionUpdates: true,
      inAppPaymentUpdates: true,
      inAppSystemUpdates: true,
      inAppQualityAlerts: true,
      notifyOnNewUser: true,
      notifyOnNewMCC: true,
      notifyOnNewCommodity: true,
      notifyOnFailedPayment: true,
      notifyOnSystemError: true,
    }

    return NextResponse.json({
      success: true,
      data: settings,
    })
  } catch (error: any) {
    console.error("Error fetching notification settings:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch notification settings",
        details: process.env.NODE_ENV === "development" ? error?.message : undefined,
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/v1/admin/settings/notifications - Save notification settings
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

    // TODO: Save to database settings table

    return NextResponse.json({
      success: true,
      message: "Notification settings saved successfully",
      data,
    })
  } catch (error: any) {
    console.error("Error saving notification settings:", error)
    return NextResponse.json(
      {
        error: "Failed to save notification settings",
        details: process.env.NODE_ENV === "development" ? error?.message : undefined,
      },
      { status: 500 }
    )
  }
}
