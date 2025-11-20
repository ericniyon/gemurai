import { NextRequest, NextResponse } from "next/server"
import { verifyAuthToken } from "@/lib/token"
import { prisma } from "@/lib/prisma"

// PUT /api/v1/mcc/warehouses/[id] - Update warehouse
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authToken = req.headers.get("authorization")?.replace("Bearer ", "")
    if (!authToken) {
      return NextResponse.json({ error: "Authorization token required" }, { status: 401 })
    }

    const user = await verifyAuthToken(authToken)
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { id } = await params
    const data = await req.json()
    const { name, type, location, capacity, isActive } = data

    const warehouse = await prisma.mcc_warehouses.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(type && { type }),
        ...(location && { location }),
        ...(capacity !== undefined && { capacity: parseFloat(capacity) }),
        ...(isActive !== undefined && { isActive: isActive }),
      },
    })

    return NextResponse.json({
      success: true,
      message: "Warehouse updated successfully",
      data: warehouse,
    })
  } catch (error: any) {
    console.error("Update warehouse error:", error)
    
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Warehouse not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { 
        error: "Failed to update warehouse",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}

// DELETE /api/v1/mcc/warehouses/[id] - Delete warehouse
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authToken = req.headers.get("authorization")?.replace("Bearer ", "")
    if (!authToken) {
      return NextResponse.json({ error: "Authorization token required" }, { status: 401 })
    }

    const user = await verifyAuthToken(authToken)
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { id } = await params

    await prisma.mcc_warehouses.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: "Warehouse deleted successfully",
    })
  } catch (error: any) {
    console.error("Delete warehouse error:", error)
    
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Warehouse not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { 
        error: "Failed to delete warehouse",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}

