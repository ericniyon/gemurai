import { NextRequest, NextResponse } from "next/server"
import { verifyAuthToken } from "@/lib/api-auth"
import { GeoAuditService } from "@/lib/services/geo-audit-service"
import type { GeoEntityType, GeoAuditAction } from "@/lib/services/geo-audit-service"

/**
 * GET /api/v1/geo/audit-logs
 * Get geo-location audit logs (Admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const authToken = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!authToken) {
      return NextResponse.json(
        { error: "Authorization token required" },
        { status: 401 }
      )
    }

    const user = await verifyAuthToken(authToken)
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN")) {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      )
    }

    const url = new URL(request.url)
    const entityType = url.searchParams.get("entityType") as GeoEntityType | null
    const entityId = url.searchParams.get("entityId")
    const userId = url.searchParams.get("userId")
    const action = url.searchParams.get("action") as GeoAuditAction | null
    const startDate = url.searchParams.get("startDate")
    const endDate = url.searchParams.get("endDate")
    const limit = parseInt(url.searchParams.get("limit") || "100")

    // Build filters
    const filters: any = {}
    if (entityType) filters.entityType = entityType
    if (action) filters.action = action
    if (startDate) filters.startDate = new Date(startDate)
    if (endDate) filters.endDate = new Date(endDate)

    let logs

    if (entityId && entityType) {
      // Get logs for specific entity
      logs = await GeoAuditService.getEntityAuditLogs(entityType, entityId, limit)
    } else if (userId) {
      // Get logs for specific user
      logs = await GeoAuditService.getUserAuditLogs(userId, limit)
    } else {
      // Get all logs with filters
      logs = await GeoAuditService.getAllAuditLogs(filters, limit)
    }

    return NextResponse.json({
      success: true,
      data: logs,
      count: logs.length,
    })
  } catch (error) {
    console.error("Get audit logs error:", error)
    return NextResponse.json(
      { error: "Failed to get audit logs" },
      { status: 500 }
    )
  }
}
