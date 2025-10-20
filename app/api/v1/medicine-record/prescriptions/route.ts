import { NextRequest, NextResponse } from "next/server";
import { MedicineRecordService } from "@/lib/services/MedicineRecordService";

// POST /api/v1/medicine-record/prescriptions
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await MedicineRecordService.createPrescription(body);
    
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Error creating prescription:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create prescription" },
      { status: 500 }
    );
  }
}

// POST /api/v1/medicine-record/prescriptions/[id]/dispense
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { dispensedBy } = body;
    
    const result = await MedicineRecordService.dispensePrescription(params.id, dispensedBy);
    
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Error dispensing prescription:", error);
    return NextResponse.json(
      { success: false, error: "Failed to dispense prescription" },
      { status: 500 }
    );
  }
}


