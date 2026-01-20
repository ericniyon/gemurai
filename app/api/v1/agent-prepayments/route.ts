import { NextRequest, NextResponse } from "next/server"
import { verifyAuthToken } from "@/lib/api-auth"
import { AgentPrepaymentService } from "@/lib/services/AgentPrepaymentService"

/**
 * GET /api/v1/agent-prepayments - Get all prepayments
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
    const farmerId = searchParams.get("farmerId")
    const commodityId = searchParams.get("commodityId")
    const status = searchParams.get("status")

    // If agentId is provided, get prepayments for that agent
    if (agentId) {
      const prepayments = await AgentPrepaymentService.getAgentPrepayments(agentId, {
        status: status || undefined,
        farmerId: farmerId || undefined,
        commodityId: commodityId || undefined,
      })

      return NextResponse.json({
        success: true,
        data: prepayments,
      })
    }

    // Otherwise, get pending prepayments for a farmer
    if (!farmerId) {
      return NextResponse.json(
        { error: "farmerId or agentId is required" },
        { status: 400 }
      )
    }

    const prepayments = await AgentPrepaymentService.getPendingPrepayments(
      farmerId,
      commodityId || undefined
    )

    return NextResponse.json({
      success: true,
      data: prepayments,
    })
  } catch (error: any) {
    console.error("Get prepayments error:", error)
    return NextResponse.json(
      {
        error: "Failed to get prepayments",
        message: process.env.NODE_ENV === 'development' ? error?.message : undefined,
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/v1/agent-prepayments - Record agent prepayment
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
      farmerId,
      agentId,
      commodityId,
      batchId,
      amount,
      currency,
      notes,
    } = data

    if (!farmerId || !agentId || !amount) {
      return NextResponse.json(
        {
          error: "Missing required fields: farmerId, agentId, amount",
        },
        { status: 400 }
      )
    }

    if (amount <= 0) {
      return NextResponse.json(
        {
          error: "Amount must be greater than 0",
        },
        { status: 400 }
      )
    }

    const prepayment = await AgentPrepaymentService.recordPrepayment(
      {
        farmerId,
        agentId,
        commodityId,
        batchId,
        amount: parseFloat(amount),
        currency,
        notes,
      },
      user.id
    )

    return NextResponse.json({
      success: true,
      message: "Prepayment recorded successfully",
      data: prepayment,
    })
  } catch (error: any) {
    console.error("Record prepayment error:", error)
    return NextResponse.json(
      {
        error: error.message || "Failed to record prepayment",
        message: process.env.NODE_ENV === 'development' ? error?.message : undefined,
      },
      { status: 400 }
    )
  }
}
