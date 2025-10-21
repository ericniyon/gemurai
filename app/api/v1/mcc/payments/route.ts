import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuthToken } from "@/lib/api-auth"

// POST /api/v1/mcc/payments - Process a payment
export async function POST(req: NextRequest) {
  try {
    const authToken = req.headers.get("authorization")?.replace("Bearer ", "")
    if (!authToken) {
      return NextResponse.json({ error: "Authorization token required" }, { status: 401 })
    }

    const user = await verifyAuthToken(authToken)
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const data = await req.json()
    
    // Validate required fields
    if (!data.farmerId || !data.collectionId || !data.netPayment || !data.paymentMethod) {
      return NextResponse.json(
        { error: "Missing required fields: farmerId, collectionId, netPayment, paymentMethod" },
        { status: 400 }
      )
    }

    // Create the payment record
    const payment = await prisma.mcc_payments.create({
      data: {
        farmerId: data.farmerId,
        collectionId: data.collectionId,
        mccId: data.mccId,
        totalAmount: data.totalAmount,
        deductions: data.deductions,
        advances: data.advances,
        netPayment: data.netPayment,
        paymentMethod: data.paymentMethod,
        paymentStatus: "paid",
        paymentDate: new Date(),
        processedBy: user.id,
        notes: data.notes || ""
      }
    })

    // Update the collection status to indicate payment is being processed
    await prisma.milk_collections.update({
      where: { id: data.collectionId },
      data: { 
        status: "PAID",
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: "Payment processed successfully",
      data: payment
    })
  } catch (error) {
    console.error("Payment processing error:", error)
    return NextResponse.json(
      { 
        error: "Failed to process payment",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// GET /api/v1/mcc/payments - Get payment records
export async function GET(req: NextRequest) {
  try {
    const authToken = req.headers.get("authorization")?.replace("Bearer ", "")
    if (!authToken) {
      return NextResponse.json({ error: "Authorization token required" }, { status: 401 })
    }

    const user = await verifyAuthToken(authToken)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const mccId = searchParams.get("mccId")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    // Get payments with pagination
    const payments = await prisma.mcc_payments.findMany({
      where: { mccId: mccId },
      include: {
        farmers: {
          select: {
            id: true,
            name: true,
            phone: true
          }
        },
        milk_collections: {
          select: {
            id: true,
            totalLiters: true,
            unitPrice: true,
            totalAmount: true,
            collectionDate: true
          }
        }
      },
      orderBy: { paymentDate: 'desc' },
      skip,
      take: limit
    })

    const total = await prisma.mcc_payments.count({ where: { mccId: mccId } })

    return NextResponse.json({
      success: true,
      data: payments,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error("Error fetching payments:", error)
    return NextResponse.json(
      { 
        error: "Failed to fetch payments",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// PUT /api/v1/mcc/payments/[id] - Update payment status
export async function PUT(req: NextRequest) {
  try {
    const authToken = req.headers.get("authorization")?.replace("Bearer ", "")
    if (!authToken) {
      return NextResponse.json({ error: "Authorization token required" }, { status: 401 })
    }

    const user = await verifyAuthToken(authToken)
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const data = await req.json()
    const { paymentId, status } = data

    if (!paymentId || !status) {
      return NextResponse.json(
        { error: "Missing required fields: paymentId, status" },
        { status: 400 }
      )
    }

    // Update payment status
    const payment = await prisma.mcc_payments.update({
      where: { id: paymentId },
      data: { 
        paymentStatus: status,
        updatedAt: new Date()
      }
    })

    // If payment is completed, update collection status
    if (status === "completed") {
      await prisma.milk_collections.update({
        where: { id: payment.collectionId },
        data: { 
          status: "PAID",
          updatedAt: new Date()
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: "Payment status updated successfully",
      data: payment
    })
  } catch (error) {
    console.error("Payment update error:", error)
    return NextResponse.json(
      { error: "Failed to update payment" },
      { status: 500 }
    )
  }
}
