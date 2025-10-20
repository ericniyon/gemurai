import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'
import { verifyAuthToken } from '@/lib/token'

/**
 * API Route: GET /api/v1/users/all
 * Simple endpoint to fetch all users for role assignment
 */
export async function GET(request: NextRequest) {
  try {
    // Get token from multiple sources
    let token = request.headers.get("Authorization")?.replace("Bearer ", "")
    if (!token) {
      token = request.cookies.get("Gemurai_token")?.value
    }

    // For role assignment, we need some authentication but not necessarily SUPER_ADMIN
    if (token) {
      const user = await verifyAuthToken(token)
      if (!user) {
        return NextResponse.json(
          { success: false, message: "Invalid token" },
          { status: 401 }
        )
      }
    } else {
      // For now, allow public access for testing
      console.log("Users API called without authentication - allowing for testing")
    }

    console.log("Users API called - fetching all users")

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const limit = parseInt(searchParams.get('limit') || '100')

    // Build where clause
    const whereClause: any = {
      isActive: true // Only get active users
    }

    // Add search functionality
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } }
      ]
    }

    // Fetch users
    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        isActive: true,
        createdAt: true,
        userRole: {
          select: {
            role: {
              select: {
                name: true,
                description: true
              }
            }
          }
        }
      },
      orderBy: {
        name: 'asc'
      },
      take: limit
    })

    console.log(`Found ${users.length} users`)

    return NextResponse.json({
      success: true,
      users: users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isActive: user.isActive,
        createdAt: user.createdAt,
        currentRole: user.userRole?.role?.name || 'No Role'
      }))
    })

  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}





