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
import { batchCreateSchema, downtimeCreateSchema, qcExceptionCreateSchema } from "@/lib/soroma/validators"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  try {
    const { tenantId } = await params
    return withSoromaTenantAuth(request, tenantId, async (_req, session) => {
      const scopeErr = await requireTenantScope(session, tenantId)
      if (scopeErr) return scopeErr
      const permErr = checkApiPermission(session, "production:GET")
      if (permErr) return permErr

      const batches = await prisma.soromaProductionBatch.findMany({
        where: { tenantId },
        include: { line: true },
        orderBy: { updatedAt: "desc" },
        take: 100,
      })
      return soromaJson(batches)
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
      const permErr = checkApiPermission(session, "production:POST")
      if (permErr) return permErr

      const body = await parseSoromaBody(req, batchCreateSchema)
      const count = await prisma.soromaProductionBatch.count({ where: { tenantId } })
      const batchNumber = body.batchNumber ?? `BATCH-${String(count + 1).padStart(4, "0")}`

      const batch = await prisma.soromaProductionBatch.create({
        data: {
          tenantId,
          batchNumber,
          productName: body.productName,
          lineId: body.lineId,
          expectedQty: body.expectedQty,
          notes: body.notes,
          status: "PLANNED",
        },
        include: { line: true },
      })

      await logSoromaAudit({
        userId: session.userId,
        tenantId,
        workspaceType: "TENANT",
        action: "production.batch.created",
        entityType: "SoromaProductionBatch",
        entityId: batch.id,
        afterState: batch,
      })

      return soromaJson(batch, 201)
    })
  } catch (error) {
    return handleSoromaApiError(error)
  }
}
