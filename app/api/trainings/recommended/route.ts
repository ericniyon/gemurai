/**
 * GET /api/trainings/recommended
 * Recommended modules for the current user (role + commodity access).
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

    const modules = await TrainingService.getRecommended(
      user.id,
      user.role,
      commodityIds
    )

    return NextResponse.json({ success: true, data: modules })
  } catch (error) {
    console.error("GET /api/trainings/recommended error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to load recommended" },
      { status: 500 }
    )
  }
}
