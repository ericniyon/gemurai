import { NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/api-auth"
import { prisma } from "@/lib/database"

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const productId = searchParams.get('productId')
    const warehouseId = searchParams.get('warehouseId')
    const locationId = searchParams.get('locationId')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!productId) {
      return NextResponse.json({
        error: "ProductId is required"
      }, { status: 400 })
    }

    // Get stock moves for the product/location
    const stockMoves = await prisma.stockMove.findMany({
      where: {
        productId,
        ...(warehouseId && { warehouseId }),
        ...(locationId && { 
          OR: [
            { locationId },
            { destinationLocationId: locationId }
          ]
        }),
        state: 'DONE' // Only show completed moves
      },
      include: {
        product: {
          select: { id: true, name: true, code: true }
        },
        warehouse: {
          select: { id: true, name: true, code: true }
        },
        location: {
          select: { id: true, name: true, code: true }
        },
        destinationLocation: {
          select: { id: true, name: true, code: true }
        },
        processedByUser: {
          select: { id: true, name: true }
        }
      },
      orderBy: { processedAt: 'desc' },
      take: limit,
      skip: offset
    })

    // Get inventory adjustments for the product/location
    const adjustments = await prisma.inventoryAdjustment.findMany({
      where: {
        productId,
        ...(warehouseId && { warehouseId }),
        ...(locationId && { locationId }),
        state: 'DONE' // Only show completed adjustments
      },
      include: {
        product: {
          select: { id: true, name: true, code: true }
        },
        warehouse: {
          select: { id: true, name: true, code: true }
        },
        location: {
          select: { id: true, name: true, code: true }
        },
        approvedByUser: {
          select: { id: true, name: true }
        }
      },
      orderBy: { approvedAt: 'desc' },
      take: limit,
      skip: offset
    })

    // Combine and sort by date
    const allMovements = [
      ...stockMoves.map(move => ({
        id: move.id,
        type: 'STOCK_MOVE',
        moveType: move.moveType,
        quantity: move.quantity,
        date: move.processedAt,
        user: move.processedByUser,
        product: move.product,
        warehouse: move.warehouse,
        sourceLocation: move.location,
        destinationLocation: move.destinationLocation,
        reference: move.reference,
        notes: move.notes
      })),
      ...adjustments.map(adj => ({
        id: adj.id,
        type: 'ADJUSTMENT',
        adjustmentType: adj.adjustmentType,
        quantity: adj.quantity,
        date: adj.approvedAt,
        user: adj.approvedByUser,
        product: adj.product,
        warehouse: adj.warehouse,
        location: adj.location,
        reason: adj.reason,
        notes: adj.notes
      }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return NextResponse.json({
      success: true,
      movements: allMovements,
      pagination: {
        limit,
        offset,
        total: allMovements.length
      }
    })

  } catch (error) {
    console.error("Error fetching stock history:", error)
    return NextResponse.json({
      error: "Failed to fetch stock history",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
} 