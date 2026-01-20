import { NextRequest, NextResponse } from "next/server"
import { verifyAuthToken } from "@/lib/api-auth"
import { AgentPrepaymentService } from "@/lib/services/AgentPrepaymentService"

/**
 * POST /api/v1/agent-prepayments/settle - Settle prepayments against a collection
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
    const {
      collectionId,
      prepaymentIds,
      totalValue,
    } = data

    if (!collectionId || !prepaymentIds || !Array.isArray(prepaymentIds) || prepaymentIds.length === 0 || !totalValue) {
      return NextResponse.json(
        {
          error: "Missing required fields: collectionId, prepaymentIds (array), totalValue",
        },
        { status: 400 }
      )
    }

    if (totalValue <= 0) {
      return NextResponse.json(
        {
          error: "Total value must be greater than 0",
        },
        { status: 400 }
      )
    }

    const settlement = await AgentPrepaymentService.settlePrepayments(
      {
        collectionId,
        prepaymentIds,
        totalValue: parseFloat(totalValue),
      },
      user.id
    )

    return NextResponse.json({
      success: true,
      message: "Prepayments settled successfully",
      data: settlement,
    })
  } catch (error: any) {
    console.error("Settle prepayments error:", error)
    return NextResponse.json(
      {
        error: error.message || "Failed to settle prepayments",
        message: process.env.NODE_ENV === 'development' ? error?.message : undefined,
      },
      { status: 400 }
    )
  }
}
