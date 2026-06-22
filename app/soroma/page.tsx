import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { getSoromaSessionFromToken } from "@/lib/soroma/auth"
import { SOROMA_ROUTES } from "@/lib/soroma/constants"

export default async function SoromaIndexPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get("Gemurai_token")?.value
  if (!token) redirect(SOROMA_ROUTES.login)

  const workspace = cookieStore.get("soroma_workspace")?.value as
    | "platform"
    | "tenant"
    | undefined
  const tenantId = cookieStore.get("soroma_tenant_id")?.value

  const session = await getSoromaSessionFromToken(token, {
    workspace,
    preferredTenantId: tenantId,
  })
  if (!session) redirect(SOROMA_ROUTES.login)
  if (session.workspaceType === "platform") {
    redirect(SOROMA_ROUTES.platform.overview)
  }
  if (session.tenantId) {
    redirect(SOROMA_ROUTES.tenant(session.tenantId).overview)
  }
  redirect(SOROMA_ROUTES.login)
}
