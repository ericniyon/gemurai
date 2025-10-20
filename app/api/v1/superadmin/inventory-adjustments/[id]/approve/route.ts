import { NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/api-auth"
import { InventoryService } from "@/lib/services/InventoryService"

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser(req)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params

    const adjustment = await InventoryService.approveInventoryAdjustment(id, user)

    return NextResponse.json({
      success: true,
      adjustment
    })
  } catch (error) {
    console.error("Error approving inventory adjustment:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to approve inventory adjustment" },
      { status: 500 }
    )
  }
} 