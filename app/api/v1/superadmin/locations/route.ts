import { NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/api-auth"
import { InventoryService } from "@/lib/services/InventoryService"
import { generateLocationCode } from "@/lib/utils/location-utils"

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const warehouseId = searchParams.get('warehouseId') || undefined

    const locations = await InventoryService.getLocations(warehouseId, user)
    
    return NextResponse.json({
      success: true,
      locations
    })
  } catch (error) {
    console.error("Error fetching locations:", error)
    return NextResponse.json(
      { error: "Failed to fetch locations" },
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
    const { name, code, description, warehouseId, parentId, locationType, maxCapacity, barcode } = body

    if (!name || !warehouseId || !locationType) {
      return NextResponse.json(
        { error: "Name, warehouseId, and locationType are required" },
        { status: 400 }
      )
    }

    // Auto-generate code if not provided
    let locationCode = code
    if (!locationCode) {
      try {
        locationCode = await generateLocationCode(warehouseId)
      } catch (error) {
        return NextResponse.json(
          { error: "Failed to generate location code" },
          { status: 500 }
        )
      }
    }

    const location = await InventoryService.createLocation({
      name,
      code: locationCode,
      description,
      warehouseId,
      parentId,
      locationType,
      maxCapacity,
      barcode
    }, user)

    return NextResponse.json({
      success: true,
      location
    })
  } catch (error) {
    console.error("Error creating location:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create location" },
      { status: 500 }
    )
  }
} 