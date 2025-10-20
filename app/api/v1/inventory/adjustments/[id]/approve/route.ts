import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { verifyAuthToken } from "@/lib/api-auth"

async function getAuthenticatedUser(request: NextRequest) {
  // Try NextAuth session first
  const session = await getServerSession(authOptions)
  if (session?.user?.id) {
    return { userId: session.user.id, method: 'session' }
  }

  // Try custom token
  const authHeader = request.headers.get("authorization")
  if (!authHeader?.startsWith("Bearer ")) {
    return null
  }

  const token = authHeader.substring(7)
  const user = await verifyAuthToken(token)
  if (!user) {
    return null
  }

  return { userId: user.id, method: 'token' }
}

async function checkInventoryPermission(userId: string, permission: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      role: true,
      permissions: true,
      userRole: {
        select: {
          role: {
            select: {
              name: true,
              rolePermissions: {
                select: {
                  permission: {
                    select: {
                      name: true
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  })

  const roleName = user?.userRole?.role?.name || user?.role
  const permissions = user?.userRole?.role?.rolePermissions?.map(rp => rp.permission.name) || []
  const userPermissions = user?.permissions || []
  
  // Super admin and admin have all permissions
  if (roleName === 'SUPER_ADMIN') {
    console.log("✅ Access granted - SUPER_ADMIN role (system user)")
    return true
  }

  // ADMIN and other roles are NOT system users - deny access
  console.log("❌ Access denied - Only SUPER_ADMIN can manage inventory system")
  return false

  // Check if user has wildcard permission
  if (userPermissions.includes('*')) {
    return true
  }

  // Check specific permission in database permissions
  if (permissions.includes(permission)) {
    return true
  }

  // Check specific permission in user permissions
  if (userPermissions.includes(permission)) {
    return true
  }

  return false
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await getAuthenticatedUser(request)
    if (!auth) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    // Check permission
    const hasPermission = await checkInventoryPermission(auth.userId, "inventory.adjustment.approve")
    if (!hasPermission) {
      return NextResponse.json(
        { success: false, message: "Permission denied" },
        { status: 403 }
      )
    }

    // Get the adjustment
    const adjustment = await prisma.inventoryAdjustment.findUnique({
      where: { id: params.id },
      include: {
        product: true,
        warehouse: true,
        location: true,
        user: true
      }
    })

    if (!adjustment) {
      return NextResponse.json(
        { success: false, message: "Inventory adjustment not found" },
        { status: 404 }
      )
    }

    if (adjustment.status !== 'PENDING') {
      return NextResponse.json(
        { success: false, message: "Adjustment is not pending" },
        { status: 400 }
      )
    }

    // Cannot approve own adjustment
    if (adjustment.userId === auth.userId) {
      return NextResponse.json(
        { success: false, message: "Cannot approve your own adjustment" },
        { status: 400 }
      )
    }

    // Execute the adjustment approval in a transaction
    const result = await prisma.$transaction(async (prisma) => {
      // Update adjustment status
      const updatedAdjustment = await prisma.inventoryAdjustment.update({
        where: { id: params.id },
        data: {
          status: 'APPROVED',
          approvedAt: new Date(),
          approvedById: auth.userId
        }
      })

      // Update stock quantity
      await updateStockQuantity(prisma, {
        productId: adjustment.productId,
        warehouseId: adjustment.warehouseId,
        locationId: adjustment.locationId,
        newQuantity: adjustment.quantityAfter,
        unitCost: adjustment.unitCost
      })

      return updatedAdjustment
    })

    // Get the updated adjustment with relations
    const finalAdjustment = await prisma.inventoryAdjustment.findUnique({
      where: { id: params.id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
            description: true
          }
        },
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
            type: true
          }
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        approvedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: finalAdjustment,
      message: "Inventory adjustment approved successfully"
    })
  } catch (error) {
    console.error("Error approving inventory adjustment:", error)
    return NextResponse.json(
      { success: false, message: "Failed to approve inventory adjustment" },
      { status: 500 }
    )
  }
}

async function updateStockQuantity(
  prisma: any,
  params: {
    productId: string
    warehouseId: string
    locationId?: string | null
    newQuantity: number
    unitCost?: number | null
  }
) {
  const { productId, warehouseId, locationId, newQuantity, unitCost } = params

  // Find existing stock quantity
  const existingStock = await prisma.stockQuantity.findFirst({
    where: {
      productId,
      warehouseId,
      locationId
    }
  })

  if (existingStock) {
    // Update existing stock
    await prisma.stockQuantity.update({
      where: { id: existingStock.id },
      data: {
        quantity: newQuantity,
        ...(unitCost && { unitCost }),
        lastUpdated: new Date()
      }
    })
  } else {
    // Create new stock quantity (only for positive quantities)
    if (newQuantity > 0) {
      await prisma.stockQuantity.create({
        data: {
          productId,
          warehouseId,
          locationId,
          quantity: newQuantity,
          reservedQuantity: 0,
          unitCost: unitCost || 0,
          lastUpdated: new Date()
        }
      })
    }
  }
} 