import { NextRequest } from "next/server"
import { handleSoromaApiError, soromaError, soromaJson } from "@/lib/soroma/api-handler"
import { verifyPassportScan } from "@/lib/soroma/traceability"

/**
 * Public QR verification endpoint.
 * Example: /api/v1/soroma/verify/PP-RW-2026-0001?tenantId=...&location=Kigali
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ passportNo: string }> }
) {
  try {
    const { passportNo } = await params
    const { searchParams } = new URL(request.url)
    const tenantId = searchParams.get("tenantId")
    const location = searchParams.get("location") ?? undefined

    if (!tenantId) {
      return soromaError("tenantId query parameter is required", 400, undefined, "VALIDATION")
    }

    const result = await verifyPassportScan({
      tenantId,
      passportNo,
      location,
      userAgent: request.headers.get("user-agent") ?? undefined,
      ipAddress:
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
        request.headers.get("x-real-ip") ??
        undefined,
    })

    if (!result) {
      return soromaError("Passport not found", 404, undefined, "NOT_FOUND")
    }

    return soromaJson(result)
  } catch (error) {
    return handleSoromaApiError(error)
  }
}
