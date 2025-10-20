import { NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/api-auth"
import { InventoryService } from "@/lib/services/InventoryService"

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const filters = {
      productId: searchParams.get('productId') || undefined,
      warehouseId: searchParams.get('warehouseId') || undefined,
      state: searchParams.get('state') || undefined,
    }

    const adjustments = await InventoryService.getInventoryAdjustments(filters, user)
    
    return NextResponse.json({
      success: true,
      adjustments
    })
  } catch (error) {
    console.error("Error fetching inventory adjustments:", error)
    return NextResponse.json(
      { error: "Failed to fetch inventory adjustments" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { productId, warehouseId, locationId, quantity, adjustmentType, reason, notes } = body

    if (!productId || !quantity || !adjustmentType || !reason) {
      return NextResponse.json(
        { error: "ProductId, quantity, adjustmentType, and reason are required" },
        { status: 400 }
      )
    }

    const adjustment = await InventoryService.createInventoryAdjustment({
      productId,
      warehouseId,
      locationId,
      quantity,
      adjustmentType,
      reason,
      notes
    }, user)

    return NextResponse.json({
      success: true,
      adjustment
    })
  } catch (error) {
    console.error("Error creating inventory adjustment:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create inventory adjustment" },
      { status: 500 }
    )
  }
} 