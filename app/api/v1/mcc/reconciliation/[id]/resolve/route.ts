import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuthToken } from "@/lib/api-auth"

/**
 * PUT /api/v1/mcc/reconciliation/[id]/resolve - Resolve reconciliation record
 */
export async function PUT(
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

    const data = await req.json()
    const { notes } = data

    const record = await prisma.reconciliation_records.update({
      where: { id: params.id },
      data: {
        status: "RESOLVED",
        resolvedBy: user.id,
        resolvedAt: new Date(),
        notes: notes || undefined,
      },
      include: {
        mcc: {
          select: {
            id: true,
            name: true,
          },
        },
        resolvedByUser: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      message: "Reconciliation resolved successfully",
      data: record,
    })
  } catch (error) {
    console.error("Resolve reconciliation error:", error)
    return NextResponse.json(
      { error: "Failed to resolve reconciliation" },
      { status: 500 }
    )
  }
}
