import { NextRequest, NextResponse } from "next/server"
import { verifyAuthToken } from "@/lib/api-auth"
import { AgentPrepaymentService } from "@/lib/services/AgentPrepaymentService"
import { prisma } from "@/lib/prisma"

/**
 * POST /api/v1/agent-prepayments/settle-collection - Settle prepayments for a collection
 * This endpoint can be called separately to settle prepayments after collection is recorded
 */
export async function POST(req: NextRequest) {
  try {
    const authToken = req.headers.get("authorization")?.replace("Bearer ", "")
    if (!authToken) {
      return NextResponse.json({ error: "Authorization token required" }, { status: 401 })
    }

    const user = await verifyAuthToken(authToken)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await req.json()
    const { collectionId } = data

    if (!collectionId) {
      return NextResponse.json(
        { error: "Missing required field: collectionId" },
        { status: 400 }
      )
    }

    // Get collection
    const collection = await prisma.commodity_collections.findUnique({
      where: { id: collectionId },
      include: {
        farmer: true,
        commodity: true,
      },
    })

    if (!collection) {
      return NextResponse.json(
        { error: "Collection not found" },
        { status: 404 }
      )
    }

    // Get pending prepayments for this farmer and commodity
    const pendingPrepayments = await AgentPrepaymentService.getPendingPrepayments(
      collection.farmerId,
      collection.commodityId
    )

    if (pendingPrepayments.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No pending prepayments to settle",
        data: {
          totalAdvance: 0,
          netPayout: collection.totalAmount - collection.totalDeductions,
        },
      })
    }

    // Settle prepayments
    const settlement = await AgentPrepaymentService.settlePrepayments(
      {
        collectionId,
        prepaymentIds: pendingPrepayments.map(p => p.id),
        totalValue: collection.totalAmount,
      },
      user.id
    )

    // Recalculate net payment with settled advances
    const newNetPayment = collection.totalAmount - collection.totalDeductions - settlement.totalAdvance

    // Update collection with new net payment
    await prisma.commodity_collections.update({
      where: { id: collectionId },
      data: {
        agentAdvance: settlement.totalAdvance,
        netPayment: newNetPayment,
      },
    })

    return NextResponse.json({
      success: true,
      message: "Prepayments settled successfully",
      data: {
        ...settlement,
        netPayout: newNetPayment,
      },
    })
  } catch (error: any) {
    console.error("Settle collection prepayments error:", error)
    return NextResponse.json(
      {
        error: error.message || "Failed to settle prepayments",
        message: process.env.NODE_ENV === 'development' ? error?.message : undefined,
      },
      { status: 400 }
    )
  }
}
