import { NextRequest } from "next/server"
import { prisma } from "@/lib/database"
import {
  withSoromaAuth,
  soromaJson,
  parseSoromaBody,
  handleSoromaApiError,
} from "@/lib/soroma/api-handler"
import { requirePermission } from "@/lib/soroma/guards"
import { tenantCreateSchema } from "@/lib/soroma/validators"

export async function GET(request: NextRequest) {
  try {
    return withSoromaAuth(request, async (_req, session) => {
      const permErr = requirePermission(session, ["soroma.tenants.view", "soroma.tenants.manage"])
      if (permErr) return permErr
      const tenants = await prisma.soromaTenant.findMany({ orderBy: { name: "asc" } })
      return soromaJson(tenants)
    })
  } catch (error) {
    return handleSoromaApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    return withSoromaAuth(request, async (req, session) => {
      const permErr = requirePermission(session, "soroma.tenants.manage")
      if (permErr) return permErr
      const body = await parseSoromaBody(req, tenantCreateSchema)
      const tenant = await prisma.soromaTenant.create({ data: body })
      return soromaJson(tenant, 201)
    })
  } catch (error) {
    return handleSoromaApiError(error)
  }
}
