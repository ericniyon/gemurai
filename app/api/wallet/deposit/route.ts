import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { verifyAuthToken } from '@/lib/token'

export async function POST(request: NextRequest) {
  try {
    let userId: string

    // Try session-based authentication first
    const session = await getServerSession(authOptions)
    
    if (session?.user) {
      userId = session.user.id
    } else {
      // Fallback to token-based authentication
      const authHeader = request.headers.get("Authorization")
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 401 }
        )
      }

      const token = authHeader.split(" ")[1]
      const user = await verifyAuthToken(token)

      if (!user) {
        return NextResponse.json(
          { success: false, error: 'Invalid authentication token' },
          { status: 401 }
        )
      }

      userId = user.id
    }

    // Verify the user exists
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true }
    })

    if (!userExists) {
      console.error(`User not found: ${userId}`)
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    console.log(`Processing deposit request for user: ${userExists.name} (${userExists.email})`)

    const body = await request.json()
    const { amount, reason, paymentMethod } = body

    // Validate input
    if (!amount || isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid amount' },
        { status: 400 }
      )
    }

    if (amount < 1000) {
      return NextResponse.json(
        { success: false, error: 'Minimum deposit amount is RWF 1,000' },
        { status: 400 }
      )
    }

    // Get user's wallet
    let wallet = await prisma.wallet.findFirst({
      where: { userId }
    })

    if (!wallet) {
      // Create wallet if it doesn't exist
      wallet = await prisma.wallet.create({
        data: {
          userId: userId,
          balance: 0,
          minimumBalance: 1000,
          status: 'ACTIVE'
        }
      })
      console.log(`Created wallet for user: ${userId}`)
    }

    // Create deposit transaction
    const transaction = await prisma.transaction.create({
      data: {
        walletId: wallet.id,
        amount: amount,
        type: 'DEPOSIT',
        status: 'PENDING', // Will be updated to COMPLETED when payment is confirmed
        description: reason || `Deposit via ${paymentMethod}`
      }
    })

    // Update wallet balance (for immediate deposits, you might want to wait for payment confirmation)
    const updatedWallet = await prisma.wallet.update({
      where: { id: wallet.id },
      data: {
        balance: {
          increment: amount
        }
      }
    })

    console.log(`Deposit processed: ${amount} RWF for user ${userId}`)

    return NextResponse.json({
      success: true,
      data: {
        transactionId: transaction.id,
        amount: amount,
        newBalance: updatedWallet.balance,
        status: 'PENDING',
        message: 'Deposit request submitted successfully. Your balance will be updated once payment is confirmed.'
      }
    })

  } catch (error) {
    console.error('Error processing deposit:', error)
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    let userId: string

    // Try session-based authentication first
    const session = await getServerSession(authOptions)
    
    if (session?.user) {
      userId = session.user.id
    } else {
      // Fallback to token-based authentication
      const authHeader = request.headers.get("Authorization")
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 401 }
        )
      }

      const token = authHeader.split(" ")[1]
      const user = await verifyAuthToken(token)

      if (!user) {
        return NextResponse.json(
          { success: false, error: 'Invalid authentication token' },
          { status: 401 }
        )
      }

      userId = user.id
    }

    // Get user's pending deposits
    const wallet = await prisma.wallet.findFirst({
      where: { userId }
    })

    if (!wallet) {
      return NextResponse.json(
        { success: false, error: 'Wallet not found' },
        { status: 404 }
      )
    }

    const pendingDeposits = await prisma.transaction.findMany({
      where: {
        walletId: wallet.id,
        type: 'DEPOSIT',
        status: 'PENDING'
      },
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        amount: true,
        description: true,
        createdAt: true
      }
    })

    return NextResponse.json({
      success: true,
      data: pendingDeposits
    })

  } catch (error) {
    console.error('Error fetching pending deposits:', error)
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
