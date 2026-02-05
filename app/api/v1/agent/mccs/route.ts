import { NextRequest, NextResponse } from "next/server"
import { verifyAuthToken } from "@/lib/api-auth"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/v1/agent/mccs - List MCCs for agent collection app (dropdown).
 * Allowed for AGENT, FIELD_AGENT, MCC_MANAGER, ADMIN, SUPER_ADMIN.
 */
export async function GET(req: NextRequest) {
  try {
    const authToken = req.headers.get("authorization")?.replace("Bearer ", "")
    if (!authToken) {
      return NextResponse.json({ error: "Authorization token required" }, { status: 401 })
    }

    const user = await verifyAuthToken(authToken)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const allowedRoles = ["AGENT", "FIELD_AGENT", "MCC_MANAGER", "ADMIN", "SUPER_ADMIN"]
    if (!user.role || !allowedRoles.includes(user.role)) {
      return NextResponse.json({ error: "Forbidden: agent or admin role required" }, { status: 403 })
    }

    const where: { id?: string } = {}
    if (user.role === "MCC_MANAGER" && user.mccId) {
      where.id = user.mccId
    }

    const mccs = await prisma.mccs.findMany({
      where,
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    })

    return NextResponse.json({ success: true, data: mccs })
  } catch (error) {
    console.error("Get agent MCCs error:", error)
    return NextResponse.json(
      { error: "Failed to get MCCs" },
      { status: 500 }
    )
  }
}
