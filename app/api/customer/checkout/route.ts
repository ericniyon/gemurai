import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuthToken } from '@/lib/token'
import { cookies } from 'next/headers'

// POST /api/customer/checkout - Process checkout and create order
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
    const {
      shippingAddress,
      billingAddress,
      customerNotes,
      paymentMethod = 'CASH',
      estimatedDelivery
    } = body

    // Validate required fields
    if (!shippingAddress) {
      return NextResponse.json({
        success: false,
        error: 'Shipping address is required'
      }, { status: 400 })
    }

    // Get customer's cart items
    const cartItems = await prisma.shoppingCart.findMany({
      where: {
        customerId: user.id
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            stock: true,
            sellerId: true
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
    })

    if (cartItems.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Cart is empty'
      }, { status: 400 })
    }

    // Validate stock availability and calculate totals
    let subtotal = 0
    const validatedItems = []

    for (const cartItem of cartItems) {
      if (cartItem.product.stock < cartItem.quantity) {
        return NextResponse.json({
          success: false,
          error: `Insufficient stock for ${cartItem.product.name}. Available: ${cartItem.product.stock}, Requested: ${cartItem.quantity}`
        }, { status: 400 })
      }

      const itemTotal = cartItem.product.price * cartItem.quantity
      subtotal += itemTotal

      validatedItems.push({
        ...cartItem,
        itemTotal
      })
    }

    // Calculate additional costs
    const shippingAmount = 500 // Fixed shipping cost for now
    const taxAmount = subtotal * 0.18 // 18% VAT
    const totalAmount = subtotal + shippingAmount + taxAmount

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    // Process order in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create customer order
      const order = await tx.customerOrder.create({
        data: {
          customerId: user.id,
          orderNumber,
          status: 'PENDING',
          totalAmount,
          subtotal,
          taxAmount,
          shippingAmount,
          discountAmount: 0,
          currency: 'RWF',
          shippingAddress,
          billingAddress: billingAddress || shippingAddress,
          customerNotes,
          estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : null
        }
      })

      // Create order items and update product stock
      const orderItems = []
      for (const item of validatedItems) {
        // Create order item
        const orderItem = await tx.customerOrderItem.create({
          data: {
            orderId: order.id,
            productId: item.productId,
            dccId: item.dccId,
            quantity: item.quantity,
            unitPrice: item.product.price,
            totalPrice: item.itemTotal,
            discount: 0
          }
        })

        // Update product stock
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity
            }
          }
        })

        orderItems.push(orderItem)
      }

      // Create payment record
      const payment = await tx.customerPayment.create({
        data: {
          orderId: order.id,
          amount: totalAmount,
          method: paymentMethod,
          status: 'PENDING',
          reference: `PAY-${Date.now()}`
        }
      })

      // Create initial tracking record
      await tx.orderTracking.create({
        data: {
          orderId: order.id,
          status: 'ORDER_CREATED',
          description: 'Order has been created and is pending confirmation',
          location: 'System'
        }
      })

      // Clear customer's cart
      await tx.shoppingCart.deleteMany({
        where: {
          customerId: user.id
        }
      })

      return {
        order,
        orderItems,
        payment
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Order created successfully',
      order: {
        id: result.order.id,
        orderNumber: result.order.orderNumber,
        status: result.order.status,
        totalAmount: result.order.totalAmount,
        subtotal: result.order.subtotal,
        taxAmount: result.order.taxAmount,
        shippingAmount: result.order.shippingAmount,
        estimatedDelivery: result.order.estimatedDelivery,
        createdAt: result.order.createdAt
      },
      items: result.orderItems.map(item => ({
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice
      })),
      payment: {
        id: result.payment.id,
        amount: result.payment.amount,
        method: result.payment.method,
        status: result.payment.status,
        reference: result.payment.reference
      }
    })

  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to process checkout'
    }, { status: 500 })
  }
}
