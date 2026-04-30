/**
 * GET /api/trainings/modules/[id]/lessons
 * List lessons for a module (ordered by orderIndex).
 */
import { NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/api-auth"
import { TrainingService } from "@/lib/services/TrainingService"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(req.url)
    const publicOnly = searchParams.get("publicOnly") === "true"
    const user = await getAuthUser(req)
    const effectivePublicOnly = !user || publicOnly

    const lessons = await TrainingService.getLessons(id, effectivePublicOnly)
    if (lessons === null) {
      return NextResponse.json(
        { success: false, error: "Module not found" },
        { status: 404 }
      )
    }

    const res = NextResponse.json({ success: true, data: lessons })
    res.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300")
    return res
  } catch (error) {
    console.error("GET /api/trainings/modules/[id]/lessons error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to load lessons" },
      { status: 500 }
    )
  }
}
