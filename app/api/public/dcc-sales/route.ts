import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    console.log("[PUBLIC_DCC_SALES_GET] Starting request...")

    // Get query parameters
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const productId = searchParams.get('productId')
    const dccId = searchParams.get('dccId')

    // Build where conditions
    const whereConditions: any = {}

    if (startDate && endDate) {
      whereConditions.saleDate = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }

    if (productId) {
      whereConditions.productId = productId
    }

    if (dccId) {
      whereConditions.dccId = dccId
    }

    // Get all sales with product and DCC details
    const sales = await prisma.sale.findMany({
      where: whereConditions,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            commission: true,
            category: true,
            image: true
          }
        },
        dcc: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        saleDate: 'desc'
      },
      skip,
      take: limit
    })

    // Transform sales to include three-tier pricing and public-friendly data
    const transformedSales = sales.map(sale => {
      const salesPrice = sale.product.price
      const commission = sale.product.commission || 0
      const purchasePrice = salesPrice - commission // Purchase price = sales price - commission
      const totalCommission = (sale.totalRevenue || 0) - (sale.totalCost || 0)
      
      return {
        id: sale.id,
        dccId: sale.dccId,
        productId: sale.productId,
        quantity: sale.quantity,
        salePrice: sale.salePrice,
        totalRevenue: sale.totalRevenue,
        costPrice: sale.costPrice,
        totalCost: sale.totalCost,
        profit: sale.profit,
        totalCommission: totalCommission,
        customerName: sale.customerName,
        customerPhone: sale.customerPhone,
        notes: sale.notes,
        saleDate: sale.saleDate,
        createdAt: sale.createdAt,
        updatedAt: sale.updatedAt,
        product: {
          id: sale.product.id,
          name: sale.product.name,
          price: sale.product.price,
          commission: sale.product.commission,
          category: sale.product.category,
          image: sale.product.image
        },
        dcc: {
          id: sale.dcc.id,
          name: sale.dcc.name,
          email: sale.dcc.email
        },
        pricing: {
          salesPrice,
          purchasePrice,
          commission
        }
      }
    })

    // Get total count for pagination
    const total = await prisma.sale.count({
      where: whereConditions
    })

    // Calculate summary statistics
    const summary = {
      totalSales: total,
      totalRevenue: transformedSales.reduce((sum, sale) => sum + sale.totalRevenue, 0),
      totalCommission: transformedSales.reduce((sum, sale) => sum + sale.totalCommission, 0),
      averageSalePrice: transformedSales.length > 0 ? transformedSales.reduce((sum, sale) => sum + sale.salePrice, 0) / transformedSales.length : 0,
      totalQuantity: transformedSales.reduce((sum, sale) => sum + sale.quantity, 0)
    }

    // Get unique DCCs and products for filtering
    const uniqueDCCs = await prisma.user.findMany({
      where: {
        userRole: {
          role: {
            name: "DCC"
          }
        },
        isActive: true
      },
      select: {
        id: true,
        name: true,
        email: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    const uniqueProducts = await prisma.product.findMany({
      where: {
        isActive: true,
        status: "active"
      },
      select: {
        id: true,
        name: true,
        category: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json({
      success: true,
      message: "DCC sales retrieved successfully",
      data: {
        sales: transformedSales,
        summary,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        },
        filters: {
          dccs: uniqueDCCs,
          products: uniqueProducts
        }
      }
    })

  } catch (error) {
    console.error("[PUBLIC_DCC_SALES_GET] Error:", error)
    return NextResponse.json({ 
      success: false, 
      message: error instanceof Error ? error.message : "Failed to fetch DCC sales" 
    }, { status: 500 })
  }
}

export async function POST(req: Request) {
  return NextResponse.json({ 
    success: false, 
    message: "POST method not allowed for public DCC sales endpoint" 
  }, { status: 405 })
}
