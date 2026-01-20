import { NextRequest, NextResponse } from "next/server"
import { verifyAuthToken } from "@/lib/api-auth"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/v1/farm-level-data/farmers - Get all farmers with profile data
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

    const farmers = await prisma.farmers.findMany({
      include: {
        mccs: {
          select: {
            id: true,
            name: true,
          },
        },
        defaultCollectionCenter: {
          select: {
            id: true,
            name: true,
          },
        },
        assignedAgents: {
          where: {
            isActive: true,
          },
          include: {
            agent: {
              select: {
                id: true,
                name: true,
                phone: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json({
      success: true,
      data: farmers,
    })
  } catch (error: any) {
    console.error("Get farmers error:", error)
    return NextResponse.json(
      {
        error: "Failed to get farmers",
        message: process.env.NODE_ENV === 'development' ? error?.message : undefined,
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/v1/farm-level-data/farmers - Create farmer profile
 */
export async function POST(req: NextRequest) {
  try {
    const authToken = req.headers.get("authorization")?.replace("Bearer ", "")
    if (!authToken) {
      return NextResponse.json({ error: "Authorization token required" }, { status: 401 })
    }

    const user = await verifyAuthToken(authToken)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await req.json()
    const {
      name,
      phone,
      nationalId,
      mccId,
      location,
      village,
      district,
      sector,
      cell,
      defaultCollectionCenterId,
      paymentMethod,
      ikofiId,
      bankAccountNumber,
      bankName,
      assignedAgentIds,
    } = data

    if (!name || !phone || !nationalId || !mccId) {
      return NextResponse.json(
        {
          error: "Missing required fields: name, phone, nationalId, mccId",
        },
        { status: 400 }
      )
    }

    // Check if national ID already exists
    const existingFarmer = await prisma.farmers.findUnique({
      where: { nationalId },
    })

    if (existingFarmer) {
      return NextResponse.json(
        {
          error: "Farmer with this National ID already exists",
        },
        { status: 400 }
      )
    }

    // Create farmer
    const farmer = await prisma.farmers.create({
      data: {
        name,
        phone,
        nationalId,
        mccId,
        location: location || "",
        village,
        district,
        sector,
        cell,
        defaultCollectionCenterId: defaultCollectionCenterId || null,
        paymentMethod: paymentMethod || null,
        ikofiId: ikofiId || null,
        bankAccountNumber: bankAccountNumber || null,
        bankName: bankName || null,
      },
      include: {
        mccs: true,
        defaultCollectionCenter: true,
      },
    })

    // Create agent assignments
    if (assignedAgentIds && assignedAgentIds.length > 0) {
      await prisma.farmer_agent_assignments.createMany({
        data: assignedAgentIds.map((agentId: string) => ({
          farmerId: farmer.id,
          agentId,
          assignedBy: user.id,
        })),
      })
    }

    // Fetch farmer with all relations
    const farmerWithRelations = await prisma.farmers.findUnique({
      where: { id: farmer.id },
      include: {
        mccs: true,
        defaultCollectionCenter: true,
        assignedAgents: {
          include: {
            agent: {
              select: {
                id: true,
                name: true,
                phone: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      message: "Farmer created successfully",
      data: farmerWithRelations,
    })
  } catch (error: any) {
    console.error("Create farmer error:", error)
    return NextResponse.json(
      {
        error: "Failed to create farmer",
        message: process.env.NODE_ENV === 'development' ? error?.message : undefined,
      },
      { status: 500 }
    )
  }
}
