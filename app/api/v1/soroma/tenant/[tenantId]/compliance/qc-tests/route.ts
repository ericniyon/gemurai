import { NextRequest } from "next/server"
import {
  handleSoromaApiError,
  parseSoromaBody,
  soromaJson,
  withSoromaTenantAuth,
} from "@/lib/soroma/api-handler"
import { checkApiPermission, requireTenantScope } from "@/lib/soroma/guards"
import { createComplianceAlertsForTenant } from "@/lib/soroma/compliance"
import { qcTestCreateSchema } from "@/lib/soroma/validators"
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

      const rows = await prisma.soromaQCTest.findMany({
        where: { tenantId },
        orderBy: { testedAt: "desc" },
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

      const body = await parseSoromaBody(req, qcTestCreateSchema)
      const test = await prisma.soromaQCTest.create({
        data: {
          tenantId,
          batchId: body.batchId,
          testType: body.testType,
          result: body.result,
          passed: body.passed,
          testedAt: body.testedAt ? new Date(body.testedAt) : undefined,
          notes: body.notes,
        },
      })

      await createComplianceAlertsForTenant(tenantId)
      await logSoromaAudit({
        userId: session.userId,
        tenantId,
        workspaceType: "TENANT",
        action: "compliance.qc_test.created",
        entityType: "SoromaQCTest",
        entityId: test.id,
        afterState: test,
      })

      return soromaJson(test, 201)
    })
  } catch (error) {
    return handleSoromaApiError(error)
  }
}
