import { NextRequest, NextResponse } from "next/server"
import { verifyAuthToken } from "@/lib/api-auth"
import { prisma } from "@/lib/prisma"

function getToken(req: NextRequest): string | null {
  const fromHeader = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "")?.trim() || ""
  if (fromHeader && fromHeader !== "null" && fromHeader !== "undefined") return fromHeader
  return req.cookies.get("Gemurai_token")?.value?.trim() ?? null
}

/**
 * GET /api/v1/mcc/products-for-receiving?mccId=...&commodityId=...|cropTypeId=...
 * Returns products that can be used when receiving a collection into warehouse.
 * If commodityId or cropTypeId is provided, includes the default inventory product for that commodity/crop type first.
 */
export async function GET(req: NextRequest) {
  try {
    const authToken = getToken(req)
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
    const cropTypeId = searchParams.get("cropTypeId")
    if (!mccId) {
      return NextResponse.json({ error: "mccId is required" }, { status: 400 })
    }

    const productIds = new Set<string>()

    if (commodityId) {
      const commodity = await prisma.commodities.findUnique({
        where: { id: commodityId },
        select: { inventoryProductId: true },
      })
      if (commodity?.inventoryProductId) productIds.add(commodity.inventoryProductId)
    }
    if (cropTypeId) {
      const cropType = await prisma.crop_types.findUnique({
        where: { id: cropTypeId },
        select: { inventoryProductId: true },
      })
      if (cropType?.inventoryProductId) productIds.add(cropType.inventoryProductId)
    }

    const allProducts = await prisma.products.findMany({
      where: {
        isActive: true,
        inventoryType: { in: ["GENERAL", "CROP"] },
      },
      select: { id: true, name: true, unitOfMeasure: true },
      orderBy: { name: "asc" },
    })

    const defaultFirst = productIds.size > 0
      ? allProducts.filter((p) => productIds.has(p.id))
      : []
    const rest = allProducts.filter((p) => !productIds.has(p.id))
    const data = [...defaultFirst, ...rest].map((p) => ({
      id: p.id,
      name: p.name,
      unit: p.unitOfMeasure || "Units",
    }))

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Get products for receiving error:", error)
    return NextResponse.json(
      { error: "Failed to get products", details: error instanceof Error ? error.message : undefined },
      { status: 500 }
    )
  }
}
