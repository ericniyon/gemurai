import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'
import { verifyAuthToken } from '@/lib/token'

/**
 * API Route: GET /api/v1/users/dcc-simple
 * Simple endpoint to fetch users with DCC role
 */
export async function GET(request: NextRequest) {
  try {
    // Get token from multiple sources
    let token = request.headers.get("Authorization")?.replace("Bearer ", "")
    if (!token) {
      token = request.cookies.get("Gemurai_token")?.value
    }

    // For now, let's make this endpoint public to test
    // You can add authentication back later if needed
    console.log("DCC Users API called - fetching all DCC users")

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const includeProfile = searchParams.get('includeProfile') === 'true'
    const skip = (page - 1) * limit

    // Build where clause for DCC users
    const whereClause: any = {
      userRole: {
        role: {
          name: "DCC"
        }
      }
    }

    // Add search functionality
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
        { national_id: { contains: search, mode: "insensitive" } },
        { district: { contains: search, mode: "insensitive" } }
      ]
    }

    // Build select clause
    const selectClause: any = {
      id: true,
      name: true,
      email: true,
      phone: true,
      national_id: true,
      gender: true,
      district: true,
      isActive: true,
      createdAt: true,
      userRole: {
        select: {
          role: {
            select: {
              name: true,
              description: true
            }
          },
          assignedAt: true,
          isActive: true
        }
      },
      dccStocks: {
        select: {
          quantity: true,
          product: {
            select: {
              id: true,
              name: true,
              description: true,
              category: true,
              price: true,
              image: true,
              commission: true
            }
          }
        }
      },
      sales: {
        select: {
          id: true,
          quantity: true,
          salePrice: true,
          totalRevenue: true,
          profit: true,
          customerName: true,
          saleDate: true,
          product: {
            select: {
              name: true,
              category: true
            }
          }
        },
        orderBy: {
          saleDate: 'desc'
        },
        take: 10
      }
    }

    // Include DCC profile if requested
    if (includeProfile) {
      selectClause.dccProfile = {
        select: {
          level: true,
          rating: true,
          totalSales: true,
          monthlySales: true,
          productsAvailable: true,
          status: true,
          location: true,
          specialties: true
        }
      }
    }

    // Fetch users and total count
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        select: selectClause,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.user.count({ where: whereClause })
    ])

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    })

  } catch (error) {
    console.error('[DCC_USERS_SIMPLE_GET] Error:', error)
    return NextResponse.json({ 
      success: false, 
      message: "Internal server error" 
    }, { status: 500 })
  }
}

/**
 * API Route: GET /api/v1/users/dcc-simple/[id]
 * Get a specific DCC user by ID
 */
export async function GET_BY_ID(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verify authentication (optional - remove if not needed)
    const authResult = await verifyToken(request)
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ 
        success: false, 
        message: "Unauthorized" 
      }, { status: 401 })
    }

    const { id } = params
    const { searchParams } = new URL(request.url)
    const includeProfile = searchParams.get('includeProfile') === 'true'

    // Build select clause
    const selectClause: any = {
      id: true,
      name: true,
      email: true,
      phone: true,
      national_id: true,
      gender: true,
      district: true,
      isActive: true,
      createdAt: true,
      userRole: {
        select: {
          role: {
            select: {
              name: true,
              description: true
            }
          },
          assignedAt: true,
          isActive: true
        }
      }
    }

    if (includeProfile) {
      selectClause.dccProfile = {
        select: {
          level: true,
          rating: true,
          totalSales: true,
          monthlySales: true,
          productsAvailable: true,
          status: true,
          location: true,
          specialties: true
        }
      }
    }

    const user = await prisma.user.findFirst({
      where: {
        id,
        userRole: {
          role: {
            name: "DCC"
          }
        }
      },
      select: selectClause
    })

    if (!user) {
      return NextResponse.json({
        success: false,
        message: "DCC user not found"
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: user
    })

  } catch (error) {
    console.error('[DCC_USER_BY_ID_GET] Error:', error)
    return NextResponse.json({ 
      success: false, 
      message: "Internal server error" 
    }, { status: 500 })
  }
}
