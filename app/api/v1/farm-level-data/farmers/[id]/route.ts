import { NextRequest, NextResponse } from "next/server"
import { verifyAuthToken } from "@/lib/api-auth"
import { prisma } from "@/lib/prisma"

/**
 * PUT /api/v1/farm-level-data/farmers/[id] - Update farmer profile
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: farmerId } = await params
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

    // National ID is mandatory: must be present on update (cannot be cleared)
    if (nationalId !== undefined && !nationalId?.trim()) {
      return NextResponse.json(
        { error: "National ID is required and cannot be empty" },
        { status: 400 }
      )
    }

    // Check if farmer exists
    const existingFarmer = await prisma.farmers.findUnique({
      where: { id: farmerId },
    })

    if (!existingFarmer) {
      return NextResponse.json(
        {
          error: "Farmer not found",
        },
        { status: 404 }
      )
    }

    // Check if national ID is being changed and if it conflicts
    if (nationalId && nationalId !== existingFarmer.nationalId) {
      const conflictFarmer = await prisma.farmers.findUnique({
        where: { nationalId },
      })

      if (conflictFarmer) {
        return NextResponse.json(
          {
            error: "Farmer with this National ID already exists",
          },
          { status: 400 }
        )
      }
    }

    // Update farmer (preserve nationalId if not sent; require non-empty if sent)
    const updateData: Record<string, unknown> = {
      name,
      phone,
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
    }
    if (nationalId !== undefined) updateData.nationalId = nationalId.trim() || existingFarmer.nationalId

    const farmer = await prisma.farmers.update({
      where: { id: farmerId },
      data: updateData,
    })

    // Update agent assignments
    if (assignedAgentIds !== undefined) {
      // Remove all existing assignments
      await prisma.farmer_agent_assignments.deleteMany({
        where: { farmerId: farmerId },
      })

      // Create new assignments
      if (assignedAgentIds.length > 0) {
        await prisma.farmer_agent_assignments.createMany({
          data: assignedAgentIds.map((agentId: string) => ({
            farmerId: farmerId,
            agentId,
            assignedBy: user.id,
          })),
        })
      }
    }

    // Fetch farmer with all relations
    const farmerWithRelations = await prisma.farmers.findUnique({
      where: { id: farmerId },
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
      message: "Farmer updated successfully",
      data: farmerWithRelations,
    })
  } catch (error: any) {
    console.error("Update farmer error:", error)
    return NextResponse.json(
      {
        error: "Failed to update farmer",
        message: process.env.NODE_ENV === 'development' ? error?.message : undefined,
      },
      { status: 500 }
    )
  }
}
