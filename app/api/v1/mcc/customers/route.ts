import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { checkMCCPermission } from "@/lib/mcc-auth"

/**
 * GET /api/v1/mcc/customers - Get customers (from sales records)
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
    const search = searchParams.get("search")
    const limit = parseInt(searchParams.get("limit") || "10")
    const page = parseInt(searchParams.get("page") || "1")
    const skip = (page - 1) * limit

    // If user is MCC_MANAGER, get their MCC ID
    let targetMccId = mccId
    if (!targetMccId && user.role === "MCC_MANAGER") {
      // Try to get mccId from user object first
      if (user.mccId) {
        targetMccId = user.mccId
      } else {
        // If not in user object, fetch from database
        try {
          const mcc = await prisma.mccs.findFirst({
            where: {
              managerUserId: user.id
            },
            select: {
              id: true
            }
          })
          if (mcc) {
            targetMccId = mcc.id
          }
        } catch (error) {
          console.error("Error fetching MCC for manager:", error)
        }
      }
    }

    if (!targetMccId) {
      return NextResponse.json(
        { error: "MCC ID is required. Please provide mccId parameter or ensure the user is assigned to an MCC." },
        { status: 400 }
      )
    }

    // Build where clause
    const where: any = {
      mccId: targetMccId,
    }

    if (search) {
      where.OR = [
        { companyName: { contains: search, mode: "insensitive" } },
        { companyContact: { contains: search, mode: "insensitive" } },
        { companyAddress: { contains: search, mode: "insensitive" } },
      ]
    }

    // Get unique customers from sales
    const sales = await prisma.mcc_sales.findMany({
      where,
      select: {
        companyName: true,
        companyContact: true,
        companyAddress: true,
        unitPrice: true,
        totalAmount: true,
        saleDate: true,
        paymentStatus: true,
      },
      orderBy: { saleDate: "desc" },
    })

    // Group by company name to get unique customers
    const customerMap = new Map<string, any>()
    
    sales.forEach((sale) => {
      const key = sale.companyName.toLowerCase().trim()
      if (!customerMap.has(key)) {
        customerMap.set(key, {
          name: sale.companyName,
          contact: sale.companyContact,
          address: sale.companyAddress || "",
          totalPurchases: 0,
          totalAmount: 0,
          lastPurchaseDate: sale.saleDate,
          avgPricePerLiter: 0,
          totalLiters: 0,
          paymentStatus: sale.paymentStatus,
        })
      }
      
      const customer = customerMap.get(key)!
      customer.totalPurchases += 1
      customer.totalAmount += sale.totalAmount
      customer.totalLiters += sale.unitPrice ? sale.totalAmount / sale.unitPrice : 0
      if (new Date(sale.saleDate) > new Date(customer.lastPurchaseDate)) {
        customer.lastPurchaseDate = sale.saleDate
      }
    })

    // Calculate average price per liter for each customer
    customerMap.forEach((customer) => {
      customer.avgPricePerLiter = customer.totalLiters > 0 
        ? customer.totalAmount / customer.totalLiters 
        : 0
    })

    // Convert to array and apply search filter if needed
    let customers = Array.from(customerMap.values())
    
    if (search) {
      const searchLower = search.toLowerCase()
      customers = customers.filter(
        (c) =>
          c.name.toLowerCase().includes(searchLower) ||
          c.contact?.toLowerCase().includes(searchLower) ||
          c.address?.toLowerCase().includes(searchLower)
      )
    }

    // Sort by last purchase date (most recent first)
    customers.sort((a, b) => 
      new Date(b.lastPurchaseDate).getTime() - new Date(a.lastPurchaseDate).getTime()
    )

    // Apply pagination
    const total = customers.length
    const paginatedCustomers = customers.slice(skip, skip + limit)

    // Get statistics
    const totalCustomers = customers.length
    const activeCustomers = customers.filter(
      (c) => new Date(c.lastPurchaseDate) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    ).length

    const avgPrice = customers.length > 0
      ? customers.reduce((sum, c) => sum + c.avgPricePerLiter, 0) / customers.length
      : 0

    const totalRevenue = customers.reduce((sum, c) => sum + c.totalAmount, 0)

    return NextResponse.json({
      success: true,
      data: paginatedCustomers,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      statistics: {
        totalCustomers,
        activeCustomers,
        avgPricePerLiter: avgPrice,
        totalRevenue,
      },
    })
  } catch (error) {
    console.error("Get customers error:", error)
    return NextResponse.json(
      { error: "Failed to fetch customers" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/v1/mcc/customers - Create a customer (by creating a sale record)
 * Note: Customers are created implicitly when recording sales
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
    const { name, contact, address, mccId } = data

    if (!name || !contact || !mccId) {
      return NextResponse.json(
        { error: "Missing required fields: name, contact, mccId" },
        { status: 400 }
      )
    }

    // If user is MCC_MANAGER, verify they own this MCC
    if (user.role === "MCC_MANAGER" && user.mccId !== mccId) {
      return NextResponse.json({ error: "Unauthorized for this MCC" }, { status: 403 })
    }

    // Customers are created implicitly through sales
    // This endpoint is mainly for validation/pre-registration
    // Return success with customer info
    return NextResponse.json({
      success: true,
      message: "Customer information validated. Create a sale to register the customer.",
      data: {
        name,
        contact,
        address: address || "",
        mccId,
      },
    })
  } catch (error) {
    console.error("Create customer error:", error)
    return NextResponse.json(
      { error: "Failed to process customer" },
      { status: 500 }
    )
  }
}

