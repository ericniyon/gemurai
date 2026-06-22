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
import { stockMovementCreateSchema } from "@/lib/soroma/validators"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  try {
    const { tenantId } = await params
    return withSoromaTenantAuth(request, tenantId, async (req, session) => {
      const scopeErr = await requireTenantScope(session, tenantId)
      if (scopeErr) return scopeErr
      const permErr = checkApiPermission(session, "inventory:POST")
      if (permErr) return permErr

      const body = await parseSoromaBody(req, stockMovementCreateSchema)
      const lot = await prisma.soromaStockLot.findFirst({
        where: { id: body.stockLotId, tenantId },
      })
      if (!lot) return soromaJson({ error: "Stock lot not found" }, 404)

      const typeMap: Record<string, string> = {
        STOCK_IN: "IN",
        STOCK_OUT: "OUT",
        TRANSFER: "TRANSFER",
        CYCLE_COUNT: "ADJUSTMENT",
        ADJUSTMENT: "ADJUSTMENT",
      }
      const movementType = typeMap[body.movementType] ?? body.movementType

      let availableQty = lot.availableQty
      if (movementType === "IN") availableQty += body.quantity
      else if (movementType === "OUT") availableQty = Math.max(0, availableQty - body.quantity)
      else if (movementType === "ADJUSTMENT") availableQty = body.quantity

      const [movement, updated] = await prisma.$transaction([
        prisma.soromaStockMovement.create({
          data: {
            tenantId,
            stockLotId: lot.id,
            movementType,
            quantity: body.quantity,
            reference: body.reference,
            destination: body.targetWarehouseId,
            createdById: session.userId,
          },
        }),
        prisma.soromaStockLot.update({
          where: { id: lot.id },
          data: {
            availableQty,
            quantity: movementType === "IN" ? lot.quantity + body.quantity : lot.quantity,
          },
        }),
      ])

      await logSoromaAudit({
        userId: session.userId,
        tenantId,
        workspaceType: "TENANT",
        action: `inventory.${body.movementType.toLowerCase()}`,
        entityType: "SoromaStockLot",
        entityId: lot.id,
        afterState: updated,
      })

      return soromaJson({ movement, lot: updated }, 201)
    })
  } catch (error) {
    return handleSoromaApiError(error)
  }
}
