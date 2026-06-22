import { NextRequest } from "next/server"
import { prisma } from "@/lib/database"
import {
  withSoromaTenantAuth,
  soromaJson,
  soromaError,
  parseSoromaBody,
  handleSoromaApiError,
} from "@/lib/soroma/api-handler"
import { logSoromaAudit } from "@/lib/soroma/audit"
import { checkApiPermission, requireTenantScope } from "@/lib/soroma/guards"
import { purchaseOrderCreateSchema } from "@/lib/soroma/validators"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  try {
    const { tenantId } = await params
    return withSoromaTenantAuth(request, tenantId, async (_req, session) => {
      const scopeErr = await requireTenantScope(session, tenantId)
      if (scopeErr) return scopeErr
      const permErr = checkApiPermission(session, "purchase-orders:GET")
      if (permErr) return permErr

      const rows = await prisma.soromaPurchaseOrder.findMany({
        where: { tenantId },
        include: { supplier: { select: { name: true } } },
        orderBy: { orderDate: "desc" },
        take: 50,
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
      const permErr = checkApiPermission(session, "purchase-orders:POST")
      if (permErr) return permErr

      const body = await parseSoromaBody(req, purchaseOrderCreateSchema)
      const count = await prisma.soromaPurchaseOrder.count({ where: { tenantId } })
      const poNumber =
        body.poNumber ??
        `PO-${new Date().getFullYear()}-${String(count + 1).padStart(3, "0")}`

      const po = await prisma.soromaPurchaseOrder.create({
        data: {
          tenantId,
          supplierId: body.supplierId,
          poNumber,
          commodity: body.commodity ?? undefined,
          amount: body.amount,
          currency: body.currency,
          status: body.status,
          deliveryDate: body.deliveryDate ? new Date(body.deliveryDate) : undefined,
          createdById: session.userId,
          lines: body.lines.length
            ? {
                create: body.lines.map((line) => ({
                  description: line.description,
                  quantity: line.quantity,
                  unitPrice: line.unitPrice,
                  lineTotal: line.quantity * line.unitPrice,
                })),
              }
            : undefined,
        },
        include: { lines: true, supplier: true },
      })

      await logSoromaAudit({
        userId: session.userId,
        tenantId,
        workspaceType: "TENANT",
        action: "purchase_order.created",
        entityType: "SoromaPurchaseOrder",
        entityId: po.id,
        afterState: { poNumber: po.poNumber, status: po.status },
      })

      return soromaJson(po, 201)
    })
  } catch (error) {
    return handleSoromaApiError(error)
  }
}
