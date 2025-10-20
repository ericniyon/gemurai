import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'
import { verifyToken } from '@/lib/token'

interface DCCStockData {
  dccId: string
  dccName: string
  dccEmail: string
  dccPhone: string
  dccLocation: string
  totalProducts: number
  totalQuantity: number
  totalValue: number
  totalOrderValue: number
  lowStockItems: number
  outOfStockItems: number
  stockItems: {
    productId: string
    productName: string
    productPrice: number
    purchasePrice: number
    quantity: number
    status: 'in-stock' | 'low-stock' | 'out-of-stock'
    stockValue: number
    category: string
    description: string
  }[]
  orderItems: {
    productId: string
    productName: string
    productPrice: number
    purchasePrice: number
    orderedQuantity: number
    orderDate: Date
    orderValue: number
    category: string
  }[]
}

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyToken(request)
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ 
        success: false, 
        message: "Unauthorized" 
      }, { status: 401 })
    }

    const user = authResult.user
    const userRole = user.role

    console.log("[EMPLOYER_DCC_STOCK_GET] User role:", userRole)

    // Only allow EMPLOYER and BRANCH_MANAGER users to access this endpoint
    if (!["EMPLOYER", "BRANCH_MANAGER"].includes(userRole)) {
      console.log("[EMPLOYER_DCC_STOCK_GET] Access denied for role:", userRole)
      return NextResponse.json({ 
        success: false, 
        message: "Only EMPLOYER and BRANCH_MANAGER users can access DCC stock data" 
      }, { status: 403 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit
    const search = searchParams.get('search') || ''
    const minStock = parseInt(searchParams.get('minStock') || '0')
    const sortBy = searchParams.get('sortBy') || 'dccName'
    const sortOrder = searchParams.get('sortOrder') || 'asc'

    // Build where conditions for DCC search
    const dccWhereConditions: any = {
      userRole: {
        role: { name: "DCC" }
      }
    }

    // Add search condition if provided
    if (search) {
      dccWhereConditions.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Get all DCCs with their stock data
    const dccs = await prisma.user.findMany({
      where: dccWhereConditions,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        location: true,
        dccStock: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                commission: true,
                category: true,
                description: true
              }
            }
          }
        },
        stockOrders: {
          where: {
            status: 'COMPLETED'
          },
          include: {
            items: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    price: true,
                    commission: true,
                    category: true
                  }
                }
              }
            }
          }
        }
      },
      skip,
      take: limit,
      orderBy: sortBy === 'dccName' ? { firstName: sortOrder } : 
               sortBy === 'totalQuantity' ? { dccStock: { _count: 'desc' } } :
               { createdAt: 'desc' }
    })

    // Process DCC stock data
    const dccStockData: DCCStockData[] = dccs.map(dcc => {
      // Process current stock items
      const stockItems = dcc.dccStock.map(stock => {
        const status = stock.quantity === 0 ? 'out-of-stock' : 
                      stock.quantity <= 5 ? 'low-stock' : 'in-stock'
        
        // Calculate purchase price (price - commission)
        const purchasePrice = stock.product.price - (stock.product.commission || 0)
        const stockValue = purchasePrice * stock.quantity
        
        return {
          productId: stock.product.id,
          productName: stock.product.name,
          productPrice: stock.product.price,
          purchasePrice: purchasePrice,
          quantity: stock.quantity,
          status,
          stockValue: stockValue,
          category: stock.product.category,
          description: stock.product.description
        }
      })

      // Process completed orders to show order history
      const orderItems = dcc.stockOrders.flatMap(order => 
        order.items.map(item => ({
          productId: item.product.id,
          productName: item.product.name,
          productPrice: item.product.price,
          purchasePrice: item.product.price - (item.product.commission || 0),
          orderedQuantity: item.quantity,
          orderDate: order.createdAt,
          orderValue: (item.product.price - (item.product.commission || 0)) * item.quantity,
          category: item.product.category
        }))
      )

      // Calculate totals
      const totalProducts = stockItems.length
      const totalQuantity = stockItems.reduce((sum, item) => sum + item.quantity, 0)
      const totalValue = stockItems.reduce((sum, item) => sum + item.stockValue, 0)
      const totalOrderValue = orderItems.reduce((sum, item) => sum + item.orderValue, 0)
      const lowStockItems = stockItems.filter(item => item.status === 'low-stock').length
      const outOfStockItems = stockItems.filter(item => item.status === 'out-of-stock').length

      return {
        dccId: dcc.id,
        dccName: `${dcc.firstName} ${dcc.lastName}`,
        dccEmail: dcc.email,
        dccPhone: dcc.phone || '',
        dccLocation: dcc.location || '',
        totalProducts,
        totalQuantity,
        totalValue,
        totalOrderValue,
        lowStockItems,
        outOfStockItems,
        stockItems,
        orderItems
      }
    })

    // Filter by minimum stock if specified
    const filteredDccStockData = minStock > 0 
      ? dccStockData.filter(dcc => dcc.totalQuantity >= minStock)
      : dccStockData

    // Get total count for pagination
    const totalDccs = await prisma.user.count({
      where: dccWhereConditions
    })

    // Calculate summary statistics
    const summary = {
      totalDCCs: totalDccs,
      totalProducts: filteredDccStockData.reduce((sum, dcc) => sum + dcc.totalProducts, 0),
      totalQuantity: filteredDccStockData.reduce((sum, dcc) => sum + dcc.totalQuantity, 0),
      totalValue: filteredDccStockData.reduce((sum, dcc) => sum + dcc.totalValue, 0),
      totalOrderValue: filteredDccStockData.reduce((sum, dcc) => sum + dcc.totalOrderValue, 0),
      dccsWithLowStock: filteredDccStockData.filter(dcc => dcc.lowStockItems > 0).length,
      dccsWithOutOfStock: filteredDccStockData.filter(dcc => dcc.outOfStockItems > 0).length
    }

    return NextResponse.json({
      success: true,
      data: {
        dccStockData: filteredDccStockData,
        summary,
        pagination: {
          page,
          limit,
          total: totalDccs,
          totalPages: Math.ceil(totalDccs / limit)
        }
      }
    })

  } catch (error) {
    console.error('[EMPLOYER_DCC_STOCK_GET] Error:', error)
    return NextResponse.json({ 
      success: false, 
      message: "Internal server error" 
    }, { status: 500 })
  }
}

