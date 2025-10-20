import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuthToken } from '@/lib/token'
import { cookies } from 'next/headers'

// GET /api/customer/orders - Get customer's orders
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

    const { searchParams } = new URL(req.url)
    const orderId = searchParams.get('orderId')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    if (orderId) {
      // Get specific order details
      const order = await prisma.customerOrder.findFirst({
        where: {
          id: orderId,
          customerId: user.id
        },
        include: {
          items: {
            include: {
              product: {
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
            }
          },
          payments: {
            orderBy: {
              createdAt: 'desc'
            }
          },
          tracking: {
            orderBy: {
              timestamp: 'desc'
            }
          }
        }
      })

      if (!order) {
        return NextResponse.json({
          success: false,
          error: 'Order not found'
        }, { status: 404 })
      }

      return NextResponse.json({
        success: true,
        order
      })
    } else {
      // Get orders list with filters
      const whereClause: any = {
        customerId: user.id
      }

      if (status) {
        whereClause.status = status
      }

      const [orders, total] = await Promise.all([
        prisma.customerOrder.findMany({
          where: whereClause,
          include: {
            items: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    price: true,
                    image: true
                  }
                }
              }
            },
            payments: {
              orderBy: {
                createdAt: 'desc'
              },
              take: 1
            },
            tracking: {
              orderBy: {
                timestamp: 'desc'
              },
              take: 1
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          skip,
          take: limit
        }),
        prisma.customerOrder.count({
          where: whereClause
        })
      ])

      const totalPages = Math.ceil(total / limit)

      return NextResponse.json({
        success: true,
        orders,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      })
    }

  } catch (error) {
    console.error('Orders GET error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch orders'
    }, { status: 500 })
  }
}

// POST /api/customer/orders - Cancel order
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

    const body = await req.json()
    const { orderId, reason } = body

    if (!orderId) {
      return NextResponse.json({
        success: false,
        error: 'Order ID is required'
      }, { status: 400 })
    }

    // Get order and verify ownership
    const order = await prisma.customerOrder.findFirst({
      where: {
        id: orderId,
        customerId: user.id
      },
      include: {
        items: true
      }
    })

    if (!order) {
      return NextResponse.json({
        success: false,
        error: 'Order not found'
      }, { status: 404 })
    }

    // Check if order can be cancelled
    if (order.status === 'DELIVERED' || order.status === 'CANCELLED') {
      return NextResponse.json({
        success: false,
        error: `Order cannot be cancelled in ${order.status} status`
      }, { status: 400 })
    }

    // Cancel order and restore stock
    const result = await prisma.$transaction(async (tx) => {
      // Update order status
      const updatedOrder = await tx.customerOrder.update({
        where: { id: orderId },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date(),
          cancelledBy: user.id,
          cancelledReason: reason
        }
      })

      // Cancel all associated payments
      await tx.customerPayment.updateMany({
        where: { 
          orderId: orderId,
          status: { not: 'CANCELLED' } // Only update payments that aren't already cancelled
        },
        data: {
          status: 'CANCELLED',
          updatedAt: new Date()
        }
      })

      // Restore product stock
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              increment: item.quantity
            }
          }
        })
      }

      // Create tracking record
      await tx.orderTracking.create({
        data: {
          orderId: orderId,
          status: 'ORDER_CANCELLED',
          description: reason || 'Order cancelled by customer',
          location: 'System'
        }
      })

      return updatedOrder
    })

    return NextResponse.json({
      success: true,
      message: 'Order cancelled successfully',
      order: result
    })

  } catch (error) {
    console.error('Orders POST error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to cancel order'
    }, { status: 500 })
  }
}
