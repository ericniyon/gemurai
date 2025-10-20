import { NextRequest, NextResponse } from "next/server";
import { PharmacyInventoryService } from "@/lib/services/PharmacyInventoryService";

// GET /api/v1/pharmacy/inventory - Get pharmacy inventory
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pharmacyId = searchParams.get("pharmacyId");

    if (!pharmacyId) {
      // Return sample data for animal medicine inventory
      const sampleInventory = [
        { id: "1", name: "Penicillin G 300mg/ml", quantity: 50, category: "Antibiotic", expiryDate: "2025-06-15", animalType: "Cattle" },
        { id: "2", name: "Oxytetracycline 200mg/ml", quantity: 75, category: "Antibiotic", expiryDate: "2025-03-20", animalType: "Poultry" },
        { id: "3", name: "Ivermectin 1% Injectable", quantity: 25, category: "Antiparasitic", expiryDate: "2025-08-10", animalType: "Sheep" },
        { id: "4", name: "Meloxicam 20mg/ml", quantity: 40, category: "Anti-inflammatory", expiryDate: "2025-12-05", animalType: "Cattle" },
        { id: "5", name: "Vitamin B Complex", quantity: 60, category: "Vitamin Supplement", expiryDate: "2025-09-15", animalType: "Poultry" },
        { id: "6", name: "Calcium Gluconate 20%", quantity: 30, category: "Mineral Supplement", expiryDate: "2025-07-30", animalType: "Cattle" },
        { id: "7", name: "Dewormer Albendazole", quantity: 100, category: "Antiparasitic", expiryDate: "2025-05-25", animalType: "Goats" },
        { id: "8", name: "Probiotic Powder", quantity: 80, category: "Digestive Health", expiryDate: "2025-11-12", animalType: "Poultry" },
        { id: "9", name: "Iron Dextran Injection", quantity: 35, category: "Mineral Supplement", expiryDate: "2025-10-20", animalType: "Pigs" },
        { id: "10", name: "Ketoprofen 10%", quantity: 45, category: "Pain Relief", expiryDate: "2025-08-30", animalType: "Cattle" }
      ];
      
      return NextResponse.json({
        success: true,
        data: sampleInventory,
      });
    }

    const inventorySummary = await PharmacyInventoryService.getPharmacyInventorySummary(pharmacyId);
    
    return NextResponse.json({
      success: true,
      data: inventorySummary,
    });
  } catch (error) {
    console.error("Error fetching pharmacy inventory:", error);
    return NextResponse.json(
      { error: "Failed to fetch pharmacy inventory" },
      { status: 500 }
    );
  }
}
