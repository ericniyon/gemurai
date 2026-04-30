/**
 * POST /api/trainings/progress
 * Record lesson completion. Idempotent.
 * GET: return progress for a module (optional moduleId query).
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
    const { moduleId, lessonId } = body as { moduleId?: string; lessonId?: string }
    if (!moduleId || !lessonId) {
      return NextResponse.json(
        { success: false, error: "moduleId and lessonId are required" },
        { status: 400 }
      )
    }

    const result = await TrainingService.recordProgress(user.id, moduleId, lessonId)
    if (!result) {
      return NextResponse.json(
        { success: false, error: "Module or lesson not found" },
        { status: 404 }
      )
    }

    // If user completed all lessons, issue certification if not already issued
    await TrainingService.issueCertificationIfEligible(user.id, moduleId)

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error("POST /api/trainings/progress error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to record progress" },
      { status: 500 }
    )
  }
}

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
    const moduleId = searchParams.get("moduleId")
    if (!moduleId) {
      return NextResponse.json(
        { success: false, error: "moduleId is required" },
        { status: 400 }
      )
    }

    const progress = await TrainingService.getProgress(user.id, moduleId)
    if (!progress) {
      return NextResponse.json(
        { success: false, error: "Module not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: progress })
  } catch (error) {
    console.error("GET /api/trainings/progress error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to load progress" },
      { status: 500 }
    )
  }
}
