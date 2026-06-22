import { NextRequest } from "next/server"
import {
  handleSoromaApiError,
  soromaJson,
  withSoromaAuth,
} from "@/lib/soroma/api-handler"
import { requirePermission } from "@/lib/soroma/guards"
import { recoverStuckExportJobs } from "@/lib/soroma/reporting"

export async function POST(request: NextRequest) {
  try {
    return withSoromaAuth(request, async (_req, session) => {
      const permErr = requirePermission(session, ["soroma.reports.manage", "soroma.exports.manage"])
      if (permErr) return permErr
      const result = await recoverStuckExportJobs({ scope: "platform", maxAgeMinutes: 30 })
      return soromaJson(result)
    })
  } catch (error) {
    return handleSoromaApiError(error)
  }
}
