import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { checkMCCPermission } from "@/lib/mcc-auth"

/**
 * POST /api/v1/mcc/procurements - Create procurement/purchase order
 */
export async function POST(req: NextRequest) {
  try {
    const authToken = req.headers.get("authorization")?.replace("Bearer ", "")
    const { authorized, user, error } = await checkMCCPermission(
      authToken,
      "mcc.procurements.create"
    )

    if (!authorized || !user) {
      return NextResponse.json({ error: error || "Unauthorized" }, { status: 401 })
    }

    const data = await req.json()
    const { supplierId, mccId, items, notes } = data

    if (!supplierId || !mccId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields: supplierId, mccId, items" },
        { status: 400 }
      )
    }

    // If user is MCC_MANAGER, verify they own this MCC
    if (user.role === "MCC_MANAGER" && user.mccId !== mccId) {
      return NextResponse.json({ error: "Unauthorized for this MCC" }, { status: 403 })
    }

    // Validate supplier exists
    const supplier = await prisma.suppliers.findUnique({
      where: { id: supplierId },
    })

    if (!supplier) {
      return NextResponse.json({ error: "Supplier not found" }, { status: 404 })
    }

    // Validate items and calculate total
    let totalAmount = 0
    const procurementItems = []

    for (const item of items) {
      if (!item.productId || !item.qty || !item.unitPrice) {
        return NextResponse.json(
          { error: "Each item must have productId, qty, and unitPrice" },
          { status: 400 }
        )
      }

      // Check product exists
      const product = await prisma.products.findUnique({
        where: { id: item.productId },
        select: {
          id: true,
          name: true,
          sku: true,
        },
      })

      if (!product) {
        return NextResponse.json(
          { error: `Product ${item.productId} not found` },
          { status: 404 }
        )
      }

      const itemTotal = item.qty * item.unitPrice
      totalAmount += itemTotal

      procurementItems.push({
        productId: item.productId,
        qty: item.qty,
        unitPrice: item.unitPrice,
      })
    }

    // Create procurement
    const procurement = await prisma.$transaction(async (tx) => {
      // Create procurement record
      const procurementRecord = await tx.procurements.create({
        data: {
          supplierId: supplierId,
          mccId: mccId,
          totalAmount: totalAmount,
          status: "ordered",
        },
      })

      // Create procurement items
      for (const item of procurementItems) {
        await tx.procurement_items.create({
          data: {
            procurementId: procurementRecord.id,
            productId: item.productId,
            qty: item.qty,
            unitPrice: item.unitPrice,
          },
        })
      }

      return procurementRecord
    })

    // Fetch complete procurement with relations
    const completeProcurement = await prisma.procurements.findUnique({
      where: { id: procurement.id },
      include: {
        supplier: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          },
        },
        mcc: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                category: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      message: "Procurement created successfully",
      data: completeProcurement,
    })
  } catch (error) {
    console.error("Create procurement error:", error)
    return NextResponse.json(
      { error: "Failed to create procurement" },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/v1/mcc/procurements/[id]/receive - Receive procurement and update stock
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authToken = req.headers.get("authorization")?.replace("Bearer ", "")
    const { authorized, user, error } = await checkMCCPermission(
      authToken,
      "mcc.procurements.manage"
    )

    if (!authorized || !user) {
      return NextResponse.json({ error: error || "Unauthorized" }, { status: 401 })
    }

    const procurementId = params.id
    const data = await req.json()
    const { warehouseId, locationId, expiryDates } = data // expiryDates: { productId: expiryDate }

    // Get procurement
    const procurement = await prisma.procurements.findUnique({
      where: { id: procurementId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        mcc: true,
      },
    })

    if (!procurement) {
      return NextResponse.json({ error: "Procurement not found" }, { status: 404 })
    }

    if (procurement.status === "received") {
      return NextResponse.json(
        { error: "Procurement already received" },
        { status: 400 }
      )
    }

    // Check access permissions
    if (user.role === "MCC_MANAGER" && user.mccId !== procurement.mccId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Receive procurement and update stock
    const updatedProcurement = await prisma.$transaction(async (tx) => {
      // Update procurement status
      const procurementRecord = await tx.procurements.update({
        where: { id: procurementId },
        data: {
          status: "received",
          procuredAt: new Date(),
        },
      })

      // Update stock for each item
      for (const item of procurement.items) {
        // Update product stock
        await tx.products.update({
          where: { id: item.productId },
          data: {
            stock: {
              increment: item.qty,
            },
          },
        })

        // Create lot number if expiry date provided (for medicines)
        if (expiryDates && expiryDates[item.productId]) {
          await tx.lotNumbers.create({
            data: {
              productId: item.productId,
              lotNumber: `LOT-${Date.now()}-${item.productId.substring(0, 6)}`,
              expiryDate: new Date(expiryDates[item.productId]),
              quantity: item.qty,
              warehouseId: warehouseId || null,
              locationId: locationId || null,
            },
          })
        }
      }

      return procurementRecord
    })

    return NextResponse.json({
      success: true,
      message: "Procurement received and stock updated successfully",
      data: updatedProcurement,
    })
  } catch (error) {
    console.error("Receive procurement error:", error)
    return NextResponse.json(
      { error: "Failed to receive procurement" },
      { status: 500 }
    )
  }
}

/**
 * GET /api/v1/mcc/procurements - Get procurements
 */
export async function GET(req: NextRequest) {
  try {
    const authToken = req.headers.get("authorization")?.replace("Bearer ", "")
    const { authorized, user, error } = await checkMCCPermission(
      authToken,
      "mcc.procurements.view"
    )

    if (!authorized || !user) {
      return NextResponse.json({ error: error || "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const mccId = searchParams.get("mccId")
    const supplierId = searchParams.get("supplierId")
    const status = searchParams.get("status")
    const limit = parseInt(searchParams.get("limit") || "10")
    const page = parseInt(searchParams.get("page") || "1")
    const skip = (page - 1) * limit

    // If user is MCC_MANAGER, filter by their MCC
    let targetMccId = mccId
    if (!targetMccId && user.role === "MCC_MANAGER" && user.mccId) {
      targetMccId = user.mccId
    }

    const where: any = {}
    if (targetMccId) where.mccId = targetMccId
    if (supplierId) where.supplierId = supplierId
    if (status) where.status = status

    const procurements = await prisma.procurements.findMany({
      where,
      include: {
        supplier: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          },
        },
        mcc: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                category: true,
              },
            },
          },
        },
      },
      orderBy: { procuredAt: "desc" },
      skip,
      take: limit,
    })

    const total = await prisma.procurements.count({ where })

    return NextResponse.json({
      success: true,
      data: procurements,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Get procurements error:", error)
    return NextResponse.json(
      { error: "Failed to get procurements" },
      { status: 500 }
    )
  }
}

