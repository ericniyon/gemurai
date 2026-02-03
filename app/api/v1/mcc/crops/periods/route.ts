import { NextRequest, NextResponse } from "next/server"
import { CropCollectionService } from "@/lib/services/CropCollectionService"
import { verifyAuthToken } from "@/lib/api-auth"

/**
 * GET /api/v1/mcc/crops/periods?mccId=... - List crop periods for an MCC
 */
export async function GET(req: NextRequest) {
  try {
    const authToken = req.headers.get("authorization")?.replace("Bearer ", "")
    if (!authToken) {
      return NextResponse.json({ error: "Authorization token required" }, { status: 401 })
    }

    const user = await verifyAuthToken(authToken)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const mccId = searchParams.get("mccId")
    if (!mccId) {
      return NextResponse.json({ error: "mccId query parameter required" }, { status: 400 })
    }

    const periods = await CropCollectionService.getCropPeriods(mccId)
    return NextResponse.json({ success: true, data: periods })
  } catch (error) {
    console.error("Get crop periods error:", error)
    return NextResponse.json(
      { error: "Failed to fetch crop periods" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/v1/mcc/crops/periods - Create crop period
 */
export async function POST(req: NextRequest) {
  try {
    const authToken = req.headers.get("authorization")?.replace("Bearer ", "")
    if (!authToken) {
      return NextResponse.json({ error: "Authorization token required" }, { status: 401 })
    }

    const user = await verifyAuthToken(authToken)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await req.json()
    const { mccId, periodNumber, startDate, endDate } = data

    if (!mccId || !periodNumber || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Missing required fields: mccId, periodNumber, startDate, endDate" },
        { status: 400 }
      )
    }

    const period = await CropCollectionService.createCropPeriod(
      mccId,
      parseInt(periodNumber),
      new Date(startDate),
      new Date(endDate)
    )

    return NextResponse.json({
      success: true,
      message: "Crop period created successfully",
      data: period,
    })
  } catch (error) {
    console.error("Create crop period error:", error)
    return NextResponse.json(
      { error: "Failed to create crop period" },
      { status: 500 }
    )
  }
}
