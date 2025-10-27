import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuthToken } from "@/lib/api-auth"

// POST /api/v1/mcc/sales - Record a new sale
export async function POST(req: NextRequest) {
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
    
    // Validate required fields
    if (!data.litersSold || !data.unitPrice || !data.companyName || !data.companyContact || !data.mccId) {
      return NextResponse.json(
        { error: "Missing required fields: litersSold, unitPrice, companyName, companyContact, mccId" },
        { status: 400 }
      )
    }

    // Calculate total amount
    const totalAmount = data.litersSold * data.unitPrice

    // Create the sale record
    const sale = await prisma.mcc_sales.create({
      data: {
        mccId: data.mccId,
        litersSold: data.litersSold,
        unitPrice: data.unitPrice,
        totalAmount: totalAmount,
        companyName: data.companyName,
        companyContact: data.companyContact,
        companyAddress: data.companyAddress || "",
        paymentStatus: data.paymentStatus || "pending",
        saleDate: data.saleDate ? new Date(data.saleDate) : new Date(),
        notes: data.notes || "",
        recordedBy: user.id
      }
    })

    return NextResponse.json({
      success: true,
      message: "Sale recorded successfully",
      data: sale
    })
  } catch (error) {
    console.error("Sale recording error:", error)
    return NextResponse.json(
      { error: "Failed to record sale" },
      { status: 500 }
    )
  }
}

// GET /api/v1/mcc/sales - Get sales records
export async function GET(req: NextRequest) {
  try {
    const authToken = req.headers.get("authorization")?.replace("Bearer ", "")
    if (!authToken) {
      return NextResponse.json({ error: "Authorization token required" }, { status: 401 })
    }

    const user = await verifyAuthToken(authToken)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const mccId = searchParams.get("mccId")
    const limit = parseInt(searchParams.get("limit") || "50")
    const page = parseInt(searchParams.get("page") || "1")
    const skip = (page - 1) * limit

    if (!mccId) {
      return NextResponse.json({ 
        success: false, 
        error: "MCC ID is required" 
      }, { status: 400 })
    }

    // Check if user has access to this MCC
    if (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN") {
      // For regular users, check if they belong to this MCC
      const userMcc = await prisma.users.findFirst({
        where: {
          id: user.id,
          mccId: mccId
        }
      })

      if (!userMcc) {
        return NextResponse.json({ error: "Access denied to this MCC" }, { status: 403 })
      }
    }

    // Get sales records
    const sales = await prisma.mcc_sales.findMany({
      where: {
        mccId: mccId
      },
      orderBy: { saleDate: 'desc' },
      skip,
      take: limit
    })

    const total = await prisma.mcc_sales.count({
      where: {
        mccId: mccId
      }
    })

    return NextResponse.json({
      success: true,
      data: sales,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error("Get sales error:", error)
    return NextResponse.json(
      { error: "Failed to fetch sales" },
      { status: 500 }
    )
  }
}


