import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { checkMCCPermission } from "@/lib/mcc-auth"

/**
 * GET /api/v1/mcc/customers - Get customers (from customers table and sales records)
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

    // Get customers from customers table (if table exists)
    let registeredCustomers: any[] = []
    try {
      // Check if mcc_customers model exists in Prisma client
      if (prisma.mcc_customers) {
        const customerWhere: any = {
          mccId: targetMccId,
        }

        if (search) {
          customerWhere.OR = [
            { name: { contains: search, mode: "insensitive" } },
            { contact: { contains: search, mode: "insensitive" } },
            { address: { contains: search, mode: "insensitive" } },
          ]
        }

        registeredCustomers = await prisma.mcc_customers.findMany({
          where: customerWhere,
          select: {
            id: true,
            name: true,
            contact: true,
            email: true,
            address: true,
            district: true,
            contactPerson: true,
            taxId: true,
            notes: true,
            createdAt: true,
          },
        })
      }
    } catch (error) {
      // Table doesn't exist yet or Prisma client not regenerated
      // Continue with just sales data
      console.warn("mcc_customers table not available, using sales data only:", error)
      registeredCustomers = []
    }

    // Get unique customers from sales
    const salesWhere: any = {
      mccId: targetMccId,
    }

    if (search) {
      salesWhere.OR = [
        { companyName: { contains: search, mode: "insensitive" } },
        { companyContact: { contains: search, mode: "insensitive" } },
        { companyAddress: { contains: search, mode: "insensitive" } },
      ]
    }

    const sales = await prisma.mcc_sales.findMany({
      where: salesWhere,
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

    // Group by company name to get unique customers from sales
    const customerMap = new Map<string, any>()
    
    // First, add registered customers to the map
    registeredCustomers.forEach((customer) => {
      const key = customer.name.toLowerCase().trim()
      if (!customerMap.has(key)) {
        customerMap.set(key, {
          name: customer.name,
          contact: customer.contact,
          address: customer.address || "",
          email: customer.email || null,
          district: customer.district || null,
          contactPerson: customer.contactPerson || null,
          taxId: customer.taxId || null,
          notes: customer.notes || null,
          totalPurchases: 0,
          totalAmount: 0,
          lastPurchaseDate: customer.createdAt.toISOString(),
          avgPricePerLiter: 0,
          totalLiters: 0,
          paymentStatus: "pending",
          registeredDate: customer.createdAt.toISOString(),
        })
      }
    })
    
    // Then, merge sales data into the map
    sales.forEach((sale) => {
      const key = sale.companyName.toLowerCase().trim()
      if (!customerMap.has(key)) {
        customerMap.set(key, {
          name: sale.companyName,
          contact: sale.companyContact,
          address: sale.companyAddress || "",
          email: null,
          district: null,
          contactPerson: null,
          taxId: null,
          notes: null,
          totalPurchases: 0,
          totalAmount: 0,
          lastPurchaseDate: sale.saleDate,
          avgPricePerLiter: 0,
          totalLiters: 0,
          paymentStatus: sale.paymentStatus,
          registeredDate: null,
        })
      }
      
      const customer = customerMap.get(key)!
      customer.totalPurchases += 1
      customer.totalAmount += sale.totalAmount
      customer.totalLiters += sale.unitPrice ? sale.totalAmount / sale.unitPrice : 0
      if (new Date(sale.saleDate) > new Date(customer.lastPurchaseDate)) {
        customer.lastPurchaseDate = sale.saleDate
      }
      // Update payment status to the most recent sale's status
      customer.paymentStatus = sale.paymentStatus
    })

    // Calculate average price per liter for each customer
    customerMap.forEach((customer) => {
      customer.avgPricePerLiter = customer.totalLiters > 0 
        ? customer.totalAmount / customer.totalLiters 
        : 0
    })

    // Convert to array
    let customers = Array.from(customerMap.values())
    
    // Sort by last purchase date (most recent first), then by registered date
    customers.sort((a, b) => {
      const dateA = new Date(a.lastPurchaseDate || a.registeredDate || 0).getTime()
      const dateB = new Date(b.lastPurchaseDate || b.registeredDate || 0).getTime()
      return dateB - dateA
    })

    // Apply pagination
    const total = customers.length
    const paginatedCustomers = customers.slice(skip, skip + limit)

    // Get statistics
    const totalCustomers = customers.length
    const activeCustomers = customers.filter(
      (c) => {
        const lastDate = c.lastPurchaseDate ? new Date(c.lastPurchaseDate) : null
        if (!lastDate) return false
        return lastDate >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      }
    ).length

    const customersWithSales = customers.filter(c => c.totalPurchases > 0)
    const avgPrice = customersWithSales.length > 0
      ? customersWithSales.reduce((sum, c) => sum + c.avgPricePerLiter, 0) / customersWithSales.length
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
 * POST /api/v1/mcc/customers - Create a customer record
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
    const { name, contact, email, address, district, contactPerson, taxId, notes, mccId, gpsLatitude, gpsLongitude, geoConsent } = data
    const trimmedName = typeof name === "string" ? name.trim() : ""
    const trimmedContact = typeof contact === "string" ? contact.trim() : ""

    // If user is MCC_MANAGER and explicitly passed a different MCC, block it
    if (user.role === "MCC_MANAGER" && mccId && user.mccId && user.mccId !== mccId) {
      return NextResponse.json({ error: "Unauthorized for this MCC" }, { status: 403 })
    }

    let targetMccId: string | null = mccId || user.mccId || null

    if (!targetMccId) {
      try {
        if (user.role === "MCC_MANAGER") {
          const managerMcc = await prisma.mccs.findFirst({
            where: { managerUserId: user.id },
            select: { id: true },
          })
          targetMccId = managerMcc?.id || null
        } else {
          const staffRecord = await prisma.staff.findFirst({
            where: { userId: user.id },
            select: { mccId: true },
          })
          targetMccId = staffRecord?.mccId || null
        }
      } catch (resolveError) {
        console.error("Failed to resolve MCC assignment for user:", resolveError)
      }
    }

    if (!trimmedName || !trimmedContact || !targetMccId) {
      return NextResponse.json(
        { error: "Missing required fields: name, contact, mccId" },
        { status: 400 }
      )
    }

    // Check if mcc_customers table exists
    if (!prisma.mcc_customers) {
      // Table doesn't exist yet - return success but don't create record
      // User needs to run migration first
      return NextResponse.json({
        success: true,
        message: "Customer information validated. Note: Customer table migration needed. Create a sale to register the customer.",
        data: {
          name: trimmedName,
          contact: trimmedContact,
          address: (typeof address === "string" ? address.trim() : "") || "",
          mccId: targetMccId,
        },
      })
    }

    // Check if customer already exists (by name and contact)
    const existingCustomer = await prisma.mcc_customers.findFirst({
      where: {
        mccId: targetMccId,
        name: trimmedName,
        contact: trimmedContact,
      },
    })

    if (existingCustomer) {
      return NextResponse.json({
        success: true,
        message: "Customer already exists",
        data: {
          id: existingCustomer.id,
          name: existingCustomer.name,
          contact: existingCustomer.contact,
          address: existingCustomer.address || "",
          mccId: existingCustomer.mccId,
        },
      })
    }

    // Create customer record
    const hasGeoLocation = gpsLatitude != null && gpsLongitude != null
    const customer = await prisma.mcc_customers.create({
      data: {
        mccId: targetMccId,
        name: trimmedName,
        contact: trimmedContact,
        email: email && typeof email === "string" ? email.trim() || null : null,
        address: address && typeof address === "string" ? address.trim() || null : null,
        district: district && typeof district === "string" ? district.trim() || null : null,
        contactPerson: contactPerson && typeof contactPerson === "string" ? contactPerson.trim() || null : null,
        taxId: taxId && typeof taxId === "string" ? taxId.trim() || null : null,
        notes: notes && typeof notes === "string" ? notes.trim() || null : null,
        // Geo-location fields
        gpsLatitude: gpsLatitude != null ? parseFloat(gpsLatitude) : null,
        gpsLongitude: gpsLongitude != null ? parseFloat(gpsLongitude) : null,
        geoConsent: geoConsent ?? hasGeoLocation,
        geoConsentAt: hasGeoLocation ? new Date() : null,
        geoCreatedAt: hasGeoLocation ? new Date() : null,
      },
    })

    return NextResponse.json({
      success: true,
      message: "Customer created successfully",
      data: {
        id: customer.id,
        name: customer.name,
        contact: customer.contact,
        address: customer.address || "",
        mccId: customer.mccId,
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

