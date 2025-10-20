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
  
  // Super admin and employer have all permissions for moves
  if (roleName === 'SUPER_ADMIN' || roleName === 'EMPLOYER') {
    console.log(`✅ Access granted - ${roleName} role for inventory moves`)
    return true
  }

  // ADMIN and other roles are NOT system users - deny access
  console.log("❌ Access denied - Only SUPER_ADMIN or EMPLOYER can manage inventory moves")
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

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthenticatedUser(request)
    if (!auth) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    // Check permission
    const hasPermission = await checkInventoryPermission(auth.userId, "inventory.manage")
    if (!hasPermission) {
      return NextResponse.json(
        { success: false, message: "Permission denied" },
        { status: 403 }
      )
    }

    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get("page") || "1")
    const limit = parseInt(url.searchParams.get("limit") || "10")
    const search = url.searchParams.get("search") || ""
    const type = url.searchParams.get("type")
    const status = url.searchParams.get("status")
    const warehouseId = url.searchParams.get("warehouseId")
    const dateFrom = url.searchParams.get("dateFrom")
    const dateTo = url.searchParams.get("dateTo")

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    if (type) {
      where.type = type
    }
    if (status) {
      where.status = status
    }
    if (warehouseId) {
      where.OR = [
        { fromWarehouseId: warehouseId },
        { toWarehouseId: warehouseId }
      ]
    }
    if (search) {
      where.OR = [
        { reference: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { product: { name: { contains: search, mode: 'insensitive' } } },
        { product: { sku: { contains: search, mode: 'insensitive' } } }
      ]
    }
    if (dateFrom || dateTo) {
      where.createdAt = {}
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom)
      }
      if (dateTo) {
        where.createdAt.lte = new Date(dateTo)
      }
    }

    const [stockMoves, total] = await Promise.all([
      prisma.stockMove.findMany({
        where,
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
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.stockMove.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: stockMoves,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error("Error fetching stock moves:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch stock moves" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthenticatedUser(request)
    if (!auth) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    // Check permission
    const hasPermission = await checkInventoryPermission(auth.userId, "inventory.move.create")
    if (!hasPermission) {
      return NextResponse.json(
        { success: false, message: "Permission denied" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      type,
      productId,
      quantity,
      fromWarehouseId,
      toWarehouseId,
      fromLocationId,
      toLocationId,
      reference,
      description,
      unitCost,
      totalCost,
      executedAt
    } = body

    // Validate required fields
    if (!type || !productId || !quantity) {
      return NextResponse.json(
        { success: false, message: "Type, product, and quantity are required" },
        { status: 400 }
      )
    }

    // Validate quantity
    if (quantity <= 0) {
      return NextResponse.json(
        { success: false, message: "Quantity must be greater than 0" },
        { status: 400 }
      )
    }

    // Validate warehouses/locations based on move type
    if (type === 'TRANSFER') {
      if (!fromWarehouseId || !toWarehouseId) {
        return NextResponse.json(
          { success: false, message: "Transfer requires both from and to warehouses" },
          { status: 400 }
        )
      }
      if (fromWarehouseId === toWarehouseId && fromLocationId === toLocationId) {
        return NextResponse.json(
          { success: false, message: "Cannot transfer to the same location" },
          { status: 400 }
        )
      }
    } else if (type === 'IN') {
      if (!toWarehouseId) {
        return NextResponse.json(
          { success: false, message: "Stock in requires destination warehouse" },
          { status: 400 }
        )
      }
    } else if (type === 'OUT') {
      if (!fromWarehouseId) {
        return NextResponse.json(
          { success: false, message: "Stock out requires source warehouse" },
          { status: 400 }
        )
      }
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

    // For OUT and TRANSFER moves, check if sufficient stock is available
    if (type === 'OUT' || type === 'TRANSFER') {
      const stockQuery: any = {
        where: {
          productId,
          warehouseId: fromWarehouseId
        }
      }

      if (fromLocationId) {
        stockQuery.where.locationId = fromLocationId
      }

      const stockQuantities = await prisma.stockQuantity.findMany(stockQuery)
      const totalAvailable = stockQuantities.reduce((sum, stock) => 
        sum + (stock.quantity - stock.reservedQuantity), 0
      )

      if (totalAvailable < quantity) {
        return NextResponse.json(
          { 
            success: false, 
            message: `Insufficient stock. Available: ${totalAvailable}, Requested: ${quantity}` 
          },
          { status: 400 }
        )
      }
    }

    // Create stock move
    const stockMove = await prisma.stockMove.create({
      data: {
        type,
        productId,
        quantity,
        fromWarehouseId,
        toWarehouseId,
        fromLocationId,
        toLocationId,
        reference,
        description,
        unitCost,
        totalCost,
        status: 'PENDING',
        userId: auth.userId,
        executedAt: executedAt ? new Date(executedAt) : null
      },
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
      data: stockMove,
      message: "Stock move created successfully"
    }, { status: 201 })
  } catch (error) {
    console.error("Error creating stock move:", error)
    return NextResponse.json(
      { success: false, message: "Failed to create stock move" },
      { status: 500 }
    )
  }
} 