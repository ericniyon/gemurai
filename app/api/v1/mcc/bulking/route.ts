import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { checkMCCPermission } from "@/lib/mcc-auth"

/**
 * POST /api/v1/mcc/bulking - Create bulk batch
 * Create a new bulk batch for milk bulking operations
 */
export async function POST(req: NextRequest) {
  try {
    const authToken = req.headers.get("authorization")?.replace("Bearer ", "")
    const { authorized, user, error } = await checkMCCPermission(
      authToken,
      "mcc.collections.manage"
    )

    if (!authorized || !user) {
      return NextResponse.json({ error: error || "Unauthorized" }, { status: 401 })
    }

    const data = await req.json()
    const { mccId, collectionIds } = data

    if (!mccId) {
      return NextResponse.json({ error: "MCC ID required" }, { status: 400 })
    }

    // If user is MCC_MANAGER, verify they own this MCC
    if (user.role === "MCC_MANAGER" && user.mccId !== mccId) {
      return NextResponse.json({ error: "Unauthorized for this MCC" }, { status: 403 })
    }

    // Get collections to bulk
    const collections = collectionIds
      ? await prisma.milk_collections.findMany({
          where: {
            id: { in: collectionIds },
            mccId: mccId,
            qualityStatus: "accepted",
            batchId: null, // Not already in a batch
          },
        })
      : await prisma.milk_collections.findMany({
          where: {
            mccId: mccId,
            qualityStatus: "accepted",
            batchId: null,
          },
        })

    if (collections.length === 0) {
      return NextResponse.json(
        { error: "No eligible collections found for bulking" },
        { status: 400 }
      )
    }

    // Calculate total liters
    const totalLiters = collections.reduce(
      (sum, c) => sum + (c.totalLiters || 0),
      0
    )

    // Create bulk batch
    const batch = await prisma.bulk_batches.create({
      data: {
        mccId: mccId,
        totalLiters: totalLiters,
        dispatched: false,
      },
    })

    // Update collections with batch ID
    await prisma.milk_collections.updateMany({
      where: {
        id: { in: collections.map((c) => c.id) },
      },
      data: {
        batchId: batch.id,
      },
    })

    return NextResponse.json({
      success: true,
      message: "Bulk batch created successfully",
      data: {
        batch,
        collectionsCount: collections.length,
        totalLiters,
      },
    })
  } catch (error) {
    console.error("Create bulk batch error:", error)
    return NextResponse.json(
      { error: "Failed to create bulk batch" },
      { status: 500 }
    )
  }
}

/**
 * GET /api/v1/mcc/bulking - Get bulk batches
 */
export async function GET(req: NextRequest) {
  try {
    const authToken = req.headers.get("authorization")?.replace("Bearer ", "")
    const { authorized, user, error } = await checkMCCPermission(
      authToken,
      "mcc.collections.view"
    )

    if (!authorized || !user) {
      return NextResponse.json({ error: error || "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const mccId = searchParams.get("mccId")
    const dispatched = searchParams.get("dispatched")
    const limit = parseInt(searchParams.get("limit") || "10")
    const page = parseInt(searchParams.get("page") || "1")
    const skip = (page - 1) * limit

    // If user is MCC_MANAGER, filter by their MCC
    let targetMccId = mccId
    if (!targetMccId && user.role === "MCC_MANAGER" && user.mccId) {
      targetMccId = user.mccId
    }

    const where: any = {}
    if (targetMccId) where.mccId = targetMccId
    if (dispatched !== null) where.dispatched = dispatched === "true"

    const batches = await prisma.bulk_batches.findMany({
      where,
      include: {
        mccs: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        milk_collections: {
          select: {
            id: true,
            totalLiters: true,
            collectionDate: true,
            farmers: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    })

    const total = await prisma.bulk_batches.count({ where })

    return NextResponse.json({
      success: true,
      data: batches,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Get bulk batches error:", error)
    return NextResponse.json(
      { error: "Failed to get bulk batches" },
      { status: 500 }
    )
  }
}


