import { NextRequest, NextResponse } from "next/server"
import { CropCollectionService } from "@/lib/services/CropCollectionService"
import { verifyAuthToken } from "@/lib/api-auth"

/**
 * POST /api/v1/mcc/crops/collections - Record crop collection
 */
export async function POST(req: NextRequest) {
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
    const {
      farmerId,
      mccId,
      cropPeriodId,
      collectionDate,
      cropTypeId,
      quantity,
      unit,
      qualityTests,
      pricePerUnit,
      deductions,
      advances,
      warehouseId,
      locationId,
      productId,
      notes,
    } = data

    // Validate required fields
    if (!farmerId || !mccId || !cropTypeId || !quantity || !pricePerUnit) {
      return NextResponse.json(
        { error: "Missing required fields: farmerId, mccId, cropTypeId, quantity, pricePerUnit" },
        { status: 400 }
      )
    }

    const result = await CropCollectionService.recordCollection({
      farmerId,
      mccId,
      cropPeriodId,
      collectionDate: collectionDate ? new Date(collectionDate) : new Date(),
      cropTypeId,
      quantity: parseFloat(quantity),
      unit: unit || "kg",
      qualityTests,
      pricePerUnit: parseFloat(pricePerUnit),
      deductions,
      advances: advances ? parseFloat(advances) : 0,
      warehouseId,
      locationId,
      productId,
      notes,
    })

    return NextResponse.json({
      success: true,
      message: "Crop collection recorded successfully",
      data: result,
    })
  } catch (error) {
    console.error("Record crop collection error:", error)
    return NextResponse.json(
      {
        error: "Failed to record crop collection",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/v1/mcc/crops/collections - Get crop collections
 */
export async function GET(req: NextRequest) {
  try {
    const authToken = req.headers.get("authorization")?.replace("Bearer ", "")
    if (!authToken) {
      return NextResponse.json({ error: "Authorization token required" }, { status: 401 })
    }

    const user = await verifyAuthToken(authToken)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const mccId = searchParams.get("mccId")
    const farmerId = searchParams.get("farmerId")
    const cropTypeId = searchParams.get("cropTypeId")
    const status = searchParams.get("status")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    if (!mccId) {
      return NextResponse.json({ error: "mccId is required" }, { status: 400 })
    }

    const collections = await CropCollectionService.getMCCCropCollections(mccId, {
      farmerId: farmerId || undefined,
      cropTypeId: cropTypeId || undefined,
      status: status || undefined,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    })

    return NextResponse.json({
      success: true,
      data: collections,
    })
  } catch (error) {
    console.error("Get crop collections error:", error)
    return NextResponse.json(
      { error: "Failed to get crop collections" },
      { status: 500 }
    )
  }
}
