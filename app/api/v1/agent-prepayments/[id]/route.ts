import { NextRequest, NextResponse } from "next/server"
import { verifyAuthToken } from "@/lib/api-auth"
import { AgentPrepaymentService } from "@/lib/services/AgentPrepaymentService"

/**
 * GET /api/v1/agent-prepayments/[id] - Get prepayment details with audit trail
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authToken = req.headers.get("authorization")?.replace("Bearer ", "")
    if (!authToken) {
      return NextResponse.json({ error: "Authorization token required" }, { status: 401 })
    }

    const user = await verifyAuthToken(authToken)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { prisma } = await import("@/lib/prisma")
    
    const prepayment = await prisma.agent_prepayments.findUnique({
      where: { id: params.id },
      include: {
        farmer: {
          select: {
            id: true,
            name: true,
            nationalId: true,
            phone: true,
          },
        },
        agent: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        commodity: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        batch: {
          select: {
            id: true,
            createdAt: true,
          },
        },
        collection: {
          select: {
            id: true,
            collectionDate: true,
            quantity: true,
            totalAmount: true,
          },
        },
        auditLogs: {
          include: {
            performer: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    })

    if (!prepayment) {
      return NextResponse.json(
        { error: "Prepayment not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: prepayment,
    })
  } catch (error: any) {
    console.error("Get prepayment error:", error)
    return NextResponse.json(
      {
        error: "Failed to get prepayment",
        message: process.env.NODE_ENV === 'development' ? error?.message : undefined,
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/v1/agent-prepayments/[id] - Cancel prepayment
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const reason = searchParams.get("reason")

    const prepayment = await AgentPrepaymentService.cancelPrepayment(
      params.id,
      user.id,
      reason || undefined
    )

    return NextResponse.json({
      success: true,
      message: "Prepayment cancelled successfully",
      data: prepayment,
    })
  } catch (error: any) {
    console.error("Cancel prepayment error:", error)
    return NextResponse.json(
      {
        error: error.message || "Failed to cancel prepayment",
        message: process.env.NODE_ENV === 'development' ? error?.message : undefined,
      },
      { status: 400 }
    )
  }
}
