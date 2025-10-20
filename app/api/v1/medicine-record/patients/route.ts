import { NextRequest, NextResponse } from "next/server";
import { MedicineRecordService } from "@/lib/services/MedicineRecordService";

// GET /api/v1/medicine-record/patients
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get("patientId");

    if (patientId) {
      const patient = await MedicineRecordService.getPatient(patientId);
      return NextResponse.json({ success: true, data: patient });
    } else {
      const patients = await MedicineRecordService.getAllPatients();
      return NextResponse.json({ success: true, data: patients });
    }
  } catch (error) {
    console.error("Error fetching patients:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch patients" },
      { status: 500 }
    );
  }
}

// POST /api/v1/medicine-record/patients
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const patient = await MedicineRecordService.createPatient(body);
    
    return NextResponse.json({ success: true, data: patient });
  } catch (error) {
    console.error("Error creating patient:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create patient" },
      { status: 500 }
    );
  }
}

// PUT /api/v1/medicine-record/patients
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { patientId, ...updateData } = body;
    
    const patient = await MedicineRecordService.updatePatient(patientId, updateData);
    
    return NextResponse.json({ success: true, data: patient });
  } catch (error) {
    console.error("Error updating patient:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update patient" },
      { status: 500 }
    );
  }
}


