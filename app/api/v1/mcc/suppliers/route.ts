import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { checkMCCPermission } from "@/lib/mcc-auth"

/**
 * GET /api/v1/mcc/suppliers - Get suppliers
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
    const search = searchParams.get("search")
    const limit = parseInt(searchParams.get("limit") || "10")
    const page = parseInt(searchParams.get("page") || "1")
    const skip = (page - 1) * limit

    const where: any = {}
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ]
    }

    const suppliers = await prisma.suppliers.findMany({
      where,
      include: {
        procurements: {
          select: {
            id: true,
            status: true,
            totalAmount: true,
            procuredAt: true,
          },
          orderBy: { procuredAt: "desc" },
          take: 5,
        },
      },
      orderBy: { name: "asc" },
      skip,
      take: limit,
    })

    const total = await prisma.suppliers.count({ where })

    return NextResponse.json({
      success: true,
      data: suppliers,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Get suppliers error:", error)
    return NextResponse.json(
      { error: "Failed to get suppliers" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/v1/mcc/suppliers - Create supplier
 */
export async function POST(req: NextRequest) {
  try {
    const authToken = req.headers.get("authorization")?.replace("Bearer ", "")
    const { authorized, user, error } = await checkMCCPermission(
      authToken,
      "mcc.procurements.manage"
    )

    if (!authorized || !user) {
      return NextResponse.json({ error: error || "Unauthorized" }, { status: 401 })
    }

    const data = await req.json()
    const { name, phone, email, address } = data

    if (!name) {
      return NextResponse.json(
        { error: "Missing required field: name" },
        { status: 400 }
      )
    }

    const supplier = await prisma.suppliers.create({
      data: {
        name,
        phone: phone || null,
        email: email || null,
        address: address || null,
      },
    })

    return NextResponse.json({
      success: true,
      message: "Supplier created successfully",
      data: supplier,
    })
  } catch (error) {
    console.error("Create supplier error:", error)
    return NextResponse.json(
      { error: "Failed to create supplier" },
      { status: 500 }
    )
  }
}

