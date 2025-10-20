import { NextResponse } from "next/server"
import { verifyAuthToken } from "@/lib/token"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.get("Authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({
        success: false,
        error: "Authentication required"
      }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    const user = await verifyAuthToken(token)

    if (!user) {
      return NextResponse.json({
        success: false,
        error: "Invalid authentication token"
      }, { status: 401 })
    }

    // Allow access for DCC, EMPLOYER role and admins
    if (!["DCC", "EMPLOYER", "ADMIN", "SUPER_ADMIN"].includes(user.role)) {
      return NextResponse.json({
        success: false,
        error: "Access denied. Insufficient permissions."
      }, { status: 403 })
    }

    // Get user's wallet
    const wallet = await prisma.wallet.findUnique({
      where: { userId: user.id }
    })

    if (!wallet) {
      return NextResponse.json({
        success: false,
        error: "Wallet not found"
      }, { status: 404 })
    }

    // Get transaction totals
    const transactions = await prisma.transaction.groupBy({
      by: ['type'],
      where: {
        walletId: wallet.id,
        status: "COMPLETED"
      },
      _sum: {
        amount: true
      }
    })

    // Calculate totals
    const totals = {
      totalDeposits: 0,
      totalWithdrawals: 0,
      totalEarnings: 0
    }

    transactions.forEach(transaction => {
      const amount = transaction._sum.amount || 0
      switch (transaction.type) {
        case "DEPOSIT":
          totals.totalDeposits += amount
          totals.totalEarnings += amount
          break
        case "WITHDRAWAL":
          totals.totalWithdrawals += amount
          break
      }
    })

    return NextResponse.json({
      success: true,
      data: totals
    })
  } catch (error) {
    console.error("[WALLET_TOTALS_GET]", error)
    return NextResponse.json({
      success: false,
      error: "Failed to fetch wallet totals"
    }, { status: 500 })
  }
} 