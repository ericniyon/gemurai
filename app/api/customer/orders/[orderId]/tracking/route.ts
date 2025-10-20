import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuthToken } from '@/lib/token'
import { cookies } from 'next/headers'

// Default product images mapping
const getDefaultProductImage = (productName: string, category: string): string => {
  const name = productName.toLowerCase()
  const cat = category.toLowerCase()
  
  // Map based on product name
  if (name.includes('bleach') || name.includes('cleaning')) {
    return '/img/Bleach_Household.png'
  }
  if (name.includes('oil') || name.includes('cooking')) {
    return '/img/Cooking_Oil_Vegetable.png'
  }
  if (name.includes('sugar') || name.includes('sweet')) {
    return '/img/Sugar_White_Refined.png'
  }
  if (name.includes('salt')) {
    return '/img/Salt_Iodized.png'
  }
  if (name.includes('toothpaste') || name.includes('dental')) {
    return '/img/Toothpaste_Fresh_Mint.png'
  }
  if (name.includes('toilet') || name.includes('paper')) {
    return '/img/Toilet_Paper_Soft.png'
  }
  if (name.includes('rice')) {
    return '/img/Rice_Premium_Quality.png'
  }
  if (name.includes('soap') || name.includes('wash')) {
    return '/img/Soap_Bar_Antibacterial.png'
  }
  if (name.includes('detergent') || name.includes('omo')) {
    return '/img/OMO_Detergent_Powder.png'
  }
  if (name.includes('condom') || name.includes('protection')) {
    return '/img/Condom_Premium.png'
  }
  
  // Map based on category
  if (cat.includes('household') || cat.includes('cleaning')) {
    return '/img/Bleach_Household.png'
  }
  if (cat.includes('cooking') || cat.includes('food')) {
    return '/img/Cooking_Oil_Vegetable.png'
  }
  if (cat.includes('personal') || cat.includes('hygiene')) {
    return '/img/Toothpaste_Fresh_Mint.png'
  }
  if (cat.includes('health') || cat.includes('medical')) {
    return '/img/Condom_Premium.png'
  }
  
  // Default fallback
  return '/img/Cooking_Oil_Vegetable.png'
}

// GET /api/customer/orders/[orderId]/tracking - Get order tracking information
export async function GET(
  req: NextRequest,
  { params }: { params: { orderId: string } }
) {
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

    const { orderId } = params

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
            }
          }
        },
        tracking: {
          orderBy: {
            timestamp: 'desc'
          }
        },
        payments: {
          orderBy: {
            createdAt: 'desc'
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

    // Get current status information
    const currentStatus = order.tracking[0] || null
    const latestPayment = order.payments[0] || null

    // Calculate estimated delivery if not set
    let estimatedDelivery = order.estimatedDelivery
    if (!estimatedDelivery && order.status !== 'DELIVERED' && order.status !== 'CANCELLED') {
      // Default to 7 days from order creation
      estimatedDelivery = new Date(order.createdAt.getTime() + (7 * 24 * 60 * 60 * 1000))
    }

    return NextResponse.json({
      success: true,
      tracking: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        currentStatus: currentStatus?.status || 'ORDER_CREATED',
        currentDescription: currentStatus?.description || 'Order has been created',
        currentLocation: currentStatus?.location || 'System',
        lastUpdate: currentStatus?.timestamp || order.createdAt,
        estimatedDelivery,
        deliveredAt: order.deliveredAt,
        cancelledAt: order.cancelledAt,
        cancelledReason: order.cancelledReason,
        timeline: order.tracking.map(track => ({
          id: track.id,
          status: track.status,
          description: track.description,
          location: track.location,
          timestamp: track.timestamp
        })),
        payment: latestPayment ? {
          id: latestPayment.id,
          amount: latestPayment.amount,
          method: latestPayment.method,
          status: latestPayment.status,
          reference: latestPayment.reference,
          processedAt: latestPayment.processedAt
        } : null,
        orderSummary: {
          totalItems: order.items.length,
          totalQuantity: order.items.reduce((sum, item) => sum + item.quantity, 0),
          subtotal: order.subtotal,
          taxAmount: order.taxAmount,
          shippingAmount: order.shippingAmount,
          totalAmount: order.totalAmount,
          currency: order.currency
        },
        items: order.items.map(item => ({
          id: item.id,
          productId: item.productId,
          productName: item.product.name,
          productImage: item.product.image || getDefaultProductImage(item.product.name, item.product.category || ''),
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice
        }))
      }
    })

  } catch (error) {
    console.error('Order tracking GET error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch order tracking'
    }, { status: 500 })
  }
}

// POST /api/customer/orders/[orderId]/tracking - Add tracking update (for admin/DCC use)
export async function POST(
  req: NextRequest,
  { params }: { params: { orderId: string } }
) {
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

    const { orderId } = params
    const body = await req.json()
    const { status, description, location } = body

    if (!orderId) {
      return NextResponse.json({
        success: false,
        error: 'Order ID is required'
      }, { status: 400 })
    }

    if (!status || !description) {
      return NextResponse.json({
        success: false,
        error: 'Status and description are required'
      }, { status: 400 })
    }

    // Verify user has permission to update tracking (admin, DCC, or order owner)
    const order = await prisma.customerOrder.findFirst({
      where: {
        id: orderId
      },
      include: {
        items: {
          include: {
            dcc: true
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

    // Check if user is admin, DCC, or order owner
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        userRole: {
          include: {
            role: true
          }
        }
      }
    })

    const userRole = dbUser?.userRole?.role?.name
    const isAdmin = userRole === 'ADMIN' || userRole === 'SUPER_ADMIN'
    const isDCC = userRole === 'DCC'
    const isOrderOwner = order.customerId === user.id
    const isOrderDCC = order.items.some(item => item.dccId === user.id)

    if (!isAdmin && !isDCC && !isOrderOwner && !isOrderDCC) {
      return NextResponse.json({
        success: false,
        error: 'Permission denied'
      }, { status: 403 })
    }

    // Add tracking update
    const trackingUpdate = await prisma.orderTracking.create({
      data: {
        orderId,
        status,
        description,
        location: location || 'System'
      }
    })

    // Update order status if needed
    let orderStatusUpdate = {}
    if (status === 'ORDER_DELIVERED') {
      orderStatusUpdate = {
        status: 'DELIVERED',
        deliveredAt: new Date()
      }
    } else if (status === 'ORDER_CANCELLED') {
      orderStatusUpdate = {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancelledBy: user.id
      }
    } else if (status === 'ORDER_CONFIRMED') {
      orderStatusUpdate = {
        status: 'CONFIRMED'
      }
    } else if (status === 'ORDER_PROCESSING') {
      orderStatusUpdate = {
        status: 'PROCESSING'
      }
    } else if (status === 'ORDER_SHIPPED') {
      orderStatusUpdate = {
        status: 'SHIPPED'
      }
    }

    if (Object.keys(orderStatusUpdate).length > 0) {
      // Use transaction to ensure both order and payment updates are atomic
      await prisma.$transaction(async (tx) => {
        // Update order status
        await tx.customerOrder.update({
          where: { id: orderId },
          data: orderStatusUpdate
        })

        // If order is being cancelled, also cancel associated payments and restore stock
        if (status === 'ORDER_CANCELLED') {
          // Cancel associated payments
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
          const orderItems = await tx.customerOrderItem.findMany({
            where: { orderId: orderId }
          })

          for (const item of orderItems) {
            await tx.product.update({
              where: { id: item.productId },
              data: {
                stock: {
                  increment: item.quantity
                }
              }
            })
          }
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Tracking update added successfully',
      tracking: trackingUpdate
    })

  } catch (error) {
    console.error('Order tracking POST error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to add tracking update'
    }, { status: 500 })
  }
}
