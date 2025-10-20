import { PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/database";

interface PharmacySetupData {
  name: string;
  licenseNumber: string;
  location: string;
  contactInfo: any;
  settings: any;
  pharmacistId?: string;
}

interface PharmacyProductData {
  name: string;
  description: string;
  price: number;
  category: string;
  pharmacyProductType: string;
  drugCategory: string;
  activeIngredient: string;
  dosageForm: string;
  strength: string;
  manufacturer: string;
  requiresPrescription: boolean;
  controlledSubstance: boolean;
  expiryDate?: Date;
  storageConditions?: any;
  sideEffects?: string[];
  contraindications?: string[];
  interactions?: string[];
}

interface PrescriptionData {
  pharmacyId: string;
  patientId: string;
  doctorId: string;
  prescriptionNumber: string;
  prescriptionDate: Date;
  notes?: string;
  items: Array<{
    productId: string;
    quantity: number;
    dosage?: string;
    frequency?: string;
    duration?: string;
    unitPrice: number;
  }>;
}

interface DrugExpiryData {
  productId: string;
  warehouseId: string;
  batchNumber: string;
  expiryDate: Date;
  quantity: number;
}

export class PharmacyInventoryService {
  /**
   * Setup Pharmacy with warehouses and initial products
   */
  static async setupPharmacy(data: PharmacySetupData) {
    return await prisma.$transaction(async (tx) => {
      // Create Pharmacy
      const pharmacy = await tx.pharmacy.create({
        data: {
          name: data.name,
          licenseNumber: data.licenseNumber,
          location: data.location,
          contactInfo: data.contactInfo,
          settings: data.settings,
          pharmacistId: data.pharmacistId,
        },
      });

      // Create default warehouses
      const warehouses = await this.createDefaultPharmacyWarehouses(tx, pharmacy.id, pharmacy.location);

      // Create initial pharmacy products
      const products = await this.createInitialPharmacyProducts(tx, pharmacy.id, warehouses);

      return {
        pharmacy,
        warehouses,
        products,
      };
    });
  }

  /**
   * Create default pharmacy warehouses
   */
  private static async createDefaultPharmacyWarehouses(tx: PrismaClient, pharmacyId: string, location: string) {
    const warehouseTypes = [
      { name: "Main Pharmacy", type: "MAIN_PHARMACY", capacity: 1000 },
      { name: "Dispensary", type: "DISPENSARY", capacity: 500 },
      { name: "Cold Storage", type: "COLD_STORAGE", capacity: 200 },
      { name: "Quarantine Area", type: "QUARANTINE", capacity: 100 },
    ];

    const warehouses = [];
    for (const warehouseData of warehouseTypes) {
      const warehouse = await tx.pharmacyWarehouse.create({
        data: {
          pharmacyId,
          name: warehouseData.name,
          type: warehouseData.type as any,
          location,
          capacity: warehouseData.capacity,
          temperatureRange: warehouseData.type === "COLD_STORAGE" ? { min: 2, max: 8 } : {},
        },
      });
      warehouses.push(warehouse);
    }

    return warehouses;
  }

  /**
   * Create initial pharmacy products
   */
  private static async createInitialPharmacyProducts(tx: PrismaClient, pharmacyId: string, warehouses: any[]) {
    const mainWarehouse = warehouses.find(w => w.type === "MAIN_PHARMACY");
    const coldStorageWarehouse = warehouses.find(w => w.type === "COLD_STORAGE");

    const initialProducts = [
      {
        name: "Paracetamol 500mg",
        description: "Pain relief and fever reducer",
        price: 500,
        category: "Pain Relief",
        pharmacyProductType: "OTC_MEDICATION",
        drugCategory: "ANALGESICS",
        activeIngredient: "Paracetamol",
        dosageForm: "Tablet",
        strength: "500mg",
        manufacturer: "Generic Pharma",
        requiresPrescription: false,
        controlledSubstance: false,
        storageConditions: { temperature: "Room temperature", humidity: "Dry place" },
        sideEffects: ["Nausea", "Allergic reactions"],
        contraindications: ["Liver disease", "Alcohol abuse"],
        interactions: ["Warfarin", "Alcohol"],
      },
      {
        name: "Amoxicillin 250mg",
        description: "Antibiotic for bacterial infections",
        price: 1200,
        category: "Antibiotics",
        pharmacyProductType: "PRESCRIPTION_DRUG",
        drugCategory: "ANTIBIOTICS",
        activeIngredient: "Amoxicillin",
        dosageForm: "Capsule",
        strength: "250mg",
        manufacturer: "MediCorp",
        requiresPrescription: true,
        controlledSubstance: false,
        storageConditions: { temperature: "Room temperature", humidity: "Dry place" },
        sideEffects: ["Diarrhea", "Nausea", "Rash"],
        contraindications: ["Penicillin allergy"],
        interactions: ["Warfarin", "Methotrexate"],
      },
      {
        name: "Insulin Glargine",
        description: "Long-acting insulin for diabetes",
        price: 5000,
        category: "Diabetes Management",
        pharmacyProductType: "PRESCRIPTION_DRUG",
        drugCategory: "DIABETES",
        activeIngredient: "Insulin Glargine",
        dosageForm: "Injection",
        strength: "100 units/ml",
        manufacturer: "DiabetesCare",
        requiresPrescription: true,
        controlledSubstance: false,
        storageConditions: { temperature: "Refrigerated", humidity: "Dry place" },
        sideEffects: ["Hypoglycemia", "Weight gain"],
        contraindications: ["Hypoglycemia"],
        interactions: ["Alcohol", "Beta-blockers"],
      },
    ];

    const products = [];
    for (const productData of initialProducts) {
      const warehouseId = productData.name.includes("Insulin") ? coldStorageWarehouse?.id : mainWarehouse?.id;
      
      const product = await tx.products.create({
        data: {
          id: `pharmacy_product_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: productData.name,
          description: productData.description,
          price: productData.price,
          category: productData.category,
          unitOfMeasure: "Units",
          sellerId: "system-user-id",
          inventoryType: "PHARMACY",
          pharmacyProductType: productData.pharmacyProductType as any,
          drugCategory: productData.drugCategory as any,
          activeIngredient: productData.activeIngredient,
          dosageForm: productData.dosageForm,
          strength: productData.strength,
          manufacturer: productData.manufacturer,
          requiresPrescription: productData.requiresPrescription,
          controlledSubstance: productData.controlledSubstance,
          pharmacyWarehouseId: warehouseId,
          storageConditions: productData.storageConditions,
          sideEffects: productData.sideEffects,
          contraindications: productData.contraindications,
          interactions: productData.interactions,
          tracking: "LOT",
          updatedAt: new Date(),
        },
      });
      products.push(product);
    }

    return products;
  }

  /**
   * Create a prescription
   */
  static async createPrescription(data: PrescriptionData) {
    return await prisma.$transaction(async (tx) => {
      // Calculate total amount
      const totalAmount = data.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

      // Create prescription
      const prescription = await tx.prescription.create({
        data: {
          pharmacyId: data.pharmacyId,
          patientId: data.patientId,
          doctorId: data.doctorId,
          prescriptionNumber: data.prescriptionNumber,
          prescriptionDate: data.prescriptionDate,
          notes: data.notes,
          totalAmount,
        },
      });

      // Create prescription items
      const items = [];
      for (const itemData of data.items) {
        const item = await tx.prescriptionItem.create({
          data: {
            prescriptionId: prescription.id,
            productId: itemData.productId,
            quantity: itemData.quantity,
            dosage: itemData.dosage,
            frequency: itemData.frequency,
            duration: itemData.duration,
            unitPrice: itemData.unitPrice,
            totalPrice: itemData.quantity * itemData.unitPrice,
          },
        });
        items.push(item);
      }

      return { prescription, items };
    });
  }

  /**
   * Dispense prescription
   */
  static async dispensePrescription(prescriptionId: string, dispensedBy: string) {
    return await prisma.$transaction(async (tx) => {
      // Get prescription with items
      const prescription = await tx.prescription.findUnique({
        where: { id: prescriptionId },
        include: { items: true },
      });

      if (!prescription) {
        throw new Error("Prescription not found");
      }

      if (prescription.status !== "APPROVED") {
        throw new Error("Prescription must be approved before dispensing");
      }

      // Check stock availability and create stock moves
      for (const item of prescription.items) {
        const product = await tx.products.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new Error(`Product ${item.productId} not found`);
        }

        // Get current stock quantity
        const stockQuantity = await tx.stockQuantity.findFirst({
          where: {
            productId: item.productId,
            warehouseId: product.pharmacyWarehouseId,
          },
        });

        if (!stockQuantity || stockQuantity.availableQuantity < item.quantity) {
          throw new Error(`Insufficient stock for product ${product.name}`);
        }

        // Create outgoing stock move
        await tx.stockMove.create({
          data: {
            id: `pharmacy_move_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            productId: item.productId,
            warehouseId: product.pharmacyWarehouseId,
            quantity: item.quantity,
            moveType: "OUTGOING",
            state: "DONE",
            createdBy: dispensedBy,
            processedAt: new Date(),
          },
        });

        // Update stock quantity
        await tx.stockQuantity.update({
          where: { id: stockQuantity.id },
          data: {
            quantity: stockQuantity.quantity - item.quantity,
            availableQuantity: stockQuantity.availableQuantity - item.quantity,
            lastUpdated: new Date(),
          },
        });

        // Update prescription item
        await tx.prescriptionItem.update({
          where: { id: item.id },
          data: { dispensedQuantity: item.quantity },
        });
      }

      // Update prescription status
      const updatedPrescription = await tx.prescription.update({
        where: { id: prescriptionId },
        data: {
          status: "DISPENSED",
          dispensedAt: new Date(),
          dispensedBy,
        },
      });

      return updatedPrescription;
    });
  }

  /**
   * Add drug expiry tracking
   */
  static async addDrugExpiry(data: DrugExpiryData) {
    return await prisma.$transaction(async (tx) => {
      // Calculate alert level based on expiry date
      const now = new Date();
      const daysToExpiry = Math.ceil((data.expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      let alertLevel = "NONE";
      if (daysToExpiry < 0) {
        alertLevel = "EXPIRED";
      } else if (daysToExpiry <= 30) {
        alertLevel = "CRITICAL";
      } else if (daysToExpiry <= 90) {
        alertLevel = "WARNING";
      }

      const drugExpiry = await tx.drugExpiry.create({
        data: {
          productId: data.productId,
          warehouseId: data.warehouseId,
          batchNumber: data.batchNumber,
          expiryDate: data.expiryDate,
          quantity: data.quantity,
          alertLevel: alertLevel as any,
        },
      });

      return drugExpiry;
    });
  }

  /**
   * Get pharmacy inventory summary
   */
  static async getPharmacyInventorySummary(pharmacyId: string) {
    const pharmacy = await prisma.pharmacy.findUnique({
      where: { id: pharmacyId },
      include: {
        warehouses: true,
        prescriptions: {
          where: { status: "PENDING" },
        },
      },
    });

    if (!pharmacy) {
      throw new Error("Pharmacy not found");
    }

    // Get pharmacy products with stock quantities
    const products = await prisma.products.findMany({
      where: {
        inventoryType: "PHARMACY",
        pharmacyWarehouse: {
          pharmacyId,
        },
      },
      include: {
        stockQuantities: {
          where: {
            warehouse: {
              pharmacyWarehouse: {
                pharmacyId,
              },
            },
          },
        },
        drugExpiry: {
          where: {
            warehouse: {
              pharmacyWarehouse: {
                pharmacyId,
              },
            },
          },
        },
      },
    });

    // Calculate inventory summary
    const totalProducts = products.length;
    const totalQuantity = products.reduce((sum, product) => {
      return sum + product.stockQuantities.reduce((productSum, sq) => productSum + sq.quantity, 0);
    }, 0);

    const totalValue = products.reduce((sum, product) => {
      const productQuantity = product.stockQuantities.reduce((productSum, sq) => productSum + sq.quantity, 0);
      return sum + (productQuantity * product.price);
    }, 0);

    const expiringSoon = products.filter(product => 
      product.drugExpiry.some(de => de.alertLevel === "WARNING" || de.alertLevel === "CRITICAL")
    ).length;

    const lowStockItems = products.filter(product => 
      product.stockQuantities.some(sq => sq.quantity < 10)
    ).length;

    return {
      pharmacy,
      inventorySummary: {
        totalProducts,
        totalQuantity,
        totalValue,
        expiringSoon,
        lowStockItems,
        pendingPrescriptions: pharmacy.prescriptions.length,
        warehouses: pharmacy.warehouses.map(warehouse => ({
          id: warehouse.id,
          name: warehouse.name,
          type: warehouse.type,
          capacity: warehouse.capacity,
        })),
      },
    };
  }

  /**
   * Get expiring drugs alert
   */
  static async getExpiringDrugsAlert(pharmacyId: string, daysAhead: number = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + daysAhead);

    const expiringDrugs = await prisma.drugExpiry.findMany({
      where: {
        warehouse: {
          pharmacyWarehouse: {
            pharmacyId,
          },
        },
        expiryDate: {
          lte: cutoffDate,
        },
        alertLevel: {
          in: ["WARNING", "CRITICAL", "EXPIRED"],
        },
      },
      include: {
        product: true,
        warehouse: true,
      },
      orderBy: {
        expiryDate: "asc",
      },
    });

    return expiringDrugs;
  }
}
