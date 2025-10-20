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
    const reportType = url.searchParams.get("type") || "overview"
    const warehouseId = url.searchParams.get("warehouseId")
    const dateFrom = url.searchParams.get("dateFrom")
    const dateTo = url.searchParams.get("dateTo")

    // Build date filter
    const dateFilter: any = {}
    if (dateFrom || dateTo) {
      if (dateFrom) {
        dateFilter.gte = new Date(dateFrom)
      }
      if (dateTo) {
        dateFilter.lte = new Date(dateTo)
      }
    }

    let reportData: any = {}

    switch (reportType) {
      case "overview":
        reportData = await getOverviewReport(warehouseId, dateFilter)
        break
      case "stock-levels":
        reportData = await getStockLevelsReport(warehouseId)
        break
      case "low-stock":
        reportData = await getLowStockReport(warehouseId)
        break
      case "stock-movements":
        reportData = await getStockMovementsReport(warehouseId, dateFilter)
        break
      case "inventory-value":
        reportData = await getInventoryValueReport(warehouseId)
        break
      case "abc-analysis":
        reportData = await getABCAnalysisReport(warehouseId, dateFilter)
        break
      default:
        return NextResponse.json(
          { success: false, message: "Invalid report type" },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      data: reportData,
      reportType,
      generatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error("Error generating inventory report:", error)
    return NextResponse.json(
      { success: false, message: "Failed to generate report" },
      { status: 500 }
    )
  }
}

async function getOverviewReport(warehouseId?: string, dateFilter?: any) {
  const whereClause = warehouseId ? { warehouseId } : {}
  const moveWhereClause = warehouseId 
    ? { 
        OR: [
          { fromWarehouseId: warehouseId },
          { toWarehouseId: warehouseId }
        ]
      }
    : {}

  if (dateFilter && Object.keys(dateFilter).length > 0) {
    moveWhereClause.createdAt = dateFilter
  }

  const [
    totalProducts,
    totalWarehouses,
    totalLocations,
    totalStockValue,
    lowStockItems,
    recentMoves,
    pendingAdjustments
  ] = await Promise.all([
    // Total unique products in stock
    prisma.stockQuantity.findMany({
      where: { ...whereClause, quantity: { gt: 0 } },
      select: { productId: true },
      distinct: ['productId']
    }),
    // Total warehouses
    prisma.warehouse.count({
      where: warehouseId ? { id: warehouseId } : {}
    }),
    // Total locations
    prisma.location.count({
      where: warehouseId ? { warehouseId } : {}
    }),
    // Total stock value
    prisma.stockQuantity.aggregate({
      where: whereClause,
      _sum: {
        quantity: true
      }
    }),
    // Low stock items count
    prisma.stockQuantity.count({
      where: {
        ...whereClause,
        quantity: { lte: prisma.stockQuantity.fields.minQuantity }
      }
    }),
    // Recent stock moves
    prisma.stockMove.count({
      where: {
        ...moveWhereClause,
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        }
      }
    }),
    // Pending adjustments
    prisma.inventoryAdjustment.count({
      where: {
        ...whereClause,
        status: 'PENDING'
      }
    })
  ])

  return {
    totalProducts: totalProducts.length,
    totalWarehouses,
    totalLocations,
    totalStockQuantity: totalStockValue._sum.quantity || 0,
    lowStockItems,
    recentMoves,
    pendingAdjustments
  }
}

async function getStockLevelsReport(warehouseId?: string) {
  const whereClause = warehouseId ? { warehouseId } : {}

  const stockLevels = await prisma.stockQuantity.findMany({
    where: whereClause,
    include: {
      product: {
        select: {
          id: true,
          name: true,
          sku: true,
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
          type: true
        }
      }
    },
    orderBy: [
      { product: { name: 'asc' } },
      { warehouse: { name: 'asc' } }
    ]
  })

  const summary = {
    totalItems: stockLevels.length,
    totalQuantity: stockLevels.reduce((sum, item) => sum + item.quantity, 0),
    totalValue: stockLevels.reduce((sum, item) => sum + (item.quantity * (item.unitCost || 0)), 0),
    averageStockLevel: stockLevels.length > 0 
      ? stockLevels.reduce((sum, item) => sum + item.quantity, 0) / stockLevels.length
      : 0
  }

  return {
    summary,
    items: stockLevels
  }
}

async function getLowStockReport(warehouseId?: string) {
  const whereClause = warehouseId ? { warehouseId } : {}

  const lowStockItems = await prisma.stockQuantity.findMany({
    where: {
      ...whereClause,
      OR: [
        { quantity: { lte: prisma.stockQuantity.fields.minQuantity } },
        { quantity: 0 }
      ]
    },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          sku: true,
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
          type: true
        }
      }
    },
    orderBy: [
      { quantity: 'asc' },
      { product: { name: 'asc' } }
    ]
  })

  const outOfStockCount = lowStockItems.filter(item => item.quantity === 0).length
  const lowStockCount = lowStockItems.filter(item => item.quantity > 0).length

  return {
    summary: {
      totalLowStockItems: lowStockItems.length,
      outOfStockItems: outOfStockCount,
      lowStockItems: lowStockCount
    },
    items: lowStockItems
  }
}

async function getStockMovementsReport(warehouseId?: string, dateFilter?: any) {
  const whereClause = warehouseId 
    ? { 
        OR: [
          { fromWarehouseId: warehouseId },
          { toWarehouseId: warehouseId }
        ]
      }
    : {}

  if (dateFilter && Object.keys(dateFilter).length > 0) {
    whereClause.createdAt = dateFilter
  }

  const movements = await prisma.stockMove.findMany({
    where: whereClause,
    include: {
      product: {
        select: {
          id: true,
          name: true,
          sku: true
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
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  const summary = {
    totalMovements: movements.length,
    inMovements: movements.filter(m => m.type === 'IN').length,
    outMovements: movements.filter(m => m.type === 'OUT').length,
    transferMovements: movements.filter(m => m.type === 'TRANSFER').length,
    totalQuantityMoved: movements.reduce((sum, m) => sum + m.quantity, 0)
  }

  return {
    summary,
    movements
  }
}

async function getInventoryValueReport(warehouseId?: string) {
  const whereClause = warehouseId ? { warehouseId } : {}

  const stockWithValues = await prisma.stockQuantity.findMany({
    where: whereClause,
    include: {
      product: {
        select: {
          id: true,
          name: true,
          sku: true,
          category: true,
          price: true
        }
      },
      warehouse: {
        select: {
          id: true,
          name: true,
          code: true
        }
      }
    }
  })

  const valueByCategory = {}
  const valueByWarehouse = {}
  let totalValue = 0

  stockWithValues.forEach(item => {
    const value = item.quantity * (item.unitCost || 0)
    totalValue += value

    // Group by category
    const category = item.product.category || 'Uncategorized'
    if (!valueByCategory[category]) {
      valueByCategory[category] = { quantity: 0, value: 0, items: 0 }
    }
    valueByCategory[category].quantity += item.quantity
    valueByCategory[category].value += value
    valueByCategory[category].items += 1

    // Group by warehouse
    const warehouse = item.warehouse.name
    if (!valueByWarehouse[warehouse]) {
      valueByWarehouse[warehouse] = { quantity: 0, value: 0, items: 0 }
    }
    valueByWarehouse[warehouse].quantity += item.quantity
    valueByWarehouse[warehouse].value += value
    valueByWarehouse[warehouse].items += 1
  })

  return {
    summary: {
      totalValue,
      totalItems: stockWithValues.length,
      totalQuantity: stockWithValues.reduce((sum, item) => sum + item.quantity, 0),
      averageValuePerItem: stockWithValues.length > 0 ? totalValue / stockWithValues.length : 0
    },
    valueByCategory,
    valueByWarehouse,
    items: stockWithValues.map(item => ({
      ...item,
      totalValue: item.quantity * (item.unitCost || 0)
    }))
  }
}

async function getABCAnalysisReport(warehouseId?: string, dateFilter?: any) {
  // This is a simplified ABC analysis based on stock value
  const whereClause = warehouseId ? { warehouseId } : {}

  const stockWithValues = await prisma.stockQuantity.findMany({
    where: whereClause,
    include: {
      product: {
        select: {
          id: true,
          name: true,
          sku: true,
          category: true
        }
      }
    }
  })

  // Calculate values and sort by value descending
  const itemsWithValue = stockWithValues
    .map(item => ({
      ...item,
      totalValue: item.quantity * (item.unitCost || 0)
    }))
    .sort((a, b) => b.totalValue - a.totalValue)

  const totalValue = itemsWithValue.reduce((sum, item) => sum + item.totalValue, 0)
  let cumulativeValue = 0
  let categoryA = 0, categoryB = 0, categoryC = 0

  // Classify items into A, B, C categories
  const classifiedItems = itemsWithValue.map(item => {
    cumulativeValue += item.totalValue
    const cumulativePercentage = (cumulativeValue / totalValue) * 100

    let classification = 'C'
    if (cumulativePercentage <= 80) {
      classification = 'A'
      categoryA++
    } else if (cumulativePercentage <= 95) {
      classification = 'B'
      categoryB++
    } else {
      categoryC++
    }

    return {
      ...item,
      classification,
      valuePercentage: (item.totalValue / totalValue) * 100,
      cumulativePercentage
    }
  })

  return {
    summary: {
      totalItems: itemsWithValue.length,
      totalValue,
      categoryA: { count: categoryA, percentage: (categoryA / itemsWithValue.length) * 100 },
      categoryB: { count: categoryB, percentage: (categoryB / itemsWithValue.length) * 100 },
      categoryC: { count: categoryC, percentage: (categoryC / itemsWithValue.length) * 100 }
    },
    items: classifiedItems
  }
} 