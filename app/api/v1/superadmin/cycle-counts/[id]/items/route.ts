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

    // Check if cycle count exists
    const cycleCount = await prisma.cycleCount.findUnique({
      where: { id: params.id }
    })

    if (!cycleCount) {
      return NextResponse.json(
        { success: false, message: "Cycle count not found" },
        { status: 404 }
      )
    }

    const items = await prisma.cycleCountItem.findMany({
      where: { cycleCountId: params.id },
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
    })

    return NextResponse.json({
      success: true,
      data: items
    })
  } catch (error) {
    console.error("Error fetching cycle count items:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch cycle count items" },
      { status: 500 }
    )
  }
}

export async function POST(
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
    const { productId, expectedQuantity, notes } = body

    // Check if cycle count exists and is not completed
    const cycleCount = await prisma.cycleCount.findUnique({
      where: { id: params.id }
    })

    if (!cycleCount) {
      return NextResponse.json(
        { success: false, message: "Cycle count not found" },
        { status: 404 }
      )
    }

    if (cycleCount.state === 'DONE') {
      return NextResponse.json(
        { success: false, message: "Cannot add items to completed cycle count" },
        { status: 400 }
      )
    }

    // Validate required fields
    if (!productId) {
      return NextResponse.json(
        { success: false, message: "Product ID is required" },
        { status: 400 }
      )
    }

    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      )
    }

    // Check if item already exists in this cycle count
    const existingItem = await prisma.cycleCountItem.findFirst({
      where: {
        cycleCountId: params.id,
        productId
      }
    })

    if (existingItem) {
      return NextResponse.json(
        { success: false, message: "Product already exists in this cycle count" },
        { status: 400 }
      )
    }

    // Get current stock quantity for expected quantity
    let currentStock = 0
    if (cycleCount.warehouseId) {
      const stockQuantity = await prisma.stockQuantity.findFirst({
        where: {
          productId,
          warehouseId: cycleCount.warehouseId,
          locationId: cycleCount.locationId || null
        }
      })
      currentStock = stockQuantity?.quantity || 0
    }

    // Create cycle count item
    const item = await prisma.cycleCountItem.create({
      data: {
        cycleCountId: params.id,
        productId,
        expectedQuantity: expectedQuantity || currentStock,
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
      data: item,
      message: "Item added to cycle count successfully"
    }, { status: 201 })
  } catch (error) {
    console.error("Error adding cycle count item:", error)
    return NextResponse.json(
      { success: false, message: "Failed to add item to cycle count" },
      { status: 500 }
    )
  }
} 