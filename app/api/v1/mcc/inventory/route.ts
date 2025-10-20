import { NextRequest, NextResponse } from "next/server"
import { MCCInventoryService } from "@/lib/services/MCCInventoryService"
import { verifyAuthToken } from "@/lib/api-auth"

// GET /api/v1/mcc/inventory - Get MCC inventory summary
export async function GET(req: NextRequest) {
  try {
    const authToken = req.headers.get("authorization")?.replace("Bearer ", "")
    if (!authToken) {
      return NextResponse.json({ error: "Authorization token required" }, { status: 401 })
    }

    const user = await verifyAuthToken(authToken)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const mccId = searchParams.get("mccId")

    if (!mccId) {
      return NextResponse.json(
        { error: "mccId parameter is required" },
        { status: 400 }
      )
    }

    const result = await MCCInventoryService.getMCCInventorySummary(mccId)

    return NextResponse.json({
      success: true,
      data: result
    })
  } catch (error) {
    console.error("Get MCC inventory error:", error)
    return NextResponse.json(
      { error: "Failed to get MCC inventory" },
      { status: 500 }
    )
  }
}


