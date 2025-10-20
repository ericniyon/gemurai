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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; itemId: string } }
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
    const { expectedQuantity, countedQuantity, notes } = body

    // Check if cycle count item exists
    const existingItem = await prisma.cycleCountItem.findUnique({
      where: { id: params.itemId },
      include: {
        cycleCount: true
      }
    })

    if (!existingItem) {
      return NextResponse.json(
        { success: false, message: "Cycle count item not found" },
        { status: 404 }
      )
    }

    // Check if cycle count is completed
    if (existingItem.cycleCount.state === 'DONE') {
      return NextResponse.json(
        { success: false, message: "Cannot modify items in completed cycle count" },
        { status: 400 }
      )
    }

    // Calculate variance if counted quantity is provided
    let variance = null
    if (countedQuantity !== undefined && countedQuantity !== null) {
      variance = countedQuantity - (expectedQuantity || existingItem.expectedQuantity)
    }

    // Update cycle count item
    const updatedItem = await prisma.cycleCountItem.update({
      where: { id: params.itemId },
      data: {
        expectedQuantity,
        countedQuantity,
        variance,
        notes
      },
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
    })

    return NextResponse.json({
      success: true,
      data: updatedItem,
      message: "Cycle count item updated successfully"
    })
  } catch (error) {
    console.error("Error updating cycle count item:", error)
    return NextResponse.json(
      { success: false, message: "Failed to update cycle count item" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; itemId: string } }
) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    // Check if cycle count item exists
    const existingItem = await prisma.cycleCountItem.findUnique({
      where: { id: params.itemId },
      include: {
        cycleCount: true
      }
    })

    if (!existingItem) {
      return NextResponse.json(
        { success: false, message: "Cycle count item not found" },
        { status: 404 }
      )
    }

    // Check if cycle count is completed
    if (existingItem.cycleCount.state === 'DONE') {
      return NextResponse.json(
        { success: false, message: "Cannot delete items from completed cycle count" },
        { status: 400 }
      )
    }

    // Delete cycle count item
    await prisma.cycleCountItem.delete({
      where: { id: params.itemId }
    })

    return NextResponse.json({
      success: true,
      message: "Cycle count item deleted successfully"
    })
  } catch (error) {
    console.error("Error deleting cycle count item:", error)
    return NextResponse.json(
      { success: false, message: "Failed to delete cycle count item" },
      { status: 500 }
    )
  }
} 