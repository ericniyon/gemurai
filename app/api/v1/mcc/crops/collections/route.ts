import { NextRequest, NextResponse } from "next/server"
import { CropCollectionService } from "@/lib/services/CropCollectionService"
import { verifyAuthToken } from "@/lib/api-auth"

function normalizeJson(value: unknown): Record<string, unknown> | undefined {
  if (value == null) return undefined
  if (typeof value !== "object") return undefined
  try {
    return JSON.parse(JSON.stringify(value)) as Record<string, unknown>
  } catch {
    return undefined
  }
}

function getToken(req: NextRequest): string | null {
  const fromHeader = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "")?.trim() || ""
  if (fromHeader && fromHeader !== "null" && fromHeader !== "undefined") return fromHeader
  const fromCookie = req.cookies.get("Gemurai_token")?.value?.trim()
  if (fromCookie) return fromCookie
  return null
}

/**
 * POST /api/v1/mcc/crops/collections - Record crop collection
 */
export async function POST(req: NextRequest) {
  try {
    let authToken = getToken(req)
    if (!authToken) {
      return NextResponse.json({ error: "Authorization token required" }, { status: 401 })
    }

    let user: Awaited<ReturnType<typeof verifyAuthToken>> = null
    try {
      user = await verifyAuthToken(authToken)
    } catch {
      const cookieToken = req.cookies.get("Gemurai_token")?.value?.trim()
      if (cookieToken && cookieToken !== authToken) {
        try {
          user = await verifyAuthToken(cookieToken)
          if (user) authToken = cookieToken
        } catch {
          // ignore
        }
      }
    }
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

    const quantityNum = typeof quantity === "number" ? quantity : parseFloat(String(quantity))
    const priceNum = typeof pricePerUnit === "number" ? pricePerUnit : parseFloat(String(pricePerUnit))
    const advancesNum = advances != null ? (typeof advances === "number" ? advances : parseFloat(String(advances))) : 0
    if (Number.isNaN(quantityNum) || quantityNum <= 0) {
      return NextResponse.json({ error: "Invalid quantity" }, { status: 400 })
    }
    if (Number.isNaN(priceNum) || priceNum < 0) {
      return NextResponse.json({ error: "Invalid pricePerUnit" }, { status: 400 })
    }

    const result = await CropCollectionService.recordCollection({
      farmerId,
      mccId,
      cropPeriodId,
      collectionDate: collectionDate ? new Date(collectionDate) : new Date(),
      cropTypeId,
      quantity: quantityNum,
      unit: unit || "kg",
      qualityTests: normalizeJson(qualityTests),
      pricePerUnit: priceNum,
      deductions: normalizeJson(deductions),
      advances: Number.isNaN(advancesNum) ? 0 : advancesNum,
      warehouseId,
      locationId,
      productId,
      notes,
      createdByUserId: user.id,
    })

    return NextResponse.json({
      success: true,
      message: "Crop collection recorded successfully",
      data: result,
    })
  } catch (error) {
    console.error("Record crop collection error:", error)
    const message = error instanceof Error ? error.message : ""
    const isAuthError =
      /token|unauthorized|jwt|expired|invalid.*signature/i.test(message) || message === "User not found" || message === "User account is not active"
    if (isAuthError) {
      return NextResponse.json({ error: "Authorization token required" }, { status: 401 })
    }
    return NextResponse.json(
      {
        error: "Failed to record crop collection",
        details: process.env.NODE_ENV === "development" ? message : undefined,
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
    let authToken = getToken(req)
    if (!authToken) {
      return NextResponse.json({ error: "Authorization token required" }, { status: 401 })
    }

    let user: Awaited<ReturnType<typeof verifyAuthToken>> | null = null
    try {
      user = await verifyAuthToken(authToken)
    } catch {
      const cookieToken = req.cookies.get("Gemurai_token")?.value?.trim()
      if (cookieToken && cookieToken !== authToken) {
        try {
          user = await verifyAuthToken(cookieToken)
        } catch {
          // ignore
        }
      }
    }
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
    const message = error instanceof Error ? error.message : ""
    const isAuthError =
      /token|unauthorized|jwt|expired|invalid.*signature/i.test(message) || message === "User not found" || message === "User account is not active"
    if (isAuthError) {
      return NextResponse.json({ error: "Authorization token required" }, { status: 401 })
    }
    return NextResponse.json(
      { error: "Failed to get crop collections" },
      { status: 500 }
    )
  }
}
