import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/database"

export async function GET(req: NextRequest) {
  try {
    const warehouses = await prisma.warehouse.findMany({
      select: {
        id: true,
        name: true,
        code: true,
        isActive: true
      }
    })

    return NextResponse.json({
      success: true,
      warehouses,
      count: warehouses.length
    })
  } catch (error) {
    console.error("Error fetching warehouses:", error)
    return NextResponse.json(
      { error: "Failed to fetch warehouses" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, code, description, country, city } = body

    const warehouse = await prisma.warehouse.create({
      data: {
        name: name || "Test Warehouse",
        code: code || "WH001",
        description: description || "Test warehouse for development",
        country: country || "Rwanda",
        city: city || "Kigali",
        isActive: true,
        isMain: false
      }
    })

    return NextResponse.json({
      success: true,
      warehouse
    })
  } catch (error) {
    console.error("Error creating warehouse:", error)
    return NextResponse.json(
      { error: "Failed to create warehouse" },
      { status: 500 }
    )
  }
} 