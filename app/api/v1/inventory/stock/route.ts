import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { verifyAuthToken } from "@/lib/api-auth"
import { checkMCCPermission } from "@/lib/mcc-auth"

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

  const roleName = user?.userRole?.role?.name ?? null
  const permissions = user?.userRole?.role?.rolePermissions?.map(rp => rp.permission.name) ?? []

  // Super admin and employer have all permissions
  if (roleName === 'SUPER_ADMIN' || roleName === 'EMPLOYER') {
    return true
  }

  // Check if user has the specific permission via role
  if (permissions.includes(permission)) {
    return true
  }

  // Check wildcard
  if (permissions.includes('*')) {
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

    // Check permission: role-based inventory.manage OR MCC user with mcc.inventory.view / mcc.inventory.manage
    let hasPermission = await checkInventoryPermission(auth.userId, "inventory.manage")
    if (!hasPermission) {
      const authHeader = request.headers.get("authorization")
      const token = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null
      if (token) {
        const [viewRes, manageRes] = await Promise.all([
          checkMCCPermission(token, "mcc.inventory.view"),
          checkMCCPermission(token, "mcc.inventory.manage"),
        ])
        hasPermission = viewRes.authorized || manageRes.authorized
      }
    }
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
    const warehouseId = url.searchParams.get("warehouseId")
    const locationId = url.searchParams.get("locationId")
    const productId = url.searchParams.get("productId")
    const lowStock = url.searchParams.get("lowStock") === 'true'

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    if (warehouseId) {
      where.warehouseId = warehouseId
    }
    if (locationId) {
      where.locationId = locationId
    }
    if (productId) {
      where.productId = productId
    }
    if (search) {
      where.product = {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { internalReference: { contains: search, mode: 'insensitive' } }
        ]
      }
    }

    // Get stock quantities
    let stockQuery = prisma.stockQuantity.findMany({
      where,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            internalReference: true,
            description: true,
            price: true,
            category: true
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
            locationType: true
          }
        }
      },
      orderBy: [
        { product: { name: 'asc' } },
        { warehouse: { name: 'asc' } },
        { location: { name: 'asc' } }
      ],
      skip,
      take: limit
    })

    const [stockQuantities, total] = await Promise.all([
      stockQuery,
      prisma.stockQuantity.count({ where })
    ])

    // Calculate available quantities and identify low stock items
    const stockWithAvailability = stockQuantities.map(stock => {
      const available = stock.quantity - stock.reservedQuantity
      const isLowStock = available <= (stock.minQuantity || 0)
      
      return {
        ...stock,
        available,
        isLowStock
      }
    })

    // Filter for low stock if requested
    const filteredStock = lowStock 
      ? stockWithAvailability.filter(stock => stock.isLowStock)
      : stockWithAvailability

    // Get summary statistics
    const summaryStats = await prisma.stockQuantity.aggregate({
      where,
      _sum: {
        quantity: true,
        reservedQuantity: true
      },
      _count: {
        id: true
      }
    })

    return NextResponse.json({
      success: true,
      data: filteredStock,
      meta: {
        page,
        limit,
        total: lowStock ? filteredStock.length : total,
        totalPages: Math.ceil((lowStock ? filteredStock.length : total) / limit)
      },
      summary: {
        totalItems: summaryStats._count.id,
        totalQuantity: summaryStats._sum.quantity || 0,
        totalReserved: summaryStats._sum.reservedQuantity || 0,
        totalAvailable: (summaryStats._sum.quantity || 0) - (summaryStats._sum.reservedQuantity || 0)
      }
    })
  } catch (error) {
    console.error("Error fetching stock:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch stock" },
      { status: 500 }
    )
  }
} 