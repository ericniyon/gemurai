import { NextRequest } from "next/server"
import { prisma } from "@/lib/database"
import {
  withSoromaTenantAuth,
  soromaJson,
  parseSoromaBody,
  handleSoromaApiError,
} from "@/lib/soroma/api-handler"
import { logSoromaAudit } from "@/lib/soroma/audit"
import { checkApiPermission, requireTenantScope } from "@/lib/soroma/guards"
import { supplierPatchSchema } from "@/lib/soroma/validators"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ tenantId: string; id: string }> }
) {
  try {
    const { tenantId, id } = await params
    return withSoromaTenantAuth(request, tenantId, async (req, session) => {
      const scopeErr = await requireTenantScope(session, tenantId)
      if (scopeErr) return scopeErr
      const permErr = checkApiPermission(session, "suppliers:POST")
      if (permErr) return permErr

      const body = await parseSoromaBody(req, supplierPatchSchema)
      const existing = await prisma.soromaSupplier.findFirst({ where: { id, tenantId } })
      if (!existing) return soromaJson({ error: "Not found" }, 404)

      const updated = await prisma.soromaSupplier.update({
        where: { id },
        data: body,
      })

      await logSoromaAudit({
        userId: session.userId,
        tenantId,
        workspaceType: "TENANT",
        action: "supplier.updated",
        entityType: "SoromaSupplier",
        entityId: id,
        beforeState: existing,
        afterState: updated,
      })

      return soromaJson(updated)
    })
  } catch (error) {
    return handleSoromaApiError(error)
  }
}
