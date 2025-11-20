import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { checkMCCPermission } from "@/lib/mcc-auth"

/**
 * PATCH /api/v1/mcc/bulking/[id]/dispatch
 * Dispatch bulk batch to processor
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authToken = req.headers.get("authorization")?.replace("Bearer ", "")
    const { authorized, user, error } = await checkMCCPermission(
      authToken,
      "mcc.collections.manage"
    )

    if (!authorized || !user) {
      return NextResponse.json({ error: error || "Unauthorized" }, { status: 401 })
    }

    const batchId = params.id
    if (!batchId) {
      return NextResponse.json({ error: "Batch ID required" }, { status: 400 })
    }

    const data = await req.json()
    const { dispatchedToProcessorId, vehicleId, driverName, notes } = data

    // Verify batch exists and belongs to user's MCC if they're MCC_MANAGER
    const batch = await prisma.bulk_batches.findUnique({
      where: { id: batchId },
      include: { mccs: true },
    })

    if (!batch) {
      return NextResponse.json({ error: "Batch not found" }, { status: 404 })
    }

    if (user.role === "MCC_MANAGER" && user.mccId !== batch.mccId) {
      return NextResponse.json({ error: "Unauthorized for this batch" }, { status: 403 })
    }

    const updatedBatch = await prisma.bulk_batches.update({
      where: { id: batchId },
      data: {
        dispatched: true,
        dispatchedToProcessorId: dispatchedToProcessorId || null,
      },
    })

    return NextResponse.json({
      success: true,
      message: "Batch dispatched successfully",
      data: updatedBatch,
    })
  } catch (error) {
    console.error("Dispatch batch error:", error)
    return NextResponse.json(
      { error: "Failed to dispatch batch" },
      { status: 500 }
    )
  }
}

