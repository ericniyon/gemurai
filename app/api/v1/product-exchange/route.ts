import { NextRequest, NextResponse } from "next/server"
import { verifyAuthToken } from "@/lib/token"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    // Verify authentication
    const token = req.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Authentication token required" },
        { status: 401 }
      )
    }

    const user = await verifyAuthToken(token)
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Invalid authentication token" },
        { status: 401 }
      )
    }

    // Check if user is DCC
    if (user.role !== "DCC") {
      return NextResponse.json(
        { success: false, message: "Only DCC users can submit exchange requests" },
        { status: 403 }
      )
    }

    const body = await req.json()
    const {
      currentProductId,
      requestedProductId,
      currentQuantity,
      requestedQuantity,
      reason
    } = body

    // Validate required fields
    if (!currentProductId || !requestedProductId || !reason?.trim()) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      )
    }

    if (currentQuantity < 1 || requestedQuantity < 1) {
      return NextResponse.json(
        { success: false, message: "Quantities must be at least 1" },
        { status: 400 }
      )
    }

    // Verify products exist
    const [currentProduct, requestedProduct] = await Promise.all([
      prisma.product.findUnique({
        where: { id: currentProductId },
        include: { seller: true }
      }),
      prisma.product.findUnique({
        where: { id: requestedProductId },
        include: { seller: true }
      })
    ])

    if (!currentProduct || !requestedProduct) {
      return NextResponse.json(
        { success: false, message: "One or both products not found" },
        { status: 404 }
      )
    }

    // Check if DCC has the current product in their stock
    const dccStock = await prisma.dCCStock.findFirst({
      where: {
        dccId: user.id,
        productId: currentProductId
      }
    })

    if (!dccStock || dccStock.quantity < currentQuantity) {
      return NextResponse.json(
        { success: false, message: "Insufficient stock for exchange" },
        { status: 400 }
      )
    }

    // Create exchange request
    const exchangeRequest = await prisma.productExchangeRequest.create({
      data: {
        dccId: user.id,
        currentProductId,
        requestedProductId,
        currentQuantity,
        requestedQuantity,
        reason: reason.trim(),
        status: "pending",
        currentProductPrice: currentProduct.price,
        requestedProductPrice: requestedProduct.price
      },
      include: {
        currentProduct: true,
        requestedProduct: true,
        dcc: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

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
    console.error("Error creating product exchange request:", error)
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to create exchange request",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    // Verify authentication
    const token = req.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Authentication token required" },
        { status: 401 }
      )
    }

    const user = await verifyAuthToken(token)
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Invalid authentication token" },
        { status: 401 }
      )
    }

    // Get query parameters
    const url = new URL(req.url)
    const page = parseInt(url.searchParams.get("page") || "1")
    const limit = parseInt(url.searchParams.get("limit") || "10")
    const status = url.searchParams.get("status")

    // Build filter
    const filter: any = {}
    
    if (user.role === "DCC") {
      filter.dccId = user.id
    }
    
    if (status) {
      filter.status = status
    }

    // Get exchange requests
    const exchangeRequests = await prisma.productExchangeRequest.findMany({
      where: filter,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        currentProduct: {
          select: {
            id: true,
            name: true,
            price: true,
            image: true,
            category: true
          }
        },
        requestedProduct: {
          select: {
            id: true,
            name: true,
            price: true,
            image: true,
            category: true
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
        createdAt: "desc"
      }
    })

    // Get total count
    const total = await prisma.productExchangeRequest.count({ where: filter })

    return NextResponse.json({
      success: true,
      data: {
        exchangeRequests,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    })

  } catch (error) {
    console.error("Error fetching product exchange requests:", error)
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to fetch exchange requests",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
