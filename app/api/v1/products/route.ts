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

    // Allow DCC (from role assignment), MCC_MANAGER, SUPER_ADMIN, ADMIN
    const allowedByToken = ['MCC_MANAGER', 'SUPER_ADMIN', 'ADMIN'].includes(payload.role)
    let allowedByDCC = false
    if (!allowedByToken) {
      const userRole = await prisma.userRoleAssignment.findFirst({
        where: {
          userId: payload.id,
          isActive: true,
          role: { name: 'DCC' }
        },
        include: { role: true }
      })
      allowedByDCC = !!userRole && userRole.role.name === 'DCC'
    }
    if (!allowedByToken && !allowedByDCC) {
      return NextResponse.json({ success: false, message: 'Access denied.' }, { status: 403 })
    }

    // Fetch available products (isActive; for MCC/crop processing allow all active so dropdowns work)
    const products = await prisma.products.findMany({
      where: {
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
        images: true,
        unitOfMeasure: true
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
