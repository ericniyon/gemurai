import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/v1/inventory/warehouses - List warehouses (minimal)
export async function GET(_request: NextRequest) {
  try {
    const warehouses = await prisma.warehouse.findMany({
      orderBy: { name: 'asc' },
    })
    return NextResponse.json({ success: true, data: warehouses })
  } catch (error) {
    console.error("List warehouses error:", error)
    return NextResponse.json({ success: false, error: "Failed to list warehouses" }, { status: 500 })
  }
}

// POST /api/v1/inventory/warehouses - Create warehouse (simplified)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, code, address, city, country, isMain } = body;

    if (!name || !code) {
      return NextResponse.json(
        { success: false, error: "Name and code are required" },
        { status: 400 }
      );
    }

    const exists = await prisma.warehouse.findUnique({ where: { code } });
    if (exists) {
      return NextResponse.json(
        { success: false, error: "Warehouse code already exists" },
        { status: 409 }
      );
    }

    // If setting as main warehouse, ensure no other main warehouse exists
    if (isMain) {
      const existingMain = await prisma.warehouse.findFirst({ where: { isMain: true } });
      if (existingMain) {
        return NextResponse.json(
          { success: false, error: "A main warehouse already exists" },
          { status: 409 }
        );
      }
    }

    const warehouse = await prisma.warehouse.create({
      data: {
        name,
        code,
        address: address || null,
        city: city || null,
        country: country || null,
        isActive: true,
        isMain: isMain || false,
      },
    });

    return NextResponse.json({ success: true, data: warehouse });
  } catch (error) {
    console.error("Create warehouse error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create warehouse" },
      { status: 500 }
    );
  }
} 