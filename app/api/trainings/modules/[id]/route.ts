/**
 * GET /api/trainings/modules/[id]
 * Get a single training module with lessons.
 * Public: only returns module if isPublic when publicOnly=true.
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
    // When not logged in, only allow public modules
    const effectivePublicOnly = !user || publicOnly

    const module_ = await TrainingService.getModuleById(id, effectivePublicOnly)
    if (!module_) {
      return NextResponse.json(
        { success: false, error: "Module not found" },
        { status: 404 }
      )
    }

    const res = NextResponse.json({ success: true, data: module_ })
    res.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300")
    return res
  } catch (error) {
    console.error("GET /api/trainings/modules/[id] error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to load module" },
      { status: 500 }
    )
  }
}
