import { NextRequest, NextResponse } from "next/server"
import { CropCollectionService } from "@/lib/services/CropCollectionService"
import { verifyAuthToken } from "@/lib/api-auth"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/v1/mcc/crops/types - Get crop types
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
    const activeOnly = searchParams.get("activeOnly") !== "false"

    const cropTypes = await CropCollectionService.getCropTypes(activeOnly)

    return NextResponse.json({
      success: true,
      data: cropTypes,
    })
  } catch (error) {
    console.error("Get crop types error:", error)
    return NextResponse.json(
      { error: "Failed to get crop types" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/v1/mcc/crops/types - Create crop type
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
    const { name, code, unitOfMeasure, qualityStandards, defaultPricePerUnit } = data

    if (!name || !code || !unitOfMeasure || !defaultPricePerUnit) {
      return NextResponse.json(
        { error: "Missing required fields: name, code, unitOfMeasure, defaultPricePerUnit" },
        { status: 400 }
      )
    }

    const cropType = await prisma.crop_types.create({
      data: {
        name,
        code,
        unitOfMeasure,
        qualityStandards: qualityStandards || {},
        defaultPricePerUnit: parseFloat(defaultPricePerUnit),
        isActive: true,
      },
    })

    return NextResponse.json({
      success: true,
      message: "Crop type created successfully",
      data: cropType,
    })
  } catch (error: any) {
    console.error("Create crop type error:", error)
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Crop type code already exists" },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { error: "Failed to create crop type" },
      { status: 500 }
    )
  }
}
