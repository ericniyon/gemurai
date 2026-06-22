import { NextRequest } from "next/server"
import {
  handleSoromaApiError,
  parseSoromaBody,
  soromaError,
  soromaJson,
  withSoromaAuth,
} from "@/lib/soroma/api-handler"
import { requirePermission } from "@/lib/soroma/guards"
import { processSyncJob } from "@/lib/soroma/integrations"
import { z } from "zod"

const bodySchema = z.object({
  jobId: z.string().trim().min(1),
})

export async function POST(request: NextRequest) {
  try {
    return withSoromaAuth(request, async (req, session) => {
      const permErr = requirePermission(session, [
        "soroma.integrations.manage",
        "soroma.integrations.retry",
      ])
      if (permErr) return permErr

      const body = await parseSoromaBody(req, bodySchema)
      const job = await processSyncJob(body.jobId, session.userId)
      if (!job) return soromaError("Sync job not found", 404, undefined, "NOT_FOUND")
      return soromaJson(job)
    })
  } catch (error) {
    return handleSoromaApiError(error)
  }
}
