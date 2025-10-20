-- Migration: Add Pharmacy Inventory System
-- This migration adds pharmacy-specific models and integrates them with the existing inventory system

-- CreateEnum: InventoryType (Main classification)
CREATE TYPE "InventoryType" AS ENUM ('MILK', 'PHARMACY', 'GENERAL');

-- CreateEnum: PharmacyWarehouseType
CREATE TYPE "PharmacyWarehouseType" AS ENUM ('MAIN_PHARMACY', 'DISPENSARY', 'COLD_STORAGE', 'QUARANTINE', 'DISTRIBUTION');

-- CreateEnum: PharmacyProductType
CREATE TYPE "PharmacyProductType" AS ENUM ('PRESCRIPTION_DRUG', 'OTC_MEDICATION', 'MEDICAL_SUPPLIES', 'VACCINES', 'DIAGNOSTIC_TOOLS', 'MEDICAL_EQUIPMENT');

-- CreateEnum: DrugCategory
CREATE TYPE "DrugCategory" AS ENUM ('ANTIBIOTICS', 'ANALGESICS', 'ANTIHISTAMINES', 'CARDIOVASCULAR', 'DIABETES', 'RESPIRATORY', 'GASTROINTESTINAL', 'DERMATOLOGICAL', 'NEUROLOGICAL', 'HORMONAL', 'VITAMINS', 'OTHER');

-- CreateEnum: PrescriptionStatus
CREATE TYPE "PrescriptionStatus" AS ENUM ('PENDING', 'APPROVED', 'DISPENSED', 'REJECTED', 'EXPIRED');

-- CreateEnum: ExpiryAlertLevel
CREATE TYPE "ExpiryAlertLevel" AS ENUM ('NONE', 'WARNING', 'CRITICAL', 'EXPIRED');

-- CreateTable: Pharmacy
CREATE TABLE "pharmacies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "licenseNumber" TEXT NOT NULL UNIQUE,
    "location" TEXT NOT NULL,
    "contactInfo" JSONB NOT NULL DEFAULT '{}',
    "settings" JSONB NOT NULL DEFAULT '{}',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "pharmacistId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pharmacies_pkey" PRIMARY KEY ("id")
);

-- CreateTable: PharmacyWarehouse
CREATE TABLE "pharmacy_warehouses" (
    "id" TEXT NOT NULL,
    "pharmacyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "PharmacyWarehouseType" NOT NULL,
    "location" TEXT NOT NULL,
    "capacity" DOUBLE PRECISION NOT NULL,
    "temperatureRange" JSONB DEFAULT '{}',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pharmacy_warehouses_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Prescription
CREATE TABLE "prescriptions" (
    "id" TEXT NOT NULL,
    "pharmacyId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "prescriptionNumber" TEXT NOT NULL UNIQUE,
    "prescriptionDate" TIMESTAMP(3) NOT NULL,
    "status" "PrescriptionStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "totalAmount" DOUBLE PRECISION DEFAULT 0,
    "dispensedAt" TIMESTAMP(3),
    "dispensedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prescriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable: PrescriptionItem
CREATE TABLE "prescription_items" (
    "id" TEXT NOT NULL,
    "prescriptionId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "dosage" TEXT,
    "frequency" TEXT,
    "duration" TEXT,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "dispensedQuantity" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prescription_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable: DrugExpiry
CREATE TABLE "drug_expiry" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "batchNumber" TEXT NOT NULL,
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "alertLevel" "ExpiryAlertLevel" NOT NULL DEFAULT 'NONE',
    "alertSent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "drug_expiry_pkey" PRIMARY KEY ("id")
);

-- Add new fields to existing products table
ALTER TABLE "products" ADD COLUMN "inventoryType" "InventoryType" NOT NULL DEFAULT 'GENERAL';
ALTER TABLE "products" ADD COLUMN "pharmacyProductType" "PharmacyProductType";
ALTER TABLE "products" ADD COLUMN "drugCategory" "DrugCategory";
ALTER TABLE "products" ADD COLUMN "requiresPrescription" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "products" ADD COLUMN "controlledSubstance" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "products" ADD COLUMN "pharmacyWarehouseId" TEXT;
ALTER TABLE "products" ADD COLUMN "activeIngredient" TEXT;
ALTER TABLE "products" ADD COLUMN "dosageForm" TEXT;
ALTER TABLE "products" ADD COLUMN "strength" TEXT;
ALTER TABLE "products" ADD COLUMN "manufacturer" TEXT;
ALTER TABLE "products" ADD COLUMN "batchNumber" TEXT;
ALTER TABLE "products" ADD COLUMN "expiryDate" TIMESTAMP(3);
ALTER TABLE "products" ADD COLUMN "storageConditions" JSONB DEFAULT '{}';
ALTER TABLE "products" ADD COLUMN "sideEffects" TEXT[];
ALTER TABLE "products" ADD COLUMN "contraindications" TEXT[];
ALTER TABLE "products" ADD COLUMN "interactions" TEXT[];

-- Add foreign key constraints
ALTER TABLE "pharmacies" ADD CONSTRAINT "pharmacies_pharmacistId_fkey" FOREIGN KEY ("pharmacistId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "pharmacy_warehouses" ADD CONSTRAINT "pharmacy_warehouses_pharmacyId_fkey" FOREIGN KEY ("pharmacyId") REFERENCES "pharmacies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_pharmacyId_fkey" FOREIGN KEY ("pharmacyId") REFERENCES "pharmacies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_dispensedBy_fkey" FOREIGN KEY ("dispensedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "prescription_items" ADD CONSTRAINT "prescription_items_prescriptionId_fkey" FOREIGN KEY ("prescriptionId") REFERENCES "prescriptions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "prescription_items" ADD CONSTRAINT "prescription_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "drug_expiry" ADD CONSTRAINT "drug_expiry_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "drug_expiry" ADD CONSTRAINT "drug_expiry_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "pharmacy_warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "products" ADD CONSTRAINT "products_pharmacyWarehouseId_fkey" FOREIGN KEY ("pharmacyWarehouseId") REFERENCES "pharmacy_warehouses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Create indexes
CREATE INDEX "products_inventoryType_idx" ON "products"("inventoryType");
CREATE INDEX "products_pharmacyProductType_idx" ON "products"("pharmacyProductType");
CREATE INDEX "products_drugCategory_idx" ON "products"("drugCategory");
CREATE INDEX "products_expiryDate_idx" ON "products"("expiryDate");
CREATE INDEX "prescriptions_status_idx" ON "prescriptions"("status");
CREATE INDEX "prescriptions_prescriptionDate_idx" ON "prescriptions"("prescriptionDate");
CREATE INDEX "drug_expiry_expiryDate_idx" ON "drug_expiry"("expiryDate");
CREATE INDEX "drug_expiry_alertLevel_idx" ON "drug_expiry"("alertLevel");


