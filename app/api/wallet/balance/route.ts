import { verifyAuthToken } from "@/lib/token"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"

// Update wallet balance
export async function POST(req: Request) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.get("Authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    const user = await verifyAuthToken(token)

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Only allow admins to update wallet balance
    if (!["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
      return new NextResponse("Access denied", { status: 403 })
    }

    const body = await req.json()
    const { userId, amount, description } = body

    if (!userId || !amount) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    // Get target user
    const targetUser = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!targetUser) {
      return new NextResponse("User not found", { status: 404 })
    }

    // Get or create wallet for the target user
    let wallet = await prisma.wallet.findUnique({
      where: { userId: targetUser.id }
    })

    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: {
          userId: targetUser.id,
          balance: 0,
          minimumBalance: 1000,
          status: "ACTIVE"
        }
      })
    }

    // Create transaction and update wallet balance
    const transaction = await prisma.transaction.create({
      data: {
        walletId: wallet.id,
        type: "DEPOSIT",
        amount,
        status: "COMPLETED",
        description: description || "Initial balance deposit"
      }
    })

    // Update wallet balance
    await prisma.wallet.update({
      where: { id: wallet.id },
      data: {
        balance: wallet.balance + amount
      }
    })

    return NextResponse.json({ success: true, transaction })
  } catch (error) {
    console.error("[WALLET_BALANCE_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 