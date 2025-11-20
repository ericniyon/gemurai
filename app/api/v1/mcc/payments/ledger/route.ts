import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { checkMCCPermission } from "@/lib/mcc-auth"

/**
 * GET /api/v1/mcc/payments/ledger - Get farmer account ledger
 */
export async function GET(req: NextRequest) {
  try {
    const authToken = req.headers.get("authorization")?.replace("Bearer ", "")
    const { authorized, user, error } = await checkMCCPermission(
      authToken,
      "mcc.ledger.view"
    )

    if (!authorized || !user) {
      return NextResponse.json({ error: error || "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const farmerId = searchParams.get("farmerId")
    const mccId = searchParams.get("mccId")
    const type = searchParams.get("type")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const format = searchParams.get("format") // "csv" or "json" (default)
    const limit = parseInt(searchParams.get("limit") || "50")
    const page = parseInt(searchParams.get("page") || "1")
    const skip = (page - 1) * limit

    // If user is FARMER, only show their own ledger
    if (user.role === "FARMER" && user.id) {
      const farmer = await prisma.farmers.findFirst({
        where: { phone: user.phone || "" },
        select: { id: true },
      })
      if (farmer) {
        const where: any = { farmerId: farmer.id }
        if (type) where.type = type
        if (startDate) where.entryAt = { gte: new Date(startDate) }
        if (endDate) {
          where.entryAt = {
            ...where.entryAt,
            lte: new Date(endDate),
          }
        }

        const ledger = await prisma.farmer_ledger.findMany({
          where,
          orderBy: { entryAt: "desc" },
          skip,
          take: limit,
        })

        const total = await prisma.farmer_ledger.count({ where })
        const account = await prisma.farmer_accounts.findUnique({
          where: { farmerId: farmer.id },
        })

        return NextResponse.json({
          success: true,
          data: {
            ledger,
            account: account || { balance: 0 },
          },
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
    if (farmerId) where.farmerId = farmerId
    if (type) where.type = type
    if (startDate) where.entryAt = { gte: new Date(startDate) }
    if (endDate) {
      where.entryAt = {
        ...where.entryAt,
        lte: new Date(endDate),
      }
    }

    // If MCC ID provided, get all farmers in that MCC
    if (mccId && !farmerId) {
      const farmers = await prisma.farmers.findMany({
        where: { mccId },
        select: { id: true },
      })
      where.farmerId = { in: farmers.map((f) => f.id) }
    }

    // CSV export format
    if (format === "csv") {
      const ledger = await prisma.farmer_ledger.findMany({
        where,
        include: {
          farmer: {
            select: {
              id: true,
              name: true,
              farmerCode: true,
              phone: true,
            },
          },
        },
        orderBy: { entryAt: "asc" },
      })

      // Generate CSV
      const csvHeader = "Date,Farmer Code,Farmer Name,Type,Amount,Balance After,Reference ID,Notes\n"
      const csvRows = ledger.map((entry) => {
        return [
          entry.entryAt.toISOString().split("T")[0],
          entry.farmer?.farmerCode || "",
          entry.farmer?.name || "",
          entry.type || "",
          entry.amount,
          entry.balanceAfter,
          entry.refId || "",
          (entry.notes || "").replace(/,/g, ";"), // Replace commas in notes
        ].join(",")
      })

      const csv = csvHeader + csvRows.join("\n")

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="ledger-${Date.now()}.csv"`,
        },
      })
    }

    // JSON format (default)
    if (!farmerId && !mccId) {
      return NextResponse.json(
        { error: "Farmer ID or MCC ID required" },
        { status: 400 }
      )
    }

    const ledger = await prisma.farmer_ledger.findMany({
      where,
      orderBy: { entryAt: "desc" },
      skip,
      take: limit,
    })

    const total = await prisma.farmer_ledger.count({ where })
    const account = farmerId ? await prisma.farmer_accounts.findUnique({
      where: { farmerId },
    }) : null

    return NextResponse.json({
      success: true,
      data: {
        ledger,
        account: account || { balance: 0 },
      },
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Get ledger error:", error)
    return NextResponse.json(
      { error: "Failed to get ledger" },
      { status: 500 }
    )
  }
}

