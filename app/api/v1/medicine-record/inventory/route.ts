import { NextRequest, NextResponse } from "next/server";
import { MedicineRecordService } from "@/lib/services/MedicineRecordService";

// GET /api/v1/medicine-record/inventory
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    if (type === "low-stock") {
      const threshold = parseInt(searchParams.get("threshold") || "10");
      const lowStockMedicines = await MedicineRecordService.getLowStockMedicines(threshold);
      return NextResponse.json({ success: true, data: lowStockMedicines });
    } else if (type === "summary") {
      const summary = await MedicineRecordService.getInventorySummary();
      return NextResponse.json({ success: true, data: summary });
    } else {
      const inventory = await MedicineRecordService.getMedicineInventory();
      return NextResponse.json({ success: true, data: inventory });
    }
  } catch (error) {
    console.error("Error fetching inventory:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch inventory" },
      { status: 500 }
    );
  }
}




