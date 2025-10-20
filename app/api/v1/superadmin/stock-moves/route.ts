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
      locationId: searchParams.get('locationId') || undefined,
      moveType: searchParams.get('moveType') || undefined,
      state: searchParams.get('state') || undefined,
      dateFrom: searchParams.get('dateFrom') ? new Date(searchParams.get('dateFrom')!) : undefined,
      dateTo: searchParams.get('dateTo') ? new Date(searchParams.get('dateTo')!) : undefined,
    }

    const stockMoves = await InventoryService.getStockMoves(filters, user)
    
    return NextResponse.json({
      success: true,
      stockMoves
    })
  } catch (error) {
    console.error("Error fetching stock moves:", error)
    return NextResponse.json(
      { error: "Failed to fetch stock moves" },
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
    const { 
      productId, 
      warehouseId, 
      locationId,
      sourceLocationId, // Handle both field names
      destinationLocationId, 
      quantity, 
      unitPrice, 
      moveType, 
      origin, 
      reference, 
      notes, 
      scheduledDate 
    } = body

    if (!productId || !quantity || !moveType) {
      return NextResponse.json(
        { error: "ProductId, quantity, and moveType are required" },
        { status: 400 }
      )
    }

    const stockMove = await InventoryService.createStockMove({
      productId,
      warehouseId,
      locationId: locationId || sourceLocationId, // Use locationId if provided, otherwise use sourceLocationId
      destinationLocationId,
      quantity,
      unitPrice,
      moveType,
      origin,
      reference,
      notes,
      scheduledDate: scheduledDate ? new Date(scheduledDate) : undefined
    }, user)

    return NextResponse.json({
      success: true,
      stockMove
    })
  } catch (error) {
    console.error("Error creating stock move:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create stock move" },
      { status: 500 }
    )
  }
} 