import { NextRequest, NextResponse } from 'next/server'
import { verifyAuthToken } from '@/lib/token'
import { prisma } from '@/lib/prisma'

// GET - Fetch available products for exchange
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ success: false, message: 'No token provided' }, { status: 401 })
    }

    const payload = await verifyAuthToken(token)
    if (!payload) {
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 })
    }

    // Check if user has DCC role
    const userRole = await prisma.userRoleAssignment.findFirst({
      where: {
        userId: payload.id,
        isActive: true,
        role: {
          name: 'DCC'
        }
      },
      include: {
        role: true
      }
    })

    if (!userRole || userRole.role.name !== 'DCC') {
      return NextResponse.json({ success: false, message: 'Access denied. DCC role required.' }, { status: 403 })
    }

    // Fetch available products (products with stock > 0)
    const products = await prisma.product.findMany({
      where: {
        stock: {
          gt: 0
        },
        isActive: true
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        businessPrice: true,
        stock: true,
        category: true,
        commission: true,
        sellerId: true,
        image: true,
        images: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json({
      success: true,
      data: products
    })

  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}
