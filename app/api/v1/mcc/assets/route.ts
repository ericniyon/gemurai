import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { checkMCCPermission } from "@/lib/mcc-auth"

/**
 * GET /api/v1/mcc/assets - Get equipment assets list
 */
export async function GET(req: NextRequest) {
  try {
    const authToken = req.headers.get("authorization")?.replace("Bearer ", "")
    const { authorized, user, error } = await checkMCCPermission(
      authToken,
      "mcc.assets.view"
    )

    if (!authorized || !user) {
      return NextResponse.json({ error: error || "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const assetType = searchParams.get("assetType")
    const status = searchParams.get("status")
    const limit = parseInt(searchParams.get("limit") || "10")
    const page = parseInt(searchParams.get("page") || "1")
    const skip = (page - 1) * limit

    const where: any = {}
    if (assetType) where.assetType = assetType
    if (status) where.status = status

    const assets = await prisma.assets.findMany({
      where,
      include: {
        rentals: {
          where: {
            returned: false,
          },
          include: {
            farmer: {
              select: {
                id: true,
                name: true,
                phone: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    })

    const total = await prisma.assets.count({ where })

    return NextResponse.json({
      success: true,
      data: assets,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Get assets error:", error)
    return NextResponse.json(
      { error: "Failed to get assets" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/v1/mcc/assets - Create equipment asset
 */
export async function POST(req: NextRequest) {
  try {
    const authToken = req.headers.get("authorization")?.replace("Bearer ", "")
    const { authorized, user, error } = await checkMCCPermission(
      authToken,
      "mcc.assets.manage"
    )

    if (!authorized || !user) {
      return NextResponse.json({ error: error || "Unauthorized" }, { status: 401 })
    }

    const data = await req.json()
    const { serial, name, assetType, purchasedAt, notes } = data

    if (!serial || !assetType) {
      return NextResponse.json(
        { error: "Missing required fields: serial, assetType" },
        { status: 400 }
      )
    }

    // Check if serial already exists
    const existingAsset = await prisma.assets.findUnique({
      where: { serial },
    })

    if (existingAsset) {
      return NextResponse.json(
        { error: "Asset with this serial number already exists" },
        { status: 409 }
      )
    }

    const asset = await prisma.assets.create({
      data: {
        serial,
        name: name || null,
        assetType,
        status: "available",
        purchasedAt: purchasedAt ? new Date(purchasedAt) : null,
        notes: notes || null,
      },
    })

    return NextResponse.json({
      success: true,
      message: "Asset created successfully",
      data: asset,
    })
  } catch (error) {
    console.error("Create asset error:", error)
    return NextResponse.json(
      { error: "Failed to create asset" },
      { status: 500 }
    )
  }
}

