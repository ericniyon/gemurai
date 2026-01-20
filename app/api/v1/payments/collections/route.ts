import { NextRequest, NextResponse } from "next/server"
import { verifyAuthToken } from "@/lib/api-auth"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/v1/payments/collections - Get collections for payout calculation
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
    const batchId = searchParams.get("batchId")
    const date = searchParams.get("date")
    const mccId = searchParams.get("mccId")

    const where: any = {
      status: { in: ["APPROVED", "PENDING"] },
    }

    if (batchId && batchId !== "all") {
      where.batchId = batchId
    }

    if (date) {
      const startDate = new Date(date)
      startDate.setHours(0, 0, 0, 0)
      const endDate = new Date(date)
      endDate.setHours(23, 59, 59, 999)
      where.collectionDate = {
        gte: startDate,
        lte: endDate,
      }
    }

    if (mccId) {
      where.mccId = mccId
    } else if (user.mccId) {
      where.mccId = user.mccId
    }

    const collections = await prisma.commodity_collections.findMany({
      where,
      include: {
        farmer: {
          select: {
            id: true,
            name: true,
            farmerCode: true,
            nationalId: true,
            phone: true,
          },
        },
        commodity: {
          select: {
            id: true,
            name: true,
            code: true,
            unitOfMeasure: true,
          },
        },
        agent: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        collectionDate: "desc",
      },
    })

    return NextResponse.json({
      success: true,
      data: collections,
    })
  } catch (error: any) {
    console.error("Get collections error:", error)
    return NextResponse.json(
      {
        error: "Failed to get collections",
        message: process.env.NODE_ENV === 'development' ? error?.message : undefined,
      },
      { status: 500 }
    )
  }
}
