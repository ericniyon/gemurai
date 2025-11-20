import { NextRequest, NextResponse } from "next/server"
import { MilkCollectionService } from "@/lib/services/MilkCollectionService"
import { checkMCCPermission } from "@/lib/mcc-auth"

/**
 * PATCH /api/v1/mcc/collections/[id]/status
 * Accept or reject a milk collection
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authToken = req.headers.get("authorization")?.replace("Bearer ", "")
    const { authorized, user, error } = await checkMCCPermission(
      authToken,
      "mcc.collections.approve"
    )

    if (!authorized || !user) {
      return NextResponse.json({ error: error || "Unauthorized" }, { status: 401 })
    }

    const collectionId = params.id
    if (!collectionId) {
      return NextResponse.json({ error: "Collection ID required" }, { status: 400 })
    }

    const data = await req.json()
    const { status, notes } = data

    if (!status || !["accepted", "rejected"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be 'accepted' or 'rejected'" },
        { status: 400 }
      )
    }

    const collection = await MilkCollectionService.updateCollectionStatus(
      collectionId,
      status,
      notes
    )

    return NextResponse.json({
      success: true,
      message: `Collection ${status} successfully`,
      data: collection,
    })
  } catch (error) {
    console.error("Update collection status error:", error)
    return NextResponse.json(
      { error: "Failed to update collection status" },
      { status: 500 }
    )
  }
}

