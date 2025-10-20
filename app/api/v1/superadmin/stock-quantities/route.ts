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
    }

    const quantities = await InventoryService.getStockQuantities(filters)
    
    return NextResponse.json({
      success: true,
      stockQuantities: quantities,
      quantities // Keep both for backward compatibility
    })
  } catch (error: any) {
    console.error("Error fetching stock quantities:", error)
    
    // Handle database connection errors specifically
    if (error.code === 'P1001') {
      return NextResponse.json(
        { 
          error: "Database connection failed. Please try again later.",
          details: "The database server is currently unreachable."
        },
        { status: 503 }
      )
    }
    
    // Handle other Prisma errors
    if (error.code && error.code.startsWith('P')) {
      return NextResponse.json(
        { 
          error: "Database operation failed",
          details: error.message
        },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: "Failed to fetch stock quantities" },
      { status: 500 }
    )
  }
} 