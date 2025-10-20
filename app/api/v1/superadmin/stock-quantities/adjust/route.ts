import { NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/api-auth"
import { InventoryService } from "@/lib/services/InventoryService"

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user has permission to adjust stock quantities
    if (!["SUPER_ADMIN", "ADMIN"].includes(user.role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const body = await req.json()
    const { 
      productId, 
      warehouseId, 
      locationId, 
      quantity, 
      adjustmentType, 
      reason, 
      notes 
    } = body

    if (!productId || !quantity || !adjustmentType || !reason) {
      return NextResponse.json({
        error: "ProductId, quantity, adjustmentType, and reason are required"
      }, { status: 400 })
    }

    if (!['INCREASE', 'DECREASE', 'SET'].includes(adjustmentType)) {
      return NextResponse.json({
        error: "Invalid adjustment type. Must be INCREASE, DECREASE, or SET"
      }, { status: 400 })
    }

    // Create inventory adjustment record
    const adjustment = await InventoryService.createInventoryAdjustment({
      productId,
      warehouseId,
      locationId,
      quantity,
      adjustmentType,
      reason,
      notes
    }, user)

    // Auto-approve the adjustment (in a real system, this might require approval)
    const approvedAdjustment = await InventoryService.approveInventoryAdjustment(
      adjustment.id, 
      user
    )

    return NextResponse.json({
      success: true,
      message: "Stock quantity adjusted successfully",
      adjustment: approvedAdjustment
    })

  } catch (error) {
    console.error("Error adjusting stock quantity:", error)
    return NextResponse.json({
      error: "Failed to adjust stock quantity",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
} 