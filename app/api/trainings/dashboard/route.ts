/**
 * GET /api/trainings/dashboard
 * Returns recommended, inProgress, and completed in one call for the training dashboard.
 * Requires authentication.
 */
import { NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/api-auth"
import { TrainingService } from "@/lib/services/TrainingService"

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req)
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const commodityIdsParam = searchParams.get("commodityIds")
    const commodityIds = commodityIdsParam
      ? commodityIdsParam.split(",").filter(Boolean)
      : []

    const [recommended, inProgress, completed] = await Promise.all([
      TrainingService.getRecommended(user.id, user.role, commodityIds),
      TrainingService.getInProgress(user.id),
      TrainingService.getCompleted(user.id),
    ])

    return NextResponse.json({
      success: true,
      data: {
        recommended,
        inProgress,
        completed,
      },
    })
  } catch (error) {
    console.error("GET /api/trainings/dashboard error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to load dashboard" },
      { status: 500 }
    )
  }
}
