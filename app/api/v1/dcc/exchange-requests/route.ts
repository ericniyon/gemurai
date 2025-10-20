import { NextRequest, NextResponse } from 'next/server'
import { verifyAuthToken } from '@/lib/token'
import { prisma } from '@/lib/prisma'

// GET - Fetch exchange requests for the authenticated DCC
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

    // Fetch exchange requests for this DCC
    const exchangeRequests = await prisma.exchangeRequest.findMany({
      where: {
        dccId: payload.id
      },
      include: {
        currentProduct: true,
        requestedProduct: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      data: exchangeRequests
    })

  } catch (error) {
    console.error('Error fetching exchange requests:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch exchange requests' },
      { status: 500 }
    )
  }
}

// POST - Create a new exchange request
export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const {
      currentProductId,
      currentQuantity,
      requestedProductId,
      requestedQuantity,
      reason,
      priority = 'normal'
    } = body

    // Validate required fields
    if (!currentProductId || !requestedProductId || !reason) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields: currentProductId, requestedProductId, reason'
      }, { status: 400 })
    }

    // Validate quantities
    if (currentQuantity < 1 || requestedQuantity < 1) {
      return NextResponse.json({
        success: false,
        message: 'Quantities must be greater than 0'
      }, { status: 400 })
    }

    // Check if DCC has the current product in stock
    const currentStock = await prisma.dccStock.findFirst({
      where: {
        dccId: payload.id,
        productId: currentProductId,
        quantity: {
          gte: currentQuantity
        }
      }
    })

    if (!currentStock) {
      return NextResponse.json({
        success: false,
        message: 'Insufficient stock for the current product'
      }, { status: 400 })
    }

    // Check if requested product exists
    const requestedProduct = await prisma.product.findUnique({
      where: { id: requestedProductId }
    })

    if (!requestedProduct) {
      return NextResponse.json({
        success: false,
        message: 'Requested product not found'
      }, { status: 400 })
    }

    // Create the exchange request
    const exchangeRequest = await prisma.exchangeRequest.create({
      data: {
        dccId: payload.id,
        currentProductId,
        currentQuantity,
        requestedProductId,
        requestedQuantity,
        reason,
        priority,
        status: 'pending'
      },
      include: {
        currentProduct: true,
        requestedProduct: true
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Exchange request created successfully',
      data: exchangeRequest
    })

  } catch (error) {
    console.error('Error creating exchange request:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create exchange request' },
      { status: 500 }
    )
  }
}
