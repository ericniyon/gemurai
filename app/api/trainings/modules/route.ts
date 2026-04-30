/**
 * GET /api/trainings/modules
 * List training modules. Supports role and commodity filters.
 * Auth: optional (if provided, respects role; if not, only isPublic modules when publicOnly=true).
 */
import { NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/api-auth"
import { TrainingService, type TrainingTargetRole } from "@/lib/services/TrainingService"

const ROLE_MAP: Record<string, TrainingTargetRole> = {
  FARMER: "Farmer",
  AGENT: "Agent",
  MCC_MANAGER: "Agent",
  COOP_ADMIN: "Agent",
  QualityOfficer: "QualityOfficer",
  WarehouseOfficer: "WarehouseOfficer",
  ADMIN: "Agent",
  SUPER_ADMIN: "Agent",
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const role = searchParams.get("role") as TrainingTargetRole | null
    const commodityId = searchParams.get("commodityId") || undefined
    const publicOnly = searchParams.get("publicOnly") === "true"

    const user = await getAuthUser(req)
    const effectiveRole = role || (user ? ROLE_MAP[user.role] : undefined)

    const modules = await TrainingService.getModules({
      role: effectiveRole || undefined,
      commodityId,
      publicOnly: publicOnly ? true : undefined,
    })

    const res = NextResponse.json({ success: true, data: modules })
    res.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300")
    return res
  } catch (error) {
    console.error("GET /api/trainings/modules error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to load modules" },
      { status: 500 }
    )
  }
}
