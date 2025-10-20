import { NextRequest, NextResponse } from "next/server";
import { PharmacyInventoryService } from "@/lib/services/PharmacyInventoryService";
import { prisma } from "@/lib/database";

// GET /api/v1/pharmacy/prescriptions - Get prescriptions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pharmacyId = searchParams.get("pharmacyId");
    const status = searchParams.get("status");

    if (!pharmacyId) {
      // Return sample data for veterinary medicine prescriptions
      const samplePrescriptions = [
        {
          id: "1",
          patientId: "COW-001",
          doctorId: "VET-001",
          prescriptionNumber: "VET-2024-001",
          prescriptionDate: "2024-01-15T00:00:00.000Z",
          status: "DISPENSED",
          dispensedAt: "2024-01-15T10:30:00.000Z",
          dispensedBy: "VET-TECH-001",
          notes: "Administer intramuscularly",
          animalType: "Cattle",
          items: [
            {
              productId: "MED-001",
              quantity: 10,
              dosage: "300mg/ml",
              frequency: "Once daily",
              duration: "5 days",
              product: { name: "Penicillin G 300mg/ml" }
            }
          ]
        },
        {
          id: "2",
          patientId: "CHICKEN-002",
          doctorId: "VET-002",
          prescriptionNumber: "VET-2024-002",
          prescriptionDate: "2024-01-16T00:00:00.000Z",
          status: "PENDING",
          dispensedAt: null,
          dispensedBy: null,
          notes: "Mix with drinking water",
          animalType: "Poultry",
          items: [
            {
              productId: "MED-002",
              quantity: 5,
              dosage: "200mg/ml",
              frequency: "Once daily",
              duration: "3 days",
              product: { name: "Oxytetracycline 200mg/ml" }
            }
          ]
        },
        {
          id: "3",
          patientId: "SHEEP-003",
          doctorId: "VET-003",
          prescriptionNumber: "VET-2024-003",
          prescriptionDate: "2024-01-14T00:00:00.000Z",
          status: "DISPENSED",
          dispensedAt: "2024-01-14T14:20:00.000Z",
          dispensedBy: "VET-TECH-001",
          notes: "Subcutaneous injection",
          animalType: "Sheep",
          items: [
            {
              productId: "MED-003",
              quantity: 2,
              dosage: "1% solution",
              frequency: "Single dose",
              duration: "1 day",
              product: { name: "Ivermectin 1% Injectable" }
            }
          ]
        },
        {
          id: "4",
          patientId: "GOAT-004",
          doctorId: "VET-001",
          prescriptionNumber: "VET-2024-004",
          prescriptionDate: "2024-01-17T00:00:00.000Z",
          status: "PENDING",
          dispensedAt: null,
          dispensedBy: null,
          notes: "Oral administration",
          animalType: "Goats",
          items: [
            {
              productId: "MED-007",
              quantity: 1,
              dosage: "10ml",
              frequency: "Single dose",
              duration: "1 day",
              product: { name: "Dewormer Albendazole" }
            }
          ]
        }
      ];
      
      return NextResponse.json({
        success: true,
        data: samplePrescriptions,
      });
    }

    const prescriptions = await prisma.prescription.findMany({
      where: {
        pharmacyId,
        ...(status && { status: status as any }),
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        dispensedByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        prescriptionDate: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: prescriptions,
    });
  } catch (error) {
    console.error("Error fetching prescriptions:", error);
    return NextResponse.json(
      { error: "Failed to fetch prescriptions" },
      { status: 500 }
    );
  }
}

// POST /api/v1/pharmacy/prescriptions - Create new prescription
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      pharmacyId,
      patientId,
      doctorId,
      prescriptionNumber,
      prescriptionDate,
      notes,
      items,
    } = body;

    if (!pharmacyId || !patientId || !doctorId || !prescriptionNumber || !items?.length) {
      return NextResponse.json(
        { error: "Required fields are missing" },
        { status: 400 }
      );
    }

    const prescription = await PharmacyInventoryService.createPrescription({
      pharmacyId,
      patientId,
      doctorId,
      prescriptionNumber,
      prescriptionDate: new Date(prescriptionDate),
      notes,
      items,
    });

    return NextResponse.json({
      success: true,
      data: prescription,
      message: "Prescription created successfully",
    });
  } catch (error) {
    console.error("Error creating prescription:", error);
    return NextResponse.json(
      { error: "Failed to create prescription" },
      { status: 500 }
    );
  }
}
