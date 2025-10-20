import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database";

// PUT /api/v1/inventory/warehouses/[id] - Update warehouse
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, address, city, country } = body;
    const warehouseId = params.id;

    if (!name) {
      return NextResponse.json(
        { success: false, error: "Name is required" },
        { status: 400 }
      );
    }

    const warehouse = await prisma.warehouse.update({
      where: { id: warehouseId },
      data: {
        name,
        address: address || null,
        city: city || null,
        country: country || null,
      },
    });

    return NextResponse.json({ success: true, data: warehouse });
  } catch (error) {
    console.error("Update warehouse error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update warehouse" },
      { status: 500 }
    );
  }
}

// DELETE /api/v1/inventory/warehouses/[id] - Delete warehouse with cascade
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const warehouseId = params.id;

    // Use Prisma transaction to ensure all deletions succeed or none do
    await prisma.$transaction(async (tx) => {
      // First, delete all stock quantities related to products in this warehouse
      await tx.stockQuantity.deleteMany({
        where: {
          OR: [
            { warehouseId: warehouseId },
            { 
              product: {
                pharmacyWarehouseId: warehouseId
              }
            }
          ]
        }
      });

      // Delete all stock moves related to this warehouse
      await tx.stockMove.deleteMany({
        where: { warehouseId: warehouseId }
      });

      // Delete all products assigned to this warehouse
      await tx.products.deleteMany({
        where: { pharmacyWarehouseId: warehouseId }
      });

      // Delete all zones (locations) in this warehouse
      await tx.location.deleteMany({
        where: { warehouseId: warehouseId }
      });

      // Finally, delete the warehouse itself
      await tx.warehouse.delete({
        where: { id: warehouseId }
      });
    });

    return NextResponse.json({ success: true, message: "Warehouse and all related data deleted successfully" });
  } catch (error) {
    console.error("Delete warehouse error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete warehouse" },
      { status: 500 }
    );
  }
}