import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { checkMCCPermission } from "@/lib/mcc-auth"

/**
 * GET /api/v1/mcc/payments/generic - Get payment records or farmer payment summary
 * If farmerId is provided, returns payment summary with deductions
 * Otherwise, returns list of payment records
 */
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
    const farmerId = searchParams.get("farmerId")
    const mccId = searchParams.get("mccId")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    // If user is MCC_MANAGER, filter by their MCC
    let targetMccId = mccId
    if (!targetMccId && user.role === "MCC_MANAGER" && user.mccId) {
      targetMccId = user.mccId
    }

    // If no farmerId, return list of payments
    if (!farmerId) {
      const where: any = {}
      if (targetMccId) {
        // Get farmers in this MCC
        const farmers = await prisma.farmers.findMany({
          where: { mccId: targetMccId },
          select: { id: true },
        })
        where.farmerId = { in: farmers.map((f) => f.id) }
      }

      let payments = []
      let total = 0
      
      try {
        payments = await prisma.payments.findMany({
          where,
          include: {
            farmer: {
              select: {
                id: true,
                name: true,
                phone: true,
                farmerCode: true,
              },
            },
          },
          orderBy: { paidAt: "desc" },
          skip,
          take: limit,
        })

        total = await prisma.payments.count({ where })
      } catch (error: any) {
        // If payments table doesn't exist yet, return empty array
        if (error?.code === "P2021" || error?.message?.includes("does not exist")) {
          console.warn("Payments table does not exist yet. Please run migrations.")
          payments = []
          total = 0
        } else {
          throw error
        }
      }

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

    // Get farmer
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

    // Verify MCC access
    if (user.role === "MCC_MANAGER" && user.mccId !== farmer.mccId) {
      return NextResponse.json({ error: "Unauthorized for this farmer" }, { status: 403 })
    }

    // Calculate medicine deductions (unpaid credit sales)
    const unpaidSales = await prisma.sales.findMany({
      where: {
        farmerId: farmerId,
        paid: false,
        paymentMethod: "CREDIT",
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    const medicineDeductions = unpaidSales.reduce((sum, sale) => sum + sale.totalAmount, 0)

    // Calculate asset rental deductions (active rentals)
    const activeRentals = await prisma.rentals.findMany({
      where: {
        farmerId: farmerId,
        returned: false,
      },
      include: {
        asset: true,
      },
    })

    const now = new Date()
    let assetDeductions = 0
    const rentalDetails = activeRentals
      .map((rental) => {
        if (!rental.rentStart || !rental.rentFeePerDay) {
          return null
        }

        const startDate = new Date(rental.rentStart)
        const daysRented = Math.max(1, Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)))
        const rentalFee = daysRented * rental.rentFeePerDay

        assetDeductions += rentalFee

        return {
          rentalId: rental.id,
          assetName: rental.asset?.name || rental.asset?.serial || "Unknown Asset",
          assetType: rental.asset?.assetType || null,
          daysRented,
          feePerDay: rental.rentFeePerDay,
          totalFee: rentalFee,
          rentStart: rental.rentStart.toISOString(),
        }
      })
      .filter((detail): detail is NonNullable<typeof detail> => detail !== null)

    const totalDeductions = medicineDeductions + assetDeductions
    const farmerBalance = farmer.farmer_account?.balance || 0
    const netPayment = farmerBalance - totalDeductions

    return NextResponse.json({
      success: true,
      data: {
        farmer: {
          id: farmer.id,
          name: farmer.name,
          phone: farmer.phone,
          farmerCode: farmer.farmerCode,
        },
        account: {
          balance: farmerBalance,
        },
        deductions: {
          medicine: {
            total: medicineDeductions,
            count: unpaidSales.length,
            details: unpaidSales.map((sale) => ({
              saleId: sale.id,
              invoiceNo: sale.invoiceNo,
              totalAmount: sale.totalAmount,
              saleAt: sale.saleAt.toISOString(),
              items: sale.items.map((item) => ({
                productName: item.product?.name || "Unknown Product",
                quantity: item.qty,
                unitPrice: item.unitPrice,
              })),
            })),
          },
          assets: {
            total: assetDeductions,
            count: activeRentals.length,
            details: rentalDetails,
          },
          total: totalDeductions,
        },
        payment: {
          netAmount: netPayment,
        },
      },
    })
  } catch (error) {
    console.error("Error fetching payment summary:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch payment summary",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/v1/mcc/payments/generic - Process payment with automatic deduction
 * Deducts all medicine purchases and asset rental fees
 */
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
    const { farmerId, amount, method, reference, notes } = data

    if (!farmerId || !amount || !method) {
      return NextResponse.json(
        { error: "Missing required fields: farmerId, amount, method" },
        { status: 400 }
      )
    }

    // Get farmer
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

    // Verify MCC access
    if (user.role === "MCC_MANAGER" && user.mccId !== farmer.mccId) {
      return NextResponse.json({ error: "Unauthorized for this farmer" }, { status: 403 })
    }

    // Calculate deductions
    const unpaidSales = await prisma.sales.findMany({
      where: {
        farmerId: farmerId,
        paid: false,
        paymentMethod: "CREDIT",
      },
    })

    const activeRentals = await prisma.rentals.findMany({
      where: {
        farmerId: farmerId,
        returned: false,
      },
    })

    const now = new Date()
    let medicineDeductions = 0
    let assetDeductions = 0

    unpaidSales.forEach((sale) => {
      medicineDeductions += sale.totalAmount || 0
    })
    
    // Ensure medicineDeductions is a number
    medicineDeductions = Number(medicineDeductions) || 0

    activeRentals.forEach((rental) => {
      if (rental.rentStart && rental.rentFeePerDay) {
        const startDate = new Date(rental.rentStart)
        const daysRented = Math.max(1, Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)))
        assetDeductions += daysRented * rental.rentFeePerDay
      }
    })
    
    // Ensure assetDeductions is a number
    assetDeductions = Number(assetDeductions) || 0

    const totalDeductions = medicineDeductions + assetDeductions
    const farmerBalance = farmer.farmer_account?.balance || 0
    const netPayment = amount - totalDeductions

    if (netPayment < 0) {
      return NextResponse.json(
        {
          error: "Payment amount is less than total deductions",
          details: {
            paymentAmount: amount,
            totalDeductions,
            netPayment,
          },
        },
        { status: 400 }
      )
    }

    // Process payment in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create payment record
      let payment
      try {
        payment = await tx.payments.create({
          data: {
            farmerId: farmerId,
            amount: amount,
            method: method.toLowerCase(),
            reference: reference || null,
            paidAt: new Date(),
          },
        })
      } catch (error: any) {
        // If payments table doesn't exist yet, throw a helpful error
        if (error?.code === "P2021" || error?.message?.includes("does not exist")) {
          throw new Error("Payments table does not exist. Please run database migrations first.")
        }
        throw error
      }

      // Mark unpaid sales as paid
      if (unpaidSales.length > 0) {
        await tx.sales.updateMany({
          where: {
            id: { in: unpaidSales.map((s) => s.id) },
          },
          data: {
            paid: true,
          },
        })
      }

      // Mark active rentals as returned (payment clears rental fees)
      // Note: This marks rentals as returned, you may want to adjust this logic
      // For now, we'll just update the farmer account balance
      // You might want to create rental payment records separately

      // Get current farmer account balance
      // netPayment = amount paid TO farmer (after deducting medicine/rentals)
      // farmer_account.balance = what we owe from collections; paying reduces it
      const amountSettlingBalance = netPayment

      // Deduct net payment from account (when we pay farmer, we reduce what we owe them)
      const farmerAccount = await tx.farmer_accounts.upsert({
        where: { farmerId: farmerId },
        create: {
          farmerId: farmerId,
          balance: -amountSettlingBalance, // Advance: we paid them before they had earnings
        },
        update: {
          balance: {
            decrement: amountSettlingBalance,
          },
          lastUpdated: new Date(),
        },
      })

      const currentBalance = farmerAccount.balance

      // Create ledger entry for payment (negative = outflow / disbursement to farmer)
      await tx.farmer_ledger.create({
        data: {
          farmerId: farmerId,
          type: "PAYMENT",
          amount: -amountSettlingBalance,
          balanceAfter: currentBalance,
          refId: payment.id,
          notes: `Payment via ${method} (net: ${netPayment}, deductions: ${totalDeductions})${notes ? ` - ${notes}` : ""}`,
        },
      })

      // Medicine and asset deductions are separate obligations - we mark sales/rentals as paid
      // but they don't affect farmer_account.balance (that only tracks collection earnings)

      // Get final account balance
      const finalAccount = await tx.farmer_accounts.findUnique({
        where: { farmerId: farmerId },
      })

      return {
        payment,
        deductions: {
          medicine: medicineDeductions,
          assets: assetDeductions,
          total: totalDeductions,
        },
        netPayment,
        finalBalance: finalAccount?.balance || 0,
      }
    })

    // Fetch complete payment with farmer
    const completePayment = await prisma.payments.findUnique({
      where: { id: result.payment.id },
      include: {
        farmer: {
          select: {
            id: true,
            name: true,
            phone: true,
            farmerCode: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      message: "Payment processed successfully",
      data: {
        payment: completePayment,
        deductions: result.deductions,
        netPayment: result.netPayment,
      },
    })
  } catch (error) {
    console.error("Payment processing error:", error)
    return NextResponse.json(
      {
        error: "Failed to process payment",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

