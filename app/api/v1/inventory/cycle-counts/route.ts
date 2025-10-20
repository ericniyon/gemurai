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
    const status = url.searchParams.get("status")
    const warehouseId = url.searchParams.get("warehouseId")
    const dateFrom = url.searchParams.get("dateFrom")
    const dateTo = url.searchParams.get("dateTo")

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    if (status) {
      where.status = status
    }
    if (warehouseId) {
      where.warehouseId = warehouseId
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { reference: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
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

    const [cycleCounts, total] = await Promise.all([
      prisma.cycleCount.findMany({
        where,
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
          _count: {
            select: {
              items: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.cycleCount.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: cycleCounts,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error("Error fetching cycle counts:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch cycle counts" },
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
    const hasPermission = await checkInventoryPermission(auth.userId, "inventory.manage")
    if (!hasPermission) {
      return NextResponse.json(
        { success: false, message: "Permission denied" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      name,
      reference,
      description,
      warehouseId,
      locationId,
      scheduledDate,
      items = []
    } = body

    // Validate required fields
    if (!name || !warehouseId) {
      return NextResponse.json(
        { success: false, message: "Name and warehouse are required" },
        { status: 400 }
      )
    }

    // Verify warehouse exists
    const warehouse = await prisma.warehouse.findUnique({
      where: { id: warehouseId }
    })

    if (!warehouse) {
      return NextResponse.json(
        { success: false, message: "Warehouse not found" },
        { status: 404 }
      )
    }

    // Verify location exists if provided
    if (locationId) {
      const location = await prisma.location.findUnique({
        where: { id: locationId }
      })

      if (!location || location.warehouseId !== warehouseId) {
        return NextResponse.json(
          { success: false, message: "Invalid location for the specified warehouse" },
          { status: 400 }
        )
      }
    }

    // Create cycle count in a transaction
    const cycleCount = await prisma.$transaction(async (prisma) => {
      // Create the cycle count
      const newCycleCount = await prisma.cycleCount.create({
        data: {
          name,
          reference,
          description,
          warehouseId,
          locationId,
          scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
          status: 'SCHEDULED',
          userId: auth.userId
        }
      })

      // If items are provided, create cycle count items
      if (items.length > 0) {
        const cycleCountItems = await Promise.all(
          items.map(async (item: any) => {
            const { productId, expectedQuantity } = item

            // Verify product exists
            const product = await prisma.product.findUnique({
              where: { id: productId }
            })

            if (!product) {
              throw new Error(`Product with ID ${productId} not found`)
            }

            // Get current stock quantity
            const currentStock = await prisma.stockQuantity.findFirst({
              where: {
                productId,
                warehouseId,
                locationId
              }
            })

            return {
              cycleCountId: newCycleCount.id,
              productId,
              expectedQuantity: expectedQuantity || currentStock?.quantity || 0,
              actualQuantity: null,
              variance: null,
              status: 'PENDING'
            }
          })
        )

        await prisma.cycleCountItem.createMany({
          data: cycleCountItems
        })
      }

      return newCycleCount
    })

    // Get the created cycle count with relations
    const finalCycleCount = await prisma.cycleCount.findUnique({
      where: { id: cycleCount.id },
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
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                description: true
              }
            }
          }
        },
        _count: {
          select: {
            items: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: finalCycleCount,
      message: "Cycle count created successfully"
    }, { status: 201 })
  } catch (error) {
    console.error("Error creating cycle count:", error)
    return NextResponse.json(
      { success: false, message: "Failed to create cycle count" },
      { status: 500 }
    )
  }
} 