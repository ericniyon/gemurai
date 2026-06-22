import { NextRequest } from "next/server"
import { z } from "zod"
import {
  handleSoromaApiError,
  parseSoromaBody,
  soromaJson,
  soromaError,
  withSoromaAuth,
} from "@/lib/soroma/api-handler"
import { assertTenantAccess } from "@/lib/soroma/auth"
import { logSoromaAudit } from "@/lib/soroma/audit"
import { SOROMA_ROUTES } from "@/lib/soroma/constants"
import { setWorkspaceCookies } from "@/lib/soroma/server-session"

const switchSchema = z.object({
  workspace: z.enum(["platform", "tenant"]),
  tenantId: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    return withSoromaAuth(request, async (req, session) => {
      const body = await parseSoromaBody(req, switchSchema)

      if (body.workspace === "tenant") {
        if (!body.tenantId) {
          return soromaError("tenantId is required for tenant workspace", 400)
        }
        const isPlatform =
          session.workspaceType === "platform" || !!session.platformRole
        const ok = await assertTenantAccess(
          session.userId,
          body.tenantId,
          isPlatform
        )
        if (!ok) {
          return soromaError("Forbidden: no access to tenant", 403, undefined, "FORBIDDEN")
        }

        await setWorkspaceCookies("tenant", body.tenantId)
        await logSoromaAudit({
          userId: session.userId,
          tenantId: body.tenantId,
          workspaceType: "TENANT",
          action:
            session.workspaceType === "platform" || session.platformRole
              ? "workspace.tenant_impersonation"
              : "workspace.switched",
          entityType: "SoromaTenant",
          entityId: body.tenantId,
          afterState: { workspace: "tenant", tenantId: body.tenantId },
        })

        return soromaJson({
          workspace: "tenant",
          redirectUrl: SOROMA_ROUTES.tenant(body.tenantId).overview,
        })
      }

      await setWorkspaceCookies("platform")
      await logSoromaAudit({
        userId: session.userId,
        workspaceType: "PLATFORM",
        action: "workspace.switched",
        afterState: { workspace: "platform" },
      })

      return soromaJson({
        workspace: "platform",
        redirectUrl: SOROMA_ROUTES.platform.overview,
      })
    })
  } catch (error) {
    return handleSoromaApiError(error)
  }
}
