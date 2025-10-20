import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { verifyAuthToken } from '@/lib/token'
import { cacheService, CACHE_KEYS, CACHE_TTL } from '@/lib/services/redis-service'

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
          { message: 'Unauthorized' },
          { status: 401 }
        )
      }

      const token = authHeader.split(" ")[1]
      const user = await verifyAuthToken(token)

      if (!user) {
        return NextResponse.json(
          { message: 'Invalid authentication token' },
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
        { message: 'User not found' },
        { status: 404 }
      )
    }

    console.log(`Processing wallet request for user: ${userExists.name} (${userExists.email})`)

    // Temporarily disable Redis caching to test if that's causing the 500 error
    // const cacheKey = CACHE_KEYS.WALLET(userId)
    // const cachedWallet = await cacheService.get(cacheKey)
    // if (cachedWallet) {
    //   console.log('📖 Retrieved wallet from cache')
    //   return NextResponse.json(cachedWallet)
    // }

    // Fetch wallet from database
    let wallet = await prisma.wallet.findFirst({
      where: { userId },
      include: {
        transactions: {
          where: {
            status: 'COMPLETED'
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 10
        }
      }
    })

    if (!wallet) {
      // Create a wallet for the user if it doesn't exist
      try {
        console.log(`Creating wallet for user: ${userId}`)
        wallet = await prisma.wallet.create({
          data: {
            userId: userId,
            balance: 0,
            minimumBalance: 1000,
            status: 'ACTIVE'
          },
          include: {
            transactions: {
              where: {
                status: 'COMPLETED'
              },
              orderBy: {
                createdAt: 'desc'
              },
              take: 10
            }
          }
        })
        console.log(`✅ Created wallet for user: ${userId}`)
      } catch (createError) {
        console.error('Error creating wallet:', createError)
        return NextResponse.json(
          { message: 'Failed to create wallet' },
          { status: 500 }
        )
      }
    }

    const response = {
      success: true,
      data: {
        id: wallet.id,
        userId: wallet.userId,
        balance: wallet.balance,
        minimumBalance: wallet.minimumBalance,
        lastWithdrawal: wallet.lastWithdrawal,
        status: wallet.status,
        createdAt: wallet.createdAt,
        updatedAt: wallet.updatedAt,
        recentTransactions: wallet.transactions
      }
    }

    // Temporarily disable Redis caching
    // await cacheService.set(cacheKey, response, CACHE_TTL.SHORT)

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching wallet:', error)
    
    // Log more detailed error information
    if (error instanceof Error) {
      console.error('Error name:', error.name)
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    
    // Check if it's a database connection error
    if (error instanceof Error && error.message.includes('connect')) {
      return NextResponse.json(
        { message: 'Database connection error' },
        { status: 503 }
      )
    }
    
    // Check if it's a Prisma error
    if (error instanceof Error && error.message.includes('prisma')) {
      return NextResponse.json(
        { message: 'Database query error' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

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
          { message: 'Unauthorized' },
          { status: 401 }
        )
      }

      const token = authHeader.split(" ")[1]
      const user = await verifyAuthToken(token)

      if (!user) {
        return NextResponse.json(
          { message: 'Invalid authentication token' },
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
        { message: 'User not found' },
        { status: 404 }
      )
    }

    console.log(`Processing wallet request for user: ${userExists.name} (${userExists.email})`)

    const body = await request.json()
    const { action, amount, type } = body

    // Clear wallet cache when updating
    await cacheService.delete(CACHE_KEYS.WALLET(userId))
    await cacheService.deleteByPattern(CACHE_KEYS.WALLET_TRANSACTIONS(userId))

    let wallet

    switch (action) {
      case 'create':
        wallet = await prisma.wallet.create({
          data: {
            userId,
            balance: 0,
            minimumBalance: 0,
            status: 'ACTIVE'
          }
        })
        break

      case 'update_balance':
        wallet = await prisma.wallet.update({
          where: { userId },
          data: { balance: amount }
        })
        break

      case 'add_transaction':
        const transaction = await prisma.transaction.create({
          data: {
            walletId: (await prisma.wallet.findFirst({ where: { userId } }))!.id,
            amount,
            type,
            status: 'COMPLETED'
          }
        })

        // Update wallet balance
        wallet = await prisma.wallet.update({
          where: { userId },
          data: {
            balance: {
              increment: type === 'DEPOSIT' ? amount : -amount
            }
          }
        })
        break

      default:
        return NextResponse.json(
          { message: 'Invalid action' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      data: wallet
    })
  } catch (error) {
    console.error('Error updating wallet:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}