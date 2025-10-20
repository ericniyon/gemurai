import { NextRequest, NextResponse } from "next/server"
import { verifyAuthToken } from "@/lib/token"
import { prisma } from "@/lib/database"
import { StockOrder, Product, User } from "@prisma/client"
import { cookies } from "next/headers"

interface StockOrderWithRelations extends StockOrder {
  product: {
    id: string
    name: string
    price: number
    sellerId: string
  }
  requestedBy: {
    id: string
    name: string
    email: string
  } | null
}

export async function GET(req: NextRequest) {
  try {
    // Get token from multiple sources
    let token = req.headers.get("Authorization")?.replace("Bearer ", "")
    if (!token) {
      token = req.cookies.get("token")?.value
    }
    if (!token) {
      token = req.cookies.get("Gemurai_token")?.value
    }

    if (!token) {
      return NextResponse.json(
        { error: "No authentication token found" },
        { status: 401 }
      )
    }

    const user = await verifyAuthToken(token)
    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      )
    }

    // Verify user exists and is active
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

    if (!dbUser) {
      return NextResponse.json(
        { error: "User not found or inactive" },
        { status: 403 }
      )
    }

    // Get user's role from the new role system
    const userRole = dbUser.userRole?.role?.name;
    console.log("[STOCK_ORDERS_GET] User role:", userRole);

    // Only allow DCC and EMPLOYER roles
    if (userRole !== "DCC" && userRole !== "EMPLOYER") {
      console.log("[STOCK_ORDERS_GET] Access denied for role:", userRole);
      return NextResponse.json(
        { error: "Permission denied" },
        { status: 403 }
      )
    }

    let stockOrders = []

    try {
      if (userRole === "DCC") {
        // DCC can only see their own orders
        stockOrders = await prisma.stockOrder.findMany({
          where: {
            dccId: user.id
          },
          include: {
            products: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                sellerId: true
              }
                }
              }
            },
            payment: true
          },
          orderBy: {
            createdAt: "desc"
          }
        })
      } else if (userRole === "EMPLOYER") {
        // Employer can see all orders for their products
        stockOrders = await prisma.stockOrder.findMany({
          where: {
            products: {
              some: {
            product: {
              sellerId: user.id
                }
              }
            }
          },
          include: {
            products: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                sellerId: true
              }
                }
              }
            },
            payment: true
          },
          orderBy: {
            createdAt: "desc"
          }
        })
      }
    } catch (dbError) {
      console.error("[STOCK_ORDERS_GET] Database error fetching orders:", dbError);
      // If database is down, return empty array
      if (dbError.message?.includes("Can't reach database server")) {
        console.log("[STOCK_ORDERS_GET] Database down, returning empty orders array");
        stockOrders = [];
      } else {
        throw dbError;
      }
    }

    return NextResponse.json({
      success: true,
      stockOrders
    })
  } catch (error) {
    console.error("Error fetching stock orders:", error)
    console.error("Error details:", error.message)
    console.error("Error stack:", error.stack)
    
    // Check if it's a database connection error
    if (error.message?.includes("Can't reach database server")) {
      console.log("[STOCK_ORDERS_GET] Database connection error, returning empty array")
      return NextResponse.json({
        success: true,
        stockOrders: []
      })
    }
    
    return NextResponse.json(
      { error: "Failed to fetch stock orders: " + error.message },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    // Get token from multiple sources
    let token = req.headers.get("Authorization")?.replace("Bearer ", "")
    if (!token) {
      token = req.cookies.get("token")?.value
    }
    if (!token) {
      token = req.cookies.get("Gemurai_token")?.value
    }

    if (!token) {
      return NextResponse.json(
        { error: "No authentication token found" },
        { status: 401 }
      )
    }

    const user = await verifyAuthToken(token)
    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      )
    }

    // Verify user exists and is active
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

    if (!dbUser) {
      return NextResponse.json(
        { error: "User not found or inactive" },
        { status: 403 }
      )
    }

    // Get user's role from the new role system
    const userRole = dbUser.userRole?.role?.name;
    console.log("[STOCK_ORDERS_POST] User role:", userRole);

    // Only allow DCC to create stock orders
    if (userRole !== "DCC") {
      console.log("[STOCK_ORDERS_POST] Access denied for role:", userRole);
      return NextResponse.json(
        { error: "Only DCC users can create stock orders" },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { productId, quantity, comment } = body

    if (!productId || !quantity) {
      return NextResponse.json(
        { error: "Product ID and quantity are required" },
        { status: 400 }
      )
    }

    // Validate product exists and get its price and commission
    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      )
    }

    // Calculate three-tier pricing system: Purchase Price, Sales Price, Commission
    const salesPrice = product.price
    const purchasePrice = product.commission || 0
    const commission = salesPrice - purchasePrice
    
    // Calculate total amount using sales price
    const totalAmount = salesPrice * quantity

    // Create stock order with pending status
    const result = await prisma.$transaction(async (tx) => {
      // Create stock order
      const stockOrder = await tx.stockOrder.create({
        data: {
          dccId: user.id,
          totalAmount,
          status: "pending",
          priority: "medium", // Default priority
          notes: comment
        }
      })

      // Create stock order product
      await tx.stockOrderProduct.create({
        data: {
          stockOrderId: stockOrder.id,
          productId,
          quantity,
          currentStock: product.stock,
          requestedStock: quantity,
          price: salesPrice // Store sales price
        }
      })

      // Create payment record with pending status
      await tx.payment.create({
        data: {
          stockOrderId: stockOrder.id,
          status: "PENDING",
          amount: totalAmount,
          method: "BANK_TRANSFER",
          paidAt: null
        }
      })

      return stockOrder
    })

    return NextResponse.json({
      success: true,
      stockOrder: result,
      pricing: {
        salesPrice: salesPrice,
        purchasePrice: purchasePrice,
        commission: commission,
        quantity: quantity,
        totalAmount: totalAmount
      }
    })
  } catch (error) {
    console.error("Error creating stock order:", error)
    return NextResponse.json(
      { error: "Failed to create stock order" },
      { status: 500 }
    )
  }
} 