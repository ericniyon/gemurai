import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'
import { verifyToken } from '@/lib/token'

/**
 * API Route: GET /api/v1/users/dcc-simple/[id]
 * Get a specific DCC user by ID
 */
export async function GET(
  request: NextRequest, 
  { params }: { params: { id: string } }
) {
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





