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
import {
  soromaPaginationQuerySchema,
  financeRecordCreateSchema,
} from "@/lib/soroma/validators"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  try {
    const { tenantId } = await params
    return withSoromaTenantAuth(request, tenantId, async (req, session) => {
      const scopeErr = await requireTenantScope(session, tenantId)
      if (scopeErr) return scopeErr
      const permErr = checkApiPermission(session, "finance:GET")
      if (permErr) return permErr

      const parsedQuery = soromaPaginationQuerySchema.parse(
        Object.fromEntries(new URL(req.url).searchParams.entries())
      )
      const where = {
        tenantId,
        ...(parsedQuery.status ? { recordType: parsedQuery.status } : {}),
      }

      const [rows, total] = await Promise.all([
        prisma.soromaFinanceRecord.findMany({
          where,
          skip: (parsedQuery.page - 1) * parsedQuery.pageSize,
          take: parsedQuery.pageSize,
          orderBy: { createdAt: "desc" },
        }),
        prisma.soromaFinanceRecord.count({ where }),
      ])

      return soromaJson({ rows, total, page: parsedQuery.page, pageSize: parsedQuery.pageSize })
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
      const permErr = checkApiPermission(session, "finance:POST")
      if (permErr) return permErr

      const body = await parseSoromaBody(req, financeRecordCreateSchema)
      const record = await prisma.soromaFinanceRecord.create({
        data: {
          tenantId,
          recordType: body.recordType,
          amount: body.amount,
          currency: body.currency,
          reference: body.reference,
          batchId: body.batchId,
          orderId: body.orderId,
          dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
        },
      })

      await logSoromaAudit({
        userId: session.userId,
        tenantId,
        workspaceType: "TENANT",
        action: "finance.record.created",
        entityType: "SoromaFinanceRecord",
        entityId: record.id,
        afterState: record,
      })

      return soromaJson(record, 201)
    })
  } catch (error) {
    return handleSoromaApiError(error)
  }
}
