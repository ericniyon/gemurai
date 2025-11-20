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
    const mccId = searchParams.get("mccId")

    if (!mccId) {
      return NextResponse.json({ error: "MCC ID is required" }, { status: 400 })
    }

    const warehouses = await prisma.mcc_warehouses.findMany({
      where: { mccId },
      orderBy: { name: "asc" },
    })

    return NextResponse.json({
      success: true,
      data: warehouses,
    })
  } catch (error) {
    console.error("Get warehouses error:", error)
    return NextResponse.json(
      { 
        error: "Failed to get warehouses",
        details: error instanceof Error ? error.message : "Unknown error"
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
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const data = await req.json()
    const { mccId, name, type, location, capacity } = data

    if (!mccId || !name || !type || !location || !capacity) {
      return NextResponse.json(
        { error: "Missing required fields: mccId, name, type, location, capacity" },
        { status: 400 }
      )
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

