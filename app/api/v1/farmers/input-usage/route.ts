import { NextRequest, NextResponse } from "next/server"
import { SeasonPlanService } from "@/lib/services/SeasonPlanService"
import { verifyAuthToken } from "@/lib/api-auth"

/**
 * POST /api/v1/farmers/input-usage - Log input usage
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
    const { seasonPlanId, inputCatalogId, farmerId, quantity, unit, cost, notes } = data

    if (!seasonPlanId || !inputCatalogId || !farmerId || !quantity || !unit) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: seasonPlanId, inputCatalogId, farmerId, quantity, unit",
        },
        { status: 400 }
      )
    }

    const usage = await SeasonPlanService.logInputUsage({
      seasonPlanId,
      inputCatalogId,
      farmerId,
      quantity: parseFloat(quantity),
      unit,
      cost: cost ? parseFloat(cost) : undefined,
      notes,
    })

    return NextResponse.json({
      success: true,
      message: "Input usage logged successfully",
      data: usage,
    })
  } catch (error) {
    console.error("Log input usage error:", error)
    return NextResponse.json(
      { error: "Failed to log input usage" },
      { status: 500 }
    )
  }
}
