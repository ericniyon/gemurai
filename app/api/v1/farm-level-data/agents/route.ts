import { NextRequest, NextResponse } from "next/server"
import { verifyAuthToken } from "@/lib/api-auth"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/v1/farm-level-data/agents - Get all agents (users with agent role)
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

    // Get users with agent-related roles
    const agents = await prisma.user.findMany({
      where: {
        roleAssignments: {
          some: {
            role: {
              name: {
                in: ["FIELD_AGENT", "AGENT", "EXTENSION_AGENT"],
              },
            },
          },
        },
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
      },
      orderBy: {
        name: "asc",
      },
    })

    return NextResponse.json({
      success: true,
      data: agents,
    })
  } catch (error: any) {
    console.error("Get agents error:", error)
    return NextResponse.json(
      {
        error: "Failed to get agents",
        message: process.env.NODE_ENV === 'development' ? error?.message : undefined,
      },
      { status: 500 }
    )
  }
}
