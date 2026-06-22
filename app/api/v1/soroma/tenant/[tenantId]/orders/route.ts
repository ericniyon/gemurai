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
  orderCreateSchema,
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
      const permErr = checkApiPermission(session, "orders:GET")
      if (permErr) return permErr

      const parsedQuery = soromaPaginationQuerySchema.parse(
        Object.fromEntries(new URL(req.url).searchParams.entries())
      )
      const where = {
        tenantId,
        ...(parsedQuery.status ? { status: parsedQuery.status as never } : {}),
      }

      const [rows, total] = await Promise.all([
        prisma.soromaOrder.findMany({
          where,
          include: { buyer: true, lines: true },
          skip: (parsedQuery.page - 1) * parsedQuery.pageSize,
          take: parsedQuery.pageSize,
          orderBy: { orderDate: "desc" },
        }),
        prisma.soromaOrder.count({ where }),
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
      const permErr = checkApiPermission(session, "orders:POST")
      if (permErr) return permErr

      const body = await parseSoromaBody(req, orderCreateSchema)
      const count = await prisma.soromaOrder.count({ where: { tenantId } })
      const orderNumber = body.orderNumber ?? `ORD-${String(count + 1).padStart(5, "0")}`
      const linesInput = body.lines ?? []
      const lineTotal = linesInput.reduce((a, l) => a + l.quantity * (l.unitPrice ?? 0), 0)
      const rawBody = body as typeof body & {
        skuCode?: string
        skuName?: string
        quantity?: number
      }
      const lines =
        linesInput.length > 0
          ? linesInput
          : rawBody.skuCode && rawBody.skuName
            ? [
                {
                  skuCode: rawBody.skuCode,
                  skuName: rawBody.skuName,
                  quantity: rawBody.quantity ?? 1,
                  unitPrice: 0,
                },
              ]
            : []

      const order = await prisma.soromaOrder.create({
        data: {
          tenantId,
          buyerId: body.buyerId,
          orderNumber,
          amount: body.amount || lineTotal,
          currency: body.currency,
          status: body.status as never,
          lines: {
            create: lines.map((l) => ({
              skuCode: l.skuCode,
              skuName: l.skuName,
              quantity: l.quantity,
              unitPrice: l.unitPrice,
              lineTotal: l.quantity * (l.unitPrice ?? 0),
            })),
          },
        },
        include: { buyer: true, lines: true },
      })

      await logSoromaAudit({
        userId: session.userId,
        tenantId,
        workspaceType: "TENANT",
        action: "order.created",
        entityType: "SoromaOrder",
        entityId: order.id,
        afterState: order,
      })

      return soromaJson(order, 201)
    })
  } catch (error) {
    return handleSoromaApiError(error)
  }
}
