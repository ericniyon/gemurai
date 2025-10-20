import { NextRequest, NextResponse } from "next/server";
import { MedicineRecordService } from "@/lib/services/MedicineRecordService";

// GET /api/v1/medicine-record/batches
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const medicineId = searchParams.get("medicineId");
    const expiringDays = searchParams.get("expiringDays");

    if (expiringDays) {
      const expiringBatches = await MedicineRecordService.getExpiringBatches(parseInt(expiringDays));
      return NextResponse.json({ success: true, data: expiringBatches });
    } else if (medicineId) {
      const batches = await MedicineRecordService.getMedicineBatches(medicineId);
      return NextResponse.json({ success: true, data: batches });
    } else {
      return NextResponse.json(
        { success: false, error: "medicineId or expiringDays parameter required" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error fetching batches:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch batches" },
      { status: 500 }
    );
  }
}

// POST /api/v1/medicine-record/batches
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const batch = await MedicineRecordService.addMedicineBatch(body);
    
    return NextResponse.json({ success: true, data: batch });
  } catch (error) {
    console.error("Error creating batch:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create batch" },
      { status: 500 }
    );
  }
}


