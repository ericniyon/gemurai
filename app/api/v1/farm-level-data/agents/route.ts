import { NextRequest, NextResponse } from "next/server"
import { verifyAuthToken } from "@/lib/api-auth"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/v1/farm-level-data/agents - Get agents (users with agent role)
 * MCC_MANAGER and staff see only agents for their MCC. ADMIN/SUPER_ADMIN see all.
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

    const { searchParams } = new URL(req.url)
    let mccId = searchParams.get("mccId") as string | null

    // MCC_MANAGER: resolve their MCC ID
    if (!mccId && user.role === "MCC_MANAGER") {
      mccId = user.mccId || null
      if (!mccId) {
        const mcc = await prisma.mccs.findFirst({
          where: { managerUserId: user.id },
          select: { id: true },
        })
        if (mcc) mccId = mcc.id
      }
    }

    const whereClause: any = {
      userRole: {
        role: {
          name: {
            in: ["FIELD_AGENT", "AGENT", "EXTENSION_AGENT"],
          },
        },
      },
      isActive: true,
    }

    // Filter by MCC for MCC_MANAGER (required). ADMIN/SUPER_ADMIN can optionally filter via query param.
    if (mccId) {
      whereClause.mccId = mccId
    } else if (user.role === "MCC_MANAGER") {
      return NextResponse.json(
        { error: "MCC ID required. Ensure the user is assigned to an MCC." },
        { status: 400 }
      )
    }

    const agents = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        mccId: true,
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
