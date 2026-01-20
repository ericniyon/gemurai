import { NextRequest, NextResponse } from "next/server"
import { verifyAuthToken } from "@/lib/api-auth"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/v1/payments/agent-commissions - Get agent commission data
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
    const agentId = searchParams.get("agentId")
    const mccId = searchParams.get("mccId") || user.mccId

    const where: any = {
      mccId: mccId || undefined,
    }

    if (agentId) {
      where.agentId = agentId
    }

    // Get collections grouped by agent
    const collections = await prisma.commodity_collections.findMany({
      where: {
        ...where,
        agentId: { not: null },
        status: { in: ["APPROVED", "PENDING"] },
      },
      include: {
        agent: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    // Group by agent and calculate commissions
    const agentMap = new Map<string, any>()

    collections.forEach((collection) => {
      if (!collection.agentId) return

      if (!agentMap.has(collection.agentId)) {
        agentMap.set(collection.agentId, {
          agentId: collection.agentId,
          agentName: collection.agent?.name || "Unknown",
          totalCollected: 0,
          excellent: 0,
          conditional: 0,
          rejected: 0,
          totalCommission: 0,
          paidCommission: 0,
        })
      }

      const agentData = agentMap.get(collection.agentId)!
      agentData.totalCollected += collection.quantity || 0

      // Determine quality status from qualityData or status
      const qualityStatus = collection.status === "APPROVED" ? "excellent" : 
                           collection.status === "PENDING" ? "conditional" : "rejected"

      if (qualityStatus === "excellent") {
        agentData.excellent += collection.quantity || 0
      } else if (qualityStatus === "conditional") {
        agentData.conditional += collection.quantity || 0
      } else {
        agentData.rejected += collection.quantity || 0
      }

      // Calculate commission (example: 2% of total amount)
      const commission = (collection.totalAmount || 0) * 0.02
      agentData.totalCommission += commission
    })

    // Calculate percentages and pending commission
    const commissions = Array.from(agentMap.values()).map((agent) => {
      const total = agent.totalCollected || 1
      return {
        agentId: agent.agentId,
        agentName: agent.agentName,
        totalCollected: agent.totalCollected,
        excellentPercent: (agent.excellent / total) * 100,
        conditionalPercent: (agent.conditional / total) * 100,
        rejectedPercent: (agent.rejected / total) * 100,
        totalCommission: agent.totalCommission,
        paidCommission: agent.paidCommission || 0,
        pendingCommission: agent.totalCommission - (agent.paidCommission || 0),
      }
    })

    return NextResponse.json({
      success: true,
      data: commissions,
    })
  } catch (error: any) {
    console.error("Get agent commissions error:", error)
    return NextResponse.json(
      {
        error: "Failed to get agent commissions",
        message: process.env.NODE_ENV === 'development' ? error?.message : undefined,
      },
      { status: 500 }
    )
  }
}
