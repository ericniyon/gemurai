import { NextRequest, NextResponse } from "next/server"
import { verifyAuthToken } from "@/lib/api-auth"
import { prisma } from "@/lib/prisma"

async function getAuthenticatedUser(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  if (!authHeader?.startsWith("Bearer ")) {
    return null
  }

  const token = authHeader.substring(7)
  const user = await verifyAuthToken(token)
  if (!user) {
    return null
  }

  // Allow SUPER_ADMIN and BRANCH_MANAGER roles
  if (user.role !== "SUPER_ADMIN" && user.role !== "BRANCH_MANAGER") {
    return null
  }

  return user
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    const cycleCount = await prisma.cycleCount.findUnique({
      where: { id: params.id },
      include: {
        warehouse: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        location: {
          select: {
            id: true,
            name: true,
            code: true,
            locationType: true
          }
        },
        product: {
          select: {
            id: true,
            name: true,
            internalReference: true,
            image: true
          }
        },
        createdByUser: {
          select: {
            id: true,
            name: true
          }
        },
        completedByUser: {
          select: {
            id: true,
            name: true
          }
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                internalReference: true,
                image: true
              }
            }
          },
          orderBy: { createdAt: 'asc' }
        }
      }
    })

    if (!cycleCount) {
      return NextResponse.json(
        { success: false, message: "Cycle count not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: cycleCount
    })
  } catch (error) {
    console.error("Error fetching cycle count:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch cycle count" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      name,
      warehouseId,
      locationId,
      productId,
      scheduledDate,
      notes,
      state
    } = body

    // Check if cycle count exists
    const existingCycleCount = await prisma.cycleCount.findUnique({
      where: { id: params.id }
    })

    if (!existingCycleCount) {
      return NextResponse.json(
        { success: false, message: "Cycle count not found" },
        { status: 404 }
      )
    }

    // Validate state transitions
    if (state && state !== existingCycleCount.state) {
      if (existingCycleCount.state === 'DONE' && state !== 'DONE') {
        return NextResponse.json(
          { success: false, message: "Cannot modify completed cycle count" },
          { status: 400 }
        )
      }
    }

    // Update cycle count
    const updatedCycleCount = await prisma.cycleCount.update({
      where: { id: params.id },
      data: {
        name,
        warehouseId,
        locationId,
        productId,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
        notes,
        state,
        ...(state === 'DONE' && !existingCycleCount.completedAt ? {
          completedAt: new Date(),
          completedBy: user.id
        } : {})
      },
      include: {
        warehouse: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        location: {
          select: {
            id: true,
            name: true,
            code: true,
            locationType: true
          }
        },
        product: {
          select: {
            id: true,
            name: true,
            internalReference: true,
            image: true
          }
        },
        createdByUser: {
          select: {
            id: true,
            name: true
          }
        },
        completedByUser: {
          select: {
            id: true,
            name: true
          }
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                internalReference: true,
                image: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedCycleCount,
      message: "Cycle count updated successfully"
    })
  } catch (error) {
    console.error("Error updating cycle count:", error)
    return NextResponse.json(
      { success: false, message: "Failed to update cycle count" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    // Check if cycle count exists
    const existingCycleCount = await prisma.cycleCount.findUnique({
      where: { id: params.id }
    })

    if (!existingCycleCount) {
      return NextResponse.json(
        { success: false, message: "Cycle count not found" },
        { status: 404 }
      )
    }

    // Only allow deletion of DRAFT cycle counts
    if (existingCycleCount.state !== 'DRAFT') {
      return NextResponse.json(
        { success: false, message: "Only draft cycle counts can be deleted" },
        { status: 400 }
      )
    }

    // Delete cycle count and related items
    await prisma.$transaction([
      prisma.cycleCountItem.deleteMany({
        where: { cycleCountId: params.id }
      }),
      prisma.cycleCount.delete({
        where: { id: params.id }
      })
    ])

    return NextResponse.json({
      success: true,
      message: "Cycle count deleted successfully"
    })
  } catch (error) {
    console.error("Error deleting cycle count:", error)
    return NextResponse.json(
      { success: false, message: "Failed to delete cycle count" },
      { status: 500 }
    )
  }
} 