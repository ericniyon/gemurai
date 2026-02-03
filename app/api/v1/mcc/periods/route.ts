import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { checkMCCPermission } from "@/lib/mcc-auth"

/**
 * GET /api/v1/mcc/periods - List MCC periods (milk collection periods)
 */
export async function GET(req: NextRequest) {
  try {
    const authToken = req.headers.get("authorization")?.replace("Bearer ", "")
    const { authorized, user, error } = await checkMCCPermission(
      authToken,
      "mcc.payments.view"
    )

    if (!authorized || !user) {
      return NextResponse.json({ error: error || "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const mccId = searchParams.get("mccId")

    let targetMccId = mccId
    if (!targetMccId && user.role === "MCC_MANAGER" && user.mccId) {
      targetMccId = user.mccId
    }

    if (!targetMccId) {
      return NextResponse.json(
        { error: "MCC ID required. Provide mccId or ensure user is assigned to an MCC." },
        { status: 400 }
      )
    }

    const periods = await prisma.mcc_periods.findMany({
      where: { mccId: targetMccId },
      orderBy: [{ periodNumber: "desc" }, { startDate: "desc" }],
    })

    return NextResponse.json({
      success: true,
      data: periods,
    })
  } catch (error) {
    console.error("Get MCC periods error:", error)
    return NextResponse.json(
      {
        error: "Failed to get MCC periods",
        details: process.env.NODE_ENV === "development" && error instanceof Error ? error.message : undefined,
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/v1/mcc/periods - Create MCC period
 */
export async function POST(req: NextRequest) {
  try {
    const authToken = req.headers.get("authorization")?.replace("Bearer ", "")
    const { authorized, user, error } = await checkMCCPermission(
      authToken,
      "mcc.payments.create"
    )

    if (!authorized || !user) {
      return NextResponse.json({ error: error || "Unauthorized" }, { status: 401 })
    }

    const data = await req.json()
    const { mccId, periodNumber, startDate, endDate } = data

    let targetMccId = mccId
    if (!targetMccId && user.role === "MCC_MANAGER" && user.mccId) {
      targetMccId = user.mccId
    }

    if (!targetMccId || !periodNumber || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Missing required fields: mccId (or user MCC), periodNumber, startDate, endDate" },
        { status: 400 }
      )
    }

    const start = new Date(startDate)
    const end = new Date(endDate)
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json(
        { error: "Invalid startDate or endDate" },
        { status: 400 }
      )
    }
    if (end <= start) {
      return NextResponse.json(
        { error: "endDate must be after startDate" },
        { status: 400 }
      )
    }

    const id = `period_${targetMccId}_${Date.now()}`

    const period = await prisma.mcc_periods.create({
      data: {
        id,
        mccId: targetMccId,
        periodNumber: parseInt(String(periodNumber)),
        startDate: start,
        endDate: end,
        status: "ACTIVE",
        totalFarmers: 0,
        totalMilkCollected: 0,
        totalAmount: 0,
        totalDeductions: 0,
        totalAdvances: 0,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      message: "MCC period created successfully",
      data: period,
    })
  } catch (error) {
    console.error("Create MCC period error:", error)
    return NextResponse.json(
      {
        error: "Failed to create MCC period",
        details: process.env.NODE_ENV === "development" && error instanceof Error ? error.message : undefined,
      },
      { status: 500 }
    )
  }
}
