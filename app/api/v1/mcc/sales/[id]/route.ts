import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuthToken } from "@/lib/api-auth"

// GET /api/v1/mcc/sales/[id] - Get a specific sale
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const sale = await prisma.mcc_sales.findUnique({
      where: { id: params.id }
    })

    if (!sale) {
      return NextResponse.json({ error: "Sale not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: sale
    })
  } catch (error) {
    console.error("Get sale error:", error)
    return NextResponse.json(
      { error: "Failed to fetch sale" },
      { status: 500 }
    )
  }
}

// PUT /api/v1/mcc/sales/[id] - Update a sale
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authToken = req.headers.get("authorization")?.replace("Bearer ", "")
    if (!authToken) {
      return NextResponse.json({ error: "Authorization token required" }, { status: 401 })
    }

    const user = await verifyAuthToken(authToken)
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const data = await req.json()
    
    // Check if sale exists
    const existingSale = await prisma.mcc_sales.findUnique({
      where: { id: params.id }
    })

    if (!existingSale) {
      return NextResponse.json({ error: "Sale not found" }, { status: 404 })
    }

    // Calculate total amount if litersSold or unitPrice changed
    let totalAmount = existingSale.totalAmount
    if (data.litersSold || data.unitPrice) {
      const litersSold = data.litersSold || existingSale.litersSold
      const unitPrice = data.unitPrice || existingSale.unitPrice
      totalAmount = litersSold * unitPrice
    }

    // Update the sale record
    const updatedSale = await prisma.mcc_sales.update({
      where: { id: params.id },
      data: {
        ...data,
        totalAmount: totalAmount,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: "Sale updated successfully",
      data: updatedSale
    })
  } catch (error) {
    console.error("Sale update error:", error)
    return NextResponse.json(
      { error: "Failed to update sale" },
      { status: 500 }
    )
  }
}

// DELETE /api/v1/mcc/sales/[id] - Delete a sale
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authToken = req.headers.get("authorization")?.replace("Bearer ", "")
    if (!authToken) {
      return NextResponse.json({ error: "Authorization token required" }, { status: 401 })
    }

    const user = await verifyAuthToken(authToken)
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Check if sale exists
    const existingSale = await prisma.mcc_sales.findUnique({
      where: { id: params.id }
    })

    if (!existingSale) {
      return NextResponse.json({ error: "Sale not found" }, { status: 404 })
    }

    // Delete the sale record
    await prisma.mcc_sales.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      success: true,
      message: "Sale deleted successfully"
    })
  } catch (error) {
    console.error("Sale deletion error:", error)
    return NextResponse.json(
      { error: "Failed to delete sale" },
      { status: 500 }
    )
  }
}



















