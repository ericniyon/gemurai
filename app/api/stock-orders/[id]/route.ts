import { NextRequest, NextResponse } from "next/server"
import { verifyAuthToken } from "@/lib/token"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    let user = null;
    
    // Try token auth first (for DCC users)
    const authHeader = req.headers.get("Authorization")
    let token = null

    // Check Authorization header
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1]
    }
    
    // Try cookie if no Authorization header
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

    // If no token auth, try NextAuth session
    if (!user) {
      const session = await getServerSession(authOptions)
      if (session?.user?.id) {
        user = session.user
      }
    }

    if (!user?.id) {
      console.log("[STOCK_ORDER_UPDATE] No user found, token verification failed");
      console.log("[STOCK_ORDER_UPDATE] Headers:", Object.fromEntries(req.headers.entries()));
      return NextResponse.json(
        { error: "No authentication token found" },
        { status: 401 }
      )
    }
    
    console.log("[STOCK_ORDER_UPDATE] User authenticated:", user.id, user.email);

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
    console.log("[STOCK_ORDER_UPDATE] User role:", userRole);

    // Get request body
    const body = await req.json()
    const { action, note } = body

    if (!action) {
      return NextResponse.json(
        { error: "Action is required" },
        { status: 400 }
      )
    }

    // Get the stock order with products
    const stockOrder = await prisma.stockOrder.findUnique({
      where: { id },
      include: {
        products: {
          include: {
            product: true
          }
        },
        dcc: true
      }
    })

    if (!stockOrder) {
      return NextResponse.json(
        { error: "Stock order not found" },
        { status: 404 }
      )
    }

    let updatedStatus: string
    let updatedData: any = {}

    // Handle different actions based on user role and current status
    if (userRole === "DCC") {
      // DCC can only confirm payment for their own orders
      if (stockOrder.dccId !== user.id) {
        return NextResponse.json(
          { error: "You can only update your own orders" },
          { status: 403 }
        )
      }

      if (action === "confirm_payment") {
        if (stockOrder.status !== "pending") {
          return NextResponse.json(
            { error: "Can only confirm payment for pending orders" },
            { status: 400 }
          )
        }
        updatedStatus = "payment_confirmed"
        updatedData = {
          paymentConfirmedBy: user.id,
          paymentConfirmedAt: new Date()
        }

        // Update payment status to CONFIRMED if payment exists
        if (stockOrder.payment) {
          await prisma.payment.update({
            where: { stockOrderId: id },
            data: {
              status: "CONFIRMED",
              paidAt: new Date()
            }
          })
        }
      } else {
        return NextResponse.json(
          { error: "Invalid action for DCC" },
          { status: 400 }
        )
      }
    } else if (userRole === "EMPLOYER") {
      // Verify that the employer owns at least one product in the order
      const hasOwnedProduct = stockOrder.products.some(
        orderProduct => orderProduct.product.sellerId === user.id
      )

      if (!hasOwnedProduct) {
        return NextResponse.json(
          { error: "You don't have permission to update this stock order" },
          { status: 403 }
        )
      }

      switch (action) {
        case "confirm_payment":
          if (stockOrder.status !== "pending") {
            return NextResponse.json(
              { error: "Can only confirm payment for pending orders" },
              { status: 400 }
            )
          }
          updatedStatus = "payment_confirmed"
          updatedData = {
            paymentConfirmedBy: user.id,
            paymentConfirmedAt: new Date()
          }

          // Update payment status to CONFIRMED if payment exists
          if (stockOrder.payment) {
            await prisma.payment.update({
              where: { stockOrderId: id },
              data: {
                status: "CONFIRMED",
                paidAt: new Date()
              }
            })
          }
          break

        case "view_payment":
          // Just return the current order without any changes
          return NextResponse.json({
            success: true,
            stockOrder: stockOrder
          })

        case "approve":
          if (stockOrder.status !== "payment_confirmed") {
            return NextResponse.json(
              { error: "Can only approve orders with confirmed payment" },
              { status: 400 }
            )
          }

          // Check if there's enough stock for all products
          for (const orderProduct of stockOrder.products) {
            const product = await prisma.product.findUnique({
              where: { id: orderProduct.productId }
            })

            if (!product) {
              return NextResponse.json(
                { error: `Product ${orderProduct.product.name} not found` },
                { status: 404 }
              )
            }

            if (product.stock < orderProduct.quantity) {
              return NextResponse.json(
                { error: `Insufficient stock for ${orderProduct.product.name}. Available: ${product.stock}, Requested: ${orderProduct.quantity}` },
                { status: 400 }
              )
            }
          }

          // Start a transaction to ensure all operations succeed or fail together
          await prisma.$transaction(async (tx) => {
            // For each product in the order
            for (const orderProduct of stockOrder.products) {
              // 1. Deduct stock from product
              await tx.product.update({
                where: { id: orderProduct.productId },
                data: {
                  stock: {
                    decrement: orderProduct.quantity
                  }
                }
              })

              // 2. Add or update DCC stock
              await tx.dCCStock.upsert({
                where: {
                  dccId_productId: {
                    dccId: stockOrder.dccId,
                    productId: orderProduct.productId
                  }
                },
                create: {
                  dccId: stockOrder.dccId,
                  productId: orderProduct.productId,
                  quantity: orderProduct.quantity
                },
                update: {
                  quantity: {
                    increment: orderProduct.quantity
                  }
                }
              })
            }

            // 3. Update stock order status
            await tx.stockOrder.update({
              where: { id: id },
              data: {
                status: "approved",
                approvedBy: user.id,
                approvedAt: new Date()
              }
            })
          })

          updatedStatus = "approved"
          updatedData = {
            approvedBy: user.id,
            approvedAt: new Date()
          }
          break

        case "reject":
          if (stockOrder.status !== "payment_confirmed") {
            return NextResponse.json(
              { error: "Can only reject orders with confirmed payment" },
              { status: 400 }
            )
          }
          updatedStatus = "rejected"
          updatedData = {
            rejectedBy: user.id,
            rejectedAt: new Date()
          }
          break

        case "complete":
          if (stockOrder.status !== "approved") {
            return NextResponse.json(
              { error: "Can only complete approved orders" },
              { status: 400 }
            )
          }
          updatedStatus = "completed"
          updatedData = {
            completedBy: user.id,
            completedAt: new Date()
          }
          break

        default:
          return NextResponse.json(
            { error: "Invalid action for EMPLOYER" },
            { status: 400 }
          )
      }
    } else {
      return NextResponse.json(
        { error: "Invalid user role" },
        { status: 403 }
      )
    }

    // Update the stock order
    const updatedOrder = await prisma.stockOrder.update({
      where: { id },
      data: {
        status: updatedStatus,
        notes: note,
        ...updatedData
      },
      include: {
        products: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                stock: true,
                sellerId: true
              }
            }
          }
        },
        dcc: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        payment: true
      }
    })

    return NextResponse.json({
      success: true,
      stockOrder: updatedOrder
    })
  } catch (error) {
    console.error("Error updating stock order:", error)
    return NextResponse.json(
      { error: "Failed to update stock order" },
      { status: 500 }
    )
  }
} 

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    let user = null;
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

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify user exists and role
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id, isActive: true },
      include: {
        userRole: { include: { role: true } }
      }
    })
    if (!dbUser) {
      return NextResponse.json({ error: "User not found or inactive" }, { status: 403 })
    }
    const userRole = dbUser.userRole?.role?.name

    // Fetch the order for ownership checks
    const stockOrder = await prisma.stockOrder.findUnique({
      where: { id },
      include: {
        products: { include: { product: true } },
        payment: true
      }
    })
    if (!stockOrder) {
      return NextResponse.json({ error: "Stock order not found" }, { status: 404 })
    }

    // Only allow delete if:
    // - EMPLOYER who owns the products in the order, and order is pending, rejected, payment_confirmed, cancelled, or received
    // - DCC who created the order, and order is pending, payment_confirmed, cancelled, or received
    if (userRole === "EMPLOYER") {
      const ownsAtLeastOne = stockOrder.products.some(p => p.product.sellerId === user.id)
      if (!ownsAtLeastOne) {
        return NextResponse.json({ error: "You can only delete orders for your products" }, { status: 403 })
      }
      if (!(stockOrder.status === "pending" || stockOrder.status === "rejected" || stockOrder.status === "payment_confirmed" || stockOrder.status === "cancelled" || stockOrder.status === "received")) {
        return NextResponse.json({ error: "Only pending, rejected, payment_confirmed, cancelled, or received orders can be deleted" }, { status: 400 })
      }
    } else if (userRole === "DCC") {
      if (stockOrder.dccId !== user.id) {
        return NextResponse.json({ error: "You can only delete your own orders" }, { status: 403 })
      }
      if (!(stockOrder.status === "pending" || stockOrder.status === "payment_confirmed" || stockOrder.status === "cancelled" || stockOrder.status === "received")) {
        return NextResponse.json({ error: "Only pending, payment_confirmed, cancelled, or received orders can be deleted" }, { status: 400 })
      }
    } else if (userRole === "BRANCH_MANAGER" || userRole === "SUPERADMIN") {
      // Allow deletion for admin roles; no additional checks
    } else {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Delete related records first if necessary
    await prisma.$transaction(async (tx) => {
      await tx.stockOrderProduct.deleteMany({ where: { stockOrderId: id } })
      await tx.payment.deleteMany({ where: { stockOrderId: id } })
      await tx.stockOrder.delete({ where: { id } })
    })

    return NextResponse.json({ success: true, message: "Stock order deleted" })
  } catch (error) {
    console.error("Error deleting stock order:", error)
    return NextResponse.json({ error: "Failed to delete stock order" }, { status: 500 })
  }
}