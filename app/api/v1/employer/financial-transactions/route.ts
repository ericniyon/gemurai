import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuthToken } from "@/lib/api-auth"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { cookies } from "next/headers"

export async function GET(req: NextRequest) {
  try {
    console.log("[EMPLOYER_FINANCIAL_TRANSACTIONS_GET] Starting request...")
    let user = null;
    
    // Try token auth first
    const authHeader = req.headers.get("Authorization")
    let token = null

    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1]
    }
    
    if (!token) {
      const cookieStore = await cookies()
      token = cookieStore.get("Gemurai_token")?.value || cookieStore.get("token")?.value
    }

    if (token) {
      const verifiedUser = await verifyAuthToken(token)
      if (verifiedUser) {
        user = verifiedUser
      }
    }

    if (!user) {
      const session = await getServerSession(authOptions)
      if (session?.user?.id) {
        user = session.user
      }
    }

    if (!user?.id) {
      return NextResponse.json({ 
        success: false, 
        message: "Unauthorized. Please log in." 
      }, { status: 401 })
    }

    // Verify user is EMPLOYER
    const dbUser = await prisma.user.findUnique({
      where: { 
        id: user.id,
        isActive: true
      },
      include: {
        userRole: {
          include: {
            role: true
          }
        }
      }
    })

    if (!dbUser || (dbUser.userRole?.role?.name !== "EMPLOYER" && dbUser.userRole?.role?.name !== "BRANCH_MANAGER")) {
      return NextResponse.json({ 
        success: false, 
        message: "Only EMPLOYER and BRANCH_MANAGER users can access financial transactions" 
      }, { status: 403 })
    }

    // Get query parameters
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Get all financial transactions - stock orders, wallet transactions, and general transactions
    const userRole = dbUser.userRole?.role?.name;
    
    // Build where clause based on user role
    let whereClause;
    if (userRole === "BRANCH_MANAGER") {
      // Branch Managers see ALL financial transactions
      whereClause = {
        OR: [
          { status: "payment_confirmed" },
          { status: "pending" },
          { status: "completed" }
        ]
      };
    } else {
      // Employers see only their product transactions
      whereClause = {
        OR: [
          {
            status: "payment_confirmed",
            products: {
              some: {
                product: {
                  sellerId: user.id
                }
              }
            }
          },
          {
            status: "pending",
            products: {
              some: {
                product: {
                  sellerId: user.id
                }
              }
            }
          },
          {
            status: "completed",
            products: {
              some: {
                product: {
                  sellerId: user.id
                }
              }
            }
          }
        ]
      };
    }
    
    const stockOrders = await prisma.stockOrder.findMany({
      where: whereClause,
      include: {
        dcc: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        products: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                description: true,
                price: true,
                stock: true,
                image: true,
                images: true,
                category: true,
                commission: true
              }
            }
          }
        },
        payment: {
          select: {
            id: true,
            status: true,
            amount: true,
            method: true,
            paidAt: true,
            createdAt: true
          }
        },
        paymentConfirmedByUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        paymentConfirmedAt: 'desc'
      },
      skip,
      take: limit
    })

    // Get total count for pagination
    const total = await prisma.stockOrder.count({
      where: whereClause
    })

    // Transform data to include summary information with commission calculations
    const transformedData = stockOrders.map(order => {
      // Calculate commission for each product in the order
      const productsWithCommission = order.products.map(product => {
        const salesPrice = product.product.price
        const purchasePrice = product.product.commission || 0
        const commission = salesPrice - purchasePrice
        const totalCommission = commission * product.quantity
        const purchasePriceTotal = purchasePrice * product.quantity
        const salesPriceTotal = salesPrice * product.quantity
        
        return {
          id: product.id,
          productId: product.productId,
          quantity: product.quantity,
          price: product.price,
          product: product.product,
          commission: commission,
          totalCommission: totalCommission,
          purchasePrice: purchasePriceTotal,
          salesPrice: salesPriceTotal
        }
      })

      // Calculate total commission for the order
      const totalCommission = productsWithCommission.reduce((sum, product) => sum + product.totalCommission, 0)
      const totalPurchasePrice = productsWithCommission.reduce((sum, product) => sum + product.purchasePrice, 0)
      const totalSalesPrice = productsWithCommission.reduce((sum, product) => sum + product.salesPrice, 0)

      return {
        id: order.id,
        dcc: order.dcc,
        totalAmount: order.totalAmount,
        totalCommission: totalCommission,
        totalPurchasePrice: totalPurchasePrice,
        totalSalesPrice: totalSalesPrice,
        status: order.status,
        requestDate: order.requestDate,
        paymentConfirmedAt: order.paymentConfirmedAt,
        paymentConfirmedBy: order.paymentConfirmedByUser,
        products: productsWithCommission,
        payment: order.payment
      }
    })

    // Calculate summary statistics
    const totalAmount = stockOrders.reduce((sum, order) => sum + order.totalAmount, 0)
    const totalOrders = stockOrders.length
    const totalCommission = transformedData.reduce((sum, order) => sum + order.totalCommission, 0)
    const totalPurchasePrice = transformedData.reduce((sum, order) => sum + order.totalPurchasePrice, 0)

    return NextResponse.json({
      success: true,
      data: {
        stockOrders: transformedData,
        summary: {
          totalOrders,
          totalAmount,
          totalCommission,
          totalPurchasePrice,
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    })

  } catch (error) {
    console.error("[EMPLOYER_FINANCIAL_TRANSACTIONS_GET] Error:", error)
    return NextResponse.json({ 
      success: false, 
      message: "Failed to fetch financial transactions" 
    }, { status: 500 })
  }
}
