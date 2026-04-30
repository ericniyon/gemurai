/**
 * POST /api/trainings/enroll
 * Enroll user in a module (record that they started). Idempotent.
 * Requires authentication.
 */
import { NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/api-auth"
import { TrainingService } from "@/lib/services/TrainingService"

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req)
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      )
    }

    const body = await req.json().catch(() => ({}))
    const moduleId = body.moduleId as string
    if (!moduleId) {
      return NextResponse.json(
        { success: false, error: "moduleId is required" },
        { status: 400 }
      )
    }

    const result = await TrainingService.enroll(user.id, moduleId)
    if (!result) {
      return NextResponse.json(
        { success: false, error: "Module not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error("POST /api/trainings/enroll error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to enroll" },
      { status: 500 }
    )
  }
}
