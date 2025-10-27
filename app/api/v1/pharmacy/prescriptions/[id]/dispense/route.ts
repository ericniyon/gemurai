import { NextRequest, NextResponse } from "next/server";
import { PharmacyInventoryService } from "@/lib/services/PharmacyInventoryService";

// POST /api/v1/pharmacy/prescriptions/[id]/dispense - Dispense prescription
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { dispensedBy } = await request.json();
    const prescriptionId = params.id;

    if (!dispensedBy) {
      return NextResponse.json(
        { error: "Dispensed by user ID is required" },
        { status: 400 }
      );
    }

    const dispensedPrescription = await PharmacyInventoryService.dispensePrescription(
      prescriptionId,
      dispensedBy
    );

    return NextResponse.json({
      success: true,
      data: dispensedPrescription,
      message: "Prescription dispensed successfully",
    });
  } catch (error) {
    console.error("Error dispensing prescription:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to dispense prescription" },
      { status: 500 }
    );
  }
}

// PUT /api/v1/pharmacy/prescriptions/[id]/approve - Approve prescription
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const prescriptionId = params.id;

    const updatedPrescription = await prisma.prescription.update({
      where: { id: prescriptionId },
      data: { status: "APPROVED" },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedPrescription,
      message: "Prescription approved successfully",
    });
  } catch (error) {
    console.error("Error approving prescription:", error);
    return NextResponse.json(
      { error: "Failed to approve prescription" },
      { status: 500 }
    );
  }
}




