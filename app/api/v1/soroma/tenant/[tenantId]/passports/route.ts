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
import { passportCreateSchema } from "@/lib/soroma/validators"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  try {
    const { tenantId } = await params
    return withSoromaTenantAuth(request, tenantId, async (_req, session) => {
      const scopeErr = await requireTenantScope(session, tenantId)
      if (scopeErr) return scopeErr
      const permErr = checkApiPermission(session, "passports:GET")
      if (permErr) return permErr

      const passports = await prisma.soromaPassport.findMany({
        where: { tenantId },
        orderBy: { createdAt: "desc" },
        take: 50,
      })
      return soromaJson(passports)
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
      const permErr = checkApiPermission(session, "passports:POST")
      if (permErr) return permErr

      const body = await parseSoromaBody(req, passportCreateSchema)
      const batch = await prisma.soromaProductionBatch.findFirst({
        where: { id: body.batchId, tenantId },
      })
      if (!batch) return soromaError("Batch not found for tenant", 404)

      const count = await prisma.soromaPassport.count({ where: { tenantId } })
      const passportNo =
        body.passportNo ??
        `PP-RW-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`

      const passport = await prisma.soromaPassport.create({
        data: {
          tenantId,
          passportNo,
          batchId: batch.id,
          status: "ISSUED",
          issuedAt: new Date(),
          issuedById: session.userId,
          qrCode: `https://soroma.local/verify/${passportNo}`,
          version: 1,
        },
      })

      await prisma.soromaTraceabilityEvent.create({
        data: {
          tenantId,
          passportId: passport.id,
          entityType: "SoromaPassport",
          entityId: passport.id,
          eventType: "passport.issued",
          payload: { batchId: batch.id, batchNumber: batch.batchNumber },
        },
      })

      await logSoromaAudit({
        userId: session.userId,
        tenantId,
        workspaceType: "TENANT",
        action: "passport.issued",
        entityType: "SoromaPassport",
        entityId: passport.id,
        afterState: { passportNo },
      })

      return soromaJson(passport, 201)
    })
  } catch (error) {
    return handleSoromaApiError(error)
  }
}
