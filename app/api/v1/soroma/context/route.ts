import { withSoromaAuth, soromaJson, handleSoromaApiError } from "@/lib/soroma/api-handler"
import { getUserTenants } from "@/lib/soroma/server-session"

export async function GET(request: Request) {
  try {
    const req = request as import("next/server").NextRequest
    return withSoromaAuth(req, async (_req, session) => {
      const tenants =
        session.workspaceType === "tenant" || session.workspaceType === "platform"
          ? await getUserTenants(session.userId)
          : []
      return soromaJson({
        ...session,
        tenants,
      })
    })
  } catch (error) {
    return handleSoromaApiError(error)
  }
}
