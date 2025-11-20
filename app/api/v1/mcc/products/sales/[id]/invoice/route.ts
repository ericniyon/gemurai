import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { checkMCCPermission } from "@/lib/mcc-auth"

/**
 * GET /api/v1/mcc/products/sales/[id]/invoice
 * Get invoice/receipt for a sale
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authToken = req.headers.get("authorization")?.replace("Bearer ", "")
    const { authorized, user, error } = await checkMCCPermission(
      authToken,
      "mcc.sales.view"
    )

    if (!authorized || !user) {
      return NextResponse.json({ error: error || "Unauthorized" }, { status: 401 })
    }

    const saleId = params.id

    const sale = await prisma.sales.findUnique({
      where: { id: saleId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                category: true,
                price: true,
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
            address: true,
            email: true,
          },
        },
        mcc: {
          select: {
            id: true,
            name: true,
            code: true,
            address: true,
            contactInfo: true,
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

    if (!sale) {
      return NextResponse.json({ error: "Sale not found" }, { status: 404 })
    }

    // Check access permissions
    if (user.role === "FARMER") {
      const farmer = await prisma.farmers.findFirst({
        where: { phone: user.phone || "" },
        select: { id: true },
      })
      if (farmer && sale.farmerId !== farmer.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
      }
    }

    if (user.role === "MCC_MANAGER" && user.mccId !== sale.mccId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Format invoice data
    const invoice = {
      invoiceNo: sale.invoiceNo,
      invoiceDate: sale.saleAt,
      mcc: sale.mcc,
      customer: sale.farmer
        ? {
            name: sale.farmer.name,
            phone: sale.farmer.phone,
            farmerCode: sale.farmer.farmerCode,
            address: sale.farmer.address,
            email: sale.farmer.email,
          }
        : null,
      items: sale.items.map((item) => ({
        product: item.product,
        quantity: item.qty,
        unitPrice: item.unitPrice,
        total: item.qty * item.unitPrice,
      })),
      subtotal: sale.totalAmount,
      total: sale.totalAmount,
      paymentMethod: sale.paymentMethod,
      paid: sale.paid,
      agent: sale.agent,
    }

    return NextResponse.json({
      success: true,
      data: {
        invoice,
        sale,
      },
    })
  } catch (error) {
    console.error("Get invoice error:", error)
    return NextResponse.json(
      { error: "Failed to get invoice" },
      { status: 500 }
    )
  }
}

