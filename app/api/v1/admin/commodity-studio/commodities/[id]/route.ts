import { NextRequest, NextResponse } from "next/server"
import { CommodityStudioService } from "@/lib/services/CommodityStudioService"
import { verifyAuthToken } from "@/lib/api-auth"

/**
 * GET /api/v1/admin/commodity-studio/commodities/[id] - Get commodity details
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const authToken = req.headers.get("authorization")?.replace("Bearer ", "")
    if (!authToken) {
      return NextResponse.json({ error: "Authorization token required" }, { status: 401 })
    }

    const user = await verifyAuthToken(authToken)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const commodity = await CommodityStudioService.getCommodityById(id)

    if (!commodity) {
      return NextResponse.json({ error: "Commodity not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: commodity,
    })
  } catch (error) {
    console.error("Get commodity error:", error)
    return NextResponse.json(
      { error: "Failed to get commodity" },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/v1/admin/commodity-studio/commodities/[id] - Update commodity
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const authToken = req.headers.get("authorization")?.replace("Bearer ", "")
    if (!authToken) {
      return NextResponse.json({ error: "Authorization token required" }, { status: 401 })
    }

    const user = await verifyAuthToken(authToken)
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const data = await req.json()
    const {
      name,
      code,
      categoryId,
      unitOfMeasure,
      pricingMethod,
      storageType,
      isPerishable,
      defaultCollectionCenterType,
      defaultCollectionFrequency,
      metadata,
      isActive,
    } = data

    const commodity = await CommodityStudioService.updateCommodity(id, {
      name,
      code,
      categoryId,
      unitOfMeasure,
      pricingMethod,
      storageType,
      isPerishable,
      defaultCollectionCenterType,
      defaultCollectionFrequency,
      metadata,
      isActive,
    })

    return NextResponse.json({
      success: true,
      message: "Commodity updated successfully",
      data: commodity,
    })
  } catch (error: any) {
    console.error("Update commodity error:", error)
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Commodity not found" },
        { status: 404 }
      )
    }
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Commodity code already exists" },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { error: "Failed to update commodity" },
      { status: 500 }
    )
  }
}
