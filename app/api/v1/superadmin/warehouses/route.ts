import { NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/api-auth"
import { InventoryService } from "@/lib/services/InventoryService"
import { generateWarehouseCode } from "@/lib/utils/warehouse-utils"

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const warehouses = await InventoryService.getWarehouses(user)
    
    return NextResponse.json({
      success: true,
      warehouses
    })
  } catch (error) {
    console.error("Error fetching warehouses:", error)
    return NextResponse.json(
      { error: "Failed to fetch warehouses" },
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
    const { name, code, description, address, city, country, isMain } = body

    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      )
    }

    // Auto-generate warehouse code if not provided
    let warehouseCode = code
    if (!warehouseCode) {
      warehouseCode = await generateWarehouseCode()
    }

    // Set default values
    const warehouseData = {
      name,
      code: warehouseCode,
      description,
      address,
      city: city || null,
      country: country || "Rwanda", // Default to Rwanda
      isMain: isMain || false
    }

    const warehouse = await InventoryService.createWarehouse(warehouseData, user)

    return NextResponse.json({
      success: true,
      warehouse
    })
  } catch (error) {
    console.error("Error creating warehouse:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create warehouse" },
      { status: 500 }
    )
  }
} 