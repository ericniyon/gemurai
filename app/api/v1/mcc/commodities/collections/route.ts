import { NextRequest, NextResponse } from "next/server"
import { CommodityCollectionService } from "@/lib/services/CommodityCollectionService"
import { verifyAuthToken } from "@/lib/api-auth"

/**
 * POST /api/v1/mcc/commodities/collections - Record commodity collection
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
      commodityId,
      farmerId,
      mccId,
      periodId,
      collectionDate,
      quantity,
      unit,
      qualityData,
      pricePerUnit,
      deductions,
      advances,
      agentAdvance,
      agentId,
      warehouseId,
      locationId,
      productId,
      batchId,
      notes,
    } = data

    if (!commodityId || !farmerId || !mccId || !quantity || !pricePerUnit) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: commodityId, farmerId, mccId, quantity, pricePerUnit",
        },
        { status: 400 }
      )
    }

    const result = await CommodityCollectionService.recordCollection({
      commodityId,
      farmerId,
      mccId,
      periodId,
      collectionDate: collectionDate ? new Date(collectionDate) : new Date(),
      quantity: parseFloat(quantity),
      unit: unit || "kg",
      qualityData: qualityData || {},
      pricePerUnit: parseFloat(pricePerUnit),
      deductions,
      advances: advances ? parseFloat(advances) : 0,
      agentAdvance: agentAdvance ? parseFloat(agentAdvance) : 0,
      agentId,
      warehouseId,
      locationId,
      productId,
      batchId,
      notes,
    })

    return NextResponse.json({
      success: true,
      message: "Commodity collection recorded successfully",
      data: result,
    })
  } catch (error) {
    console.error("Record commodity collection error:", error)
    return NextResponse.json(
      {
        error: "Failed to record commodity collection",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/v1/mcc/commodities/collections - Get commodity collections
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
    const commodityId = searchParams.get("commodityId")
    const farmerId = searchParams.get("farmerId")
    const status = searchParams.get("status")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    if (!mccId) {
      return NextResponse.json({ error: "mccId is required" }, { status: 400 })
    }

    const collections = await CommodityCollectionService.getMCCCollections(mccId, {
      commodityId: commodityId || undefined,
      farmerId: farmerId || undefined,
      status: status || undefined,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    })

    return NextResponse.json({
      success: true,
      data: collections,
    })
  } catch (error) {
    console.error("Get commodity collections error:", error)
    return NextResponse.json(
      { error: "Failed to get commodity collections" },
      { status: 500 }
    )
  }
}
