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
    const hasPermission = await checkInventoryPermission(auth.userId, "inventory.move.confirm")
    if (!hasPermission) {
      return NextResponse.json(
        { success: false, message: "Permission denied" },
        { status: 403 }
      )
    }

    // Get the stock move
    const stockMove = await prisma.stockMove.findUnique({
      where: { id: params.id },
      include: {
        product: true,
        fromWarehouse: true,
        toWarehouse: true,
        fromLocation: true,
        toLocation: true
      }
    })

    if (!stockMove) {
      return NextResponse.json(
        { success: false, message: "Stock move not found" },
        { status: 404 }
      )
    }

    if (stockMove.status !== 'PENDING') {
      return NextResponse.json(
        { success: false, message: "Stock move is not pending" },
        { status: 400 }
      )
    }

    // Execute the stock move in a transaction
    const result = await prisma.$transaction(async (prisma) => {
      // Update stock move status
      const updatedStockMove = await prisma.stockMove.update({
        where: { id: params.id },
        data: {
          status: 'CONFIRMED',
          executedAt: new Date(),
          confirmedBy: auth.userId
        }
      })

      // Handle stock quantity updates based on move type
      if (stockMove.type === 'IN') {
        // Stock IN - Add to destination
        await upsertStockQuantity(prisma, {
          productId: stockMove.productId,
          warehouseId: stockMove.toWarehouseId!,
          locationId: stockMove.toLocationId,
          quantityChange: stockMove.quantity,
          unitCost: stockMove.unitCost
        })
      } else if (stockMove.type === 'OUT') {
        // Stock OUT - Remove from source
        await upsertStockQuantity(prisma, {
          productId: stockMove.productId,
          warehouseId: stockMove.fromWarehouseId!,
          locationId: stockMove.fromLocationId,
          quantityChange: -stockMove.quantity,
          unitCost: stockMove.unitCost
        })
      } else if (stockMove.type === 'TRANSFER') {
        // Stock TRANSFER - Remove from source and add to destination
        await upsertStockQuantity(prisma, {
          productId: stockMove.productId,
          warehouseId: stockMove.fromWarehouseId!,
          locationId: stockMove.fromLocationId,
          quantityChange: -stockMove.quantity,
          unitCost: stockMove.unitCost
        })
        
        await upsertStockQuantity(prisma, {
          productId: stockMove.productId,
          warehouseId: stockMove.toWarehouseId!,
          locationId: stockMove.toLocationId,
          quantityChange: stockMove.quantity,
          unitCost: stockMove.unitCost
        })
      }

      return updatedStockMove
    })

    // Get the updated stock move with relations
    const finalStockMove = await prisma.stockMove.findUnique({
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
        fromWarehouse: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        toWarehouse: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        fromLocation: {
          select: {
            id: true,
            name: true,
            type: true
          }
        },
        toLocation: {
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
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: finalStockMove,
      message: "Stock move confirmed successfully"
    })
  } catch (error) {
    console.error("Error confirming stock move:", error)
    return NextResponse.json(
      { success: false, message: "Failed to confirm stock move" },
      { status: 500 }
    )
  }
}

async function upsertStockQuantity(
  prisma: any,
  params: {
    productId: string
    warehouseId: string
    locationId?: string | null
    quantityChange: number
    unitCost?: number | null
  }
) {
  const { productId, warehouseId, locationId, quantityChange, unitCost } = params

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
    const newQuantity = existingStock.quantity + quantityChange
    
    if (newQuantity < 0) {
      throw new Error(`Insufficient stock. Available: ${existingStock.quantity}, Requested: ${Math.abs(quantityChange)}`)
    }

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
    if (quantityChange > 0) {
      await prisma.stockQuantity.create({
        data: {
          productId,
          warehouseId,
          locationId,
          quantity: quantityChange,
          reservedQuantity: 0,
          unitCost: unitCost || 0,
          lastUpdated: new Date()
        }
      })
    } else {
      throw new Error(`No existing stock to deduct from`)
    }
  }
} 