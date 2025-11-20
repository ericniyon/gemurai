import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { checkMCCPermission } from "@/lib/mcc-auth"

/**
 * POST /api/v1/mcc/rentals - Create equipment rental
 * Deploy asset to farmer with rental contract
 */
export async function POST(req: NextRequest) {
  try {
    const authToken = req.headers.get("authorization")?.replace("Bearer ", "")
    const { authorized, user, error } = await checkMCCPermission(
      authToken,
      "mcc.rentals.create"
    )

    if (!authorized || !user) {
      return NextResponse.json({ error: error || "Unauthorized" }, { status: 401 })
    }

    const data = await req.json()
    const {
      assetId,
      farmerId,
      mccId,
      rentStart,
      rentEnd,
      rentFeePerDay,
      deposit,
      contractDoc,
    } = data

    if (!assetId || !farmerId || !mccId) {
      return NextResponse.json(
        { error: "Missing required fields: assetId, farmerId, mccId" },
        { status: 400 }
      )
    }

    // If user is MCC_MANAGER, verify they own this MCC
    if (user.role === "MCC_MANAGER" && user.mccId !== mccId) {
      return NextResponse.json({ error: "Unauthorized for this MCC" }, { status: 403 })
    }

    // Check asset availability
    const asset = await prisma.assets.findUnique({
      where: { id: assetId },
      include: {
        rentals: {
          where: {
            returned: false,
          },
        },
      },
    })

    if (!asset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 })
    }

    if (asset.status !== "available") {
      return NextResponse.json(
        { error: `Asset is not available. Current status: ${asset.status}` },
        { status: 400 }
      )
    }

    // Check if asset is already rented
    const activeRental = asset.rentals.find((r) => !r.returned)
    if (activeRental) {
      return NextResponse.json(
        { error: "Asset is already rented out" },
        { status: 400 }
      )
    }

    // Create rental
    const rental = await prisma.$transaction(async (tx) => {
      // Create rental record
      const rentalRecord = await tx.rentals.create({
        data: {
          assetId: assetId,
          farmerId: farmerId,
          mccId: mccId,
          rentStart: rentStart ? new Date(rentStart) : new Date(),
          rentEnd: rentEnd ? new Date(rentEnd) : null,
          rentFeePerDay: rentFeePerDay || 0,
          deposit: deposit || 0,
          contractDoc: contractDoc || null,
          returned: false,
        },
      })

      // Update asset status
      await tx.assets.update({
        where: { id: assetId },
        data: {
          status: "rented",
          currentHolderType: "farmer",
          currentHolderId: farmerId,
        },
      })

      return rentalRecord
    })

    // Fetch complete rental with relations
    const completeRental = await prisma.rentals.findUnique({
      where: { id: rental.id },
      include: {
        asset: {
          select: {
            id: true,
            serial: true,
            name: true,
            assetType: true,
          },
        },
        farmer: {
          select: {
            id: true,
            name: true,
            phone: true,
            farmerCode: true,
          },
        },
        mcc: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      message: "Rental created successfully",
      data: completeRental,
    })
  } catch (error) {
    console.error("Create rental error:", error)
    return NextResponse.json(
      { error: "Failed to create rental" },
      { status: 500 }
    )
  }
}

/**
 * GET /api/v1/mcc/rentals - Get equipment rentals
 */
export async function GET(req: NextRequest) {
  try {
    const authToken = req.headers.get("authorization")?.replace("Bearer ", "")
    const { authorized, user, error } = await checkMCCPermission(
      authToken,
      "mcc.rentals.view"
    )

    if (!authorized || !user) {
      return NextResponse.json({ error: error || "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const mccId = searchParams.get("mccId")
    const farmerId = searchParams.get("farmerId")
    const assetId = searchParams.get("assetId")
    const returned = searchParams.get("returned")
    const limit = parseInt(searchParams.get("limit") || "10")
    const page = parseInt(searchParams.get("page") || "1")
    const skip = (page - 1) * limit

    // If user is MCC_MANAGER, filter by their MCC
    let targetMccId = mccId
    if (!targetMccId && user.role === "MCC_MANAGER" && user.mccId) {
      targetMccId = user.mccId
    }

    // If user is FARMER, only show their own rentals
    if (user.role === "FARMER" && user.id) {
      const farmer = await prisma.farmers.findFirst({
        where: { phone: user.phone || "" },
        select: { id: true },
      })
      if (farmer) {
        const rentals = await prisma.rentals.findMany({
          where: { farmerId: farmer.id },
          include: {
            asset: {
              select: {
                id: true,
                serial: true,
                name: true,
                assetType: true,
              },
            },
            mcc: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
        })

        const total = await prisma.rentals.count({
          where: { farmerId: farmer.id },
        })

        return NextResponse.json({
          success: true,
          data: rentals,
          meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        })
      }
    }

    // Build where clause
    const where: any = {}
    if (targetMccId) where.mccId = targetMccId
    if (farmerId) where.farmerId = farmerId
    if (assetId) where.assetId = assetId
    if (returned !== null) where.returned = returned === "true"

    const rentals = await prisma.rentals.findMany({
      where,
      include: {
        asset: {
          select: {
            id: true,
            serial: true,
            name: true,
            assetType: true,
            status: true,
          },
        },
        farmer: {
          select: {
            id: true,
            name: true,
            phone: true,
            farmerCode: true,
          },
        },
        mcc: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    })

    const total = await prisma.rentals.count({ where })

    return NextResponse.json({
      success: true,
      data: rentals,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Get rentals error:", error)
    return NextResponse.json(
      { error: "Failed to get rentals" },
      { status: 500 }
    )
  }
}

