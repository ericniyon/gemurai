import { NextRequest } from "next/server"
import {
  handleSoromaApiError,
  parseSoromaBody,
  soromaError,
  soromaJson,
  withSoromaAuth,
} from "@/lib/soroma/api-handler"
import { requirePermission } from "@/lib/soroma/guards"
import { pushToDeadLetter, retrySyncJob } from "@/lib/soroma/integrations"
import { retrySyncJobSchema } from "@/lib/soroma/validators"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params
    return withSoromaAuth(request, async (req, session) => {
      const permErr = requirePermission(session, [
        "soroma.integrations.retry",
        "soroma.integrations.manage",
      ])
      if (permErr) return permErr

      const body = await parseSoromaBody(req, retrySyncJobSchema)
      const retryJob = await retrySyncJob(jobId, session.userId)
      if (!retryJob) return soromaError("Sync job not found", 404, undefined, "NOT_FOUND")

      if (body.reason) {
        await pushToDeadLetter(jobId, body.reason, session.userId)
      }

      return soromaJson(retryJob)
    })
  } catch (error) {
    return handleSoromaApiError(error)
  }
}
