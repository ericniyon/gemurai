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
  stockLotCreateSchema,
  stockMovementCreateSchema,
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
      const permErr = checkApiPermission(session, "inventory:GET")
      if (permErr) return permErr

      const parsedQuery = soromaPaginationQuerySchema.parse(
        Object.fromEntries(new URL(req.url).searchParams.entries())
      )
      const where = {
        tenantId,
        ...(parsedQuery.status ? { status: parsedQuery.status } : {}),
        ...(parsedQuery.search
          ? {
              OR: [
                { skuCode: { contains: parsedQuery.search, mode: "insensitive" as const } },
                { skuName: { contains: parsedQuery.search, mode: "insensitive" as const } },
              ],
            }
          : {}),
      }

      const [rows, total] = await Promise.all([
        prisma.soromaStockLot.findMany({
          where,
          include: { warehouse: true },
          skip: (parsedQuery.page - 1) * parsedQuery.pageSize,
          take: parsedQuery.pageSize,
          orderBy: { updatedAt: "desc" },
        }),
        prisma.soromaStockLot.count({ where }),
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
      const permErr = checkApiPermission(session, "inventory:POST")
      if (permErr) return permErr

      const body = await parseSoromaBody(req, stockLotCreateSchema)
      const lot = await prisma.soromaStockLot.create({
        data: {
          tenantId,
          skuCode: body.skuCode,
          skuName: body.skuName,
          category: body.category,
          quantity: body.quantity,
          availableQty: body.quantity,
          warehouseId: body.warehouseId,
          expiryDate: body.expiryDate ? new Date(body.expiryDate) : undefined,
          unit: body.unit,
          status: "AVAILABLE",
        },
      })

      await prisma.soromaStockMovement.create({
        data: {
          tenantId,
          stockLotId: lot.id,
          movementType: "IN",
          quantity: body.quantity,
          reference: "Initial stock in",
          createdById: session.userId,
        },
      })

      await logSoromaAudit({
        userId: session.userId,
        tenantId,
        workspaceType: "TENANT",
        action: "inventory.stock_in",
        entityType: "SoromaStockLot",
        entityId: lot.id,
        afterState: lot,
      })

      return soromaJson(lot, 201)
    })
  } catch (error) {
    return handleSoromaApiError(error)
  }
}
