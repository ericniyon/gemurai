import { NextRequest, NextResponse } from "next/server"
import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { checkMCCPermission } from "@/lib/mcc-auth"
import crypto from "crypto"

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
    const {
      serial,
      name,
      assetType,
      purchasedAt,
      notes,
      rentable,
      capacityLiters,
      weightKg,
      specifications,
    } = data

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

    const rentableValue = typeof rentable === "boolean" ? rentable : rentable !== false && rentable !== "false"

    const capLiters =
      capacityLiters != null && capacityLiters !== "" ? parseFloat(String(capacityLiters)) : null
    const weight =
      weightKg != null && weightKg !== "" ? parseFloat(String(weightKg)) : null
    const specs =
      specifications && typeof specifications === "object" && Object.keys(specifications).length > 0
        ? (specifications as Record<string, unknown>)
        : null

    // Use raw INSERT to avoid Prisma client validation issues (e.g. stale client missing rentable)
    const id = `c${Date.now().toString(36)}${crypto.randomBytes(12).toString("base64url").replace(/[-_]/g, "").slice(0, 16)}`
    const now = new Date()
    const purchasedAtDate = purchasedAt ? new Date(purchasedAt) : null
    const specsJson = specs != null ? JSON.stringify(specs) : null

    const rows = await prisma.$queryRaw<
      Array<{
        id: string
        serial: string
        name: string | null
        assetType: string | null
        status: string
        rentable: boolean
        currentHolderType: string | null
        currentHolderId: string | null
        purchasedAt: Date | null
        notes: string | null
        capacityLiters: number | null
        weightKg: number | null
        specifications: unknown
        createdAt: Date
      }>
    >(
      Prisma.sql`
        INSERT INTO "assets" (
          id, serial, name, "assetType", status, rentable,
          "currentHolderType", "currentHolderId", "purchasedAt", notes,
          "capacityLiters", "weightKg", specifications, "createdAt"
        )
        VALUES (
          ${id}, ${serial}, ${name || null}, ${assetType}, 'available', ${rentableValue},
          NULL, NULL, ${purchasedAtDate}, ${notes || null},
          ${capLiters != null && !Number.isNaN(capLiters) ? capLiters : null},
          ${weight != null && !Number.isNaN(weight) ? weight : null},
          ${specsJson}::jsonb,
          ${now}
        )
        RETURNING *
      `
    )

    const asset = rows[0]
    if (!asset) {
      throw new Error("Insert succeeded but no row returned")
    }

    return NextResponse.json({
      success: true,
      message: "Asset created successfully",
      data: asset,
    })
  } catch (error) {
    console.error("Create asset error:", error)
    const message = error instanceof Error ? error.message : "Failed to create asset"
    return NextResponse.json(
      { error: process.env.NODE_ENV === "development" ? message : "Failed to create asset" },
      { status: 500 }
    )
  }
}

