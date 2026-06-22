import { NextRequest } from "next/server"
import {
  handleSoromaApiError,
  parseSoromaBody,
  soromaJson,
  withSoromaTenantAuth,
} from "@/lib/soroma/api-handler"
import { checkApiPermission, requireTenantScope } from "@/lib/soroma/guards"
import { createComplianceAlertsForTenant } from "@/lib/soroma/compliance"
import { certificationCreateSchema } from "@/lib/soroma/validators"
import { prisma } from "@/lib/database"
import { logSoromaAudit } from "@/lib/soroma/audit"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  try {
    const { tenantId } = await params
    return withSoromaTenantAuth(request, tenantId, async (_req, session) => {
      const scopeErr = await requireTenantScope(session, tenantId)
      if (scopeErr) return scopeErr
      const permErr = checkApiPermission(session, "compliance:GET")
      if (permErr) return permErr

      const rows = await prisma.soromaCertification.findMany({
        where: { tenantId },
        orderBy: { expiryDate: "asc" },
        take: 100,
      })
      return soromaJson(rows)
    })
  } catch (error) {
    return handleSoromaApiError(error)
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  try {
    const { tenantId } = await params
    return withSoromaTenantAuth(request, tenantId, async (req, session) => {
      const scopeErr = await requireTenantScope(session, tenantId)
      if (scopeErr) return scopeErr
      const permErr = checkApiPermission(session, "compliance:POST")
      if (permErr) return permErr

      const body = await parseSoromaBody(req, certificationCreateSchema)
      const cert = await prisma.soromaCertification.create({
        data: {
          tenantId,
          standard: body.standard,
          certificateNo: body.certificateNo,
          issueDate: body.issueDate ? new Date(body.issueDate) : undefined,
          expiryDate: body.expiryDate ? new Date(body.expiryDate) : undefined,
          status: body.status,
          documentUrl: body.documentUrl,
          supplierId: body.supplierId,
        },
      })

      await createComplianceAlertsForTenant(tenantId)
      await logSoromaAudit({
        userId: session.userId,
        tenantId,
        workspaceType: "TENANT",
        action: "compliance.certification.created",
        entityType: "SoromaCertification",
        entityId: cert.id,
        afterState: cert,
      })

      return soromaJson(cert, 201)
    })
  } catch (error) {
    return handleSoromaApiError(error)
  }
}
