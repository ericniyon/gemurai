import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { verifyAuthToken } from '@/lib/token'

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

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const walletId = searchParams.get('walletId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search')
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const date = searchParams.get('date')
    
    const offset = (page - 1) * limit

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

    // Get user's wallet
    const wallet = await prisma.wallet.findFirst({
      where: { userId }
    })

    if (!wallet) {
      return NextResponse.json(
        { success: false, error: 'Wallet not found' },
        { status: 404 }
      )
    }

    // Build where clause for filtering
    const whereClause: any = {
      walletId: wallet.id
    }

    // Add search filter
    if (search) {
      whereClause.OR = [
        { description: { contains: search, mode: 'insensitive' } },
        { type: { contains: search, mode: 'insensitive' } },
        { status: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Add status filter
    if (status && status !== 'all') {
      whereClause.status = { equals: status, mode: 'insensitive' }
    }

    // Add type filter
    if (type && type !== 'all') {
      whereClause.type = { equals: type, mode: 'insensitive' }
    }

    // Add date filter
    if (date && date !== 'all') {
      const now = new Date()
      let startDate: Date
      
      switch (date) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          break
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1)
          break
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1)
          break
        default:
          startDate = new Date(0)
      }
      
      whereClause.createdAt = {
        gte: startDate
      }
    }

    // Fetch transactions with basic details first
    const transactions = await prisma.transaction.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      skip: offset,
      select: {
        id: true,
        type: true,
        amount: true,
        status: true,
        description: true,
        createdAt: true,
        updatedAt: true,
        wallet: {
          select: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true
              }
            }
          }
        }
      }
    })

    // Try to fetch DCC profile data separately to avoid errors
    let transactionsWithDCC = transactions
    try {
      const userWithDCC = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          dccProfile: {
            select: {
              id: true,
              location: true,
              specialties: true
            }
          }
        }
      })

      if (userWithDCC?.dccProfile) {
        transactionsWithDCC = transactions.map(transaction => ({
          ...transaction,
          wallet: {
            ...transaction.wallet,
            user: {
              ...transaction.wallet?.user,
              dccProfile: userWithDCC.dccProfile
            }
          }
        }))
      }
    } catch (dccError) {
      console.log('DCC profile fetch failed, continuing without it:', dccError)
    }

    // Get total count for pagination
    const totalCount = await prisma.transaction.count({
      where: whereClause
    })

    // Try to fetch recent sales for additional context
    let recentSales = []
    try {
      recentSales = await prisma.sale.findMany({
        where: {
          dccId: userId
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 10,
        select: {
          id: true,
          productId: true,
          quantity: true,
          salePrice: true,
          totalRevenue: true,
          profit: true,
          customerName: true,
          customerPhone: true,
          saleDate: true,
          createdAt: true,
          product: {
            select: {
              name: true,
              image: true
            }
          }
        }
      })
    } catch (salesError) {
      console.log('Sales fetch failed, continuing without sales data:', salesError)
    }

    return NextResponse.json({
      success: true,
      data: transactionsWithDCC,
      sales: recentSales,
      total: totalCount,
      pagination: {
        total: totalCount,
        page,
        limit,
        offset,
        hasMore: offset + limit < totalCount
      }
    })

  } catch (error) {
    console.error('Error fetching transactions:', error)
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
