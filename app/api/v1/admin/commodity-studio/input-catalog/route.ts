import { NextRequest, NextResponse } from "next/server"
import { SeasonPlanService } from "@/lib/services/SeasonPlanService"
import { verifyAuthToken } from "@/lib/api-auth"

/**
 * GET /api/v1/admin/commodity-studio/input-catalog - Get input catalog
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
    const commodityId = searchParams.get("commodityId")
    const activeOnly = searchParams.get("activeOnly") !== "false"

    if (!commodityId) {
      return NextResponse.json({ error: "commodityId is required" }, { status: 400 })
    }

    const catalog = await SeasonPlanService.getInputCatalog(commodityId, activeOnly)

    return NextResponse.json({
      success: true,
      data: catalog,
    })
  } catch (error) {
    console.error("Get input catalog error:", error)
    return NextResponse.json(
      { error: "Failed to get input catalog" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/v1/admin/commodity-studio/input-catalog - Create input catalog item
 */
export async function POST(req: NextRequest) {
  try {
    const authToken = req.headers.get("authorization")?.replace("Bearer ", "")
    if (!authToken) {
      return NextResponse.json({ error: "Authorization token required" }, { status: 401 })
    }

    const user = await verifyAuthToken(authToken)
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const data = await req.json()
    const { commodityId, name, category, unit, pricingReference, description } = data

    if (!commodityId || !name || !category || !unit) {
      return NextResponse.json(
        { error: "Missing required fields: commodityId, name, category, unit" },
        { status: 400 }
      )
    }

    const item = await SeasonPlanService.createInputCatalogItem({
      commodityId,
      name,
      category,
      unit,
      pricingReference: pricingReference ? parseFloat(pricingReference) : undefined,
      description,
    })

    return NextResponse.json({
      success: true,
      message: "Input catalog item created successfully",
      data: item,
    })
  } catch (error) {
    console.error("Create input catalog item error:", error)
    return NextResponse.json(
      { error: "Failed to create input catalog item" },
      { status: 500 }
    )
  }
}
