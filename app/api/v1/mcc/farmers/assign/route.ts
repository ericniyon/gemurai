import { NextRequest, NextResponse } from "next/server"
import { verifyAuthToken } from "@/lib/api-auth"
import { prisma } from "@/lib/prisma"

/**
 * POST /api/v1/mcc/farmers/assign - Assign farmers to an MCC
 * Body: { mccId: string, farmerIds: string[] }
 */
export async function POST(req: NextRequest) {
  try {
    const authToken = req.headers.get("authorization")?.replace("Bearer ", "")
    if (!authToken) {
      return NextResponse.json({ error: "Authorization token required" }, { status: 401 })
    }

    const user = await verifyAuthToken(authToken)
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN" && user.role !== "MCC_MANAGER")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { mccId, farmerIds } = await req.json()

    if (!mccId || !Array.isArray(farmerIds) || farmerIds.length === 0) {
      return NextResponse.json(
        { error: "mccId and farmerIds array are required" },
        { status: 400 }
      )
    }

    // Verify MCC exists
    const mcc = await prisma.mccs.findUnique({
      where: { id: mccId },
      select: { id: true, name: true }
    })

    if (!mcc) {
      return NextResponse.json({ error: "MCC not found" }, { status: 404 })
    }

    // MCC_MANAGER can only assign farmers to their own MCC
    if (user.role === "MCC_MANAGER") {
      const userMccId = user.mccId || (await prisma.mccs.findFirst({
        where: { managerUserId: user.id },
        select: { id: true }
      }))?.id

      if (userMccId !== mccId) {
        return NextResponse.json(
          { error: "You can only assign farmers to your own MCC" },
          { status: 403 }
        )
      }
    }

    // Update farmers with the new MCC
    const result = await prisma.farmers.updateMany({
      where: {
        id: { in: farmerIds }
      },
      data: {
        mccId: mccId,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: `Successfully assigned ${result.count} farmer(s) to ${mcc.name}`,
      data: {
        assignedCount: result.count,
        mccId,
        mccName: mcc.name
      }
    })
  } catch (error) {
    console.error("Assign farmers error:", error)
    return NextResponse.json(
      { error: "Failed to assign farmers", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}

/**
 * GET /api/v1/mcc/farmers/assign - Get all farmers with their MCC assignments
 * Query params: ?unassigned=true to get only unassigned farmers
 */
export async function GET(req: NextRequest) {
  try {
    const authToken = req.headers.get("authorization")?.replace("Bearer ", "")
    if (!authToken) {
      return NextResponse.json({ error: "Authorization token required" }, { status: 401 })
    }

    const user = await verifyAuthToken(authToken)
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN" && user.role !== "MCC_MANAGER")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const unassignedOnly = searchParams.get("unassigned") === "true"
    const mccId = searchParams.get("mccId")

    const where: any = {}

    if (unassignedOnly) {
      // This would require a nullable mccId, but currently mccId is required
      // We'll skip this filter for now since all farmers must have an MCC
    }

    if (mccId) {
      where.mccId = mccId
    }

    const farmers = await prisma.farmers.findMany({
      where,
      select: {
        id: true,
        name: true,
        farmerCode: true,
        phone: true,
        location: true,
        mccId: true,
        mccs: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      },
      orderBy: { name: "asc" }
    })

    return NextResponse.json({
      success: true,
      data: farmers
    })
  } catch (error) {
    console.error("Get farmers for assignment error:", error)
    return NextResponse.json(
      { error: "Failed to get farmers" },
      { status: 500 }
    )
  }
}
