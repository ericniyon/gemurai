/**
 * GET /api/trainings/certifications
 * List current user's certifications.
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

    const certifications = await TrainingService.getCertifications(user.id)
    return NextResponse.json({ success: true, data: certifications })
  } catch (error) {
    console.error("GET /api/trainings/certifications error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to load certifications" },
      { status: 500 }
    )
  }
}
