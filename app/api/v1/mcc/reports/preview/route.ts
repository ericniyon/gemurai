import { NextRequest, NextResponse } from "next/server"
import { checkMCCPermission } from "@/lib/mcc-auth"
import { generateReportData } from "../route"

/**
 * GET /api/v1/mcc/reports/preview - Preview report data without downloading
 */
export async function GET(req: NextRequest) {
  try {
    const authToken = req.headers.get("authorization")?.replace("Bearer ", "")
    const { authorized, user, error } = await checkMCCPermission(
      authToken,
      "mcc.reports.generate"
    )

    if (!authorized || !user) {
      return NextResponse.json({ error: error || "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const reportType = searchParams.get("reportType")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const mccId = searchParams.get("mccId") || undefined
    const farmerId = searchParams.get("farmerId") || undefined

    if (!reportType || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Missing required parameters: reportType, startDate, endDate" },
        { status: 400 }
      )
    }

    // If user is MCC_MANAGER, verify they own this MCC
    if (user.role === "MCC_MANAGER" && mccId && user.mccId !== mccId) {
      return NextResponse.json({ error: "Unauthorized for this MCC" }, { status: 403 })
    }

    // Generate report data
    const reportData = await generateReportData({
      reportType,
      mccId,
      startDate,
      endDate,
      farmerId,
    })

    return NextResponse.json({
      success: true,
      data: reportData,
      meta: {
        reportType,
        startDate,
        endDate,
        mccId,
        farmerId,
        generatedAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("Report preview error:", error)
    return NextResponse.json(
      {
        error: "Failed to generate report preview",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
