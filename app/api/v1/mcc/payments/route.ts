import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { checkMCCPermission } from "@/lib/mcc-auth"
import { MilkCollectionService } from "@/lib/services/MilkCollectionService"

// POST /api/v1/mcc/payments - Process a payment (cash, Mobile Money, bank transfer)
export async function POST(req: NextRequest) {
  try {
    const authToken = req.headers.get("authorization")?.replace("Bearer ", "")
    const { authorized, user, error } = await checkMCCPermission(
      authToken,
      "mcc.payments.create"
    )

    if (!authorized || !user) {
      return NextResponse.json({ error: error || "Unauthorized" }, { status: 401 })
    }

    const data = await req.json()
    
    // Validate required fields
    if (!data.farmerId || !data.netPayment || !data.paymentMethod) {
      return NextResponse.json(
        { error: "Missing required fields: farmerId, netPayment, paymentMethod" },
        { status: 400 }
      )
    }

    const {
      farmerId,
      collectionId,
      mccId,
      totalAmount,
      deductions,
      advances,
      netPayment,
      paymentMethod,
      mobileMoneyPhone,
      mobileMoneyReference,
      bankReference,
      notes,
    } = data

    // If user is MCC_MANAGER, verify they own this MCC
    if (user.role === "MCC_MANAGER" && mccId && user.mccId !== mccId) {
      return NextResponse.json({ error: "Unauthorized for this MCC" }, { status: 403 })
    }

    // Get farmer account
    const farmer = await prisma.farmers.findUnique({
      where: { id: farmerId },
      include: {
        farmer_account: true,
        mccs: true,
      },
    })

    if (!farmer) {
      return NextResponse.json({ error: "Farmer not found" }, { status: 404 })
    }

    const targetMccId = mccId || farmer.mccId
    if (!targetMccId) {
      return NextResponse.json({ error: "MCC ID required" }, { status: 400 })
    }

    // Process payment based on method
    let paymentStatus = "pending"
    let paymentReference = null

    if (paymentMethod === "mobile_money") {
      // TODO: Integrate with Mobile Money API (MTN/Rwanda)
      // For now, simulate successful payment
      paymentStatus = "paid"
      paymentReference = mobileMoneyReference || `MOMO-${Date.now()}`
    } else if (paymentMethod === "bank_transfer") {
      paymentStatus = "pending" // Requires manual confirmation
      paymentReference = bankReference || `BANK-${Date.now()}`
    } else {
      // Cash payment
      paymentStatus = "paid"
    }

    // Create payment record
    const payment = await prisma.$transaction(async (tx) => {
      // Create payment
      const paymentRecord = await tx.mcc_payments.create({
        data: {
          farmerId: farmerId,
          collectionId: collectionId || null,
          mccId: targetMccId,
          totalAmount: totalAmount || netPayment,
          deductions: deductions || 0,
          advances: advances || 0,
          netPayment: netPayment,
          paymentMethod: paymentMethod.toUpperCase() as any,
          paymentStatus: paymentStatus as any,
          paymentDate: new Date(),
          processedBy: user.id,
          notes: notes || "",
        },
      })

      // Update collection status if collectionId provided
      if (collectionId) {
        await tx.milk_collections.update({
          where: { id: collectionId },
          data: {
            status: paymentStatus === "paid" ? "PAID" : "APPROVED",
            paid: paymentStatus === "paid",
            updatedAt: new Date(),
          },
        })
      }

      // Update farmer account and ledger
      if (paymentStatus === "paid") {
        const farmerAccount = await tx.farmer_accounts.upsert({
          where: { farmerId: farmerId },
          create: {
            farmerId: farmerId,
            balance: -netPayment, // Negative for payment
          },
          update: {
            balance: {
              decrement: netPayment,
            },
            lastUpdated: new Date(),
          },
        })

        // Create ledger entry
        await tx.farmer_ledger.create({
          data: {
            farmerId: farmerId,
            type: "PAYMENT",
            amount: -netPayment,
            balanceAfter: farmerAccount.balance,
            refId: paymentRecord.id,
            notes: `Payment via ${paymentMethod} - ${notes || ""}`,
          },
        })
      }

      return paymentRecord
    })

    // Fetch complete payment with relations
    const completePayment = await prisma.mcc_payments.findUnique({
      where: { id: payment.id },
      include: {
        farmers: {
          select: {
            id: true,
            name: true,
            phone: true,
            farmerCode: true,
          },
        },
        milk_collections: {
          select: {
            id: true,
            totalLiters: true,
            collectionDate: true,
          },
        },
        mccs: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      message: `Payment ${paymentStatus === "paid" ? "processed" : "initiated"} successfully`,
      data: {
        payment: completePayment,
        reference: paymentReference,
        status: paymentStatus,
      },
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
    const { authorized, user, error } = await checkMCCPermission(
      authToken,
      "mcc.payments.view"
    )

    if (!authorized || !user) {
      return NextResponse.json({ error: error || "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const mccId = searchParams.get("mccId")
    const farmerId = searchParams.get("farmerId")
    const paymentMethod = searchParams.get("paymentMethod")
    const paymentStatus = searchParams.get("paymentStatus")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    // If user is MCC_MANAGER, filter by their MCC
    let targetMccId = mccId
    if (!targetMccId && user.role === "MCC_MANAGER" && user.mccId) {
      targetMccId = user.mccId
    }

    // If user is FARMER, only show their own payments
    if (user.role === "FARMER" && user.id) {
      const farmer = await prisma.farmers.findFirst({
        where: { phone: user.phone || "" },
        select: { id: true },
      })
      if (farmer) {
        const payments = await prisma.mcc_payments.findMany({
          where: { farmerId: farmer.id },
          include: {
            farmers: {
              select: {
                id: true,
                name: true,
                phone: true,
                farmerCode: true,
              },
            },
            milk_collections: {
              select: {
                id: true,
                totalLiters: true,
                collectionDate: true,
              },
            },
            mccs: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
          orderBy: { paymentDate: "desc" },
          skip,
          take: limit,
        })

        const total = await prisma.mcc_payments.count({
          where: { farmerId: farmer.id },
        })

        return NextResponse.json({
          success: true,
          data: payments,
          meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        })
      }
    }

    // Build where clause
    const where: any = {}
    if (targetMccId) where.mccId = targetMccId
    if (farmerId) where.farmerId = farmerId
    if (paymentMethod) where.paymentMethod = paymentMethod.toUpperCase()
    if (paymentStatus) where.paymentStatus = paymentStatus
    if (startDate) where.paymentDate = { gte: new Date(startDate) }
    if (endDate) {
      where.paymentDate = {
        ...where.paymentDate,
        lte: new Date(endDate),
      }
    }

    // Get payments with pagination
    const payments = await prisma.mcc_payments.findMany({
      where,
      include: {
        farmers: {
          select: {
            id: true,
            name: true,
            phone: true,
            farmerCode: true,
          },
        },
        milk_collections: {
          select: {
            id: true,
            totalLiters: true,
            unitPrice: true,
            totalAmount: true,
            collectionDate: true,
          },
        },
        mccs: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
      orderBy: { paymentDate: "desc" },
      skip,
      take: limit,
    })

    const total = await prisma.mcc_payments.count({ where })

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
    const { authorized, user, error } = await checkMCCPermission(
      authToken,
      "mcc.payments.manage"
    )

    if (!authorized || !user) {
      return NextResponse.json({ error: error || "Unauthorized" }, { status: 401 })
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
