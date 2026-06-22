import { NextRequest } from "next/server"
import {
  handleSoromaApiError,
  soromaError,
  soromaJson,
  withSoromaAuth,
} from "@/lib/soroma/api-handler"
import { requirePermission } from "@/lib/soroma/guards"
import { getPlatformKpiDrilldown } from "@/lib/soroma/kpi-engine"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const kpi = searchParams.get("kpi")
    const scope = searchParams.get("scope")
    if (!kpi) return soromaError("kpi query parameter is required", 400, undefined, "VALIDATION")

    return withSoromaAuth(request, async (_req, session) => {
      const permErr = requirePermission(session, "soroma.platform.view")
      if (permErr) return permErr

      const data = await getPlatformKpiDrilldown(kpi, scope)
      return soromaJson(data)
    })
  } catch (error) {
    return handleSoromaApiError(error)
  }
}
