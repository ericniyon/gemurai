import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { checkMCCPermission } from "@/lib/mcc-auth"

/**
 * GET /api/v1/mcc/ikofi - Get financial services data (savings, loans, insurance, payments)
 */
export async function GET(req: NextRequest) {
  try {
    const authToken = req.headers.get("authorization")?.replace("Bearer ", "")
    const { authorized, user, error } = await checkMCCPermission(
      authToken,
      "mcc.view"
    )

    if (!authorized || !user) {
      return NextResponse.json({ error: error || "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const mccId = searchParams.get("mccId")

    // If user is MCC_MANAGER, get their MCC ID
    let targetMccId = mccId
    if (!targetMccId && user.role === "MCC_MANAGER" && user.mccId) {
      targetMccId = user.mccId
    }

    // Get savings balance (from farmer accounts)
    let savingsBalance = 0
    try {
      const savingsAggregate = await prisma.farmer_accounts.aggregate({
        where: {
          ...(targetMccId
            ? {
                farmers: {
                  mccId: targetMccId,
                },
              }
            : {}),
        },
        _sum: {
          balance: true,
        },
      })
      savingsBalance = savingsAggregate._sum?.balance || 0
    } catch (error) {
      console.warn("Could not fetch savings balance:", error)
    }

    // Get loans outstanding (placeholder - would need loans table)
    let loansOutstanding = 0
    try {
      // TODO: Implement when loans table is available
      loansOutstanding = 0
    } catch (error) {
      console.warn("Could not fetch loans:", error)
    }

    // Get insurance policies (placeholder - would need insurance table)
    let activePolicies = 0
    try {
      // TODO: Implement when insurance table is available
      activePolicies = 0
    } catch (error) {
      console.warn("Could not fetch insurance:", error)
    }

    // Get payments this month
    let paymentsThisMonth = 0
    try {
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)

      const paymentsAggregate = await prisma.mcc_payments.aggregate({
        where: {
          ...(targetMccId ? { mccId: targetMccId } : {}),
          paymentDate: {
            gte: startOfMonth,
          },
          paymentStatus: "PAID",
        },
        _sum: {
          netPayment: true,
        },
      })
      paymentsThisMonth = paymentsAggregate._sum?.netPayment || 0
    } catch (error) {
      console.warn("Could not fetch payments this month:", error)
    }

    // Get recent transactions
    let recentTransactions: any[] = []
    try {
      const transactions = await prisma.mcc_payments.findMany({
        where: {
          ...(targetMccId ? { mccId: targetMccId } : {}),
        },
        include: {
          farmers: {
            select: {
              id: true,
              name: true,
              phone: true,
            },
          },
        },
        orderBy: {
          paymentDate: "desc",
        },
        take: 10,
      })

      recentTransactions = transactions.map((t) => ({
        id: t.id,
        type: t.paymentMethod === "MOBILE_MONEY" ? "Mobile Money Transfer" : "Payment",
        description: `Payment to ${t.farmers?.name || "Farmer"}`,
        amount: t.netPayment,
        date: t.paymentDate,
        status: t.paymentStatus,
      }))
    } catch (error) {
      console.warn("Could not fetch recent transactions:", error)
    }

    return NextResponse.json({
      success: true,
      data: {
        savings: {
          totalBalance: savingsBalance,
        },
        loans: {
          outstanding: loansOutstanding,
        },
        insurance: {
          activePolicies,
        },
        payments: {
          thisMonth: paymentsThisMonth,
        },
        recentTransactions,
      },
    })
  } catch (error) {
    console.error("Ikofi error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch financial services data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

