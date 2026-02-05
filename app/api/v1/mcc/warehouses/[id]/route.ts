import { NextRequest, NextResponse } from "next/server"
import { Prisma } from "@prisma/client"
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
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN" && user.role !== "MCC_MANAGER")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { id } = await params
    const existing = await prisma.mcc_warehouses.findUnique({ where: { id }, select: { mccId: true } })
    if (!existing) {
      return NextResponse.json({ error: "Warehouse not found" }, { status: 404 })
    }
    if (user.role === "MCC_MANAGER" && existing.mccId !== user.mccId) {
      return NextResponse.json({ error: "You can only update warehouses for your own MCC" }, { status: 403 })
    }

    const data = await req.json()
    const { name, type, location, capacity, isActive, globalWarehouseId } = data

    const updatedAt = new Date()

    // Update scalar fields (generated client may not include globalWarehouseId in update type)
    const updated = await prisma.mcc_warehouses.update({
      where: { id },
      data: {
        ...(name != null && { name }),
        ...(type != null && { type }),
        ...(location != null && { location }),
        ...(capacity !== undefined && { capacity: parseFloat(capacity) }),
        ...(isActive !== undefined && { isActive: !!isActive }),
        updatedAt,
      },
    })

    // Set globalWarehouseId via raw query if provided (column exists in DB but may be missing from generated client)
    if (globalWarehouseId !== undefined) {
      const value = globalWarehouseId === null || globalWarehouseId === "" ? null : globalWarehouseId
      await prisma.$executeRaw`
        UPDATE mcc_warehouses
        SET "globalWarehouseId" = ${value}, "updatedAt" = ${updatedAt}
        WHERE id = ${id}
      `
    }

    const row = await prisma.mcc_warehouses.findFirst({ where: { id } })
    const globalId = row?.globalWarehouseId ?? updated.globalWarehouseId ?? null

    let warehouse: typeof updated & { warehouse?: { id: string; name: string; code: string } | null } = {
      ...updated,
      globalWarehouseId: globalId,
      warehouse: null,
    }
    if (globalId) {
      const linked = await prisma.warehouse.findUnique({
        where: { id: globalId },
        select: { id: true, name: true, code: true },
      })
      warehouse.warehouse = linked ?? null
    }

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
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN" && user.role !== "MCC_MANAGER")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { id } = await params
    const existing = await prisma.mcc_warehouses.findUnique({ where: { id }, select: { mccId: true } })
    if (!existing) {
      return NextResponse.json({ error: "Warehouse not found" }, { status: 404 })
    }
    if (user.role === "MCC_MANAGER" && existing.mccId !== user.mccId) {
      return NextResponse.json({ error: "You can only delete warehouses for your own MCC" }, { status: 403 })
    }

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

