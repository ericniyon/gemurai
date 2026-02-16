import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { checkMCCPermission } from "@/lib/mcc-auth"

/**
 * GET /api/v1/mcc/agents - List agents (Umucunda) for collection center staff.
 * Used when registering a collection brought by an agent: "Who collected for this farmer?"
 * Returns users with role AGENT or FIELD_AGENT.
 */
export async function GET(req: NextRequest) {
  try {
    const authToken = req.headers.get("authorization")?.replace("Bearer ", "")
    const { authorized, user, error } = await checkMCCPermission(
      authToken,
      "mcc.collections.view"
    )

    if (!authorized || !user) {
      return NextResponse.json({ error: error || "Unauthorized" }, { status: 401 })
    }

    const agents = await prisma.user.findMany({
      where: {
        isActive: true,
        userRole: {
          isActive: true,
          role: {
            name: { in: ["AGENT", "FIELD_AGENT"] },
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        displayId: true,
      },
      orderBy: { name: "asc" },
    })

    return NextResponse.json({
      success: true,
      data: agents,
    })
  } catch (err) {
    console.error("GET /api/v1/mcc/agents error:", err)
    return NextResponse.json(
      { error: "Failed to fetch agents", details: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    )
  }
}
