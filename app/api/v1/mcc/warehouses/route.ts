import { NextRequest, NextResponse } from "next/server"
import { verifyAuthToken } from "@/lib/token"
import { prisma } from "@/lib/prisma"

// GET /api/v1/mcc/warehouses - Get warehouses for an MCC
export async function GET(req: NextRequest) {
  try {
    const authToken = req.headers.get("authorization")?.replace("Bearer ", "")
    if (!authToken) {
      return NextResponse.json({ error: "Authorization token required" }, { status: 401 })
    }

    const user = await verifyAuthToken(authToken)
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN" && user.role !== "MCC_MANAGER")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    let mccId = searchParams.get("mccId")
    if (user.role === "MCC_MANAGER" && user.mccId) {
      mccId = mccId || user.mccId
    }
    if (!mccId) {
      return NextResponse.json({ error: "MCC ID is required" }, { status: 400 })
    }

    const mccIdStr = String(mccId).trim()

    // Fetch MCC warehouses (optionally with linked global warehouse)
    let rows: Array<{
      id: string
      mccId: string
      name: string
      type: string
      location: string
      capacity: number
      isActive: boolean
      globalWarehouseId: string | null
      warehouse?: { id: string; name: string; code: string } | null
    }>

    try {
      const list = await prisma.mcc_warehouses.findMany({
        where: { mccId: mccIdStr },
        orderBy: { name: "asc" },
      })

      const globalIds = [...new Set(list.map((r) => r.globalWarehouseId).filter(Boolean))] as string[]
      const warehouseMap: Record<string, { id: string; name: string; code: string }> = {}

      if (globalIds.length > 0) {
        const linked = await prisma.warehouse.findMany({
          where: { id: { in: globalIds } },
          select: { id: true, name: true, code: true },
        })
        linked.forEach((w) => {
          warehouseMap[w.id] = { id: w.id, name: w.name, code: w.code }
        })
      }

      rows = list.map((r) => ({
        id: r.id,
        mccId: r.mccId,
        name: r.name,
        type: r.type,
        location: r.location,
        capacity: r.capacity,
        isActive: r.isActive,
        globalWarehouseId: r.globalWarehouseId,
        warehouse: r.globalWarehouseId ? warehouseMap[r.globalWarehouseId] ?? null : null,
      }))
    } catch (dbError) {
      console.error("Get warehouses DB error:", dbError)
      throw dbError
    }

    return NextResponse.json({
      success: true,
      data: rows,
    })
  } catch (error) {
    console.error("Get warehouses error:", error)
    return NextResponse.json(
      {
        error: "Failed to get warehouses",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

// POST /api/v1/mcc/warehouses - Create new warehouse
export async function POST(req: NextRequest) {
  try {
    const authToken = req.headers.get("authorization")?.replace("Bearer ", "")
    if (!authToken) {
      return NextResponse.json({ error: "Authorization token required" }, { status: 401 })
    }

    const user = await verifyAuthToken(authToken)
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN" && user.role !== "MCC_MANAGER")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const data = await req.json()
    let { mccId, name, type, location, capacity } = data
    if (user.role === "MCC_MANAGER" && user.mccId) {
      mccId = mccId || user.mccId
    }
    if (!mccId || !name || !type || !location || !capacity) {
      return NextResponse.json(
        { error: "Missing required fields: mccId, name, type, location, capacity" },
        { status: 400 }
      )
    }
    if (user.role === "MCC_MANAGER" && mccId !== user.mccId) {
      return NextResponse.json({ error: "You can only create warehouses for your own MCC" }, { status: 403 })
    }

    const warehouse = await prisma.mcc_warehouses.create({
      data: {
        id: `wh_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        mccId,
        name,
        type,
        location,
        capacity: parseFloat(capacity),
        isActive: true,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      message: "Warehouse created successfully",
      data: warehouse,
    })
  } catch (error: any) {
    console.error("Create warehouse error:", error)
    return NextResponse.json(
      { 
        error: "Failed to create warehouse",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}

