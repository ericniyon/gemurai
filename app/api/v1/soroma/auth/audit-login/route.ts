import { NextRequest } from "next/server"
import {
  handleSoromaApiError,
  soromaJson,
  withSoromaAuth,
} from "@/lib/soroma/api-handler"
import { logSoromaAudit } from "@/lib/soroma/audit"

/** Records SOROMA workspace login after Gemurai auth succeeds */
export async function POST(request: NextRequest) {
  try {
    return withSoromaAuth(request, async (_req, session) => {
      await logSoromaAudit({
        userId: session.userId,
        tenantId: session.tenantId,
        workspaceType: session.workspaceType === "platform" ? "PLATFORM" : "TENANT",
        action: "auth.login",
        afterState: {
          email: session.email,
          workspaceType: session.workspaceType,
          role: session.platformRole ?? session.tenantRole,
        },
      })
      return soromaJson({ ok: true })
    })
  } catch (error) {
    return handleSoromaApiError(error)
  }
}
