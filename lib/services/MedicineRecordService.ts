import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class MedicineRecordService {
  // Patient Management
  static async createPatient(data: {
    patientId: string;
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    gender: string;
    phoneNumber?: string;
    email?: string;
    address?: string;
    emergencyContact?: any;
    medicalHistory?: any;
    allergies?: string[];
    bloodType?: string;
  }) {
    return await prisma.patient.create({
      data: {
        ...data,
        updatedAt: new Date(),
      }
    });
  }

  static async getPatient(patientId: string) {
    return await prisma.patient.findUnique({
      where: { patientId },
      include: {
        prescriptions: {
          include: {
            items: {
              include: {
                product: true
              }
            }
          },
          orderBy: { prescriptionDate: 'desc' }
        },
        dispensingRecords: {
          include: {
            medicine: true,
            dispenser: true
          },
          orderBy: { dispensingDate: 'desc' }
        }
      }
    });
  }

  static async getAllPatients() {
    return await prisma.patient.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async updatePatient(patientId: string, data: any) {
    return await prisma.patient.update({
      where: { patientId },
      data: {
        ...data,
        updatedAt: new Date(),
      }
    });
  }

  // Medicine Batch Management
  static async addMedicineBatch(data: {
    medicineId: string;
    batchNumber: string;
    expiryDate: Date;
    quantity: number;
    supplier?: string;
    purchaseDate?: Date;
    purchasePrice?: number;
  }) {
    return await prisma.medicineBatch.create({
      data: {
        ...data,
        updatedAt: new Date(),
      }
    });
  }

  static async getMedicineBatches(medicineId: string) {
    return await prisma.medicineBatch.findMany({
      where: { 
        medicineId,
        isActive: true,
        quantity: { gt: 0 }
      },
      orderBy: { expiryDate: 'asc' }
    });
  }

  static async getExpiringBatches(daysAhead: number = 30) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    return await prisma.medicineBatch.findMany({
      where: {
        expiryDate: { lte: futureDate },
        isActive: true,
        quantity: { gt: 0 }
      },
      include: {
        medicine: true
      },
      orderBy: { expiryDate: 'asc' }
    });
  }

  // Dispensing Management
  static async dispenseMedicine(data: {
    patientId: string;
    prescriptionId?: string;
    medicineId: string;
    quantityDispensed: number;
    dispensedBy: string;
    batchNumber?: string;
    expiryDate?: Date;
    notes?: string;
  }) {
    return await prisma.$transaction(async (tx) => {
      // Create dispensing record
      const dispensingRecord = await tx.dispensingRecord.create({
        data: {
          ...data,
          dispensingDate: new Date(),
          updatedAt: new Date(),
        }
      });

      // Update batch quantity if batch number provided
      if (data.batchNumber) {
        await tx.medicineBatch.updateMany({
          where: {
            medicineId: data.medicineId,
            batchNumber: data.batchNumber
          },
          data: {
            quantity: { decrement: data.quantityDispensed },
            updatedAt: new Date(),
          }
        });
      }

      // Update stock quantity
      const stockQuantity = await tx.stockQuantity.findFirst({
        where: {
          productId: data.medicineId
        }
      });

      if (stockQuantity) {
        await tx.stockQuantity.update({
          where: { id: stockQuantity.id },
          data: {
            quantity: { decrement: data.quantityDispensed },
            availableQuantity: { decrement: data.quantityDispensed },
            lastUpdated: new Date()
          }
        });
      }

      return dispensingRecord;
    });
  }

  static async getDispensingRecords(patientId?: string, medicineId?: string) {
    return await prisma.dispensingRecord.findMany({
      where: {
        ...(patientId && { patientId }),
        ...(medicineId && { medicineId })
      },
      include: {
        patient: true,
        medicine: true,
        dispenser: true,
        prescription: true
      },
      orderBy: { dispensingDate: 'desc' }
    });
  }

  // Medicine Inventory Management
  static async getMedicineInventory() {
    return await prisma.products.findMany({
      where: {
        inventoryType: "PHARMACY"
      },
      include: {
        stockQuantities: {
          include: {
            warehouse: true
          }
        },
        medicineBatches: {
          where: { isActive: true },
          orderBy: { expiryDate: 'asc' }
        }
      }
    });
  }

  static async getLowStockMedicines(threshold: number = 10) {
    return await prisma.products.findMany({
      where: {
        inventoryType: "PHARMACY",
        stockQuantities: {
          some: {
            availableQuantity: { lte: threshold }
          }
        }
      },
      include: {
        stockQuantities: {
          include: {
            warehouse: true
          }
        }
      }
    });
  }

  // Prescription Management
  static async createPrescription(data: {
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
  }) {
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
          updatedAt: new Date(),
        }
      });

      // Create prescription items
      const prescriptionItems = await Promise.all(
        data.items.map(item =>
          tx.prescriptionItem.create({
            data: {
              prescriptionId: prescription.id,
              productId: item.productId,
              quantity: item.quantity,
              dosage: item.dosage,
              frequency: item.frequency,
              duration: item.duration,
              unitPrice: item.unitPrice,
              totalPrice: item.quantity * item.unitPrice,
              updatedAt: new Date(),
            }
          })
        )
      );

      return { prescription, prescriptionItems };
    });
  }

  static async dispensePrescription(prescriptionId: string, dispensedBy: string) {
    return await prisma.$transaction(async (tx) => {
      // Get prescription with items
      const prescription = await tx.prescription.findUnique({
        where: { id: prescriptionId },
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      });

      if (!prescription) {
        throw new Error("Prescription not found");
      }

      // Create dispensing records for each item
      const dispensingRecords = await Promise.all(
        prescription.items.map(async (item) => {
          // Get available batch for this medicine
          const batch = await tx.medicineBatch.findFirst({
            where: {
              medicineId: item.productId,
              isActive: true,
              quantity: { gte: item.quantity }
            },
            orderBy: { expiryDate: 'asc' }
          });

          if (!batch) {
            throw new Error(`Insufficient stock for ${item.product.name}`);
          }

          // Create dispensing record
          return await tx.dispensingRecord.create({
            data: {
              patientId: prescription.patientId,
              prescriptionId: prescription.id,
              medicineId: item.productId,
              quantityDispensed: item.quantity,
              dispensingDate: new Date(),
              dispensedBy,
              batchNumber: batch.batchNumber,
              expiryDate: batch.expiryDate,
              updatedAt: new Date(),
            }
          });
        })
      );

      // Update prescription status
      await tx.prescription.update({
        where: { id: prescriptionId },
        data: {
          status: "DISPENSED",
          dispensedAt: new Date(),
          dispensedBy,
          updatedAt: new Date(),
        }
      });

      // Update batch quantities
      await Promise.all(
        prescription.items.map(async (item) => {
          const batch = await tx.medicineBatch.findFirst({
            where: {
              medicineId: item.productId,
              isActive: true,
              quantity: { gte: item.quantity }
            },
            orderBy: { expiryDate: 'asc' }
          });

          if (batch) {
            await tx.medicineBatch.update({
              where: { id: batch.id },
              data: {
                quantity: { decrement: item.quantity },
                updatedAt: new Date(),
              }
            });
          }
        })
      );

      return { prescription, dispensingRecords };
    });
  }

  // Reports and Analytics
  static async getMedicineUsageReport(startDate: Date, endDate: Date) {
    return await prisma.dispensingRecord.findMany({
      where: {
        dispensingDate: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        medicine: true,
        patient: true,
        dispenser: true
      },
      orderBy: { dispensingDate: 'desc' }
    });
  }

  static async getPatientMedicationHistory(patientId: string) {
    return await prisma.dispensingRecord.findMany({
      where: { patientId },
      include: {
        medicine: true,
        prescription: {
          include: {
            items: true
          }
        }
      },
      orderBy: { dispensingDate: 'desc' }
    });
  }

  static async getInventorySummary() {
    const medicines = await prisma.products.findMany({
      where: { inventoryType: "PHARMACY" },
      include: {
        stockQuantities: true,
        medicineBatches: {
          where: { isActive: true }
        }
      }
    });

    const summary = medicines.map(medicine => {
      const totalStock = medicine.stockQuantities.reduce((sum, sq) => sum + sq.quantity, 0);
      const totalBatches = medicine.medicineBatches.reduce((sum, batch) => sum + batch.quantity, 0);
      const expiringSoon = medicine.medicineBatches.filter(batch => {
        const daysUntilExpiry = Math.ceil((batch.expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
      });

      return {
        id: medicine.id,
        name: medicine.name,
        totalStock,
        totalBatches,
        expiringSoon: expiringSoon.length,
        batches: medicine.medicineBatches
      };
    });

    return summary;
  }
}


