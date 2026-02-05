import { NextRequest, NextResponse } from "next/server"
import { verifyAuthToken } from "@/lib/api-auth"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/v1/admin/commodity-studio/stats - Get counts for dashboard cards
 */
export async function GET(req: NextRequest) {
  try {
    const authToken = req.headers.get("authorization")?.replace("Bearer ", "")
    if (!authToken) {
      return NextResponse.json({ error: "Authorization token required" }, { status: 401 })
    }

    const user = await verifyAuthToken(authToken)
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const [totalCategories, totalCommodities, totalQualityFields, totalInputItems] = await Promise.all([
      prisma.commodity_categories.count(),
      prisma.commodities.count({ where: { isActive: true } }),
      prisma.commodity_quality_fields.count(),
      prisma.input_catalog.count(),
    ])

    return NextResponse.json({
      success: true,
      data: {
        totalCategories,
        totalCommodities,
        totalQualityFields,
        totalInputItems,
      },
    })
  } catch (error) {
    console.error("Commodity studio stats error:", error)
    return NextResponse.json(
      { error: "Failed to load stats" },
      { status: 500 }
    )
  }
}
