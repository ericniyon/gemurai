import { NextResponse, NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { verifyAuthToken } from "@/lib/token"
import { cookies } from "next/headers"

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const orderId = params.id
    if (!orderId) {
      return NextResponse.json({ success: false, message: "Order ID is required" }, { status: 400 })
    }

    let user: any = null

    const authHeader = req.headers.get("Authorization")
    let token: string | null = null

    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1]
    }

    if (!token) {
      const cookieStore = await cookies()
      token = cookieStore.get("Gemurai_token")?.value || cookieStore.get("token")?.value || null
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
      return NextResponse.json({ success: false, message: "Unauthorized. Please log in." }, { status: 401 })
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id, isActive: true },
      include: { userRole: { include: { role: true } } }
    })

    if (!dbUser) {
      return NextResponse.json({ success: false, message: "User not found or inactive" }, { status: 404 })
    }

    const userRole = dbUser.userRole?.role?.name
    if (userRole !== "DCC") {
      return NextResponse.json({ success: false, message: "Only DCC users can mark orders as received" }, { status: 403 })
    }

    const stockOrder = await prisma.stockOrder.findUnique({
      where: { id: orderId },
      include: { products: { include: { product: true } }, dcc: true }
    })

    if (!stockOrder) {
      return NextResponse.json({ success: false, message: "Stock order not found" }, { status: 404 })
    }

    if (stockOrder.dccId !== user.id) {
      return NextResponse.json({ success: false, message: "You can only mark your own orders as received" }, { status: 403 })
    }

    if (stockOrder.status !== "delivered") {
      return NextResponse.json({ success: false, message: "Order must be delivered to be marked as received" }, { status: 400 })
    }

    // Credit DCC inventory upon receipt
    await prisma.$transaction(async (tx) => {
      await tx.stockOrder.update({
        where: { id: orderId },
        data: { status: "received" }
      })

      const order = await tx.stockOrder.findUnique({
        where: { id: orderId },
        include: { products: true }
      })

      if (!order) {
        throw new Error("Stock order not found when crediting DCC inventory")
      }

      for (const orderProduct of order.products) {
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
            quantity: { increment: orderProduct.quantity }
          }
        })
      }
    })

    return NextResponse.json({ success: true, message: "Stock order received successfully and stock credited to DCC" })
  } catch (error) {
    console.error("[STOCK_ORDER_RECEIVED]", error)
    return NextResponse.json({ success: false, message: "Failed to mark order as received" }, { status: 500 })
  }
}


