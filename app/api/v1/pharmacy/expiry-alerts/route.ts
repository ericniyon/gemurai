import { NextRequest, NextResponse } from "next/server";
import { PharmacyInventoryService } from "@/lib/services/PharmacyInventoryService";

// GET /api/v1/pharmacy/expiry-alerts - Get expiring drugs alerts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pharmacyId = searchParams.get("pharmacyId");
    const daysAhead = parseInt(searchParams.get("daysAhead") || "30");

    if (!pharmacyId) {
      return NextResponse.json({ error: "Pharmacy ID is required" }, { status: 400 });
    }

    const expiringDrugs = await PharmacyInventoryService.getExpiringDrugsAlert(pharmacyId, daysAhead);
    
    return NextResponse.json({
      success: true,
      data: expiringDrugs,
    });
  } catch (error) {
    console.error("Error fetching expiring drugs:", error);
    return NextResponse.json(
      { error: "Failed to fetch expiring drugs" },
      { status: 500 }
    );
  }
}

// POST /api/v1/pharmacy/expiry-alerts - Add drug expiry tracking
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      productId,
      warehouseId,
      batchNumber,
      expiryDate,
      quantity,
    } = body;

    if (!productId || !warehouseId || !batchNumber || !expiryDate || !quantity) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const drugExpiry = await PharmacyInventoryService.addDrugExpiry({
      productId,
      warehouseId,
      batchNumber,
      expiryDate: new Date(expiryDate),
      quantity,
    });

    return NextResponse.json({
      success: true,
      data: drugExpiry,
      message: "Drug expiry tracking added successfully",
    });
  } catch (error) {
    console.error("Error adding drug expiry:", error);
    return NextResponse.json(
      { error: "Failed to add drug expiry tracking" },
      { status: 500 }
    );
  }
}





















