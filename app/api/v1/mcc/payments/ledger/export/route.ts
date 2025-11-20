import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { checkMCCPermission } from "@/lib/mcc-auth"

/**
 * GET /api/v1/mcc/payments/ledger/export
 * Export ledger to CSV
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
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    if (!farmerId && !mccId) {
      return NextResponse.json(
        { error: "Farmer ID or MCC ID required" },
        { status: 400 }
      )
    }

    // Build where clause
    const where: any = {}
    if (farmerId) where.farmerId = farmerId
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
        entry.farmer.farmerCode || "",
        entry.farmer.name,
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
  } catch (error) {
    console.error("Export ledger error:", error)
    return NextResponse.json(
      { error: "Failed to export ledger" },
      { status: 500 }
    )
  }
}

