import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/v1/inventory/locations - List locations (zones)
export async function GET(_request: NextRequest) {
  try {
    const locations = await prisma.location.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, code: true, warehouseId: true, locationType: true, isActive: true }
    })
    return NextResponse.json({ success: true, data: locations })
  } catch (error) {
    console.error("List locations error:", error)
    return NextResponse.json({ success: false, error: "Failed to list locations" }, { status: 500 })
  }
}

// POST /api/v1/inventory/locations - Create zone/location (simplified)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { warehouseId, name, code } = body;

    if (!warehouseId || !name || !code) {
      return NextResponse.json(
        { success: false, error: "warehouseId, name, code are required" },
        { status: 400 }
      );
    }

    const exists = await prisma.location.findFirst({ where: { warehouseId, code } })
    if (exists) {
      return NextResponse.json(
        { success: false, error: "Location code already exists in this warehouse" },
        { status: 409 }
      );
    }

    const location = await prisma.location.create({
      data: {
        warehouseId,
        name,
        code,
        locationType: 'STORAGE',
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, data: location });
  } catch (error) {
    console.error("Create location error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create location" },
      { status: 500 }
    );
  }
} 