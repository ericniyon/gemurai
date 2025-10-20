import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database";

// PUT /api/v1/inventory/locations/[id] - Update location/zone
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, warehouseId } = body;
    const locationId = params.id;

    if (!name || !warehouseId) {
      return NextResponse.json(
        { success: false, error: "Name and warehouse are required" },
        { status: 400 }
      );
    }

    const location = await prisma.location.update({
      where: { id: locationId },
      data: {
        name,
        warehouseId,
      },
    });

    return NextResponse.json({ success: true, data: location });
  } catch (error) {
    console.error("Update location error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update location" },
      { status: 500 }
    );
  }
}

// DELETE /api/v1/inventory/locations/[id] - Delete location/zone with cascade
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const locationId = params.id;

    // Use Prisma transaction to ensure all deletions succeed or none do
    await prisma.$transaction(async (tx) => {
      // First, delete all stock quantities related to this location
      await tx.stockQuantity.deleteMany({
        where: { locationId: locationId }
      });

      // Delete all products assigned to this location
      await tx.products.deleteMany({
        where: { locationId: locationId }
      });

      // Finally, delete the location itself
      await tx.location.delete({
        where: { id: locationId }
      });
    });

    return NextResponse.json({ success: true, message: "Location and all related data deleted successfully" });
  } catch (error) {
    console.error("Delete location error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete location" },
      { status: 500 }
    );
  }
}
