import { NextRequest } from "next/server"
import { z } from "zod"
import {
  handleSoromaApiError,
  parseSoromaBody,
  soromaError,
  soromaJson,
  withSoromaTenantAuth,
} from "@/lib/soroma/api-handler"
import { prisma } from "@/lib/database"
import { checkApiPermission, requireTenantScope } from "@/lib/soroma/guards"
import { verifyPassportScan } from "@/lib/soroma/traceability"

const bodySchema = z.object({
  location: z.string().trim().optional(),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tenantId: string; passportId: string }> }
) {
  try {
    const { tenantId, passportId } = await params
    return withSoromaTenantAuth(request, tenantId, async (req, session) => {
      const scopeErr = await requireTenantScope(session, tenantId)
      if (scopeErr) return scopeErr
      const permErr = checkApiPermission(session, "traceability:POST")
      if (permErr) return permErr

      const body = await parseSoromaBody(req, bodySchema)
      const passport = await prisma.soromaPassport.findFirst({
        where: { id: passportId, tenantId },
        select: { passportNo: true },
      })
      if (!passport) {
        return soromaError("Passport not found", 404, undefined, "NOT_FOUND")
      }

      const verified = await verifyPassportScan({
        tenantId,
        passportNo: passport.passportNo,
        location: body.location,
        scannedByUserId: session.userId,
        userAgent: req.headers.get("user-agent") ?? undefined,
        ipAddress:
          req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
          req.headers.get("x-real-ip") ??
          undefined,
      })

      if (!verified) return soromaError("Passport not found", 404, undefined, "NOT_FOUND")
      return soromaJson(verified)
    })
  } catch (error) {
    return handleSoromaApiError(error)
  }
}
