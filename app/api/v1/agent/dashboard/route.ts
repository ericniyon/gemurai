import { NextRequest, NextResponse } from "next/server"
import { verifyAuthToken } from "@/lib/api-auth"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/v1/agent/dashboard
 * Returns dashboard stats and recent collections for the current agent (from DB).
 * For AGENT role: only their data. For MCC_MANAGER/ADMIN: optional agentId query.
 */
export async function GET(req: NextRequest) {
  try {
    const authToken = req.headers.get("authorization")?.replace("Bearer ", "")
    if (!authToken) {
      return NextResponse.json({ error: "Authorization token required" }, { status: 401 })
    }

    const user = await verifyAuthToken(authToken)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const agentIdParam = searchParams.get("agentId")
    const mccIdParam = searchParams.get("mccId")

    const agentId =
      user.role === "AGENT" ? user.id : agentIdParam || user.id
    const mccId = mccIdParam || user.mccId || undefined

    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
    const todayEnd = new Date(todayStart)
    todayEnd.setDate(todayEnd.getDate() + 1)

    const dayOfMonth = now.getDate()
    const periodStart = new Date(now.getFullYear(), now.getMonth(), dayOfMonth <= 15 ? 1 : 16, 0, 0, 0, 0)
    const periodEnd = new Date(periodStart)
    if (dayOfMonth <= 15) {
      periodEnd.setDate(16)
    } else {
      periodEnd.setMonth(periodEnd.getMonth() + 1)
    }

    const whereBase: { agentId: string; mccId?: string } = { agentId }
    if (mccId) whereBase.mccId = mccId

    const signalsDelegate = (prisma as any).pre_collection_availability_signals as { count: (args: { where: any }) => Promise<number> } | undefined

    const [collectionsToday, collectionsPeriod, pendingQualityCount, recentCollections, farmerAssignments, signalsCountResult] =
      await Promise.all([
        prisma.commodity_collections.findMany({
          where: {
            ...whereBase,
            collectionDate: { gte: todayStart, lt: todayEnd },
          },
          select: { id: true, quantity: true, collectionDate: true, status: true, farmerId: true },
        }),
        prisma.commodity_collections.findMany({
          where: {
            ...whereBase,
            collectionDate: { gte: periodStart, lt: periodEnd },
          },
          select: { id: true, quantity: true },
        }),
        prisma.commodity_collections.count({
          where: {
            ...whereBase,
            status: "PENDING",
          },
        }),
        prisma.commodity_collections.findMany({
          where: whereBase,
          orderBy: { collectionDate: "desc" },
          take: 10,
          select: {
            id: true,
            quantity: true,
            unit: true,
            collectionDate: true,
            status: true,
            farmer: { select: { id: true, name: true, farmerCode: true } },
          },
        }),
        prisma.farmer_agent_assignments.findMany({
          where: { agentId, isActive: true },
          select: { farmerId: true },
        }),
        signalsDelegate?.count
          ? signalsDelegate.count({ where: { createdByUserId: user.id, status: "ACTIVE" } })
          : Promise.resolve(0),
      ])

    const todayLiters = collectionsToday.reduce((sum, c) => sum + (c.quantity ?? 0), 0)
    const periodLiters = collectionsPeriod.reduce((sum, c) => sum + (c.quantity ?? 0), 0)
    const totalFarmers = farmerAssignments.length
    const activeFarmers = totalFarmers

    const commissionCollections = await prisma.commodity_collections.findMany({
      where: {
        ...whereBase,
        status: { in: ["APPROVED", "PENDING"] },
      },
      select: { totalAmount: true, status: true },
    })
    let commissionEarned = 0
    let commissionPending = 0
    commissionCollections.forEach((c) => {
      const commission = (c.totalAmount ?? 0) * 0.02
      if (c.status === "APPROVED") {
        commissionEarned += commission
      } else {
        commissionPending += commission
      }
    })

    const recent = recentCollections.map((c) => {
      const status =
        c.status === "APPROVED" ? "passed" : c.status === "REJECTED" ? "rejected" : c.status === "PENDING" ? "pending" : "conditional"
      return {
        id: c.id,
        farmerName: c.farmer?.name ?? "—",
        farmerCode: c.farmer?.farmerCode ?? "",
        quantity: c.quantity,
        unit: c.unit,
        status,
        time: c.collectionDate ? new Date(c.collectionDate).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) : "",
      }
    })

    const payload = {
      todayCollections: collectionsToday.length,
      todayLiters: Math.round(todayLiters * 100) / 100,
      periodCollections: collectionsPeriod.length,
      periodLiters: Math.round(periodLiters * 100) / 100,
      totalFarmers,
      activeFarmers,
      pendingQualityCheck: pendingQualityCount,
      commissionEarned: Math.round(commissionEarned * 100) / 100,
      commissionPending: Math.round(commissionPending * 100) / 100,
      recentCollections: recent,
      signalsCount: typeof signalsCountResult === "number" ? signalsCountResult : 0,
    }

    return NextResponse.json({ success: true, data: payload })
  } catch (error: any) {
    console.error("Get agent dashboard error:", error)
    return NextResponse.json(
      {
        error: "Failed to load agent dashboard",
        message: process.env.NODE_ENV === "development" ? error?.message : undefined,
      },
      { status: 500 }
    )
  }
}
