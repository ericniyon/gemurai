import { NextRequest, NextResponse } from "next/server";
import { PharmacyInventoryService } from "@/lib/services/PharmacyInventoryService";
import { prisma } from "@/lib/database";

// GET /api/v1/pharmacy/setup - Setup pharmacy with warehouses and products
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pharmacyId = searchParams.get("pharmacyId");

    if (!pharmacyId) {
      return NextResponse.json({ error: "Pharmacy ID is required" }, { status: 400 });
    }

    const inventorySummary = await PharmacyInventoryService.getPharmacyInventorySummary(pharmacyId);
    
    return NextResponse.json({
      success: true,
      data: inventorySummary,
    });
  } catch (error) {
    console.error("Error fetching pharmacy setup:", error);
    return NextResponse.json(
      { error: "Failed to fetch pharmacy setup" },
      { status: 500 }
    );
  }
}

// POST /api/v1/pharmacy/setup - Create new pharmacy setup
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      licenseNumber,
      location,
      contactInfo,
      settings,
      pharmacistId,
    } = body;

    if (!name || !licenseNumber || !location) {
      return NextResponse.json(
        { error: "Name, license number, and location are required" },
        { status: 400 }
      );
    }

    const setup = await PharmacyInventoryService.setupPharmacy({
      name,
      licenseNumber,
      location,
      contactInfo: contactInfo || {},
      settings: settings || {},
      pharmacistId,
    });

    return NextResponse.json({
      success: true,
      data: setup,
      message: "Pharmacy setup completed successfully",
    });
  } catch (error) {
    console.error("Error setting up pharmacy:", error);
    return NextResponse.json(
      { error: "Failed to setup pharmacy" },
      { status: 500 }
    );
  }
}


















