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
import {
  soromaPaginationQuerySchema,
  supplierCreateSchema,
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
      const permErr = checkApiPermission(session, "suppliers:GET")
      if (permErr) return permErr

      const parsedQuery = soromaPaginationQuerySchema.parse(
        Object.fromEntries(new URL(req.url).searchParams.entries())
      )

      const where = {
        tenantId,
        ...(parsedQuery.status ? { status: parsedQuery.status } : {}),
        ...(parsedQuery.search
          ? { name: { contains: parsedQuery.search, mode: "insensitive" as const } }
          : {}),
      }

      const [rows, total] = await Promise.all([
        prisma.soromaSupplier.findMany({
          where,
          skip: (parsedQuery.page - 1) * parsedQuery.pageSize,
          take: parsedQuery.pageSize,
          orderBy: { name: "asc" },
        }),
        prisma.soromaSupplier.count({ where }),
      ])

      return soromaJson({
        rows,
        total,
        page: parsedQuery.page,
        pageSize: parsedQuery.pageSize,
      })
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
      const permErr = checkApiPermission(session, "suppliers:POST")
      if (permErr) return permErr

      const body = await parseSoromaBody(req, supplierCreateSchema)
      const supplier = await prisma.soromaSupplier.create({
        data: {
          tenantId,
          name: body.name,
          type: body.type,
          commodity: body.commodity ?? undefined,
          district: body.district ?? undefined,
          contactPhone: body.contactPhone ?? undefined,
          contactEmail: body.contactEmail ?? undefined,
          status: body.status,
        },
      })

      await logSoromaAudit({
        userId: session.userId,
        tenantId,
        workspaceType: "TENANT",
        action: "supplier.created",
        entityType: "SoromaSupplier",
        entityId: supplier.id,
        afterState: supplier,
      })

      return soromaJson(supplier, 201)
    })
  } catch (error) {
    return handleSoromaApiError(error)
  }
}
