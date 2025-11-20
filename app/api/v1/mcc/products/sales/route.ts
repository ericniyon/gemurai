import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { checkMCCPermission } from "@/lib/mcc-auth"
import { randomBytes } from "crypto"

/**
 * POST /api/v1/mcc/products/sales - Record product sale (inputs, medicines)
 * Supports cash/credit payment, generates invoice
 */
export async function POST(req: NextRequest) {
  try {
    const authToken = req.headers.get("authorization")?.replace("Bearer ", "")
    const { authorized, user, error } = await checkMCCPermission(
      authToken,
      "mcc.sales.create"
    )

    if (!authorized || !user) {
      return NextResponse.json({ error: error || "Unauthorized" }, { status: 401 })
    }

    const data = await req.json()
    const { mccId, farmerId, items, paymentMethod, paid, notes } = data

    if (!mccId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields: mccId, items" },
        { status: 400 }
      )
    }

    // If user is MCC_MANAGER, verify they own this MCC
    if (user.role === "MCC_MANAGER" && user.mccId !== mccId) {
      return NextResponse.json({ error: "Unauthorized for this MCC" }, { status: 403 })
    }

    // Validate items and calculate totals
    let totalAmount = 0
    const saleItems = []

    for (const item of items) {
      if (!item.productId || !item.qty || !item.unitPrice) {
        return NextResponse.json(
          { error: "Each item must have productId, qty, and unitPrice" },
          { status: 400 }
        )
      }

      // Check product exists and has stock
      const product = await prisma.products.findUnique({
        where: { id: item.productId },
        select: {
          id: true,
          name: true,
          stock: true,
          price: true,
          sku: true,
        },
      })

      if (!product) {
        return NextResponse.json(
          { error: `Product ${item.productId} not found` },
          { status: 404 }
        )
      }

      if (product.stock < item.qty) {
        return NextResponse.json(
          { error: `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.qty}` },
          { status: 400 }
        )
      }

      const itemTotal = item.qty * item.unitPrice
      totalAmount += itemTotal

      saleItems.push({
        productId: item.productId,
        qty: item.qty,
        unitPrice: item.unitPrice,
        productName: product.name,
        productSku: product.sku,
      })
    }

    // Check credit limit if farmer and credit payment
    if (farmerId && paymentMethod === "CREDIT") {
      const farmer = await prisma.farmers.findUnique({
        where: { id: farmerId },
        include: {
          farmer_account: true,
        },
      })

      if (!farmer) {
        return NextResponse.json({ error: "Farmer not found" }, { status: 404 })
      }

      const currentBalance = farmer.farmer_account?.balance || 0
      const creditLimit = farmer.creditLimit || 0
      const newBalance = currentBalance + totalAmount

      if (newBalance > creditLimit) {
        return NextResponse.json(
          {
            error: `Credit limit exceeded. Current balance: ${currentBalance}, Credit limit: ${creditLimit}, Sale amount: ${totalAmount}`,
          },
          { status: 400 }
        )
      }
    }

    // Generate invoice number
    const invoiceNo = `INV-${Date.now()}-${randomBytes(4).toString("hex").toUpperCase()}`

    // Create sale transaction
    const sale = await prisma.$transaction(async (tx) => {
      // Create sale record
      const saleRecord = await tx.sales.create({
        data: {
          mccId: mccId,
          farmerId: farmerId || null,
          agentId: user.id,
          totalAmount: totalAmount,
          paymentMethod: paymentMethod || "CASH",
          paid: paid || paymentMethod === "CASH",
          invoiceNo: invoiceNo,
        },
      })

      // Create sale items and update stock
      for (const item of saleItems) {
        await tx.sale_items.create({
          data: {
            saleId: saleRecord.id,
            productId: item.productId,
            qty: item.qty,
            unitPrice: item.unitPrice,
          },
        })

        // Update product stock
        await tx.products.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.qty,
            },
          },
        })
      }

      // Update farmer account if credit
      if (farmerId && paymentMethod === "CREDIT") {
        const farmerAccount = await tx.farmer_accounts.upsert({
          where: { farmerId: farmerId },
          create: {
            farmerId: farmerId,
            balance: totalAmount,
          },
          update: {
            balance: {
              increment: totalAmount,
            },
            lastUpdated: new Date(),
          },
        })

        // Create ledger entry
        await tx.farmer_ledger.create({
          data: {
            farmerId: farmerId,
            type: "SALE",
            amount: -totalAmount, // Negative for purchases
            balanceAfter: farmerAccount.balance,
            refId: saleRecord.id,
            notes: `Product sale - Invoice ${invoiceNo}`,
          },
        })
      }

      return saleRecord
    })

    // Fetch complete sale with items
    const completeSale = await prisma.sales.findUnique({
      where: { id: sale.id },
      include: {
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
        farmer: {
          select: {
            id: true,
            name: true,
            phone: true,
            farmerCode: true,
          },
        },
        mcc: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        agent: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      message: "Sale recorded successfully",
      data: {
        sale: completeSale,
        invoice: {
          invoiceNo: invoiceNo,
          totalAmount: totalAmount,
          paymentMethod: paymentMethod || "CASH",
          paid: paid || paymentMethod === "CASH",
        },
      },
    })
  } catch (error) {
    console.error("Product sale error:", error)
    return NextResponse.json(
      {
        error: "Failed to record sale",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/v1/mcc/products/sales - Get product sales
 */
export async function GET(req: NextRequest) {
  try {
    const authToken = req.headers.get("authorization")?.replace("Bearer ", "")
    const { authorized, user, error } = await checkMCCPermission(
      authToken,
      "mcc.sales.view"
    )

    if (!authorized || !user) {
      return NextResponse.json({ error: error || "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const mccId = searchParams.get("mccId")
    const farmerId = searchParams.get("farmerId")
    const invoiceNo = searchParams.get("invoiceNo")
    const paymentMethod = searchParams.get("paymentMethod")
    const paid = searchParams.get("paid")
    const limit = parseInt(searchParams.get("limit") || "10")
    const page = parseInt(searchParams.get("page") || "1")
    const skip = (page - 1) * limit

    // If user is MCC_MANAGER, filter by their MCC
    let targetMccId = mccId
    if (!targetMccId && user.role === "MCC_MANAGER" && user.mccId) {
      targetMccId = user.mccId
    }

    // If user is FARMER, only show their own sales
    if (user.role === "FARMER" && user.id) {
      const farmer = await prisma.farmers.findFirst({
        where: { phone: user.phone || "" },
        select: { id: true },
      })
      if (farmer) {
        const sales = await prisma.sales.findMany({
          where: { farmerId: farmer.id },
          include: {
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
            mcc: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
          orderBy: { saleAt: "desc" },
          skip,
          take: limit,
        })

        const total = await prisma.sales.count({
          where: { farmerId: farmer.id },
        })

        return NextResponse.json({
          success: true,
          data: sales,
          meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        })
      }
    }

    // Build where clause
    const where: any = {}
    if (targetMccId) where.mccId = targetMccId
    if (farmerId) where.farmerId = farmerId
    if (invoiceNo) where.invoiceNo = invoiceNo
    if (paymentMethod) where.paymentMethod = paymentMethod
    if (paid !== null) where.paid = paid === "true"

    const sales = await prisma.sales.findMany({
      where,
      include: {
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
        farmer: {
          select: {
            id: true,
            name: true,
            phone: true,
            farmerCode: true,
          },
        },
        mcc: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        agent: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { saleAt: "desc" },
      skip,
      take: limit,
    })

    const total = await prisma.sales.count({ where })

    return NextResponse.json({
      success: true,
      data: sales,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Get sales error:", error)
    return NextResponse.json(
      { error: "Failed to get sales" },
      { status: 500 }
    )
  }
}

