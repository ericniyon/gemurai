import { NextRequest, NextResponse } from "next/server"
import { verifyAuthToken } from "@/lib/token"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ 
        success: false, 
        message: "Authentication token required" 
      }, { status: 401 })
    }

    const token = authHeader.substring(7)
    console.log("[EXCHANGE_REQUEST_API] Token received:", !!token)
    
    const decoded = await verifyAuthToken(token)
    console.log("[EXCHANGE_REQUEST_API] Decoded token:", decoded)
    
    if (!decoded || !decoded.id) {
      console.log("[EXCHANGE_REQUEST_API] Token verification failed")
      return NextResponse.json({ 
        success: false, 
        message: "Invalid authentication token" 
      }, { status: 401 })
    }

    // Check if user is DCC
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: {
        userRole: {
          include: {
            role: true
          }
        }
      }
    })

    console.log("[EXCHANGE_REQUEST_API] User found:", !!user)
    console.log("[EXCHANGE_REQUEST_API] User role:", user?.userRole?.role?.name)
    
    if (!user || user.userRole?.role?.name !== "DCC") {
      console.log("[EXCHANGE_REQUEST_API] User role check failed")
      return NextResponse.json({ 
        success: false, 
        message: "Only DCC users can request stock exchanges" 
      }, { status: 403 })
    }

    const body = await request.json()
    const {
      stockOrderId,
      currentProductId,
      requestedProductId,
      currentQuantity,
      requestedQuantity,
      reason
    } = body

    // Validate required fields
    if (!stockOrderId || !currentProductId || !requestedProductId || !reason) {
      return NextResponse.json({ 
        success: false, 
        message: "Missing required fields" 
      }, { status: 400 })
    }

    if (currentQuantity < 1 || requestedQuantity < 1) {
      return NextResponse.json({ 
        success: false, 
        message: "Quantities must be at least 1" 
      }, { status: 400 })
    }

    // Verify the stock order belongs to the DCC
    const stockOrder = await prisma.stockOrder.findFirst({
      where: {
        id: stockOrderId,
        dccId: decoded.id
      },
      include: {
        products: {
          include: {
            product: true
          }
        }
      }
    })

    if (!stockOrder) {
      return NextResponse.json({ 
        success: false, 
        message: "Stock order not found or access denied" 
      }, { status: 404 })
    }

    // Verify the current product exists in the order
    const currentProductInOrder = stockOrder.products.find(
      p => p.productId === currentProductId
    )

    if (!currentProductInOrder) {
      return NextResponse.json({ 
        success: false, 
        message: "Current product not found in the order" 
      }, { status: 400 })
    }

    // Verify the requested product exists
    const requestedProduct = await prisma.product.findUnique({
      where: { id: requestedProductId }
    })

    if (!requestedProduct) {
      return NextResponse.json({ 
        success: false, 
        message: "Requested product not found" 
      }, { status: 404 })
    }

    // Check if quantity is available
    if (currentQuantity > currentProductInOrder.quantity) {
      return NextResponse.json({ 
        success: false, 
        message: "Requested quantity exceeds available quantity in order" 
      }, { status: 400 })
    }

    // Create exchange request
    const exchangeRequest = await prisma.stockExchangeRequest.create({
      data: {
        dccId: decoded.id,
        stockOrderId,
        currentProductId,
        requestedProductId,
        currentQuantity,
        requestedQuantity,
        reason: reason.trim(),
        status: "pending"
      },
      include: {
        currentProduct: true,
        requestedProduct: true,
        stockOrder: {
          include: {
            dcc: true
          }
        }
      }
    })

    console.log("[EXCHANGE_REQUEST] Created exchange request:", exchangeRequest.id)

    return NextResponse.json({
      success: true,
      message: "Exchange request submitted successfully",
      data: {
        id: exchangeRequest.id,
        status: exchangeRequest.status,
        currentProduct: {
          id: exchangeRequest.currentProduct.id,
          name: exchangeRequest.currentProduct.name,
          price: exchangeRequest.currentProduct.price
        },
        requestedProduct: {
          id: exchangeRequest.requestedProduct.id,
          name: exchangeRequest.requestedProduct.name,
          price: exchangeRequest.requestedProduct.price
        },
        currentQuantity: exchangeRequest.currentQuantity,
        requestedQuantity: exchangeRequest.requestedQuantity,
        reason: exchangeRequest.reason,
        createdAt: exchangeRequest.createdAt
      }
    })

  } catch (error) {
    console.error("[EXCHANGE_REQUEST] Error:", error)
    return NextResponse.json({ 
      success: false, 
      message: "Internal server error" 
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ 
        success: false, 
        message: "Authentication token required" 
      }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = await verifyAuthToken(token)
    
    if (!decoded || !decoded.id) {
      return NextResponse.json({ 
        success: false, 
        message: "Invalid authentication token" 
      }, { status: 401 })
    }

    // Get user role
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: {
        userRole: {
          include: {
            role: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ 
        success: false, 
        message: "User not found" 
      }, { status: 404 })
    }

    const userRole = user.userRole?.role?.name

    // Build query based on user role
    let whereClause: any = {}

    if (userRole === "DCC") {
      // DCC can only see their own exchange requests
      whereClause.dccId = decoded.id
    } else if (userRole === "EMPLOYER" || userRole === "ADMIN" || userRole === "SUPER_ADMIN") {
      // Employers and admins can see all exchange requests
      // No additional where clause needed
    } else {
      return NextResponse.json({ 
        success: false, 
        message: "Insufficient permissions" 
      }, { status: 403 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const offset = (page - 1) * limit

    if (status && status !== "all") {
      whereClause.status = status
    }

    // Fetch exchange requests
    const [exchangeRequests, totalCount] = await Promise.all([
      prisma.stockExchangeRequest.findMany({
        where: whereClause,
        include: {
          currentProduct: true,
          requestedProduct: true,
          stockOrder: {
            include: {
              dcc: true
            }
          },
          dcc: true
        },
        orderBy: { createdAt: "desc" },
        skip: offset,
        take: limit
      }),
      prisma.stockExchangeRequest.count({ where: whereClause })
    ])

    return NextResponse.json({
      success: true,
      data: exchangeRequests,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    })

  } catch (error) {
    console.error("[EXCHANGE_REQUEST] Error:", error)
    return NextResponse.json({ 
      success: false, 
      message: "Internal server error" 
    }, { status: 500 })
  }
}
