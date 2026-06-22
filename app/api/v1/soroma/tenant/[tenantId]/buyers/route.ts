import { NextRequest } from "next/server"
import { prisma } from "@/lib/database"
import {
  withSoromaTenantAuth,
  soromaJson,
  parseSoromaBody,
  handleSoromaApiError,
} from "@/lib/soroma/api-handler"
import { checkApiPermission, requireTenantScope } from "@/lib/soroma/guards"
import { buyerCreateSchema } from "@/lib/soroma/validators"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  try {
    const { tenantId } = await params
    return withSoromaTenantAuth(request, tenantId, async (_req, session) => {
      const scopeErr = await requireTenantScope(session, tenantId)
      if (scopeErr) return scopeErr
      const permErr = checkApiPermission(session, "orders:GET")
      if (permErr) return permErr

      const buyers = await prisma.soromaBuyer.findMany({
        where: { tenantId },
        orderBy: { name: "asc" },
      })
      return soromaJson(buyers)
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

      const body = await parseSoromaBody(req, buyerCreateSchema)
      const buyer = await prisma.soromaBuyer.create({
        data: {
          tenantId,
          name: body.name,
          segment: body.type,
          district: body.district,
          contractStatus: body.contractStatus,
        },
      })
      return soromaJson(buyer, 201)
    })
  } catch (error) {
    return handleSoromaApiError(error)
  }
}
