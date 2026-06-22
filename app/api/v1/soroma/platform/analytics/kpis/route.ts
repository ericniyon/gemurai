import { NextRequest } from "next/server"
import {
  handleSoromaApiError,
  soromaJson,
  withSoromaAuth,
} from "@/lib/soroma/api-handler"
import { requirePermission } from "@/lib/soroma/guards"
import { getPlatformKpis } from "@/lib/soroma/kpi-engine"

export async function GET(request: NextRequest) {
  try {
    const scope = new URL(request.url).searchParams.get("scope")
    return withSoromaAuth(request, async (_req, session) => {
      const permErr = requirePermission(session, "soroma.platform.view")
      if (permErr) return permErr

      const data = await getPlatformKpis(scope)
      return soromaJson(data)
    })
  } catch (error) {
    return handleSoromaApiError(error)
  }
}
