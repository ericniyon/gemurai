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
import { shipmentCreateSchema } from "@/lib/soroma/validators"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  try {
    const { tenantId } = await params
    return withSoromaTenantAuth(request, tenantId, async (_req, session) => {
      const scopeErr = await requireTenantScope(session, tenantId)
      if (scopeErr) return scopeErr
      const permErr = checkApiPermission(session, "logistics:GET")
      if (permErr) return permErr

      const shipments = await prisma.soromaShipment.findMany({
        where: { tenantId },
        include: { order: { select: { orderNumber: true } } },
        orderBy: { createdAt: "desc" },
        take: 100,
      })
      return soromaJson(shipments)
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
      const permErr = checkApiPermission(session, "logistics:POST")
      if (permErr) return permErr

      const body = await parseSoromaBody(req, shipmentCreateSchema)
      const count = await prisma.soromaShipment.count({ where: { tenantId } })
      const shipmentNumber = body.shipmentNumber ?? `SHP-${String(count + 1).padStart(4, "0")}`

      const shipment = await prisma.soromaShipment.create({
        data: {
          tenantId,
          orderId: body.orderId,
          shipmentNumber,
          routeName: body.routeName,
          vehicleId: body.vehicleId,
          driverName: body.driverName,
          costAmount: body.costAmount,
          status: "PLANNED",
        },
      })

      await logSoromaAudit({
        userId: session.userId,
        tenantId,
        workspaceType: "TENANT",
        action: "logistics.shipment.created",
        entityType: "SoromaShipment",
        entityId: shipment.id,
        afterState: shipment,
      })

      return soromaJson(shipment, 201)
    })
  } catch (error) {
    return handleSoromaApiError(error)
  }
}
