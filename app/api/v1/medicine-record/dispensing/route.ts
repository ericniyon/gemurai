import { NextRequest, NextResponse } from "next/server";
import { MedicineRecordService } from "@/lib/services/MedicineRecordService";

// GET /api/v1/medicine-record/dispensing
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get("patientId");
    const medicineId = searchParams.get("medicineId");

    // Return sample data for animal medicine dispensing records
    const sampleDispensingRecords = [
      {
        id: "1",
        patientId: "COW-001",
        prescriptionId: "VET-2024-001",
        medicineId: "MED-001",
        quantityDispensed: 10,
        dispensingDate: "2024-01-15T10:30:00.000Z",
        dispensedBy: "VET-TECH-001",
        batchNumber: "VET-BATCH-001",
        expiryDate: "2025-06-15T00:00:00.000Z",
        notes: "Intramuscular injection administered",
        animalType: "Cattle"
      },
      {
        id: "2",
        patientId: "SHEEP-003",
        prescriptionId: "VET-2024-003",
        medicineId: "MED-003",
        quantityDispensed: 2,
        dispensingDate: "2024-01-14T14:20:00.000Z",
        dispensedBy: "VET-TECH-001",
        batchNumber: "VET-BATCH-003",
        expiryDate: "2025-08-10T00:00:00.000Z",
        notes: "Subcutaneous injection completed",
        animalType: "Sheep"
      },
      {
        id: "3",
        patientId: "PIG-005",
        prescriptionId: "VET-2024-005",
        medicineId: "MED-009",
        quantityDispensed: 5,
        dispensingDate: "2024-01-16T09:15:00.000Z",
        dispensedBy: "VET-TECH-002",
        batchNumber: "VET-BATCH-009",
        expiryDate: "2025-10-20T00:00:00.000Z",
        notes: "Iron supplement injection",
        animalType: "Pigs"
      }
    ];

    // Filter by patientId or medicineId if provided
    let filteredRecords = sampleDispensingRecords;
    if (patientId) {
      filteredRecords = filteredRecords.filter(record => record.patientId === patientId);
    }
    if (medicineId) {
      filteredRecords = filteredRecords.filter(record => record.medicineId === medicineId);
    }
    
    return NextResponse.json({ success: true, data: filteredRecords });
  } catch (error) {
    console.error("Error fetching dispensing records:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch dispensing records" },
      { status: 500 }
    );
  }
}

// POST /api/v1/medicine-record/dispensing
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const dispensingRecord = await MedicineRecordService.dispenseMedicine(body);
    
    return NextResponse.json({ success: true, data: dispensingRecord });
  } catch (error) {
    console.error("Error dispensing medicine:", error);
    return NextResponse.json(
      { success: false, error: "Failed to dispense medicine" },
      { status: 500 }
    );
  }
}
