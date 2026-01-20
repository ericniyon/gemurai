-- ============================================
-- PostgreSQL Migrations for pgAdmin4
-- Generated on: 2026-01-18T21:54:11.811Z
-- Total migrations: 59
-- 
-- Instructions:
-- 1. Open this file in pgAdmin4
-- 2. Connect to your database
-- 3. Open Query Tool (Tools > Query Tool)
-- 4. Paste this entire file
-- 5. Click Execute (F5) or press F5
-- 
-- Note: Each migration is wrapped in its own transaction.
-- If one migration fails, others can still execute.
-- You can also execute migrations one at a time.
-- ============================================

-- ============================================
-- Migration 1/59: 20250101000000_enhance_password_reset_with_national_id
-- ============================================

BEGIN;

-- Enhance password reset table to support national ID verification
-- Add metadata field to store additional verification data

-- Add metadata column to password_resets table
ALTER TABLE "password_resets" ADD COLUMN IF NOT EXISTS "metadata" TEXT;

-- Add index on metadata for faster lookups
CREATE INDEX IF NOT EXISTS "password_resets_metadata_idx" ON "password_resets"("metadata");

-- Add index on expires_at for cleanup queries
CREATE INDEX IF NOT EXISTS "password_resets_expires_at_idx" ON "password_resets"("expiresAt");

-- Add index on used field for cleanup queries
CREATE INDEX IF NOT EXISTS "password_resets_used_idx" ON "password_resets"("used");

-- Update existing password_resets table structure if needed
-- Ensure the table has all required columns
DO $$
BEGIN
    -- Add metadata column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'password_resets' 
        AND column_name = 'metadata'
    ) THEN
        ALTER TABLE "password_resets" ADD COLUMN IF NOT EXISTS "metadata" TEXT;
    END IF;
    
    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'password_resets' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE "password_resets" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;
END $$;

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_password_resets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS password_resets_updated_at_trigger ON "password_resets";
CREATE TRIGGER password_resets_updated_at_trigger
    BEFORE UPDATE ON "password_resets"
    FOR EACH ROW
    EXECUTE FUNCTION update_password_resets_updated_at();

-- Add comment to document the enhanced functionality
COMMENT ON TABLE "password_resets" IS 'Enhanced password reset table with national ID verification support';
COMMENT ON COLUMN "password_resets"."metadata" IS 'JSON metadata containing national ID and other verification data';
COMMENT ON COLUMN "password_resets"."expiresAt" IS 'Token expiration timestamp (typically 15 minutes)';
COMMENT ON COLUMN "password_resets"."used" IS 'Whether the reset token has been used';


COMMIT;

-- If this migration failed, you can continue with the next one
-- Just comment out the failed migration section above

-- ============================================
-- Migration 2/59: 20250115120000_add_mcc_inventory_integration
-- ============================================

BEGIN;

-- Migration: Add MCC-Inventory Integration
-- This migration adds MCC management models and integrates them with the inventory system

-- CreateEnum: MCCWarehouseType
-- Create type MCCWarehouseType if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'MCCWarehouseType') THEN
        CREATE TYPE "MCCWarehouseType" AS ENUM ('COLLECTION_CENTER', 'PROCESSING_PLANT', 'COLD_STORAGE', 'DISTRIBUTION_CENTER');
    END IF;
END $$;

-- CreateEnum: MCCProductType  
-- Create type MCCProductType if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'MCCProductType') THEN
        CREATE TYPE "MCCProductType" AS ENUM ('RAW_MILK', 'PROCESSED_MILK', 'MILK_PRODUCTS', 'BYPRODUCTS');
    END IF;
END $$;

-- CreateEnum: MilkCollectionStatus
-- Create type MilkCollectionStatus if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'MilkCollectionStatus') THEN
        CREATE TYPE "MilkCollectionStatus" AS ENUM ('PENDING', 'APPROVED', 'PAID', 'PROCESSED');
    END IF;
END $$;

-- CreateEnum: MCCPeriodStatus
-- Create type MCCPeriodStatus if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'MCCPeriodStatus') THEN
        CREATE TYPE "MCCPeriodStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'CLOSED');
    END IF;
END $$;

-- CreateTable: MCC
CREATE TABLE IF NOT EXISTS "mccs" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "contactInfo" JSONB NOT NULL DEFAULT '{}',
    "settings" JSONB NOT NULL DEFAULT '{}',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mccs_pkey" PRIMARY KEY ("id")
);

-- CreateTable: MCCWarehouse
CREATE TABLE IF NOT EXISTS "mcc_warehouses" (
    "id" TEXT NOT NULL,
    "mccId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "MCCWarehouseType" NOT NULL,
    "location" TEXT NOT NULL,
    "capacity" DOUBLE PRECISION NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mcc_warehouses_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Farmer
CREATE TABLE IF NOT EXISTS "farmers" (
    "id" TEXT NOT NULL,
    "mccId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "registrationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "totalAmountEarned" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastCollectionDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "farmers_pkey" PRIMARY KEY ("id")
);

-- CreateTable: MCCPeriod
CREATE TABLE IF NOT EXISTS "mcc_periods" (
    "id" TEXT NOT NULL,
    "mccId" TEXT NOT NULL,
    "periodNumber" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" "MCCPeriodStatus" NOT NULL DEFAULT 'ACTIVE',
    "totalFarmers" INTEGER NOT NULL DEFAULT 0,
    "totalMilkCollected" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalDeductions" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalAdvances" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mcc_periods_pkey" PRIMARY KEY ("id")
);

-- CreateTable: MilkCollection
CREATE TABLE IF NOT EXISTS "milk_collections" (
    "id" TEXT NOT NULL,
    "farmerId" TEXT NOT NULL,
    "mccPeriodId" TEXT,
    "collectionDate" TIMESTAMP(3) NOT NULL,
    "period" INTEGER NOT NULL,
    "totalLiters" DOUBLE PRECISION NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "stockMoveId" TEXT,
    "warehouseId" TEXT,
    "locationId" TEXT,
    "productId" TEXT,
    "deductions" JSONB NOT NULL DEFAULT '{}',
    "advances" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalDeductions" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "netPayment" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" "MilkCollectionStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "milk_collections_pkey" PRIMARY KEY ("id")
);

-- CreateTable: MilkProcessing
CREATE TABLE IF NOT EXISTS "milk_processing" (
    "id" TEXT NOT NULL,
    "mccId" TEXT NOT NULL,
    "rawMilkProductId" TEXT NOT NULL,
    "processedProductId" TEXT NOT NULL,
    "inputQuantity" DOUBLE PRECISION NOT NULL,
    "outputQuantity" DOUBLE PRECISION NOT NULL,
    "processingDate" TIMESTAMP(3) NOT NULL,
    "processingSteps" JSONB NOT NULL DEFAULT '{}',
    "qualityMetrics" JSONB NOT NULL DEFAULT '{}',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "milk_processing_pkey" PRIMARY KEY ("id")
);

-- Add MCC-specific fields to Product table
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "mccProductType" "MCCProductType";
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "mccWarehouseId" TEXT;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "processingSteps" JSONB;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "shelfLife" INTEGER;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "temperatureRange" JSONB;

-- Add MCC relations to User table
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "mccId" TEXT;

-- CreateIndex: MCCWarehouse
CREATE INDEX IF NOT EXISTS "mcc_warehouses_mccId_idx" ON "mcc_warehouses"("mccId");

-- CreateIndex: Farmer
CREATE INDEX IF NOT EXISTS "farmers_mccId_idx" ON "farmers"("mccId");
CREATE INDEX IF NOT EXISTS "farmers_phone_idx" ON "farmers"("phone");

-- CreateIndex: MCCPeriod
CREATE INDEX IF NOT EXISTS "mcc_periods_mccId_idx" ON "mcc_periods"("mccId");
CREATE INDEX IF NOT EXISTS "mcc_periods_periodNumber_idx" ON "mcc_periods"("periodNumber");

-- CreateIndex: MilkCollection
CREATE INDEX IF NOT EXISTS "milk_collections_farmerId_idx" ON "milk_collections"("farmerId");
CREATE INDEX IF NOT EXISTS "milk_collections_stockMoveId_idx" ON "milk_collections"("stockMoveId");
CREATE INDEX IF NOT EXISTS "milk_collections_productId_idx" ON "milk_collections"("productId");
CREATE INDEX IF NOT EXISTS "milk_collections_collectionDate_idx" ON "milk_collections"("collectionDate");

-- CreateIndex: MilkProcessing
CREATE INDEX IF NOT EXISTS "milk_processing_mccId_idx" ON "milk_processing"("mccId");
CREATE INDEX IF NOT EXISTS "milk_processing_rawMilkProductId_idx" ON "milk_processing"("rawMilkProductId");
CREATE INDEX IF NOT EXISTS "milk_processing_processedProductId_idx" ON "milk_processing"("processedProductId");

-- CreateIndex: Products MCC fields
CREATE INDEX IF NOT EXISTS "products_mccProductType_idx" ON "products"("mccProductType");
CREATE INDEX IF NOT EXISTS "products_mccWarehouseId_idx" ON "products"("mccWarehouseId");

-- CreateIndex: Users MCC relation
CREATE INDEX IF NOT EXISTS "users_mccId_idx" ON "users"("mccId");

-- AddForeignKey: MCCWarehouse
-- Add constraint mcc_warehouses_mccId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'mcc_warehouses_mccId_fkey' 
        AND conrelid = 'mcc_warehouses'::regclass
    ) THEN
        ALTER TABLE "mcc_warehouses" ADD CONSTRAINT "mcc_warehouses_mccId_fkey" FOREIGN KEY ("mccId") REFERENCES "mccs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey: Farmer
-- Add constraint farmers_mccId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'farmers_mccId_fkey' 
        AND conrelid = 'farmers'::regclass
    ) THEN
        ALTER TABLE "farmers" ADD CONSTRAINT "farmers_mccId_fkey" FOREIGN KEY ("mccId") REFERENCES "mccs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey: MCCPeriod
-- Add constraint mcc_periods_mccId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'mcc_periods_mccId_fkey' 
        AND conrelid = 'mcc_periods'::regclass
    ) THEN
        ALTER TABLE "mcc_periods" ADD CONSTRAINT "mcc_periods_mccId_fkey" FOREIGN KEY ("mccId") REFERENCES "mccs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey: MilkCollection
-- Add constraint milk_collections_farmerId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'milk_collections_farmerId_fkey' 
        AND conrelid = 'milk_collections'::regclass
    ) THEN
        ALTER TABLE "milk_collections" ADD CONSTRAINT "milk_collections_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "farmers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;
-- Add constraint milk_collections_stockMoveId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'milk_collections_stockMoveId_fkey' 
        AND conrelid = 'milk_collections'::regclass
    ) THEN
        ALTER TABLE "milk_collections" ADD CONSTRAINT "milk_collections_stockMoveId_fkey" FOREIGN KEY ("stockMoveId") REFERENCES "stock_moves"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
-- Add constraint milk_collections_warehouseId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'milk_collections_warehouseId_fkey' 
        AND conrelid = 'milk_collections'::regclass
    ) THEN
        ALTER TABLE "milk_collections" ADD CONSTRAINT "milk_collections_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
-- Add constraint milk_collections_locationId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'milk_collections_locationId_fkey' 
        AND conrelid = 'milk_collections'::regclass
    ) THEN
        ALTER TABLE "milk_collections" ADD CONSTRAINT "milk_collections_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
-- Add constraint milk_collections_productId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'milk_collections_productId_fkey' 
        AND conrelid = 'milk_collections'::regclass
    ) THEN
        ALTER TABLE "milk_collections" ADD CONSTRAINT "milk_collections_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
-- Add constraint milk_collections_mccPeriodId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'milk_collections_mccPeriodId_fkey' 
        AND conrelid = 'milk_collections'::regclass
    ) THEN
        ALTER TABLE "milk_collections" ADD CONSTRAINT "milk_collections_mccPeriodId_fkey" FOREIGN KEY ("mccPeriodId") REFERENCES "mcc_periods"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey: MilkProcessing
-- Add constraint milk_processing_mccId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'milk_processing_mccId_fkey' 
        AND conrelid = 'milk_processing'::regclass
    ) THEN
        ALTER TABLE "milk_processing" ADD CONSTRAINT "milk_processing_mccId_fkey" FOREIGN KEY ("mccId") REFERENCES "mccs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;
-- Add constraint milk_processing_rawMilkProductId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'milk_processing_rawMilkProductId_fkey' 
        AND conrelid = 'milk_processing'::regclass
    ) THEN
        ALTER TABLE "milk_processing" ADD CONSTRAINT "milk_processing_rawMilkProductId_fkey" FOREIGN KEY ("rawMilkProductId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;
-- Add constraint milk_processing_processedProductId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'milk_processing_processedProductId_fkey' 
        AND conrelid = 'milk_processing'::regclass
    ) THEN
        ALTER TABLE "milk_processing" ADD CONSTRAINT "milk_processing_processedProductId_fkey" FOREIGN KEY ("processedProductId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey: Products MCC fields
-- Add constraint products_mccWarehouseId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'products_mccWarehouseId_fkey' 
        AND conrelid = 'products'::regclass
    ) THEN
        ALTER TABLE "products" ADD CONSTRAINT "products_mccWarehouseId_fkey" FOREIGN KEY ("mccWarehouseId") REFERENCES "mcc_warehouses"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey: Users MCC relation
-- Add constraint users_mccId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'users_mccId_fkey' 
        AND conrelid = 'users'::regclass
    ) THEN
        ALTER TABLE "users" ADD CONSTRAINT "users_mccId_fkey" FOREIGN KEY ("mccId") REFERENCES "mccs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;























COMMIT;

-- If this migration failed, you can continue with the next one
-- Just comment out the failed migration section above

-- ============================================
-- Migration 3/59: 20250117000000_add_pharmacy_inventory_system
-- ============================================

BEGIN;

-- Migration: Add Pharmacy Inventory System
-- This migration adds pharmacy-specific models and integrates them with the existing inventory system

-- CreateEnum: InventoryType (Main classification)
-- Create type InventoryType if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'InventoryType') THEN
        CREATE TYPE "InventoryType" AS ENUM ('MILK', 'PHARMACY', 'GENERAL');
    END IF;
END $$;

-- CreateEnum: PharmacyWarehouseType
-- Create type PharmacyWarehouseType if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PharmacyWarehouseType') THEN
        CREATE TYPE "PharmacyWarehouseType" AS ENUM ('MAIN_PHARMACY', 'DISPENSARY', 'COLD_STORAGE', 'QUARANTINE', 'DISTRIBUTION');
    END IF;
END $$;

-- CreateEnum: PharmacyProductType
-- Create type PharmacyProductType if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PharmacyProductType') THEN
        CREATE TYPE "PharmacyProductType" AS ENUM ('PRESCRIPTION_DRUG', 'OTC_MEDICATION', 'MEDICAL_SUPPLIES', 'VACCINES', 'DIAGNOSTIC_TOOLS', 'MEDICAL_EQUIPMENT');
    END IF;
END $$;

-- CreateEnum: DrugCategory
-- Create type DrugCategory if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'DrugCategory') THEN
        CREATE TYPE "DrugCategory" AS ENUM ('ANTIBIOTICS', 'ANALGESICS', 'ANTIHISTAMINES', 'CARDIOVASCULAR', 'DIABETES', 'RESPIRATORY', 'GASTROINTESTINAL', 'DERMATOLOGICAL', 'NEUROLOGICAL', 'HORMONAL', 'VITAMINS', 'OTHER');
    END IF;
END $$;

-- CreateEnum: PrescriptionStatus
-- Create type PrescriptionStatus if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PrescriptionStatus') THEN
        CREATE TYPE "PrescriptionStatus" AS ENUM ('PENDING', 'APPROVED', 'DISPENSED', 'REJECTED', 'EXPIRED');
    END IF;
END $$;

-- CreateEnum: ExpiryAlertLevel
-- Create type ExpiryAlertLevel if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ExpiryAlertLevel') THEN
        CREATE TYPE "ExpiryAlertLevel" AS ENUM ('NONE', 'WARNING', 'CRITICAL', 'EXPIRED');
    END IF;
END $$;

-- CreateTable: Pharmacy
CREATE TABLE IF NOT EXISTS "pharmacies" (
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
CREATE TABLE IF NOT EXISTS "pharmacy_warehouses" (
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
CREATE TABLE IF NOT EXISTS "prescriptions" (
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
CREATE TABLE IF NOT EXISTS "prescription_items" (
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
CREATE TABLE IF NOT EXISTS "drug_expiry" (
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
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "inventoryType" "InventoryType" NOT NULL DEFAULT 'GENERAL';
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "pharmacyProductType" "PharmacyProductType";
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "drugCategory" "DrugCategory";
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "requiresPrescription" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "controlledSubstance" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "pharmacyWarehouseId" TEXT;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "activeIngredient" TEXT;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "dosageForm" TEXT;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "strength" TEXT;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "manufacturer" TEXT;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "batchNumber" TEXT;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "expiryDate" TIMESTAMP(3);
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "storageConditions" JSONB DEFAULT '{}';
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "sideEffects" TEXT[];
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "contraindications" TEXT[];
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "interactions" TEXT[];

-- Add foreign key constraints
-- Add constraint pharmacies_pharmacistId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'pharmacies_pharmacistId_fkey' 
        AND conrelid = 'pharmacies'::regclass
    ) THEN
        ALTER TABLE "pharmacies" ADD CONSTRAINT "pharmacies_pharmacistId_fkey" FOREIGN KEY ("pharmacistId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
-- Add constraint pharmacy_warehouses_pharmacyId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'pharmacy_warehouses_pharmacyId_fkey' 
        AND conrelid = 'pharmacy_warehouses'::regclass
    ) THEN
        ALTER TABLE "pharmacy_warehouses" ADD CONSTRAINT "pharmacy_warehouses_pharmacyId_fkey" FOREIGN KEY ("pharmacyId") REFERENCES "pharmacies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;
-- Add constraint prescriptions_pharmacyId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'prescriptions_pharmacyId_fkey' 
        AND conrelid = 'prescriptions'::regclass
    ) THEN
        ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_pharmacyId_fkey" FOREIGN KEY ("pharmacyId") REFERENCES "pharmacies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;
-- Add constraint prescriptions_dispensedBy_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'prescriptions_dispensedBy_fkey' 
        AND conrelid = 'prescriptions'::regclass
    ) THEN
        ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_dispensedBy_fkey" FOREIGN KEY ("dispensedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
-- Add constraint prescription_items_prescriptionId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'prescription_items_prescriptionId_fkey' 
        AND conrelid = 'prescription_items'::regclass
    ) THEN
        ALTER TABLE "prescription_items" ADD CONSTRAINT "prescription_items_prescriptionId_fkey" FOREIGN KEY ("prescriptionId") REFERENCES "prescriptions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;
-- Add constraint prescription_items_productId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'prescription_items_productId_fkey' 
        AND conrelid = 'prescription_items'::regclass
    ) THEN
        ALTER TABLE "prescription_items" ADD CONSTRAINT "prescription_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;
-- Add constraint drug_expiry_productId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'drug_expiry_productId_fkey' 
        AND conrelid = 'drug_expiry'::regclass
    ) THEN
        ALTER TABLE "drug_expiry" ADD CONSTRAINT "drug_expiry_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;
-- Add constraint drug_expiry_warehouseId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'drug_expiry_warehouseId_fkey' 
        AND conrelid = 'drug_expiry'::regclass
    ) THEN
        ALTER TABLE "drug_expiry" ADD CONSTRAINT "drug_expiry_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "pharmacy_warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;
-- Add constraint products_pharmacyWarehouseId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'products_pharmacyWarehouseId_fkey' 
        AND conrelid = 'products'::regclass
    ) THEN
        ALTER TABLE "products" ADD CONSTRAINT "products_pharmacyWarehouseId_fkey" FOREIGN KEY ("pharmacyWarehouseId") REFERENCES "pharmacy_warehouses"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS "products_inventoryType_idx" ON "products"("inventoryType");
CREATE INDEX IF NOT EXISTS "products_pharmacyProductType_idx" ON "products"("pharmacyProductType");
CREATE INDEX IF NOT EXISTS "products_drugCategory_idx" ON "products"("drugCategory");
CREATE INDEX IF NOT EXISTS "products_expiryDate_idx" ON "products"("expiryDate");
CREATE INDEX IF NOT EXISTS "prescriptions_status_idx" ON "prescriptions"("status");
CREATE INDEX IF NOT EXISTS "prescriptions_prescriptionDate_idx" ON "prescriptions"("prescriptionDate");
CREATE INDEX IF NOT EXISTS "drug_expiry_expiryDate_idx" ON "drug_expiry"("expiryDate");
CREATE INDEX IF NOT EXISTS "drug_expiry_alertLevel_idx" ON "drug_expiry"("alertLevel");























COMMIT;

-- If this migration failed, you can continue with the next one
-- Just comment out the failed migration section above

-- ============================================
-- Migration 4/59: 20250120000000_add_mcc_sales_table
-- ============================================

BEGIN;

-- Migration: Add MCC Sales Table
-- This migration adds the mcc_sales table to track milk sales to companies

-- CreateEnum: PaymentStatus (only if it doesn't exist)
-- Create type PaymentStatus if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PaymentStatus') THEN
        CREATE TYPE "PaymentStatus" AS ENUM ('pending', 'paid', 'partial');
    END IF;
END $$;

-- CreateTable: MCC Sales (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS "mcc_sales" (
    "id" TEXT NOT NULL,
    "mccId" TEXT NOT NULL,
    "litersSold" DOUBLE PRECISION NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "companyName" TEXT NOT NULL,
    "companyContact" TEXT NOT NULL,
    "companyAddress" TEXT NOT NULL DEFAULT '',
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'pending',
    "saleDate" TIMESTAMP(3) NOT NULL,
    "notes" TEXT NOT NULL DEFAULT '',
    "recordedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mcc_sales_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: MCC Sales (only if they don't exist)
CREATE INDEX IF NOT EXISTS "mcc_sales_mccId_idx" ON "mcc_sales"("mccId");
CREATE INDEX IF NOT EXISTS "mcc_sales_saleDate_idx" ON "mcc_sales"("saleDate");
CREATE INDEX IF NOT EXISTS "mcc_sales_paymentStatus_idx" ON "mcc_sales"("paymentStatus");
CREATE INDEX IF NOT EXISTS "mcc_sales_companyName_idx" ON "mcc_sales"("companyName");







COMMIT;

-- If this migration failed, you can continue with the next one
-- Just comment out the failed migration section above

-- ============================================
-- Migration 5/59: 20250120000001_add_mcc_payments_table
-- ============================================

BEGIN;

-- Migration: Add MCC Payments Table
-- This migration adds the mcc_payments table to track farmer payments

-- CreateEnum: PaymentMethod (only if it doesn't exist)
-- Create type PaymentMethod if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PaymentMethod') THEN
        CREATE TYPE "PaymentMethod" AS ENUM ('cash', 'mobile_money', 'bank_transfer');
    END IF;
END $$;

-- CreateTable: MCC Payments
CREATE TABLE IF NOT EXISTS "mcc_payments" (
    "id" TEXT NOT NULL,
    "farmerId" TEXT NOT NULL,
    "collectionId" TEXT NOT NULL,
    "mccId" TEXT NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "deductions" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "advances" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "netPayment" DOUBLE PRECISION NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'pending',
    "paymentDate" TIMESTAMP(3) NOT NULL,
    "processedBy" TEXT NOT NULL,
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mcc_payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: MCC Payments
CREATE INDEX IF NOT EXISTS "mcc_payments_farmerId_idx" ON "mcc_payments"("farmerId");
CREATE INDEX IF NOT EXISTS "mcc_payments_collectionId_idx" ON "mcc_payments"("collectionId");
CREATE INDEX IF NOT EXISTS "mcc_payments_mccId_idx" ON "mcc_payments"("mccId");
CREATE INDEX IF NOT EXISTS "mcc_payments_paymentDate_idx" ON "mcc_payments"("paymentDate");
CREATE INDEX IF NOT EXISTS "mcc_payments_paymentStatus_idx" ON "mcc_payments"("paymentStatus");

-- AddForeignKey: MCC Payments
-- Add constraint mcc_payments_farmerId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'mcc_payments_farmerId_fkey' 
        AND conrelid = 'mcc_payments'::regclass
    ) THEN
        ALTER TABLE "mcc_payments" ADD CONSTRAINT "mcc_payments_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "farmers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;
-- Add constraint mcc_payments_collectionId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'mcc_payments_collectionId_fkey' 
        AND conrelid = 'mcc_payments'::regclass
    ) THEN
        ALTER TABLE "mcc_payments" ADD CONSTRAINT "mcc_payments_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "milk_collections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;
-- Add constraint mcc_payments_mccId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'mcc_payments_mccId_fkey' 
        AND conrelid = 'mcc_payments'::regclass
    ) THEN
        ALTER TABLE "mcc_payments" ADD CONSTRAINT "mcc_payments_mccId_fkey" FOREIGN KEY ("mccId") REFERENCES "mccs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;


COMMIT;

-- If this migration failed, you can continue with the next one
-- Just comment out the failed migration section above

-- ============================================
-- Migration 6/59: 20250121000000_add_mcc_comprehensive_features
-- ============================================

BEGIN;

-- Migration: Add MCC Comprehensive Features
-- This migration adds comprehensive MCC management features including:
-- - Quality test fields for milk collections
-- - Traceability fields (sample tags, geolocation, photos)
-- - Bulk batches for milk bulking
-- - Staff and workforce management
-- - Vehicles and transport management
-- - Power assets tracking
-- - Capacity assessments
-- - Suppliers and procurements
-- - Assets and rentals
-- - Farmer accounts and ledger
-- - Sales and sale items
-- - Questionnaires and responses

-- AlterTable: Add fields to mccs
ALTER TABLE "mccs" ADD COLUMN IF NOT EXISTS "code" TEXT;
ALTER TABLE "mccs" ADD COLUMN IF NOT EXISTS "region" TEXT;
ALTER TABLE "mccs" ADD COLUMN IF NOT EXISTS "address" TEXT;
ALTER TABLE "mccs" ADD COLUMN IF NOT EXISTS "managerUserId" TEXT;

-- CreateIndex: Add unique constraint on mccs.code
CREATE UNIQUE INDEX IF NOT EXISTS "mccs_code_key" ON "mccs"("code");

-- CreateIndex: Add unique constraint on mccs.managerUserId
CREATE UNIQUE INDEX IF NOT EXISTS "mccs_managerUserId_key" ON "mccs"("managerUserId");

-- CreateIndex: Add index on mccs.code
CREATE INDEX IF NOT EXISTS "mccs_code_idx" ON "mccs"("code");

-- CreateIndex: Add index on mccs.managerUserId
CREATE INDEX IF NOT EXISTS "mccs_managerUserId_idx" ON "mccs"("managerUserId");

-- AlterTable: Add fields to farmers
ALTER TABLE "farmers" ADD COLUMN IF NOT EXISTS "farmerCode" TEXT;
ALTER TABLE "farmers" ADD COLUMN IF NOT EXISTS "village" TEXT;
ALTER TABLE "farmers" ADD COLUMN IF NOT EXISTS "defaultPriceGroup" TEXT;

-- CreateIndex: Add unique constraint on farmers.farmerCode
CREATE UNIQUE INDEX IF NOT EXISTS "farmers_farmerCode_key" ON "farmers"("farmerCode");

-- CreateIndex: Add index on farmers.farmerCode
CREATE INDEX IF NOT EXISTS "farmers_farmerCode_idx" ON "farmers"("farmerCode");

-- AlterTable: Add quality and traceability fields to milk_collections
ALTER TABLE "milk_collections" ADD COLUMN IF NOT EXISTS "mccId" TEXT;
ALTER TABLE "milk_collections" ADD COLUMN IF NOT EXISTS "fat" DOUBLE PRECISION;
ALTER TABLE "milk_collections" ADD COLUMN IF NOT EXISTS "protein" DOUBLE PRECISION;
ALTER TABLE "milk_collections" ADD COLUMN IF NOT EXISTS "lactometerReading" DOUBLE PRECISION;
ALTER TABLE "milk_collections" ADD COLUMN IF NOT EXISTS "antibioticTest" BOOLEAN DEFAULT false;
ALTER TABLE "milk_collections" ADD COLUMN IF NOT EXISTS "tempCelsius" DOUBLE PRECISION;
ALTER TABLE "milk_collections" ADD COLUMN IF NOT EXISTS "timeSinceMilkingHours" DOUBLE PRECISION;
ALTER TABLE "milk_collections" ADD COLUMN IF NOT EXISTS "qualityStatus" TEXT DEFAULT 'pending';
ALTER TABLE "milk_collections" ADD COLUMN IF NOT EXISTS "qualityNotes" TEXT;
ALTER TABLE "milk_collections" ADD COLUMN IF NOT EXISTS "sampleTag" TEXT;
ALTER TABLE "milk_collections" ADD COLUMN IF NOT EXISTS "agentId" TEXT;
ALTER TABLE "milk_collections" ADD COLUMN IF NOT EXISTS "photoUrl" TEXT;
ALTER TABLE "milk_collections" ADD COLUMN IF NOT EXISTS "geolocation" JSONB;
ALTER TABLE "milk_collections" ADD COLUMN IF NOT EXISTS "synced" BOOLEAN DEFAULT false;
ALTER TABLE "milk_collections" ADD COLUMN IF NOT EXISTS "batchId" TEXT;

-- CreateIndex: Add unique constraint on milk_collections.sampleTag
CREATE UNIQUE INDEX IF NOT EXISTS "milk_collections_sampleTag_key" ON "milk_collections"("sampleTag") WHERE "sampleTag" IS NOT NULL;

-- CreateIndex: Add indexes on milk_collections
CREATE INDEX IF NOT EXISTS "milk_collections_sampleTag_idx" ON "milk_collections"("sampleTag");
CREATE INDEX IF NOT EXISTS "milk_collections_agentId_idx" ON "milk_collections"("agentId");
CREATE INDEX IF NOT EXISTS "milk_collections_mccId_idx" ON "milk_collections"("mccId");
CREATE INDEX IF NOT EXISTS "milk_collections_qualityStatus_idx" ON "milk_collections"("qualityStatus");

-- CreateTable: bulk_batches
CREATE TABLE IF NOT EXISTS "bulk_batches" (
    "id" TEXT NOT NULL,
    "mccId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dispatched" BOOLEAN NOT NULL DEFAULT false,
    "dispatchedToProcessorId" TEXT,
    "totalLiters" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "bulk_batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable: staff
CREATE TABLE IF NOT EXISTS "staff" (
    "id" TEXT NOT NULL,
    "userId" TEXT UNIQUE,
    "mccId" TEXT,
    "position" TEXT,
    "employmentType" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "trainingLevel" TEXT,
    "certifications" TEXT[],
    "payrollAccount" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable: vehicles
CREATE TABLE IF NOT EXISTS "vehicles" (
    "id" TEXT NOT NULL,
    "regNo" TEXT NOT NULL,
    "vehicleType" TEXT,
    "capacityLiters" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'available',
    "lastMaintenance" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable: power_assets
CREATE TABLE IF NOT EXISTS "power_assets" (
    "id" TEXT NOT NULL,
    "mccId" TEXT NOT NULL,
    "name" TEXT,
    "assetType" TEXT,
    "capacityKw" DOUBLE PRECISION,
    "lastTested" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'operational',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "power_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable: capacity_assessments
CREATE TABLE IF NOT EXISTS "capacity_assessments" (
    "id" TEXT NOT NULL,
    "mccId" TEXT NOT NULL,
    "assessedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assessorUserId" TEXT,
    "staffCount" INTEGER,
    "trainedStaffCount" INTEGER,
    "coolingCapacityLiters" DOUBLE PRECISION,
    "estimatedDailyDemandLiters" DOUBLE PRECISION,
    "transportCapacityLiters" DOUBLE PRECISION,
    "powerOk" BOOLEAN,
    "notes" TEXT,

    CONSTRAINT "capacity_assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable: suppliers
CREATE TABLE IF NOT EXISTS "suppliers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id")
);

-- CreateTable: procurements
CREATE TABLE IF NOT EXISTS "procurements" (
    "id" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "mccId" TEXT,
    "procuredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalAmount" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'received',

    CONSTRAINT "procurements_pkey" PRIMARY KEY ("id")
);

-- CreateTable: procurement_items
CREATE TABLE IF NOT EXISTS "procurement_items" (
    "id" TEXT NOT NULL,
    "procurementId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "qty" DOUBLE PRECISION NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "procurement_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable: assets
CREATE TABLE IF NOT EXISTS "assets" (
    "id" TEXT NOT NULL,
    "serial" TEXT NOT NULL,
    "name" TEXT,
    "assetType" TEXT,
    "status" TEXT NOT NULL DEFAULT 'available',
    "currentHolderType" TEXT,
    "currentHolderId" TEXT,
    "purchasedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable: rentals
CREATE TABLE IF NOT EXISTS "rentals" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "farmerId" TEXT,
    "mccId" TEXT,
    "rentStart" TIMESTAMP(3),
    "rentEnd" TIMESTAMP(3),
    "rentFeePerDay" DOUBLE PRECISION,
    "deposit" DOUBLE PRECISION,
    "returned" BOOLEAN NOT NULL DEFAULT false,
    "returnedAt" TIMESTAMP(3),
    "contractDoc" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rentals_pkey" PRIMARY KEY ("id")
);

-- CreateTable: farmer_accounts
CREATE TABLE IF NOT EXISTS "farmer_accounts" (
    "id" TEXT NOT NULL,
    "farmerId" TEXT NOT NULL,
    "balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "farmer_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable: farmer_ledger
CREATE TABLE IF NOT EXISTS "farmer_ledger" (
    "id" TEXT NOT NULL,
    "farmerId" TEXT NOT NULL,
    "entryAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "balanceAfter" DOUBLE PRECISION NOT NULL,
    "refId" TEXT,
    "notes" TEXT,

    CONSTRAINT "farmer_ledger_pkey" PRIMARY KEY ("id")
);

-- CreateTable: sales
CREATE TABLE IF NOT EXISTS "sales" (
    "id" TEXT NOT NULL,
    "mccId" TEXT NOT NULL,
    "farmerId" TEXT,
    "agentId" TEXT,
    "saleAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "paymentMethod" TEXT,
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "invoiceNo" TEXT,

    CONSTRAINT "sales_pkey" PRIMARY KEY ("id")
);

-- CreateTable: sale_items
CREATE TABLE IF NOT EXISTS "sale_items" (
    "id" TEXT NOT NULL,
    "saleId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "qty" DOUBLE PRECISION NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "sale_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable: questionnaires
CREATE TABLE IF NOT EXISTS "questionnaires" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "schema" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "questionnaires_pkey" PRIMARY KEY ("id")
);

-- CreateTable: questionnaire_responses
CREATE TABLE IF NOT EXISTS "questionnaire_responses" (
    "id" TEXT NOT NULL,
    "questionnaireId" TEXT NOT NULL,
    "mccId" TEXT,
    "farmerId" TEXT,
    "respondentUserId" TEXT,
    "response" JSONB,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "questionnaire_responses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: Add unique constraint on vehicles.regNo
CREATE UNIQUE INDEX IF NOT EXISTS "vehicles_regNo_key" ON "vehicles"("regNo");

-- CreateIndex: Add unique constraint on assets.serial
CREATE UNIQUE INDEX IF NOT EXISTS "assets_serial_key" ON "assets"("serial");

-- CreateIndex: Add unique constraint on questionnaires.code
CREATE UNIQUE INDEX IF NOT EXISTS "questionnaires_code_key" ON "questionnaires"("code");

-- CreateIndex: Add unique constraint on farmer_accounts.farmerId
CREATE UNIQUE INDEX IF NOT EXISTS "farmer_accounts_farmerId_key" ON "farmer_accounts"("farmerId");

-- CreateIndex: Add indexes
CREATE INDEX IF NOT EXISTS "bulk_batches_mccId_idx" ON "bulk_batches"("mccId");
CREATE INDEX IF NOT EXISTS "bulk_batches_dispatched_idx" ON "bulk_batches"("dispatched");
CREATE INDEX IF NOT EXISTS "staff_mccId_idx" ON "staff"("mccId");
CREATE INDEX IF NOT EXISTS "staff_userId_idx" ON "staff"("userId");
CREATE INDEX IF NOT EXISTS "vehicles_status_idx" ON "vehicles"("status");
CREATE INDEX IF NOT EXISTS "power_assets_mccId_idx" ON "power_assets"("mccId");
CREATE INDEX IF NOT EXISTS "power_assets_status_idx" ON "power_assets"("status");
CREATE INDEX IF NOT EXISTS "capacity_assessments_mccId_assessedAt_idx" ON "capacity_assessments"("mccId", "assessedAt" DESC);
CREATE INDEX IF NOT EXISTS "procurements_mccId_idx" ON "procurements"("mccId");
CREATE INDEX IF NOT EXISTS "procurements_supplierId_idx" ON "procurements"("supplierId");
CREATE INDEX IF NOT EXISTS "procurement_items_procurementId_idx" ON "procurement_items"("procurementId");
CREATE INDEX IF NOT EXISTS "procurement_items_productId_idx" ON "procurement_items"("productId");
CREATE INDEX IF NOT EXISTS "assets_status_idx" ON "assets"("status");
CREATE INDEX IF NOT EXISTS "assets_assetType_idx" ON "assets"("assetType");
CREATE INDEX IF NOT EXISTS "rentals_assetId_idx" ON "rentals"("assetId");
CREATE INDEX IF NOT EXISTS "rentals_farmerId_idx" ON "rentals"("farmerId");
CREATE INDEX IF NOT EXISTS "rentals_mccId_idx" ON "rentals"("mccId");
CREATE INDEX IF NOT EXISTS "farmer_ledger_farmerId_entryAt_idx" ON "farmer_ledger"("farmerId", "entryAt" DESC);
CREATE INDEX IF NOT EXISTS "sales_mccId_idx" ON "sales"("mccId");
CREATE INDEX IF NOT EXISTS "sales_farmerId_idx" ON "sales"("farmerId");
CREATE INDEX IF NOT EXISTS "sales_saleAt_idx" ON "sales"("saleAt");
CREATE INDEX IF NOT EXISTS "sale_items_saleId_idx" ON "sale_items"("saleId");
CREATE INDEX IF NOT EXISTS "sale_items_productId_idx" ON "sale_items"("productId");
CREATE INDEX IF NOT EXISTS "questionnaire_responses_questionnaireId_idx" ON "questionnaire_responses"("questionnaireId");
CREATE INDEX IF NOT EXISTS "questionnaire_responses_mccId_idx" ON "questionnaire_responses"("mccId");
CREATE INDEX IF NOT EXISTS "questionnaire_responses_farmerId_idx" ON "questionnaire_responses"("farmerId");

-- AddForeignKey: Add foreign keys
-- Add constraint mccs_managerUserId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'mccs_managerUserId_fkey' 
        AND conrelid = 'mccs'::regclass
    ) THEN
        ALTER TABLE "mccs" ADD CONSTRAINT "mccs_managerUserId_fkey" FOREIGN KEY ("managerUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- Add constraint milk_collections_mccId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'milk_collections_mccId_fkey' 
        AND conrelid = 'milk_collections'::regclass
    ) THEN
        ALTER TABLE "milk_collections" ADD CONSTRAINT "milk_collections_mccId_fkey" FOREIGN KEY ("mccId") REFERENCES "mccs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
-- Add constraint milk_collections_agentId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'milk_collections_agentId_fkey' 
        AND conrelid = 'milk_collections'::regclass
    ) THEN
        ALTER TABLE "milk_collections" ADD CONSTRAINT "milk_collections_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
-- Add constraint milk_collections_batchId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'milk_collections_batchId_fkey' 
        AND conrelid = 'milk_collections'::regclass
    ) THEN
        ALTER TABLE "milk_collections" ADD CONSTRAINT "milk_collections_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "bulk_batches"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- Add constraint bulk_batches_mccId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'bulk_batches_mccId_fkey' 
        AND conrelid = 'bulk_batches'::regclass
    ) THEN
        ALTER TABLE "bulk_batches" ADD CONSTRAINT "bulk_batches_mccId_fkey" FOREIGN KEY ("mccId") REFERENCES "mccs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

-- Add constraint staff_userId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'staff_userId_fkey' 
        AND conrelid = 'staff'::regclass
    ) THEN
        ALTER TABLE "staff" ADD CONSTRAINT "staff_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
-- Add constraint staff_mccId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'staff_mccId_fkey' 
        AND conrelid = 'staff'::regclass
    ) THEN
        ALTER TABLE "staff" ADD CONSTRAINT "staff_mccId_fkey" FOREIGN KEY ("mccId") REFERENCES "mccs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- Add constraint power_assets_mccId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'power_assets_mccId_fkey' 
        AND conrelid = 'power_assets'::regclass
    ) THEN
        ALTER TABLE "power_assets" ADD CONSTRAINT "power_assets_mccId_fkey" FOREIGN KEY ("mccId") REFERENCES "mccs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

-- Add constraint capacity_assessments_mccId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'capacity_assessments_mccId_fkey' 
        AND conrelid = 'capacity_assessments'::regclass
    ) THEN
        ALTER TABLE "capacity_assessments" ADD CONSTRAINT "capacity_assessments_mccId_fkey" FOREIGN KEY ("mccId") REFERENCES "mccs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;
-- Add constraint capacity_assessments_assessorUserId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'capacity_assessments_assessorUserId_fkey' 
        AND conrelid = 'capacity_assessments'::regclass
    ) THEN
        ALTER TABLE "capacity_assessments" ADD CONSTRAINT "capacity_assessments_assessorUserId_fkey" FOREIGN KEY ("assessorUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- Add constraint procurements_supplierId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'procurements_supplierId_fkey' 
        AND conrelid = 'procurements'::regclass
    ) THEN
        ALTER TABLE "procurements" ADD CONSTRAINT "procurements_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;
-- Add constraint procurements_mccId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'procurements_mccId_fkey' 
        AND conrelid = 'procurements'::regclass
    ) THEN
        ALTER TABLE "procurements" ADD CONSTRAINT "procurements_mccId_fkey" FOREIGN KEY ("mccId") REFERENCES "mccs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- Add constraint procurement_items_procurementId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'procurement_items_procurementId_fkey' 
        AND conrelid = 'procurement_items'::regclass
    ) THEN
        ALTER TABLE "procurement_items" ADD CONSTRAINT "procurement_items_procurementId_fkey" FOREIGN KEY ("procurementId") REFERENCES "procurements"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
-- Add constraint procurement_items_productId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'procurement_items_productId_fkey' 
        AND conrelid = 'procurement_items'::regclass
    ) THEN
        ALTER TABLE "procurement_items" ADD CONSTRAINT "procurement_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

-- Add constraint rentals_assetId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'rentals_assetId_fkey' 
        AND conrelid = 'rentals'::regclass
    ) THEN
        ALTER TABLE "rentals" ADD CONSTRAINT "rentals_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;
-- Add constraint rentals_farmerId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'rentals_farmerId_fkey' 
        AND conrelid = 'rentals'::regclass
    ) THEN
        ALTER TABLE "rentals" ADD CONSTRAINT "rentals_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "farmers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
-- Add constraint rentals_mccId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'rentals_mccId_fkey' 
        AND conrelid = 'rentals'::regclass
    ) THEN
        ALTER TABLE "rentals" ADD CONSTRAINT "rentals_mccId_fkey" FOREIGN KEY ("mccId") REFERENCES "mccs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- Add constraint farmer_accounts_farmerId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'farmer_accounts_farmerId_fkey' 
        AND conrelid = 'farmer_accounts'::regclass
    ) THEN
        ALTER TABLE "farmer_accounts" ADD CONSTRAINT "farmer_accounts_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "farmers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

-- Add constraint farmer_ledger_farmerId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'farmer_ledger_farmerId_fkey' 
        AND conrelid = 'farmer_ledger'::regclass
    ) THEN
        ALTER TABLE "farmer_ledger" ADD CONSTRAINT "farmer_ledger_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "farmers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

-- Add constraint sales_mccId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'sales_mccId_fkey' 
        AND conrelid = 'sales'::regclass
    ) THEN
        ALTER TABLE "sales" ADD CONSTRAINT "sales_mccId_fkey" FOREIGN KEY ("mccId") REFERENCES "mccs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;
-- Add constraint sales_farmerId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'sales_farmerId_fkey' 
        AND conrelid = 'sales'::regclass
    ) THEN
        ALTER TABLE "sales" ADD CONSTRAINT "sales_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "farmers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
-- Add constraint sales_agentId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'sales_agentId_fkey' 
        AND conrelid = 'sales'::regclass
    ) THEN
        ALTER TABLE "sales" ADD CONSTRAINT "sales_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- Add constraint sale_items_saleId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'sale_items_saleId_fkey' 
        AND conrelid = 'sale_items'::regclass
    ) THEN
        ALTER TABLE "sale_items" ADD CONSTRAINT "sale_items_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "sales"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
-- Add constraint sale_items_productId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'sale_items_productId_fkey' 
        AND conrelid = 'sale_items'::regclass
    ) THEN
        ALTER TABLE "sale_items" ADD CONSTRAINT "sale_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

-- Add constraint questionnaire_responses_questionnaireId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'questionnaire_responses_questionnaireId_fkey' 
        AND conrelid = 'questionnaire_responses'::regclass
    ) THEN
        ALTER TABLE "questionnaire_responses" ADD CONSTRAINT "questionnaire_responses_questionnaireId_fkey" FOREIGN KEY ("questionnaireId") REFERENCES "questionnaires"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;
-- Add constraint questionnaire_responses_mccId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'questionnaire_responses_mccId_fkey' 
        AND conrelid = 'questionnaire_responses'::regclass
    ) THEN
        ALTER TABLE "questionnaire_responses" ADD CONSTRAINT "questionnaire_responses_mccId_fkey" FOREIGN KEY ("mccId") REFERENCES "mccs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
-- Add constraint questionnaire_responses_farmerId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'questionnaire_responses_farmerId_fkey' 
        AND conrelid = 'questionnaire_responses'::regclass
    ) THEN
        ALTER TABLE "questionnaire_responses" ADD CONSTRAINT "questionnaire_responses_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "farmers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
-- Add constraint questionnaire_responses_respondentUserId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'questionnaire_responses_respondentUserId_fkey' 
        AND conrelid = 'questionnaire_responses'::regclass
    ) THEN
        ALTER TABLE "questionnaire_responses" ADD CONSTRAINT "questionnaire_responses_respondentUserId_fkey" FOREIGN KEY ("respondentUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;



COMMIT;

-- If this migration failed, you can continue with the next one
-- Just comment out the failed migration section above

-- ============================================
-- Migration 7/59: 20250121000001_add_mcc_roles
-- ============================================

BEGIN;

-- Migration: Add MCC Roles
-- This migration adds new MCC-related roles to the UserRole enum

-- AlterEnum: Add new MCC roles to UserRole enum
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'MCC_MANAGER';
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'FIELD_AGENT';
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'COOP_ADMIN';
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'FARMER';
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'ACCOUNTANT';



COMMIT;

-- If this migration failed, you can continue with the next one
-- Just comment out the failed migration section above

-- ============================================
-- Migration 8/59: 20250122000000_add_generic_payments_table
-- ============================================

BEGIN;

-- Migration: Add Generic Payments Table
-- This migration adds the payments table to track generic farmer payments

-- CreateTable: Payments
CREATE TABLE IF NOT EXISTS "payments" (
    "id" TEXT NOT NULL,
    "farmerId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "method" TEXT,
    "reference" TEXT,
    "paidAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: Payments
CREATE INDEX IF NOT EXISTS "payments_farmerId_idx" ON "payments"("farmerId");
CREATE INDEX IF NOT EXISTS "payments_paidAt_idx" ON "payments"("paidAt");

-- AddForeignKey: Payments
-- Add constraint payments_farmerId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'payments_farmerId_fkey' 
        AND conrelid = 'payments'::regclass
    ) THEN
        ALTER TABLE "payments" ADD CONSTRAINT "payments_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "farmers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;












COMMIT;

-- If this migration failed, you can continue with the next one
-- Just comment out the failed migration section above

-- ============================================
-- Migration 9/59: 20250123000000_add_geo_location_system
-- ============================================

BEGIN;

-- Migration: Add geo-location system with consent and audit
-- All fields are nullable for backward compatibility
-- No breaking changes - existing data remains valid

-- 1. Add geo-location fields to mccs
ALTER TABLE "mccs" 
ADD COLUMN IF NOT EXISTS "gpsLatitude" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "gpsLongitude" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "geoConsent" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "geoConsentAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "geoCreatedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "geoUpdatedAt" TIMESTAMP(3);

-- 2. Add geo-location fields to users (for agents/field agents)
ALTER TABLE "users" 
ADD COLUMN IF NOT EXISTS "gpsLatitude" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "gpsLongitude" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "geoConsent" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "geoConsentAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "geoCreatedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "geoUpdatedAt" TIMESTAMP(3);

-- 3. Add geo-location fields to warehouses
ALTER TABLE "warehouses" 
ADD COLUMN IF NOT EXISTS "gpsLatitude" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "gpsLongitude" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "geoConsent" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "geoConsentAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "geoCreatedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "geoUpdatedAt" TIMESTAMP(3);

-- 4. Add geo-location fields to mcc_customers
ALTER TABLE "mcc_customers" 
ADD COLUMN IF NOT EXISTS "gpsLatitude" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "gpsLongitude" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "geoConsent" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "geoConsentAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "geoCreatedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "geoUpdatedAt" TIMESTAMP(3);

-- 5. Add geo-location fields to suppliers
ALTER TABLE "suppliers" 
ADD COLUMN IF NOT EXISTS "gpsLatitude" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "gpsLongitude" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "geoConsent" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "geoConsentAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "geoCreatedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "geoUpdatedAt" TIMESTAMP(3);

-- 6. Add consent and audit fields to farmers (gpsLatitude/gpsLongitude already exist)
ALTER TABLE "farmers" 
ADD COLUMN IF NOT EXISTS "geoConsent" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "geoConsentAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "geoCreatedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "geoUpdatedAt" TIMESTAMP(3);

-- 7. Create geo audit log table
CREATE TABLE IF NOT EXISTS "geo_audit_logs" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "userName" TEXT,
  "userRole" TEXT,
  "action" TEXT NOT NULL,
  "entityType" TEXT NOT NULL,
  "entityId" TEXT NOT NULL,
  "entityName" TEXT,
  "oldValue" TEXT,
  "newValue" TEXT,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "metadata" TEXT,
  "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "geo_audit_logs_pkey" PRIMARY KEY ("id")
);

-- 8. Create indexes for geo-location queries (improves performance)
CREATE INDEX IF NOT EXISTS "mccs_gpsLatitude_gpsLongitude_idx" ON "mccs"("gpsLatitude", "gpsLongitude") WHERE "gpsLatitude" IS NOT NULL AND "gpsLongitude" IS NOT NULL;
CREATE INDEX IF NOT EXISTS "users_gpsLatitude_gpsLongitude_idx" ON "users"("gpsLatitude", "gpsLongitude") WHERE "gpsLatitude" IS NOT NULL AND "gpsLongitude" IS NOT NULL;
CREATE INDEX IF NOT EXISTS "warehouses_gpsLatitude_gpsLongitude_idx" ON "warehouses"("gpsLatitude", "gpsLongitude") WHERE "gpsLatitude" IS NOT NULL AND "gpsLongitude" IS NOT NULL;
CREATE INDEX IF NOT EXISTS "mcc_customers_gpsLatitude_gpsLongitude_idx" ON "mcc_customers"("gpsLatitude", "gpsLongitude") WHERE "gpsLatitude" IS NOT NULL AND "gpsLongitude" IS NOT NULL;
CREATE INDEX IF NOT EXISTS "suppliers_gpsLatitude_gpsLongitude_idx" ON "suppliers"("gpsLatitude", "gpsLongitude") WHERE "gpsLatitude" IS NOT NULL AND "gpsLongitude" IS NOT NULL;
CREATE INDEX IF NOT EXISTS "farmers_gpsLatitude_gpsLongitude_idx" ON "farmers"("gpsLatitude", "gpsLongitude") WHERE "gpsLatitude" IS NOT NULL AND "gpsLongitude" IS NOT NULL;

-- 9. Create indexes for audit logs
CREATE INDEX IF NOT EXISTS "geo_audit_logs_userId_idx" ON "geo_audit_logs"("userId");
CREATE INDEX IF NOT EXISTS "geo_audit_logs_entityType_entityId_idx" ON "geo_audit_logs"("entityType", "entityId");
CREATE INDEX IF NOT EXISTS "geo_audit_logs_action_idx" ON "geo_audit_logs"("action");
CREATE INDEX IF NOT EXISTS "geo_audit_logs_timestamp_idx" ON "geo_audit_logs"("timestamp");


COMMIT;

-- If this migration failed, you can continue with the next one
-- Just comment out the failed migration section above

-- ============================================
-- Migration 10/59: 20250123000001_add_amakusanyirizo_complete
-- ============================================

BEGIN;

-- Migration: Complete Amakusanyirizo Implementation
-- Phase 1, 2, and 3 features

-- 1. Add CROP to InventoryType enum (if not exists via ALTER TYPE)
-- Note: PostgreSQL doesn't support adding enum values easily, may need manual enum update
-- ALTER TYPE "InventoryType" ADD VALUE IF NOT EXISTS 'CROP';

-- 2. Create crop_types table
CREATE TABLE IF NOT EXISTS "crop_types" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "code" TEXT NOT NULL UNIQUE,
  "unitOfMeasure" TEXT NOT NULL,
  "qualityStandards" JSONB,
  "defaultPricePerUnit" DOUBLE PRECISION NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "crop_types_pkey" PRIMARY KEY ("id")
);

-- 3. Create crop_collections table
CREATE TABLE IF NOT EXISTS "crop_collections" (
  "id" TEXT NOT NULL,
  "farmerId" TEXT NOT NULL,
  "mccId" TEXT NOT NULL,
  "cropPeriodId" TEXT,
  "collectionDate" TIMESTAMP(3) NOT NULL,
  "cropTypeId" TEXT NOT NULL,
  "quantity" DOUBLE PRECISION NOT NULL,
  "unit" TEXT NOT NULL,
  "qualityTests" JSONB,
  "pricePerUnit" DOUBLE PRECISION NOT NULL,
  "totalAmount" DOUBLE PRECISION NOT NULL,
  "deductions" JSONB NOT NULL DEFAULT '{}',
  "advances" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "totalDeductions" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "netPayment" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "warehouseId" TEXT,
  "locationId" TEXT,
  "productId" TEXT,
  "stockMoveId" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "crop_collections_pkey" PRIMARY KEY ("id")
);

-- 4. Create crop_periods table
CREATE TABLE IF NOT EXISTS "crop_periods" (
  "id" TEXT NOT NULL,
  "mccId" TEXT NOT NULL,
  "periodNumber" INTEGER NOT NULL,
  "startDate" TIMESTAMP(3) NOT NULL,
  "endDate" TIMESTAMP(3) NOT NULL,
  "totalFarmers" INTEGER NOT NULL DEFAULT 0,
  "totalQuantity" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "totalAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "totalDeductions" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "totalAdvances" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "crop_periods_pkey" PRIMARY KEY ("id")
);

-- 5. Create crop_processing table
CREATE TABLE IF NOT EXISTS "crop_processing" (
  "id" TEXT NOT NULL,
  "mccId" TEXT NOT NULL,
  "rawCropProductId" TEXT NOT NULL,
  "processedProductId" TEXT NOT NULL,
  "inputQuantity" DOUBLE PRECISION NOT NULL,
  "outputQuantity" DOUBLE PRECISION NOT NULL,
  "processingDate" TIMESTAMP(3) NOT NULL,
  "processingSteps" JSONB NOT NULL DEFAULT '{}',
  "qualityMetrics" JSONB NOT NULL DEFAULT '{}',
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "crop_processing_pkey" PRIMARY KEY ("id")
);

-- 6. Create services table
CREATE TABLE IF NOT EXISTS "services" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "code" TEXT NOT NULL UNIQUE,
  "type" TEXT NOT NULL,
  "description" TEXT,
  "pricing" JSONB NOT NULL,
  "duration" INTEGER,
  "sla" JSONB,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- 7. Create service_deliveries table
CREATE TABLE IF NOT EXISTS "service_deliveries" (
  "id" TEXT NOT NULL,
  "serviceId" TEXT NOT NULL,
  "farmerId" TEXT,
  "mccId" TEXT,
  "requestedBy" TEXT NOT NULL,
  "scheduledDate" TIMESTAMP(3) NOT NULL,
  "completedDate" TIMESTAMP(3),
  "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
  "notes" TEXT,
  "cost" DOUBLE PRECISION,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "service_deliveries_pkey" PRIMARY KEY ("id")
);

-- 8. Create reconciliation_records table
CREATE TABLE IF NOT EXISTS "reconciliation_records" (
  "id" TEXT NOT NULL,
  "mccId" TEXT NOT NULL,
  "periodId" TEXT,
  "reconciliationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "type" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "totalExpected" DOUBLE PRECISION NOT NULL,
  "totalActual" DOUBLE PRECISION NOT NULL,
  "discrepancy" DOUBLE PRECISION NOT NULL,
  "discrepancies" JSONB,
  "resolvedBy" TEXT,
  "resolvedAt" TIMESTAMP(3),
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "reconciliation_records_pkey" PRIMARY KEY ("id")
);

-- 9. Add contract management fields to rentals
ALTER TABLE "rentals" 
ADD COLUMN IF NOT EXISTS "contractTerms" JSONB,
ADD COLUMN IF NOT EXISTS "contractStart" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "contractEnd" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "autoRenew" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "renewalPeriod" INTEGER,
ADD COLUMN IF NOT EXISTS "contractStatus" TEXT DEFAULT 'ACTIVE',
ADD COLUMN IF NOT EXISTS "signedBy" TEXT,
ADD COLUMN IF NOT EXISTS "signedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "contractVersion" INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- 10. Add foreign keys
-- Add constraint crop_collections_farmerId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'crop_collections_farmerId_fkey' 
        AND conrelid = 'crop_collections'::regclass
    ) THEN
        -- Add constraint crop_collections_farmerId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'crop_collections_farmerId_fkey' 
        AND conrelid = 'crop_collections'::regclass
    ) THEN
        ALTER TABLE "crop_collections" ADD CONSTRAINT "crop_collections_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "farmers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;
    END IF;
END $$;
-- Add constraint crop_collections_mccId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'crop_collections_mccId_fkey' 
        AND conrelid = 'crop_collections'::regclass
    ) THEN
        -- Add constraint crop_collections_mccId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'crop_collections_mccId_fkey' 
        AND conrelid = 'crop_collections'::regclass
    ) THEN
        ALTER TABLE "crop_collections" ADD CONSTRAINT "crop_collections_mccId_fkey" FOREIGN KEY ("mccId") REFERENCES "mccs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;
    END IF;
END $$;
-- Add constraint crop_collections_cropTypeId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'crop_collections_cropTypeId_fkey' 
        AND conrelid = 'crop_collections'::regclass
    ) THEN
        -- Add constraint crop_collections_cropTypeId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'crop_collections_cropTypeId_fkey' 
        AND conrelid = 'crop_collections'::regclass
    ) THEN
        ALTER TABLE "crop_collections" ADD CONSTRAINT "crop_collections_cropTypeId_fkey" FOREIGN KEY ("cropTypeId") REFERENCES "crop_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;
    END IF;
END $$;
-- Add constraint crop_collections_cropPeriodId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'crop_collections_cropPeriodId_fkey' 
        AND conrelid = 'crop_collections'::regclass
    ) THEN
        -- Add constraint crop_collections_cropPeriodId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'crop_collections_cropPeriodId_fkey' 
        AND conrelid = 'crop_collections'::regclass
    ) THEN
        ALTER TABLE "crop_collections" ADD CONSTRAINT "crop_collections_cropPeriodId_fkey" FOREIGN KEY ("cropPeriodId") REFERENCES "crop_periods"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
    END IF;
END $$;
-- Add constraint crop_collections_warehouseId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'crop_collections_warehouseId_fkey' 
        AND conrelid = 'crop_collections'::regclass
    ) THEN
        -- Add constraint crop_collections_warehouseId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'crop_collections_warehouseId_fkey' 
        AND conrelid = 'crop_collections'::regclass
    ) THEN
        ALTER TABLE "crop_collections" ADD CONSTRAINT "crop_collections_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
    END IF;
END $$;
-- Add constraint crop_collections_locationId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'crop_collections_locationId_fkey' 
        AND conrelid = 'crop_collections'::regclass
    ) THEN
        -- Add constraint crop_collections_locationId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'crop_collections_locationId_fkey' 
        AND conrelid = 'crop_collections'::regclass
    ) THEN
        ALTER TABLE "crop_collections" ADD CONSTRAINT "crop_collections_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
    END IF;
END $$;
-- Add constraint crop_collections_productId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'crop_collections_productId_fkey' 
        AND conrelid = 'crop_collections'::regclass
    ) THEN
        -- Add constraint crop_collections_productId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'crop_collections_productId_fkey' 
        AND conrelid = 'crop_collections'::regclass
    ) THEN
        ALTER TABLE "crop_collections" ADD CONSTRAINT "crop_collections_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
    END IF;
END $$;
-- Add constraint crop_collections_stockMoveId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'crop_collections_stockMoveId_fkey' 
        AND conrelid = 'crop_collections'::regclass
    ) THEN
        -- Add constraint crop_collections_stockMoveId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'crop_collections_stockMoveId_fkey' 
        AND conrelid = 'crop_collections'::regclass
    ) THEN
        ALTER TABLE "crop_collections" ADD CONSTRAINT "crop_collections_stockMoveId_fkey" FOREIGN KEY ("stockMoveId") REFERENCES "stock_moves"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
    END IF;
END $$;

-- Add constraint crop_periods_mccId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'crop_periods_mccId_fkey' 
        AND conrelid = 'crop_periods'::regclass
    ) THEN
        -- Add constraint crop_periods_mccId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'crop_periods_mccId_fkey' 
        AND conrelid = 'crop_periods'::regclass
    ) THEN
        ALTER TABLE "crop_periods" ADD CONSTRAINT "crop_periods_mccId_fkey" FOREIGN KEY ("mccId") REFERENCES "mccs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;
    END IF;
END $$;

-- Add constraint crop_processing_mccId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'crop_processing_mccId_fkey' 
        AND conrelid = 'crop_processing'::regclass
    ) THEN
        -- Add constraint crop_processing_mccId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'crop_processing_mccId_fkey' 
        AND conrelid = 'crop_processing'::regclass
    ) THEN
        ALTER TABLE "crop_processing" ADD CONSTRAINT "crop_processing_mccId_fkey" FOREIGN KEY ("mccId") REFERENCES "mccs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;
    END IF;
END $$;
-- Add constraint crop_processing_rawCropProductId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'crop_processing_rawCropProductId_fkey' 
        AND conrelid = 'crop_processing'::regclass
    ) THEN
        -- Add constraint crop_processing_rawCropProductId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'crop_processing_rawCropProductId_fkey' 
        AND conrelid = 'crop_processing'::regclass
    ) THEN
        ALTER TABLE "crop_processing" ADD CONSTRAINT "crop_processing_rawCropProductId_fkey" FOREIGN KEY ("rawCropProductId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;
    END IF;
END $$;
-- Add constraint crop_processing_processedProductId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'crop_processing_processedProductId_fkey' 
        AND conrelid = 'crop_processing'::regclass
    ) THEN
        -- Add constraint crop_processing_processedProductId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'crop_processing_processedProductId_fkey' 
        AND conrelid = 'crop_processing'::regclass
    ) THEN
        ALTER TABLE "crop_processing" ADD CONSTRAINT "crop_processing_processedProductId_fkey" FOREIGN KEY ("processedProductId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;
    END IF;
END $$;

-- Add constraint service_deliveries_serviceId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'service_deliveries_serviceId_fkey' 
        AND conrelid = 'service_deliveries'::regclass
    ) THEN
        -- Add constraint service_deliveries_serviceId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'service_deliveries_serviceId_fkey' 
        AND conrelid = 'service_deliveries'::regclass
    ) THEN
        ALTER TABLE "service_deliveries" ADD CONSTRAINT "service_deliveries_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;
    END IF;
END $$;
-- Add constraint service_deliveries_farmerId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'service_deliveries_farmerId_fkey' 
        AND conrelid = 'service_deliveries'::regclass
    ) THEN
        -- Add constraint service_deliveries_farmerId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'service_deliveries_farmerId_fkey' 
        AND conrelid = 'service_deliveries'::regclass
    ) THEN
        ALTER TABLE "service_deliveries" ADD CONSTRAINT "service_deliveries_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "farmers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
    END IF;
END $$;
-- Add constraint service_deliveries_mccId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'service_deliveries_mccId_fkey' 
        AND conrelid = 'service_deliveries'::regclass
    ) THEN
        -- Add constraint service_deliveries_mccId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'service_deliveries_mccId_fkey' 
        AND conrelid = 'service_deliveries'::regclass
    ) THEN
        ALTER TABLE "service_deliveries" ADD CONSTRAINT "service_deliveries_mccId_fkey" FOREIGN KEY ("mccId") REFERENCES "mccs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
    END IF;
END $$;
-- Add constraint service_deliveries_requestedBy_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'service_deliveries_requestedBy_fkey' 
        AND conrelid = 'service_deliveries'::regclass
    ) THEN
        -- Add constraint service_deliveries_requestedBy_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'service_deliveries_requestedBy_fkey' 
        AND conrelid = 'service_deliveries'::regclass
    ) THEN
        ALTER TABLE "service_deliveries" ADD CONSTRAINT "service_deliveries_requestedBy_fkey" FOREIGN KEY ("requestedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;
    END IF;
END $$;

-- Add constraint reconciliation_records_mccId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'reconciliation_records_mccId_fkey' 
        AND conrelid = 'reconciliation_records'::regclass
    ) THEN
        -- Add constraint reconciliation_records_mccId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'reconciliation_records_mccId_fkey' 
        AND conrelid = 'reconciliation_records'::regclass
    ) THEN
        ALTER TABLE "reconciliation_records" ADD CONSTRAINT "reconciliation_records_mccId_fkey" FOREIGN KEY ("mccId") REFERENCES "mccs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;
    END IF;
END $$;
-- Add constraint reconciliation_records_resolvedBy_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'reconciliation_records_resolvedBy_fkey' 
        AND conrelid = 'reconciliation_records'::regclass
    ) THEN
        -- Add constraint reconciliation_records_resolvedBy_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'reconciliation_records_resolvedBy_fkey' 
        AND conrelid = 'reconciliation_records'::regclass
    ) THEN
        ALTER TABLE "reconciliation_records" ADD CONSTRAINT "reconciliation_records_resolvedBy_fkey" FOREIGN KEY ("resolvedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
    END IF;
END $$;

-- Add constraint rentals_signedBy_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'rentals_signedBy_fkey' 
        AND conrelid = 'rentals'::regclass
    ) THEN
        -- Add constraint rentals_signedBy_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'rentals_signedBy_fkey' 
        AND conrelid = 'rentals'::regclass
    ) THEN
        ALTER TABLE "rentals" ADD CONSTRAINT "rentals_signedBy_fkey" FOREIGN KEY ("signedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
    END IF;
END $$;

-- 11. Create indexes
CREATE INDEX IF NOT EXISTS "crop_types_code_idx" ON "crop_types"("code");
CREATE INDEX IF NOT EXISTS "crop_collections_farmerId_idx" ON "crop_collections"("farmerId");
CREATE INDEX IF NOT EXISTS "crop_collections_mccId_idx" ON "crop_collections"("mccId");
CREATE INDEX IF NOT EXISTS "crop_collections_collectionDate_idx" ON "crop_collections"("collectionDate");
CREATE INDEX IF NOT EXISTS "crop_collections_status_idx" ON "crop_collections"("status");
CREATE INDEX IF NOT EXISTS "crop_collections_cropTypeId_idx" ON "crop_collections"("cropTypeId");
CREATE INDEX IF NOT EXISTS "crop_periods_mccId_idx" ON "crop_periods"("mccId");
CREATE INDEX IF NOT EXISTS "crop_periods_periodNumber_idx" ON "crop_periods"("periodNumber");
CREATE INDEX IF NOT EXISTS "crop_processing_mccId_idx" ON "crop_processing"("mccId");
CREATE INDEX IF NOT EXISTS "crop_processing_rawCropProductId_idx" ON "crop_processing"("rawCropProductId");
CREATE INDEX IF NOT EXISTS "crop_processing_processedProductId_idx" ON "crop_processing"("processedProductId");
CREATE INDEX IF NOT EXISTS "services_code_idx" ON "services"("code");
CREATE INDEX IF NOT EXISTS "services_type_idx" ON "services"("type");
CREATE INDEX IF NOT EXISTS "service_deliveries_serviceId_idx" ON "service_deliveries"("serviceId");
CREATE INDEX IF NOT EXISTS "service_deliveries_farmerId_idx" ON "service_deliveries"("farmerId");
CREATE INDEX IF NOT EXISTS "service_deliveries_mccId_idx" ON "service_deliveries"("mccId");
CREATE INDEX IF NOT EXISTS "service_deliveries_status_idx" ON "service_deliveries"("status");
CREATE INDEX IF NOT EXISTS "service_deliveries_scheduledDate_idx" ON "service_deliveries"("scheduledDate");
CREATE INDEX IF NOT EXISTS "reconciliation_records_mccId_idx" ON "reconciliation_records"("mccId");
CREATE INDEX IF NOT EXISTS "reconciliation_records_type_idx" ON "reconciliation_records"("type");
CREATE INDEX IF NOT EXISTS "reconciliation_records_status_idx" ON "reconciliation_records"("status");
CREATE INDEX IF NOT EXISTS "reconciliation_records_reconciliationDate_idx" ON "reconciliation_records"("reconciliationDate");
CREATE INDEX IF NOT EXISTS "rentals_contractStatus_idx" ON "rentals"("contractStatus");


COMMIT;

-- If this migration failed, you can continue with the next one
-- Just comment out the failed migration section above

-- ============================================
-- Migration 11/59: 20250123000002_add_harvestplus_platform
-- ============================================

BEGIN;

-- Migration: HarvestPlus Multi-Commodity Platform
-- Complete implementation of Commodity Studio and multi-commodity support

-- 1. Create commodity_categories table
CREATE TABLE IF NOT EXISTS "commodity_categories" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL UNIQUE,
  "description" TEXT,
  "defaultStorageType" TEXT,
  "status" TEXT NOT NULL DEFAULT 'active',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "commodity_categories_pkey" PRIMARY KEY ("id")
);

-- 2. Create commodities table
CREATE TABLE IF NOT EXISTS "commodities" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "code" TEXT NOT NULL UNIQUE,
  "categoryId" TEXT NOT NULL,
  "unitOfMeasure" TEXT NOT NULL,
  "pricingMethod" TEXT NOT NULL,
  "storageType" TEXT NOT NULL,
  "defaultCollectionCenterType" TEXT,
  "defaultCollectionFrequency" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "commodities_pkey" PRIMARY KEY ("id")
);

-- 3. Create commodity_quality_fields table
CREATE TABLE IF NOT EXISTS "commodity_quality_fields" (
  "id" TEXT NOT NULL,
  "commodityId" TEXT NOT NULL,
  "fieldName" TEXT NOT NULL,
  "fieldType" TEXT NOT NULL,
  "dataType" TEXT NOT NULL,
  "options" JSONB,
  "isMandatory" BOOLEAN NOT NULL DEFAULT false,
  "displayOrder" INTEGER NOT NULL DEFAULT 0,
  "description" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "commodity_quality_fields_pkey" PRIMARY KEY ("id")
);

-- 4. Create commodity_quality_rules table
CREATE TABLE IF NOT EXISTS "commodity_quality_rules" (
  "id" TEXT NOT NULL,
  "commodityId" TEXT NOT NULL,
  "qualityFieldId" TEXT,
  "ruleName" TEXT NOT NULL,
  "ruleType" TEXT NOT NULL,
  "thresholdValue" DOUBLE PRECISION,
  "thresholdOperator" TEXT,
  "impactOnPricing" BOOLEAN NOT NULL DEFAULT false,
  "pricingMultiplier" DOUBLE PRECISION,
  "errorMessage" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "commodity_quality_rules_pkey" PRIMARY KEY ("id")
);

-- 5. Create season_plans table
CREATE TABLE IF NOT EXISTS "season_plans" (
  "id" TEXT NOT NULL,
  "farmerId" TEXT NOT NULL,
  "commodityId" TEXT NOT NULL,
  "season" TEXT NOT NULL,
  "plotHerdReference" TEXT,
  "expectedHarvestVolume" DOUBLE PRECISION NOT NULL,
  "expectedHarvestStartDate" TIMESTAMP(3) NOT NULL,
  "expectedHarvestEndDate" TIMESTAMP(3) NOT NULL,
  "collectionFrequency" TEXT,
  "status" TEXT NOT NULL DEFAULT 'PLANNED',
  "actualHarvestVolume" DOUBLE PRECISION,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "season_plans_pkey" PRIMARY KEY ("id")
);

-- 6. Create input_catalog table
CREATE TABLE IF NOT EXISTS "input_catalog" (
  "id" TEXT NOT NULL,
  "commodityId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "unit" TEXT NOT NULL,
  "pricingReference" DOUBLE PRECISION,
  "description" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "input_catalog_pkey" PRIMARY KEY ("id")
);

-- 7. Create input_usage_logs table
CREATE TABLE IF NOT EXISTS "input_usage_logs" (
  "id" TEXT NOT NULL,
  "seasonPlanId" TEXT NOT NULL,
  "inputCatalogId" TEXT NOT NULL,
  "farmerId" TEXT NOT NULL,
  "quantity" DOUBLE PRECISION NOT NULL,
  "unit" TEXT NOT NULL,
  "usageDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "cost" DOUBLE PRECISION,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "input_usage_logs_pkey" PRIMARY KEY ("id")
);

-- 8. Create id_verifications table
CREATE TABLE IF NOT EXISTS "id_verifications" (
  "id" TEXT NOT NULL,
  "entityType" TEXT NOT NULL,
  "entityId" TEXT NOT NULL,
  "nationalId" TEXT NOT NULL,
  "agentId" TEXT,
  "verificationStatus" TEXT NOT NULL DEFAULT 'PENDING',
  "verifiedBy" TEXT,
  "verifiedAt" TIMESTAMP(3),
  "verificationMethod" TEXT,
  "verificationNotes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "id_verifications_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "id_verifications_entityType_entityId_key" UNIQUE ("entityType", "entityId")
);

-- 9. Create commodity_collections table
CREATE TABLE IF NOT EXISTS "commodity_collections" (
  "id" TEXT NOT NULL,
  "commodityId" TEXT NOT NULL,
  "farmerId" TEXT NOT NULL,
  "mccId" TEXT NOT NULL,
  "periodId" TEXT,
  "collectionDate" TIMESTAMP(3) NOT NULL,
  "quantity" DOUBLE PRECISION NOT NULL,
  "unit" TEXT NOT NULL,
  "qualityData" JSONB NOT NULL DEFAULT '{}',
  "qualityScore" DOUBLE PRECISION,
  "pricePerUnit" DOUBLE PRECISION NOT NULL,
  "totalAmount" DOUBLE PRECISION NOT NULL,
  "deductions" JSONB NOT NULL DEFAULT '{}',
  "advances" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "agentAdvance" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "totalDeductions" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "netPayment" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "warehouseId" TEXT,
  "locationId" TEXT,
  "productId" TEXT,
  "stockMoveId" TEXT,
  "agentId" TEXT,
  "batchId" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "commodity_collections_pkey" PRIMARY KEY ("id")
);

-- 10. Add foreign keys
-- Add constraint commodities_categoryId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'commodities_categoryId_fkey' 
        AND conrelid = 'commodities'::regclass
    ) THEN
        -- Add constraint commodities_categoryId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'commodities_categoryId_fkey' 
        AND conrelid = 'commodities'::regclass
    ) THEN
        ALTER TABLE "commodities" ADD CONSTRAINT "commodities_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "commodity_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;
    END IF;
END $$;
-- Add constraint commodity_quality_fields_commodityId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'commodity_quality_fields_commodityId_fkey' 
        AND conrelid = 'commodity_quality_fields'::regclass
    ) THEN
        -- Add constraint commodity_quality_fields_commodityId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'commodity_quality_fields_commodityId_fkey' 
        AND conrelid = 'commodity_quality_fields'::regclass
    ) THEN
        ALTER TABLE "commodity_quality_fields" ADD CONSTRAINT "commodity_quality_fields_commodityId_fkey" FOREIGN KEY ("commodityId") REFERENCES "commodities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
    END IF;
END $$;
-- Add constraint commodity_quality_rules_commodityId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'commodity_quality_rules_commodityId_fkey' 
        AND conrelid = 'commodity_quality_rules'::regclass
    ) THEN
        -- Add constraint commodity_quality_rules_commodityId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'commodity_quality_rules_commodityId_fkey' 
        AND conrelid = 'commodity_quality_rules'::regclass
    ) THEN
        ALTER TABLE "commodity_quality_rules" ADD CONSTRAINT "commodity_quality_rules_commodityId_fkey" FOREIGN KEY ("commodityId") REFERENCES "commodities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
    END IF;
END $$;
-- Add constraint commodity_quality_rules_qualityFieldId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'commodity_quality_rules_qualityFieldId_fkey' 
        AND conrelid = 'commodity_quality_rules'::regclass
    ) THEN
        -- Add constraint commodity_quality_rules_qualityFieldId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'commodity_quality_rules_qualityFieldId_fkey' 
        AND conrelid = 'commodity_quality_rules'::regclass
    ) THEN
        ALTER TABLE "commodity_quality_rules" ADD CONSTRAINT "commodity_quality_rules_qualityFieldId_fkey" FOREIGN KEY ("qualityFieldId") REFERENCES "commodity_quality_fields"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
    END IF;
END $$;
-- Add constraint season_plans_farmerId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'season_plans_farmerId_fkey' 
        AND conrelid = 'season_plans'::regclass
    ) THEN
        -- Add constraint season_plans_farmerId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'season_plans_farmerId_fkey' 
        AND conrelid = 'season_plans'::regclass
    ) THEN
        ALTER TABLE "season_plans" ADD CONSTRAINT "season_plans_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "farmers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;
    END IF;
END $$;
-- Add constraint season_plans_commodityId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'season_plans_commodityId_fkey' 
        AND conrelid = 'season_plans'::regclass
    ) THEN
        -- Add constraint season_plans_commodityId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'season_plans_commodityId_fkey' 
        AND conrelid = 'season_plans'::regclass
    ) THEN
        ALTER TABLE "season_plans" ADD CONSTRAINT "season_plans_commodityId_fkey" FOREIGN KEY ("commodityId") REFERENCES "commodities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;
    END IF;
END $$;
-- Add constraint input_catalog_commodityId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'input_catalog_commodityId_fkey' 
        AND conrelid = 'input_catalog'::regclass
    ) THEN
        -- Add constraint input_catalog_commodityId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'input_catalog_commodityId_fkey' 
        AND conrelid = 'input_catalog'::regclass
    ) THEN
        ALTER TABLE "input_catalog" ADD CONSTRAINT "input_catalog_commodityId_fkey" FOREIGN KEY ("commodityId") REFERENCES "commodities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;
    END IF;
END $$;
-- Add constraint input_usage_logs_seasonPlanId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'input_usage_logs_seasonPlanId_fkey' 
        AND conrelid = 'input_usage_logs'::regclass
    ) THEN
        -- Add constraint input_usage_logs_seasonPlanId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'input_usage_logs_seasonPlanId_fkey' 
        AND conrelid = 'input_usage_logs'::regclass
    ) THEN
        ALTER TABLE "input_usage_logs" ADD CONSTRAINT "input_usage_logs_seasonPlanId_fkey" FOREIGN KEY ("seasonPlanId") REFERENCES "season_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;
    END IF;
END $$;
-- Add constraint input_usage_logs_inputCatalogId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'input_usage_logs_inputCatalogId_fkey' 
        AND conrelid = 'input_usage_logs'::regclass
    ) THEN
        -- Add constraint input_usage_logs_inputCatalogId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'input_usage_logs_inputCatalogId_fkey' 
        AND conrelid = 'input_usage_logs'::regclass
    ) THEN
        ALTER TABLE "input_usage_logs" ADD CONSTRAINT "input_usage_logs_inputCatalogId_fkey" FOREIGN KEY ("inputCatalogId") REFERENCES "input_catalog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;
    END IF;
END $$;
-- Add constraint input_usage_logs_farmerId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'input_usage_logs_farmerId_fkey' 
        AND conrelid = 'input_usage_logs'::regclass
    ) THEN
        -- Add constraint input_usage_logs_farmerId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'input_usage_logs_farmerId_fkey' 
        AND conrelid = 'input_usage_logs'::regclass
    ) THEN
        ALTER TABLE "input_usage_logs" ADD CONSTRAINT "input_usage_logs_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "farmers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;
    END IF;
END $$;
-- Add constraint id_verifications_verifiedBy_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'id_verifications_verifiedBy_fkey' 
        AND conrelid = 'id_verifications'::regclass
    ) THEN
        -- Add constraint id_verifications_verifiedBy_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'id_verifications_verifiedBy_fkey' 
        AND conrelid = 'id_verifications'::regclass
    ) THEN
        ALTER TABLE "id_verifications" ADD CONSTRAINT "id_verifications_verifiedBy_fkey" FOREIGN KEY ("verifiedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
    END IF;
END $$;
-- Add constraint commodity_collections_commodityId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'commodity_collections_commodityId_fkey' 
        AND conrelid = 'commodity_collections'::regclass
    ) THEN
        -- Add constraint commodity_collections_commodityId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'commodity_collections_commodityId_fkey' 
        AND conrelid = 'commodity_collections'::regclass
    ) THEN
        ALTER TABLE "commodity_collections" ADD CONSTRAINT "commodity_collections_commodityId_fkey" FOREIGN KEY ("commodityId") REFERENCES "commodities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;
    END IF;
END $$;
-- Add constraint commodity_collections_farmerId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'commodity_collections_farmerId_fkey' 
        AND conrelid = 'commodity_collections'::regclass
    ) THEN
        -- Add constraint commodity_collections_farmerId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'commodity_collections_farmerId_fkey' 
        AND conrelid = 'commodity_collections'::regclass
    ) THEN
        ALTER TABLE "commodity_collections" ADD CONSTRAINT "commodity_collections_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "farmers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;
    END IF;
END $$;
-- Add constraint commodity_collections_mccId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'commodity_collections_mccId_fkey' 
        AND conrelid = 'commodity_collections'::regclass
    ) THEN
        -- Add constraint commodity_collections_mccId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'commodity_collections_mccId_fkey' 
        AND conrelid = 'commodity_collections'::regclass
    ) THEN
        ALTER TABLE "commodity_collections" ADD CONSTRAINT "commodity_collections_mccId_fkey" FOREIGN KEY ("mccId") REFERENCES "mccs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;
    END IF;
END $$;
-- Add constraint commodity_collections_warehouseId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'commodity_collections_warehouseId_fkey' 
        AND conrelid = 'commodity_collections'::regclass
    ) THEN
        -- Add constraint commodity_collections_warehouseId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'commodity_collections_warehouseId_fkey' 
        AND conrelid = 'commodity_collections'::regclass
    ) THEN
        ALTER TABLE "commodity_collections" ADD CONSTRAINT "commodity_collections_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
    END IF;
END $$;
-- Add constraint commodity_collections_locationId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'commodity_collections_locationId_fkey' 
        AND conrelid = 'commodity_collections'::regclass
    ) THEN
        -- Add constraint commodity_collections_locationId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'commodity_collections_locationId_fkey' 
        AND conrelid = 'commodity_collections'::regclass
    ) THEN
        ALTER TABLE "commodity_collections" ADD CONSTRAINT "commodity_collections_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
    END IF;
END $$;
-- Add constraint commodity_collections_productId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'commodity_collections_productId_fkey' 
        AND conrelid = 'commodity_collections'::regclass
    ) THEN
        -- Add constraint commodity_collections_productId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'commodity_collections_productId_fkey' 
        AND conrelid = 'commodity_collections'::regclass
    ) THEN
        ALTER TABLE "commodity_collections" ADD CONSTRAINT "commodity_collections_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
    END IF;
END $$;
-- Add constraint commodity_collections_stockMoveId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'commodity_collections_stockMoveId_fkey' 
        AND conrelid = 'commodity_collections'::regclass
    ) THEN
        -- Add constraint commodity_collections_stockMoveId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'commodity_collections_stockMoveId_fkey' 
        AND conrelid = 'commodity_collections'::regclass
    ) THEN
        ALTER TABLE "commodity_collections" ADD CONSTRAINT "commodity_collections_stockMoveId_fkey" FOREIGN KEY ("stockMoveId") REFERENCES "stock_moves"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
    END IF;
END $$;
-- Add constraint commodity_collections_agentId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'commodity_collections_agentId_fkey' 
        AND conrelid = 'commodity_collections'::regclass
    ) THEN
        -- Add constraint commodity_collections_agentId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'commodity_collections_agentId_fkey' 
        AND conrelid = 'commodity_collections'::regclass
    ) THEN
        ALTER TABLE "commodity_collections" ADD CONSTRAINT "commodity_collections_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
    END IF;
END $$;

-- 11. Create indexes
CREATE INDEX IF NOT EXISTS "commodity_categories_status_idx" ON "commodity_categories"("status");
CREATE INDEX IF NOT EXISTS "commodities_code_idx" ON "commodities"("code");
CREATE INDEX IF NOT EXISTS "commodities_categoryId_idx" ON "commodities"("categoryId");
CREATE INDEX IF NOT EXISTS "commodities_isActive_idx" ON "commodities"("isActive");
CREATE INDEX IF NOT EXISTS "commodity_quality_fields_commodityId_idx" ON "commodity_quality_fields"("commodityId");
CREATE INDEX IF NOT EXISTS "commodity_quality_fields_displayOrder_idx" ON "commodity_quality_fields"("displayOrder");
CREATE INDEX IF NOT EXISTS "commodity_quality_rules_commodityId_idx" ON "commodity_quality_rules"("commodityId");
CREATE INDEX IF NOT EXISTS "commodity_quality_rules_isActive_idx" ON "commodity_quality_rules"("isActive");
CREATE INDEX IF NOT EXISTS "season_plans_farmerId_idx" ON "season_plans"("farmerId");
CREATE INDEX IF NOT EXISTS "season_plans_commodityId_idx" ON "season_plans"("commodityId");
CREATE INDEX IF NOT EXISTS "season_plans_season_idx" ON "season_plans"("season");
CREATE INDEX IF NOT EXISTS "season_plans_status_idx" ON "season_plans"("status");
CREATE INDEX IF NOT EXISTS "input_catalog_commodityId_idx" ON "input_catalog"("commodityId");
CREATE INDEX IF NOT EXISTS "input_catalog_category_idx" ON "input_catalog"("category");
CREATE INDEX IF NOT EXISTS "input_usage_logs_seasonPlanId_idx" ON "input_usage_logs"("seasonPlanId");
CREATE INDEX IF NOT EXISTS "input_usage_logs_farmerId_idx" ON "input_usage_logs"("farmerId");
CREATE INDEX IF NOT EXISTS "input_usage_logs_usageDate_idx" ON "input_usage_logs"("usageDate");
CREATE INDEX IF NOT EXISTS "id_verifications_nationalId_idx" ON "id_verifications"("nationalId");
CREATE INDEX IF NOT EXISTS "id_verifications_verificationStatus_idx" ON "id_verifications"("verificationStatus");
CREATE INDEX IF NOT EXISTS "id_verifications_entityType_entityId_idx" ON "id_verifications"("entityType", "entityId");
CREATE INDEX IF NOT EXISTS "commodity_collections_commodityId_idx" ON "commodity_collections"("commodityId");
CREATE INDEX IF NOT EXISTS "commodity_collections_farmerId_idx" ON "commodity_collections"("farmerId");
CREATE INDEX IF NOT EXISTS "commodity_collections_mccId_idx" ON "commodity_collections"("mccId");
CREATE INDEX IF NOT EXISTS "commodity_collections_collectionDate_idx" ON "commodity_collections"("collectionDate");
CREATE INDEX IF NOT EXISTS "commodity_collections_status_idx" ON "commodity_collections"("status");
CREATE INDEX IF NOT EXISTS "commodity_collections_agentId_idx" ON "commodity_collections"("agentId");


COMMIT;

-- If this migration failed, you can continue with the next one
-- Just comment out the failed migration section above

-- ============================================
-- Migration 12/59: 202501XX000000_add_geo_location_fields
-- ============================================

BEGIN;

-- Migration: Add geo-location fields to entities
-- All fields are nullable for backward compatibility
-- No breaking changes - existing data remains valid

-- 1. Add fields to mccs
ALTER TABLE "mccs" 
ADD COLUMN IF NOT EXISTS "latitude" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "longitude" DOUBLE PRECISION;

-- 2. Add fields to warehouses
ALTER TABLE "warehouses" 
ADD COLUMN IF NOT EXISTS "latitude" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "longitude" DOUBLE PRECISION;

-- 3. Add fields to mcc_customers
ALTER TABLE "mcc_customers" 
ADD COLUMN IF NOT EXISTS "latitude" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "longitude" DOUBLE PRECISION;

-- 4. Add fields to suppliers
ALTER TABLE "suppliers" 
ADD COLUMN IF NOT EXISTS "latitude" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "longitude" DOUBLE PRECISION;

-- 5. Add fields to users (for agents)
ALTER TABLE "users" 
ADD COLUMN IF NOT EXISTS "latitude" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "longitude" DOUBLE PRECISION;

-- 6. Add fields to mcc_warehouses
ALTER TABLE "mcc_warehouses" 
ADD COLUMN IF NOT EXISTS "latitude" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "longitude" DOUBLE PRECISION;

-- 7. Add standardized fields to farmers (in addition to existing gpsLatitude/gpsLongitude)
ALTER TABLE "farmers" 
ADD COLUMN IF NOT EXISTS "latitude" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "longitude" DOUBLE PRECISION;

-- 8. Add standardized fields to milk_collections (in addition to existing geolocation JSON)
ALTER TABLE "milk_collections" 
ADD COLUMN IF NOT EXISTS "latitude" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "longitude" DOUBLE PRECISION;

-- Create composite indexes for location queries (improves performance for geo queries)
CREATE INDEX IF NOT EXISTS "mccs_latitude_longitude_idx" ON "mccs"("latitude", "longitude");
CREATE INDEX IF NOT EXISTS "warehouses_latitude_longitude_idx" ON "warehouses"("latitude", "longitude");
CREATE INDEX IF NOT EXISTS "mcc_customers_latitude_longitude_idx" ON "mcc_customers"("latitude", "longitude");
CREATE INDEX IF NOT EXISTS "suppliers_latitude_longitude_idx" ON "suppliers"("latitude", "longitude");
CREATE INDEX IF NOT EXISTS "users_latitude_longitude_idx" ON "users"("latitude", "longitude");
CREATE INDEX IF NOT EXISTS "mcc_warehouses_latitude_longitude_idx" ON "mcc_warehouses"("latitude", "longitude");
CREATE INDEX IF NOT EXISTS "farmers_latitude_longitude_idx" ON "farmers"("latitude", "longitude");
CREATE INDEX IF NOT EXISTS "milk_collections_latitude_longitude_idx" ON "milk_collections"("latitude", "longitude");


COMMIT;

-- If this migration failed, you can continue with the next one
-- Just comment out the failed migration section above

-- ============================================
-- Migration 13/59: 202501XX000001_add_geo_governance
-- ============================================

BEGIN;

-- Migration: Add geo-location governance, consent, and audit
-- Includes consent flags and audit logging

-- 1. Add consent flags to entities
ALTER TABLE "farmers" ADD COLUMN IF NOT EXISTS "geoConsentFlags" JSONB;
ALTER TABLE "mccs" ADD COLUMN IF NOT EXISTS "geoConsentFlags" JSONB;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "geoConsentFlags" JSONB;
ALTER TABLE "warehouses" ADD COLUMN IF NOT EXISTS "geoConsentFlags" JSONB;
ALTER TABLE "mcc_customers" ADD COLUMN IF NOT EXISTS "geoConsentFlags" JSONB;
ALTER TABLE "suppliers" ADD COLUMN IF NOT EXISTS "geoConsentFlags" JSONB;

-- 2. Create geo audit log table
CREATE TABLE IF NOT EXISTS "geo_audit_logs" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "userName" TEXT,
  "userRole" TEXT,
  "action" TEXT NOT NULL,
  "entityType" TEXT NOT NULL,
  "entityId" TEXT NOT NULL,
  "entityName" TEXT,
  "oldValue" TEXT,
  "newValue" TEXT,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "metadata" TEXT,
  "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "geo_audit_logs_pkey" PRIMARY KEY ("id")
);

-- 3. Create indexes for audit logs
CREATE INDEX IF NOT EXISTS "geo_audit_logs_userId_idx" ON "geo_audit_logs"("userId");
CREATE INDEX IF NOT EXISTS "geo_audit_logs_entityType_entityId_idx" ON "geo_audit_logs"("entityType", "entityId");
CREATE INDEX IF NOT EXISTS "geo_audit_logs_action_idx" ON "geo_audit_logs"("action");
CREATE INDEX IF NOT EXISTS "geo_audit_logs_timestamp_idx" ON "geo_audit_logs"("timestamp");


COMMIT;

-- If this migration failed, you can continue with the next one
-- Just comment out the failed migration section above

-- ============================================
-- Migration 14/59: 20250615144042_add_wallet_system
-- ============================================

BEGIN;

-- Create provinces table first
CREATE TABLE IF NOT EXISTS "provinces" (
    "id" TEXT PRIMARY KEY,
    "name" VARCHAR(100) NOT NULL UNIQUE,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial provinces
INSERT INTO "provinces" ("id", "name")
VALUES
  ('eastern', 'Eastern Province'),
  ('northern', 'Northern Province')
ON CONFLICT ("id") DO NOTHING;

-- CreateEnum
-- Create type UserRole if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'UserRole') THEN
        CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'DCC', 'EMPLOYER', 'CONSUMER');
    END IF;
END $$;

-- CreateEnum
-- Create type ApplicationStatus if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ApplicationStatus') THEN
        CREATE TYPE "ApplicationStatus" AS ENUM ('TEMPORARY', 'SUBMITTED', 'UNDER_REVIEW', 'PENDING_DOCUMENTS', 'APPROVED', 'REJECTED');
    END IF;
END $$;

-- CreateEnum
-- Create type DCCLevel if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'DCCLevel') THEN
        CREATE TYPE "DCCLevel" AS ENUM ('LEVEL_A', 'LEVEL_B', 'LEVEL_C');
    END IF;
END $$;

-- CreateEnum
-- Create type ProductCondition if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ProductCondition') THEN
        CREATE TYPE "ProductCondition" AS ENUM ('NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'POOR', 'REFURBISHED');
    END IF;
END $$;

-- CreateEnum
-- Create type ProductAvailability if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ProductAvailability') THEN
        CREATE TYPE "ProductAvailability" AS ENUM ('IN_STOCK', 'OUT_OF_STOCK', 'LOW_STOCK', 'PREORDER', 'DISCONTINUED', 'COMING_SOON');
    END IF;
END $$;

-- CreateEnum
-- Create type TransactionType if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'TransactionType') THEN
        CREATE TYPE "TransactionType" AS ENUM ('DEPOSIT', 'WITHDRAWAL', 'COMMISSION', 'REFUND', 'FEE');
    END IF;
END $$;

-- CreateEnum
-- Create type TransactionStatus if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'TransactionStatus') THEN
        CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REVERSED');
    END IF;
END $$;

-- CreateEnum
-- Create type WithdrawalStatus if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'WithdrawalStatus') THEN
        CREATE TYPE "WithdrawalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED', 'CANCELLED');
    END IF;
END $$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "avatar" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'CONSUMER',
    "permissions" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "applications" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'SUBMITTED',
    "formData" JSONB NOT NULL,
    "currentStep" INTEGER NOT NULL DEFAULT 1,
    "notes" TEXT,
    "dccCreated" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "application_evaluations" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "evaluatorId" TEXT NOT NULL,
    "questions" JSONB NOT NULL,
    "overallScore" DOUBLE PRECISION NOT NULL,
    "overallComment" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "application_evaluations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "dcc_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "level" "DCCLevel" NOT NULL DEFAULT 'LEVEL_C',
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 5.0,
    "totalSales" TEXT NOT NULL DEFAULT 'RWF 0',
    "monthlySales" TEXT NOT NULL DEFAULT 'RWF 0',
    "productsAvailable" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'active',
    "location" TEXT NOT NULL,
    "specialties" TEXT[],
    "performance" JSONB NOT NULL,
    "recentActivity" JSONB NOT NULL,
    "approvedBy" TEXT,
    "approvedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dcc_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "email_logs" (
    "id" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "template" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "error" TEXT,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "sms_logs" (
    "id" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "error" TEXT,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sms_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "password_resets" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_resets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "jobs" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "salary" TEXT,
    "type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "requirements" JSONB NOT NULL,
    "benefits" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "postedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "employers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "location" TEXT,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "products" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "image" TEXT,
    "category" TEXT NOT NULL,
    "subcategory" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "employerId" TEXT NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "product_reviews" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "title" TEXT,
    "comment" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "helpful" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "order_items" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "courses" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "instructor" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "price" DOUBLE PRECISION,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "dcc_wallets" (
    "id" TEXT NOT NULL,
    "dccProfileId" TEXT NOT NULL,
    "balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "minimumBalance" DOUBLE PRECISION NOT NULL DEFAULT 5000,
    "lastWithdrawal" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dcc_wallets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "wallet_transactions" (
    "id" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "description" TEXT NOT NULL,
    "status" "TransactionStatus" NOT NULL DEFAULT 'COMPLETED',
    "reference" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wallet_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "withdrawal_requests" (
    "id" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" "WithdrawalStatus" NOT NULL DEFAULT 'PENDING',
    "reason" TEXT,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "withdrawal_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "dcc_profiles_userId_key" ON "dcc_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "dcc_profiles_applicationId_key" ON "dcc_profiles"("applicationId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "password_resets_token_key" ON "password_resets"("token");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "sessions_sessionToken_key" ON "sessions"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "employers_email_key" ON "employers"("email");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "dcc_wallets_dccProfileId_key" ON "dcc_wallets"("dccProfileId");

-- AddForeignKey
-- Add constraint applications_userId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'applications_userId_fkey' 
        AND conrelid = 'applications'::regclass
    ) THEN
        ALTER TABLE "applications" ADD CONSTRAINT "applications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
-- Add constraint application_evaluations_applicationId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'application_evaluations_applicationId_fkey' 
        AND conrelid = 'application_evaluations'::regclass
    ) THEN
        ALTER TABLE "application_evaluations" ADD CONSTRAINT "application_evaluations_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
-- Add constraint application_evaluations_evaluatorId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'application_evaluations_evaluatorId_fkey' 
        AND conrelid = 'application_evaluations'::regclass
    ) THEN
        ALTER TABLE "application_evaluations" ADD CONSTRAINT "application_evaluations_evaluatorId_fkey" FOREIGN KEY ("evaluatorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
-- Add constraint dcc_profiles_userId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'dcc_profiles_userId_fkey' 
        AND conrelid = 'dcc_profiles'::regclass
    ) THEN
        ALTER TABLE "dcc_profiles" ADD CONSTRAINT "dcc_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
-- Add constraint dcc_profiles_applicationId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'dcc_profiles_applicationId_fkey' 
        AND conrelid = 'dcc_profiles'::regclass
    ) THEN
        ALTER TABLE "dcc_profiles" ADD CONSTRAINT "dcc_profiles_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "applications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
-- Add constraint products_employerId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'products_employerId_fkey' 
        AND conrelid = 'products'::regclass
    ) THEN
        ALTER TABLE "products" ADD CONSTRAINT "products_employerId_fkey" FOREIGN KEY ("employerId") REFERENCES "employers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
-- Add constraint product_reviews_productId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'product_reviews_productId_fkey' 
        AND conrelid = 'product_reviews'::regclass
    ) THEN
        ALTER TABLE "product_reviews" ADD CONSTRAINT "product_reviews_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
-- Add constraint order_items_productId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'order_items_productId_fkey' 
        AND conrelid = 'order_items'::regclass
    ) THEN
        ALTER TABLE "order_items" ADD CONSTRAINT "order_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
-- Add constraint dcc_wallets_dccProfileId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'dcc_wallets_dccProfileId_fkey' 
        AND conrelid = 'dcc_wallets'::regclass
    ) THEN
        ALTER TABLE "dcc_wallets" ADD CONSTRAINT "dcc_wallets_dccProfileId_fkey" FOREIGN KEY ("dccProfileId") REFERENCES "dcc_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
-- Add constraint wallet_transactions_walletId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'wallet_transactions_walletId_fkey' 
        AND conrelid = 'wallet_transactions'::regclass
    ) THEN
        ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "dcc_wallets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
-- Add constraint withdrawal_requests_walletId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'withdrawal_requests_walletId_fkey' 
        AND conrelid = 'withdrawal_requests'::regclass
    ) THEN
        ALTER TABLE "withdrawal_requests" ADD CONSTRAINT "withdrawal_requests_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "dcc_wallets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;


COMMIT;

-- If this migration failed, you can continue with the next one
-- Just comment out the failed migration section above

-- ============================================
-- Migration 15/59: 20250615152128_add_user_to_withdrawal_requests
-- ============================================

BEGIN;

/*
  Warnings:

  - Added the required column `userId` to the `withdrawal_requests` table without a default value. This is not possible if the table is not empty.

*/
-- First, add the column as nullable
ALTER TABLE "withdrawal_requests" ADD COLUMN IF NOT EXISTS "userId" TEXT;

-- Update existing records with the user ID from the wallet's DCC profile
UPDATE "withdrawal_requests" wr
SET "userId" = dcc_profiles."userId"
FROM "dcc_wallets"
JOIN "dcc_profiles" ON "dcc_wallets"."dccProfileId" = "dcc_profiles"."id"
WHERE wr."walletId" = "dcc_wallets"."id";

-- Now make the column required
ALTER TABLE "withdrawal_requests" ALTER COLUMN "userId" SET NOT NULL;

-- Add foreign key constraint
-- Add constraint withdrawal_requests_userId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'withdrawal_requests_userId_fkey' 
        AND conrelid = 'withdrawal_requests'::regclass
    ) THEN
        ALTER TABLE "withdrawal_requests" ADD CONSTRAINT "withdrawal_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;


COMMIT;

-- If this migration failed, you can continue with the next one
-- Just comment out the failed migration section above

-- ============================================
-- Migration 16/59: 20250615152525_add_withdrawal_request_fields
-- ============================================

BEGIN;

-- AlterTable
ALTER TABLE "withdrawal_requests" ADD COLUMN IF NOT EXISTS "adminComment" TEXT,
ADD COLUMN     "processedAt" TIMESTAMP(3),
ADD COLUMN     "processedById" TEXT;

-- AddForeignKey
-- Add constraint withdrawal_requests_processedById_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'withdrawal_requests_processedById_fkey' 
        AND conrelid = 'withdrawal_requests'::regclass
    ) THEN
        ALTER TABLE "withdrawal_requests" ADD CONSTRAINT "withdrawal_requests_processedById_fkey" FOREIGN KEY ("processedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;


COMMIT;

-- If this migration failed, you can continue with the next one
-- Just comment out the failed migration section above

-- ============================================
-- Migration 17/59: 20250615154705_add_wallet_and_transactions
-- ============================================

BEGIN;

-- CreateTable
CREATE TABLE IF NOT EXISTS "wallets" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "minimumBalance" DOUBLE PRECISION NOT NULL DEFAULT 1000,
    "lastWithdrawal" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wallets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "transactions" (
    "id" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "wallets_userId_key" ON "wallets"("userId");

-- AddForeignKey
-- Add constraint wallets_userId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'wallets_userId_fkey' 
        AND conrelid = 'wallets'::regclass
    ) THEN
        ALTER TABLE "wallets" ADD CONSTRAINT "wallets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
-- Add constraint transactions_walletId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'transactions_walletId_fkey' 
        AND conrelid = 'transactions'::regclass
    ) THEN
        ALTER TABLE "transactions" ADD CONSTRAINT "transactions_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "wallets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;


COMMIT;

-- If this migration failed, you can continue with the next one
-- Just comment out the failed migration section above

-- ============================================
-- Migration 18/59: 20250616001655_update_product_model
-- ============================================

BEGIN;

/*
  Warnings:

  - You are about to drop the column `employerId` on the `products` table. All the data in the column will be lost.
  - Added the required column `sellerId` to the `products` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "products" DROP CONSTRAINT "products_employerId_fkey";

-- AlterTable
ALTER TABLE "products" DROP COLUMN "employerId",
ADD COLUMN     "images" TEXT[],
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "sellerId" TEXT NOT NULL,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'active',
ADD COLUMN     "stock" INTEGER NOT NULL DEFAULT 0;


COMMIT;

-- If this migration failed, you can continue with the next one
-- Just comment out the failed migration section above

-- ============================================
-- Migration 19/59: 20250616033616_add_product_seller_relation
-- ============================================

BEGIN;

/*
  Warnings:

  - A unique constraint covering the columns `[barcode]` on the table `products` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "barcode" TEXT,
ADD COLUMN     "brandId" TEXT,
ADD COLUMN     "certifications" JSONB,
ADD COLUMN     "countryOfOrigin" TEXT,
ADD COLUMN     "isFragile" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "manufacturer" TEXT,
ADD COLUMN     "maxOrderQuantity" INTEGER,
ADD COLUMN     "minOrderQuantity" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "requiresSpecialHandling" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "shippingWeight" DOUBLE PRECISION,
ADD COLUMN     "warrantyInfo" TEXT;

-- CreateTable
CREATE TABLE IF NOT EXISTS "brands" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "logo" TEXT,
    "website" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "brands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "product_variants" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "color" TEXT,
    "size" TEXT,
    "model" TEXT,
    "weight" DOUBLE PRECISION,
    "dimensions" JSONB,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "price" DOUBLE PRECISION NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_variants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "product_specifications" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_specifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "brands_name_key" ON "brands"("name");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "product_variants_sku_key" ON "product_variants"("sku");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "products_barcode_key" ON "products"("barcode");

-- AddForeignKey
-- Add constraint product_variants_productId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'product_variants_productId_fkey' 
        AND conrelid = 'product_variants'::regclass
    ) THEN
        ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
-- Add constraint product_specifications_productId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'product_specifications_productId_fkey' 
        AND conrelid = 'product_specifications'::regclass
    ) THEN
        ALTER TABLE "product_specifications" ADD CONSTRAINT "product_specifications_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
-- Add constraint products_brandId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'products_brandId_fkey' 
        AND conrelid = 'products'::regclass
    ) THEN
        ALTER TABLE "products" ADD CONSTRAINT "products_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "brands"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
-- Add constraint products_sellerId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'products_sellerId_fkey' 
        AND conrelid = 'products'::regclass
    ) THEN
        ALTER TABLE "products" ADD CONSTRAINT "products_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;


COMMIT;

-- If this migration failed, you can continue with the next one
-- Just comment out the failed migration section above

-- ============================================
-- Migration 20/59: 20250616213401_add_product_flags
-- ============================================

BEGIN;

-- AlterTable
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "commission" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "isNew" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isPopular" BOOLEAN NOT NULL DEFAULT false;


COMMIT;

-- If this migration failed, you can continue with the next one
-- Just comment out the failed migration section above

-- ============================================
-- Migration 21/59: 20250617032712_add_stock_orders
-- ============================================

BEGIN;

/*
  Warnings:

  - You are about to drop the column `isNew` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `isPopular` on the `products` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "products" DROP COLUMN "isNew",
DROP COLUMN "isPopular";

-- CreateTable
CREATE TABLE IF NOT EXISTS "StockOrder" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "requestedById" TEXT NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StockOrder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "StockOrder_productId_idx" ON "StockOrder"("productId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "StockOrder_requestedById_idx" ON "StockOrder"("requestedById");

-- AddForeignKey
-- Add constraint StockOrder_productId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'StockOrder_productId_fkey' 
        AND conrelid = 'StockOrder'::regclass
    ) THEN
        ALTER TABLE "StockOrder" ADD CONSTRAINT "StockOrder_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
-- Add constraint StockOrder_requestedById_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'StockOrder_requestedById_fkey' 
        AND conrelid = 'StockOrder'::regclass
    ) THEN
        ALTER TABLE "StockOrder" ADD CONSTRAINT "StockOrder_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;


COMMIT;

-- If this migration failed, you can continue with the next one
-- Just comment out the failed migration section above

-- ============================================
-- Migration 22/59: 20250617035640_add_business_fields
-- ============================================

BEGIN;

-- AlterTable
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "businessAddress" TEXT,
ADD COLUMN     "businessName" TEXT,
ADD COLUMN     "businessRegistrationNumber" TEXT,
ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false;


COMMIT;

-- If this migration failed, you can continue with the next one
-- Just comment out the failed migration section above

-- ============================================
-- Migration 23/59: 20250617050433_add_original_price_to_product
-- ============================================

BEGIN;

/*
  Warnings:

  - You are about to drop the column `businessAddress` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `businessName` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `businessRegistrationNumber` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `isVerified` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `StockOrder` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "StockOrder" DROP CONSTRAINT "StockOrder_productId_fkey";

-- DropForeignKey
ALTER TABLE "StockOrder" DROP CONSTRAINT "StockOrder_requestedById_fkey";

-- AlterTable
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "originalPrice" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "businessAddress",
DROP COLUMN "businessName",
DROP COLUMN "businessRegistrationNumber",
DROP COLUMN "isVerified";

-- DropTable
DROP TABLE "StockOrder";


COMMIT;

-- If this migration failed, you can continue with the next one
-- Just comment out the failed migration section above

-- ============================================
-- Migration 24/59: 20250617050818_add_stock_order_model
-- ============================================

BEGIN;

-- CreateTable
CREATE TABLE IF NOT EXISTS "stock_orders" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "comment" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "requestedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stock_orders_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
-- Add constraint stock_orders_productId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'stock_orders_productId_fkey' 
        AND conrelid = 'stock_orders'::regclass
    ) THEN
        ALTER TABLE "stock_orders" ADD CONSTRAINT "stock_orders_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
-- Add constraint stock_orders_requestedById_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'stock_orders_requestedById_fkey' 
        AND conrelid = 'stock_orders'::regclass
    ) THEN
        ALTER TABLE "stock_orders" ADD CONSTRAINT "stock_orders_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;


COMMIT;

-- If this migration failed, you can continue with the next one
-- Just comment out the failed migration section above

-- ============================================
-- Migration 25/59: 20250617224003_add_stock_order_tracking_fields
-- ============================================

BEGIN;

-- AlterTable
ALTER TABLE "stock_orders" ADD COLUMN IF NOT EXISTS "approvedAt" TIMESTAMP(3),
ADD COLUMN     "approvedById" TEXT,
ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "completedById" TEXT,
ADD COLUMN     "note" TEXT,
ADD COLUMN     "paymentConfirmedAt" TIMESTAMP(3),
ADD COLUMN     "paymentConfirmedById" TEXT,
ADD COLUMN     "rejectedAt" TIMESTAMP(3),
ADD COLUMN     "rejectedById" TEXT;

-- AddForeignKey
-- Add constraint stock_orders_approvedById_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'stock_orders_approvedById_fkey' 
        AND conrelid = 'stock_orders'::regclass
    ) THEN
        ALTER TABLE "stock_orders" ADD CONSTRAINT "stock_orders_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
-- Add constraint stock_orders_rejectedById_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'stock_orders_rejectedById_fkey' 
        AND conrelid = 'stock_orders'::regclass
    ) THEN
        ALTER TABLE "stock_orders" ADD CONSTRAINT "stock_orders_rejectedById_fkey" FOREIGN KEY ("rejectedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
-- Add constraint stock_orders_paymentConfirmedById_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'stock_orders_paymentConfirmedById_fkey' 
        AND conrelid = 'stock_orders'::regclass
    ) THEN
        ALTER TABLE "stock_orders" ADD CONSTRAINT "stock_orders_paymentConfirmedById_fkey" FOREIGN KEY ("paymentConfirmedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
-- Add constraint stock_orders_completedById_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'stock_orders_completedById_fkey' 
        AND conrelid = 'stock_orders'::regclass
    ) THEN
        ALTER TABLE "stock_orders" ADD CONSTRAINT "stock_orders_completedById_fkey" FOREIGN KEY ("completedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;


COMMIT;

-- If this migration failed, you can continue with the next one
-- Just comment out the failed migration section above

-- ============================================
-- Migration 26/59: 20250617224720_simplify_stock_order_actions
-- ============================================

BEGIN;

/*
  Warnings:

  - You are about to drop the column `completedAt` on the `stock_orders` table. All the data in the column will be lost.
  - You are about to drop the column `completedById` on the `stock_orders` table. All the data in the column will be lost.
  - You are about to drop the column `rejectedAt` on the `stock_orders` table. All the data in the column will be lost.
  - You are about to drop the column `rejectedById` on the `stock_orders` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "stock_orders" DROP CONSTRAINT "stock_orders_completedById_fkey";

-- DropForeignKey
ALTER TABLE "stock_orders" DROP CONSTRAINT "stock_orders_rejectedById_fkey";

-- AlterTable
ALTER TABLE "stock_orders" DROP COLUMN "completedAt",
DROP COLUMN "completedById",
DROP COLUMN "rejectedAt",
DROP COLUMN "rejectedById";


COMMIT;

-- If this migration failed, you can continue with the next one
-- Just comment out the failed migration section above

-- ============================================
-- Migration 27/59: 20250617231350_seller
-- ============================================

BEGIN;

-- AlterTable
ALTER TABLE "stock_orders" ADD COLUMN IF NOT EXISTS "completedAt" TIMESTAMP(3),
ADD COLUMN     "completedById" TEXT,
ADD COLUMN     "rejectedAt" TIMESTAMP(3),
ADD COLUMN     "rejectedById" TEXT;

-- AddForeignKey
-- Add constraint stock_orders_rejectedById_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'stock_orders_rejectedById_fkey' 
        AND conrelid = 'stock_orders'::regclass
    ) THEN
        ALTER TABLE "stock_orders" ADD CONSTRAINT "stock_orders_rejectedById_fkey" FOREIGN KEY ("rejectedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
-- Add constraint stock_orders_completedById_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'stock_orders_completedById_fkey' 
        AND conrelid = 'stock_orders'::regclass
    ) THEN
        ALTER TABLE "stock_orders" ADD CONSTRAINT "stock_orders_completedById_fkey" FOREIGN KEY ("completedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;


COMMIT;

-- If this migration failed, you can continue with the next one
-- Just comment out the failed migration section above

-- ============================================
-- Migration 28/59: 20250618013218_add_dcc_stock
-- ============================================

BEGIN;

/*
  Warnings:

  - You are about to drop the column `orderId` on the `order_items` table. All the data in the column will be lost.
  - You are about to drop the column `barcode` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `originalPrice` on the `products` table. All the data in the column will be lost.
  - The `certifications` column on the `products` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- DropIndex
DROP INDEX "products_barcode_key";

-- AlterTable
ALTER TABLE "order_items" DROP COLUMN "orderId";

-- AlterTable
ALTER TABLE "products" DROP COLUMN "barcode",
DROP COLUMN "originalPrice",
DROP COLUMN "certifications",
ADD COLUMN     "certifications" TEXT[],
ALTER COLUMN "minOrderQuantity" DROP NOT NULL,
ALTER COLUMN "minOrderQuantity" DROP DEFAULT;

-- CreateTable
CREATE TABLE IF NOT EXISTS "dcc_stocks" (
    "id" TEXT NOT NULL,
    "dccId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dcc_stocks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "dcc_stocks_dccId_productId_key" ON "dcc_stocks"("dccId", "productId");

-- AddForeignKey
-- Add constraint dcc_stocks_dccId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'dcc_stocks_dccId_fkey' 
        AND conrelid = 'dcc_stocks'::regclass
    ) THEN
        ALTER TABLE "dcc_stocks" ADD CONSTRAINT "dcc_stocks_dccId_fkey" FOREIGN KEY ("dccId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
-- Add constraint dcc_stocks_productId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'dcc_stocks_productId_fkey' 
        AND conrelid = 'dcc_stocks'::regclass
    ) THEN
        ALTER TABLE "dcc_stocks" ADD CONSTRAINT "dcc_stocks_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;


COMMIT;

-- If this migration failed, you can continue with the next one
-- Just comment out the failed migration section above

-- ============================================
-- Migration 29/59: 20250620092153_add_form_config
-- ============================================

BEGIN;

/*
  Warnings:

  - You are about to drop the column `overallComment` on the `application_evaluations` table. All the data in the column will be lost.
  - You are about to drop the column `overallScore` on the `application_evaluations` table. All the data in the column will be lost.
  - You are about to drop the column `questions` on the `application_evaluations` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `application_evaluations` table. All the data in the column will be lost.
  - You are about to drop the `stock_orders` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `feedback` to the `application_evaluations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `score` to the `application_evaluations` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "application_evaluations" DROP CONSTRAINT "application_evaluations_applicationId_fkey";

-- DropForeignKey
ALTER TABLE "stock_orders" DROP CONSTRAINT "stock_orders_approvedById_fkey";

-- DropForeignKey
ALTER TABLE "stock_orders" DROP CONSTRAINT "stock_orders_completedById_fkey";

-- DropForeignKey
ALTER TABLE "stock_orders" DROP CONSTRAINT "stock_orders_paymentConfirmedById_fkey";

-- DropForeignKey
ALTER TABLE "stock_orders" DROP CONSTRAINT "stock_orders_productId_fkey";

-- DropForeignKey
ALTER TABLE "stock_orders" DROP CONSTRAINT "stock_orders_rejectedById_fkey";

-- DropForeignKey
ALTER TABLE "stock_orders" DROP CONSTRAINT "stock_orders_requestedById_fkey";

-- AlterTable
ALTER TABLE "application_evaluations" DROP COLUMN "overallComment",
DROP COLUMN "overallScore",
DROP COLUMN "questions",
DROP COLUMN "status",
ADD COLUMN     "feedback" TEXT NOT NULL,
ADD COLUMN     "improvements" TEXT[],
ADD COLUMN     "questionScores" JSONB,
ADD COLUMN     "score" INTEGER NOT NULL,
ADD COLUMN     "strengths" TEXT[],
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'MANUAL';

-- DropTable
DROP TABLE "stock_orders";

-- CreateTable
CREATE TABLE IF NOT EXISTS "StockOrder" (
    "id" TEXT NOT NULL,
    "dccId" TEXT NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "requestDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estimatedDelivery" TIMESTAMP(3),
    "notes" TEXT,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "rejectedBy" TEXT,
    "rejectedAt" TIMESTAMP(3),
    "paymentConfirmedBy" TEXT,
    "paymentConfirmedAt" TIMESTAMP(3),
    "completedBy" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StockOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "StockOrderProduct" (
    "id" TEXT NOT NULL,
    "stockOrderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "currentStock" INTEGER NOT NULL,
    "requestedStock" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StockOrderProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Payment" (
    "id" TEXT NOT NULL,
    "stockOrderId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "method" TEXT,
    "reference" TEXT,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "form_configs" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "sections" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "form_configs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "StockOrder_dccId_idx" ON "StockOrder"("dccId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "StockOrder_status_idx" ON "StockOrder"("status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "StockOrder_priority_idx" ON "StockOrder"("priority");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "StockOrderProduct_stockOrderId_idx" ON "StockOrderProduct"("stockOrderId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "StockOrderProduct_productId_idx" ON "StockOrderProduct"("productId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Payment_stockOrderId_key" ON "Payment"("stockOrderId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Payment_status_idx" ON "Payment"("status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "application_evaluations_applicationId_idx" ON "application_evaluations"("applicationId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "application_evaluations_evaluatorId_idx" ON "application_evaluations"("evaluatorId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "applications_userId_idx" ON "applications"("userId");

-- AddForeignKey
-- Add constraint application_evaluations_applicationId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'application_evaluations_applicationId_fkey' 
        AND conrelid = 'application_evaluations'::regclass
    ) THEN
        ALTER TABLE "application_evaluations" ADD CONSTRAINT "application_evaluations_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "applications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
-- Add constraint StockOrder_approvedBy_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'StockOrder_approvedBy_fkey' 
        AND conrelid = 'StockOrder'::regclass
    ) THEN
        ALTER TABLE "StockOrder" ADD CONSTRAINT "StockOrder_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
-- Add constraint StockOrder_completedBy_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'StockOrder_completedBy_fkey' 
        AND conrelid = 'StockOrder'::regclass
    ) THEN
        ALTER TABLE "StockOrder" ADD CONSTRAINT "StockOrder_completedBy_fkey" FOREIGN KEY ("completedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
-- Add constraint StockOrder_dccId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'StockOrder_dccId_fkey' 
        AND conrelid = 'StockOrder'::regclass
    ) THEN
        ALTER TABLE "StockOrder" ADD CONSTRAINT "StockOrder_dccId_fkey" FOREIGN KEY ("dccId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
-- Add constraint StockOrder_paymentConfirmedBy_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'StockOrder_paymentConfirmedBy_fkey' 
        AND conrelid = 'StockOrder'::regclass
    ) THEN
        ALTER TABLE "StockOrder" ADD CONSTRAINT "StockOrder_paymentConfirmedBy_fkey" FOREIGN KEY ("paymentConfirmedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
-- Add constraint StockOrder_rejectedBy_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'StockOrder_rejectedBy_fkey' 
        AND conrelid = 'StockOrder'::regclass
    ) THEN
        ALTER TABLE "StockOrder" ADD CONSTRAINT "StockOrder_rejectedBy_fkey" FOREIGN KEY ("rejectedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
-- Add constraint StockOrderProduct_productId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'StockOrderProduct_productId_fkey' 
        AND conrelid = 'StockOrderProduct'::regclass
    ) THEN
        ALTER TABLE "StockOrderProduct" ADD CONSTRAINT "StockOrderProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
-- Add constraint StockOrderProduct_stockOrderId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'StockOrderProduct_stockOrderId_fkey' 
        AND conrelid = 'StockOrderProduct'::regclass
    ) THEN
        ALTER TABLE "StockOrderProduct" ADD CONSTRAINT "StockOrderProduct_stockOrderId_fkey" FOREIGN KEY ("stockOrderId") REFERENCES "StockOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
-- Add constraint Payment_stockOrderId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'Payment_stockOrderId_fkey' 
        AND conrelid = 'Payment'::regclass
    ) THEN
        ALTER TABLE "Payment" ADD CONSTRAINT "Payment_stockOrderId_fkey" FOREIGN KEY ("stockOrderId") REFERENCES "StockOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;


COMMIT;

-- If this migration failed, you can continue with the next one
-- Just comment out the failed migration section above

-- ============================================
-- Migration 30/59: 20250622133600_make_email_optional
-- ============================================

BEGIN;

-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'AGENT';

-- AlterTable
ALTER TABLE "applications" ALTER COLUMN "email" DROP NOT NULL;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "email" DROP NOT NULL;


COMMIT;

-- If this migration failed, you can continue with the next one
-- Just comment out the failed migration section above

-- ============================================
-- Migration 31/59: 20250622133601_add_employer_evaluate_permission
-- ============================================

BEGIN;

-- Add applications.evaluate permission to all EMPLOYER users
UPDATE users 
SET permissions = array_append(permissions, 'applications.evaluate')
WHERE role = 'EMPLOYER' 
AND NOT 'applications.evaluate' = ANY(permissions);

-- Add applications.view permission if not already present
UPDATE users 
SET permissions = array_append(permissions, 'applications.view')
WHERE role = 'EMPLOYER' 
AND NOT 'applications.view' = ANY(permissions); 

COMMIT;

-- If this migration failed, you can continue with the next one
-- Just comment out the failed migration section above

-- ============================================
-- Migration 32/59: 20250623002624_add_vulnerability_assessment
-- ============================================

BEGIN;

/*
  Warnings:

  - You are about to drop the `application_evaluations` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `email` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "application_evaluations" DROP CONSTRAINT "application_evaluations_applicationId_fkey";

-- DropForeignKey
ALTER TABLE "application_evaluations" DROP CONSTRAINT "application_evaluations_evaluatorId_fkey";

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "email" SET NOT NULL;

-- DropTable
DROP TABLE "application_evaluations";

-- CreateTable
CREATE TABLE IF NOT EXISTS "ApplicationEvaluation" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "evaluatorId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "questionScores" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApplicationEvaluation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ApplicationEvaluation_applicationId_idx" ON "ApplicationEvaluation"("applicationId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ApplicationEvaluation_evaluatorId_idx" ON "ApplicationEvaluation"("evaluatorId");

-- AddForeignKey
-- Add constraint ApplicationEvaluation_applicationId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'ApplicationEvaluation_applicationId_fkey' 
        AND conrelid = 'ApplicationEvaluation'::regclass
    ) THEN
        ALTER TABLE "ApplicationEvaluation" ADD CONSTRAINT "ApplicationEvaluation_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "applications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
-- Add constraint ApplicationEvaluation_evaluatorId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'ApplicationEvaluation_evaluatorId_fkey' 
        AND conrelid = 'ApplicationEvaluation'::regclass
    ) THEN
        ALTER TABLE "ApplicationEvaluation" ADD CONSTRAINT "ApplicationEvaluation_evaluatorId_fkey" FOREIGN KEY ("evaluatorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;


COMMIT;

-- If this migration failed, you can continue with the next one
-- Just comment out the failed migration section above

-- ============================================
-- Migration 33/59: 20250623002625_make_email_optional
-- ============================================

BEGIN;

-- Make email optional in users table
ALTER TABLE "users" ALTER COLUMN "email" DROP NOT NULL;

-- Make email optional in applications table
ALTER TABLE "applications" ALTER COLUMN "email" DROP NOT NULL; 

COMMIT;

-- If this migration failed, you can continue with the next one
-- Just comment out the failed migration section above

-- ============================================
-- Migration 34/59: 20250623003724_update_evaluation_model
-- ============================================

BEGIN;

/*
  Warnings:

  - You are about to drop the column `evaluatorId` on the `ApplicationEvaluation` table. All the data in the column will be lost.
  - You are about to drop the column `metadata` on the `ApplicationEvaluation` table. All the data in the column will be lost.
  - You are about to drop the column `questionScores` on the `ApplicationEvaluation` table. All the data in the column will be lost.
  - You are about to drop the column `score` on the `ApplicationEvaluation` table. All the data in the column will be lost.
  - Added the required column `evaluatedBy` to the `ApplicationEvaluation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `maxScore` to the `ApplicationEvaluation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `overallLevel` to the `ApplicationEvaluation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recommendations` to the `ApplicationEvaluation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `scores` to the `ApplicationEvaluation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalScore` to the `ApplicationEvaluation` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ApplicationEvaluation" DROP CONSTRAINT "ApplicationEvaluation_evaluatorId_fkey";

-- DropIndex
DROP INDEX "ApplicationEvaluation_evaluatorId_idx";

-- AlterTable
ALTER TABLE "ApplicationEvaluation" DROP COLUMN "evaluatorId",
DROP COLUMN "metadata",
DROP COLUMN "questionScores",
DROP COLUMN "score",
ADD COLUMN     "evaluatedBy" TEXT NOT NULL,
ADD COLUMN     "maxScore" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "overallLevel" TEXT NOT NULL,
ADD COLUMN     "recommendations" JSONB NOT NULL,
ADD COLUMN     "scores" JSONB NOT NULL,
ADD COLUMN     "totalScore" DOUBLE PRECISION NOT NULL,
ALTER COLUMN "type" SET DEFAULT 'VULNERABILITY';

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ApplicationEvaluation_evaluatedBy_idx" ON "ApplicationEvaluation"("evaluatedBy");

-- AddForeignKey
-- Add constraint ApplicationEvaluation_evaluatedBy_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'ApplicationEvaluation_evaluatedBy_fkey' 
        AND conrelid = 'ApplicationEvaluation'::regclass
    ) THEN
        ALTER TABLE "ApplicationEvaluation" ADD CONSTRAINT "ApplicationEvaluation_evaluatedBy_fkey" FOREIGN KEY ("evaluatedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;


COMMIT;

-- If this migration failed, you can continue with the next one
-- Just comment out the failed migration section above

-- ============================================
-- Migration 35/59: 20250623010351_update_application_evaluation_schema
-- ============================================

BEGIN;

/*
  Warnings:

  - You are about to drop the column `evaluatedBy` on the `ApplicationEvaluation` table. All the data in the column will be lost.
  - You are about to drop the column `maxScore` on the `ApplicationEvaluation` table. All the data in the column will be lost.
  - Added the required column `evaluatorId` to the `ApplicationEvaluation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `score` to the `ApplicationEvaluation` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ApplicationEvaluation" DROP CONSTRAINT "ApplicationEvaluation_evaluatedBy_fkey";

-- DropIndex
DROP INDEX "ApplicationEvaluation_evaluatedBy_idx";

-- AlterTable
ALTER TABLE "ApplicationEvaluation" DROP COLUMN "evaluatedBy",
DROP COLUMN "maxScore",
ADD COLUMN     "evaluatorId" TEXT NOT NULL,
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "questionScores" JSONB,
ADD COLUMN     "score" DOUBLE PRECISION NOT NULL,
ALTER COLUMN "overallLevel" DROP NOT NULL,
ALTER COLUMN "recommendations" DROP NOT NULL,
ALTER COLUMN "scores" DROP NOT NULL;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ApplicationEvaluation_evaluatorId_idx" ON "ApplicationEvaluation"("evaluatorId");

-- AddForeignKey
-- Add constraint ApplicationEvaluation_evaluatorId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'ApplicationEvaluation_evaluatorId_fkey' 
        AND conrelid = 'ApplicationEvaluation'::regclass
    ) THEN
        ALTER TABLE "ApplicationEvaluation" ADD CONSTRAINT "ApplicationEvaluation_evaluatorId_fkey" FOREIGN KEY ("evaluatorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;


COMMIT;

-- If this migration failed, you can continue with the next one
-- Just comment out the failed migration section above

-- ============================================
-- Migration 36/59: 20250623010352_update_employer_permissions
-- ============================================

BEGIN;

-- Update permissions for all EMPLOYER users
UPDATE users
SET permissions = ARRAY[
  'applications.view',
  'applications.evaluate',
  'applications.manage',
  'applications.review',
  'products.view',
  'products.create',
  'products.edit',
  'products.delete',
  'products.manage',
  'orders.view',
  'orders.create',
  'orders.manage',
  'learning.view',
  'learning.enroll',
  'jobs.view',
  'jobs.post',
  'jobs.manage',
  'finance.view',
  'finance.request',
  'dashboard.view'
]
WHERE role = 'EMPLOYER';

-- Create a trigger to automatically set these permissions for new EMPLOYER users
CREATE OR REPLACE FUNCTION set_employer_permissions()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role = 'EMPLOYER' THEN
    NEW.permissions = ARRAY[
      'applications.view',
      'applications.evaluate',
      'applications.manage',
      'applications.review',
      'products.view',
      'products.create',
      'products.edit',
      'products.delete',
      'products.manage',
      'orders.view',
      'orders.create',
      'orders.manage',
      'learning.view',
      'learning.enroll',
      'jobs.view',
      'jobs.post',
      'jobs.manage',
      'finance.view',
      'finance.request',
      'dashboard.view'
    ];
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_employer_permissions_trigger ON users;
CREATE TRIGGER set_employer_permissions_trigger
  BEFORE INSERT OR UPDATE OF role ON users
  FOR EACH ROW
  EXECUTE FUNCTION set_employer_permissions(); 

COMMIT;

-- If this migration failed, you can continue with the next one
-- Just comment out the failed migration section above

-- ============================================
-- Migration 37/59: 20250623010353_update_employer_stock_permissions
-- ============================================

BEGIN;

-- Update permissions for all EMPLOYER users to include stock management
UPDATE users
SET permissions = ARRAY_CAT(
  ARRAY_REMOVE(
    ARRAY_REMOVE(
      ARRAY_REMOVE(
        ARRAY_REMOVE(
          ARRAY_REMOVE(
            ARRAY_REMOVE(
              ARRAY_REMOVE(permissions, 'orders.view'),
              'orders.manage'
            ),
            'products.view'
          ),
          'products.create'
        ),
        'products.edit'
      ),
      'products.delete'
    ),
    'products.manage'
  ),
  ARRAY[
    'orders.view',
    'orders.manage',
    'products.view',
    'products.create',
    'products.edit',
    'products.delete',
    'products.manage',
    'stock.view',
    'stock.manage'
  ]
)
WHERE role = 'EMPLOYER';

-- Update the trigger function to include these permissions for new EMPLOYER users
CREATE OR REPLACE FUNCTION set_employer_permissions()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role = 'EMPLOYER' THEN
    NEW.permissions = ARRAY_CAT(
      COALESCE(NEW.permissions, ARRAY[]::text[]),
      ARRAY[
        'orders.view',
        'orders.manage',
        'products.view',
        'products.create',
        'products.edit',
        'products.delete',
        'products.manage',
        'stock.view',
        'stock.manage'
      ]
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS set_employer_permissions_trigger ON users;

-- Create new trigger
CREATE TRIGGER set_employer_permissions_trigger
  BEFORE INSERT OR UPDATE OF role ON users
  FOR EACH ROW
  EXECUTE FUNCTION set_employer_permissions(); 

COMMIT;

-- If this migration failed, you can continue with the next one
-- Just comment out the failed migration section above

-- ============================================
-- Migration 38/59: 20250623123609_add_default_user_id
-- ============================================

BEGIN;

-- AlterTable
ALTER TABLE "applications" ALTER COLUMN "userId" SET DEFAULT 'cmc8k8j4u001ddd7tte79mz3d';


COMMIT;

-- If this migration failed, you can continue with the next one
-- Just comment out the failed migration section above

-- ============================================
-- Migration 39/59: 20250623123610_add_national_id_unique_constraint
-- ============================================

BEGIN;

-- Create provinces table if it doesn't exist
CREATE TABLE IF NOT EXISTS provinces (
    id TEXT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert provinces if they don't exist
INSERT INTO provinces (id, name)
VALUES
  ('eastern', 'Eastern Province'),
  ('northern', 'Northern Province')
ON CONFLICT (id) DO NOTHING;

-- Create a unique index on the National ID field in formData
CREATE UNIQUE INDEX IF NOT EXISTS "applications_national_id_unique" ON "applications" ((("formData"->>'q5')));

-- Add a unique constraint using the index
-- Add constraint applications_national_id_unique if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'applications_national_id_unique' 
        AND conrelid = 'applications'::regclass
    ) THEN
        ALTER TABLE "applications" ADD CONSTRAINT "applications_national_id_unique" UNIQUE USING INDEX "applications_national_id_unique";
    END IF;
END $$;

-- Add the nationalId column
ALTER TABLE "applications" ADD COLUMN IF NOT EXISTS "nationalId" TEXT;

-- Update existing records by extracting nationalId from formData
UPDATE "applications"
SET "nationalId" = ("formData"->>'q5')::TEXT
WHERE "formData"->>'q5' IS NOT NULL;

-- Add unique constraint
-- Add constraint applications_nationalId_key if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'applications_nationalId_key' 
        AND conrelid = 'applications'::regclass
    ) THEN
        ALTER TABLE "applications" ADD CONSTRAINT "applications_nationalId_key" UNIQUE ("nationalId");
    END IF;
END $$; 

COMMIT;

-- If this migration failed, you can continue with the next one
-- Just comment out the failed migration section above

-- ============================================
-- Migration 40/59: 20250626095434_add_national_id_field
-- ============================================

BEGIN;

/*
  Warnings:

  - You are about to drop the `provinces` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[nationalId]` on the table `applications` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "applications" ADD COLUMN IF NOT EXISTS "nationalId" TEXT;

-- DropTable
DROP TABLE "provinces";

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "applications_nationalId_key" ON "applications"("nationalId");


COMMIT;

-- If this migration failed, you can continue with the next one
-- Just comment out the failed migration section above

-- ============================================
-- Migration 41/59: 20250626161955_update_application_user_relation
-- ============================================

BEGIN;

/*
  Warnings:

  - Made the column `email` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "users" ALTER COLUMN "email" SET NOT NULL;


COMMIT;

-- If this migration failed, you can continue with the next one
-- Just comment out the failed migration section above

-- ============================================
-- Migration 42/59: 20250626162159_update_application_default_user
-- ============================================

BEGIN;

-- AlterTable
ALTER TABLE "applications" ALTER COLUMN "userId" SET DEFAULT 'AI_SYSTEM';


COMMIT;

-- If this migration failed, you can continue with the next one
-- Just comment out the failed migration section above

-- ============================================
-- Migration 43/59: 20250626162160_update_application_user_nullable
-- ============================================

BEGIN;

-- DropForeignKey
ALTER TABLE "applications" DROP CONSTRAINT IF EXISTS "applications_userId_fkey";

-- AddForeignKey with SET NULL
-- Add constraint applications_userId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'applications_userId_fkey' 
        AND conrelid = 'applications'::regclass
    ) THEN
        ALTER TABLE "applications" ADD CONSTRAINT "applications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$; 

COMMIT;

-- If this migration failed, you can continue with the next one
-- Just comment out the failed migration section above

-- ============================================
-- Migration 44/59: 20250626162161_update_application_user_id
-- ============================================

BEGIN;

-- AlterTable
ALTER TABLE "applications" ALTER COLUMN "userId" SET DEFAULT 'cmcdl82ko0000jkigr7q2i049'; 

COMMIT;

-- If this migration failed, you can continue with the next one
-- Just comment out the failed migration section above

-- ============================================
-- Migration 45/59: 20250630190325_remove_default_user_id
-- ============================================

BEGIN;

-- AlterTable
ALTER TABLE "applications" ALTER COLUMN "userId" DROP DEFAULT;


COMMIT;

-- If this migration failed, you can continue with the next one
-- Just comment out the failed migration section above

-- ============================================
-- Migration 46/59: 20250630190326_add_dcc_model
-- ============================================

BEGIN;

-- CreateTable
CREATE TABLE IF NOT EXISTS "dccs" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dccs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "dccs_email_key" ON "dccs"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "dccs_phone_key" ON "dccs"("phone"); 

COMMIT;

-- If this migration failed, you can continue with the next one
-- Just comment out the failed migration section above

-- ============================================
-- Migration 47/59: 20250707020445_add_role_based_permissions
-- ============================================

BEGIN;

/*
  Warnings:

  - A unique constraint covering the columns `[barcode]` on the table `products` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[internalReference]` on the table `products` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
-- Create type ProductType if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ProductType') THEN
        CREATE TYPE "ProductType" AS ENUM ('STOCKABLE', 'CONSUMABLE', 'SERVICE');
    END IF;
END $$;

-- CreateEnum
-- Create type ProductTracking if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ProductTracking') THEN
        CREATE TYPE "ProductTracking" AS ENUM ('NONE', 'LOT', 'SERIAL', 'LOT_AND_SERIAL');
    END IF;
END $$;

-- CreateEnum
-- Create type LocationType if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'LocationType') THEN
        CREATE TYPE "LocationType" AS ENUM ('STORAGE', 'PICKING', 'RECEIVING', 'SHIPPING', 'PRODUCTION', 'SCRAP', 'TRANSIT');
    END IF;
END $$;

-- CreateEnum
-- Create type StockMoveType if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'StockMoveType') THEN
        CREATE TYPE "StockMoveType" AS ENUM ('INCOMING', 'OUTGOING', 'INTERNAL', 'RETURN', 'ADJUSTMENT', 'PRODUCTION', 'SCRAP');
    END IF;
END $$;

-- CreateEnum
-- Create type StockMoveState if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'StockMoveState') THEN
        CREATE TYPE "StockMoveState" AS ENUM ('DRAFT', 'CONFIRMED', 'ASSIGNED', 'DONE', 'CANCELLED');
    END IF;
END $$;

-- CreateEnum
-- Create type InventoryAdjustmentType if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'InventoryAdjustmentType') THEN
        CREATE TYPE "InventoryAdjustmentType" AS ENUM ('INCREASE', 'DECREASE', 'SET');
    END IF;
END $$;

-- CreateEnum
-- Create type InventoryAdjustmentState if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'InventoryAdjustmentState') THEN
        CREATE TYPE "InventoryAdjustmentState" AS ENUM ('DRAFT', 'APPROVED', 'DONE', 'CANCELLED');
    END IF;
END $$;

-- CreateEnum
-- Create type SerialNumberStatus if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'SerialNumberStatus') THEN
        CREATE TYPE "SerialNumberStatus" AS ENUM ('AVAILABLE', 'RESERVED', 'SOLD', 'SCRAPPED', 'LOST');
    END IF;
END $$;

-- CreateEnum
-- Create type CycleCountState if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'CycleCountState') THEN
        CREATE TYPE "CycleCountState" AS ENUM ('DRAFT', 'IN_PROGRESS', 'DONE', 'CANCELLED');
    END IF;
END $$;

-- CreateEnum
-- Create type ValuationMethod if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ValuationMethod') THEN
        CREATE TYPE "ValuationMethod" AS ENUM ('FIFO', 'LIFO', 'AVCO');
    END IF;
END $$;

-- CreateEnum
-- Create type ProductRoute if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ProductRoute') THEN
        CREATE TYPE "ProductRoute" AS ENUM ('BUY', 'MTO', 'DROPSHIP', 'MANUFACTURE', 'CROSSDOCK', 'CONSIGNMENT');
    END IF;
END $$;

-- AlterTable
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "barcode" TEXT,
ADD COLUMN     "costPrice" DOUBLE PRECISION,
ADD COLUMN     "customAttributes" JSONB,
ADD COLUMN     "height" DOUBLE PRECISION,
ADD COLUMN     "internalReference" TEXT,
ADD COLUMN     "lastPurchasePrice" DOUBLE PRECISION,
ADD COLUMN     "leadTime" INTEGER DEFAULT 7,
ADD COLUMN     "length" DOUBLE PRECISION,
ADD COLUMN     "maxStockLevel" INTEGER,
ADD COLUMN     "packagingId" TEXT,
ADD COLUMN     "productType" "ProductType" NOT NULL DEFAULT 'STOCKABLE',
ADD COLUMN     "purchaseUnitOfMeasure" TEXT,
ADD COLUMN     "reorderPoint" INTEGER DEFAULT 10,
ADD COLUMN     "routes" "ProductRoute"[],
ADD COLUMN     "salesUnitOfMeasure" TEXT,
ADD COLUMN     "standardPrice" DOUBLE PRECISION,
ADD COLUMN     "supplierInfo" JSONB,
ADD COLUMN     "tracking" "ProductTracking" NOT NULL DEFAULT 'NONE',
ADD COLUMN     "unitOfMeasure" TEXT NOT NULL DEFAULT 'Units',
ADD COLUMN     "valuationMethod" "ValuationMethod" DEFAULT 'FIFO',
ADD COLUMN     "volume" DOUBLE PRECISION,
ADD COLUMN     "width" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE IF NOT EXISTS "warehouses" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "address" TEXT,
    "city" TEXT,
    "country" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isMain" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "warehouses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "locations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "warehouseId" TEXT NOT NULL,
    "parentId" TEXT,
    "locationType" "LocationType" NOT NULL DEFAULT 'STORAGE',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "maxCapacity" INTEGER,
    "currentCapacity" INTEGER DEFAULT 0,
    "barcode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "stock_moves" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "warehouseId" TEXT,
    "locationId" TEXT,
    "destinationLocationId" TEXT,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unitPrice" DOUBLE PRECISION,
    "moveType" "StockMoveType" NOT NULL,
    "state" "StockMoveState" NOT NULL DEFAULT 'DRAFT',
    "priority" TEXT NOT NULL DEFAULT 'normal',
    "scheduledDate" TIMESTAMP(3),
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "origin" TEXT,
    "reference" TEXT,
    "notes" TEXT,
    "createdBy" TEXT NOT NULL,
    "processedBy" TEXT,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stock_moves_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "stock_quantities" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "warehouseId" TEXT,
    "locationId" TEXT,
    "quantity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reservedQuantity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "availableQuantity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stock_quantities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "inventory_adjustments" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "warehouseId" TEXT,
    "locationId" TEXT,
    "quantity" DOUBLE PRECISION NOT NULL,
    "adjustmentType" "InventoryAdjustmentType" NOT NULL,
    "reason" TEXT NOT NULL,
    "notes" TEXT,
    "state" "InventoryAdjustmentState" NOT NULL DEFAULT 'DRAFT',
    "createdBy" TEXT NOT NULL,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_adjustments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "lot_numbers" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "lotNumber" TEXT NOT NULL,
    "expiryDate" TIMESTAMP(3),
    "quantity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "warehouseId" TEXT,
    "locationId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lot_numbers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "serial_numbers" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "serialNumber" TEXT NOT NULL,
    "warehouseId" TEXT,
    "locationId" TEXT,
    "status" "SerialNumberStatus" NOT NULL DEFAULT 'AVAILABLE',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "serial_numbers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "cycle_counts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "warehouseId" TEXT,
    "locationId" TEXT,
    "productId" TEXT,
    "state" "CycleCountState" NOT NULL DEFAULT 'DRAFT',
    "scheduledDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdBy" TEXT NOT NULL,
    "completedBy" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cycle_counts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "cycle_count_items" (
    "id" TEXT NOT NULL,
    "cycleCountId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "expectedQuantity" DOUBLE PRECISION NOT NULL,
    "countedQuantity" DOUBLE PRECISION,
    "variance" DOUBLE PRECISION,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cycle_count_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "reorder_rules" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "warehouseId" TEXT,
    "locationId" TEXT,
    "minQuantity" DOUBLE PRECISION NOT NULL,
    "maxQuantity" DOUBLE PRECISION,
    "orderQuantity" DOUBLE PRECISION NOT NULL,
    "leadTime" INTEGER NOT NULL DEFAULT 7,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reorder_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "packaging" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "unitsPerPackage" INTEGER,
    "weight" DOUBLE PRECISION,
    "volume" DOUBLE PRECISION,
    "length" DOUBLE PRECISION,
    "width" DOUBLE PRECISION,
    "height" DOUBLE PRECISION,
    "barcode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "packaging_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "permissions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "roles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "role_permissions" (
    "id" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "user_role_assignments" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "assignedBy" TEXT,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "user_role_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "warehouses_code_key" ON "warehouses"("code");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "locations_warehouseId_code_key" ON "locations"("warehouseId", "code");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "stock_moves_productId_idx" ON "stock_moves"("productId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "stock_moves_state_idx" ON "stock_moves"("state");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "stock_moves_moveType_idx" ON "stock_moves"("moveType");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "stock_moves_date_idx" ON "stock_moves"("date");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "stock_quantities_productId_idx" ON "stock_quantities"("productId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "stock_quantities_productId_warehouseId_locationId_key" ON "stock_quantities"("productId", "warehouseId", "locationId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "inventory_adjustments_productId_idx" ON "inventory_adjustments"("productId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "inventory_adjustments_state_idx" ON "inventory_adjustments"("state");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "lot_numbers_productId_idx" ON "lot_numbers"("productId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "lot_numbers_expiryDate_idx" ON "lot_numbers"("expiryDate");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "lot_numbers_productId_lotNumber_key" ON "lot_numbers"("productId", "lotNumber");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "serial_numbers_serialNumber_key" ON "serial_numbers"("serialNumber");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "serial_numbers_productId_idx" ON "serial_numbers"("productId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "serial_numbers_status_idx" ON "serial_numbers"("status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "cycle_counts_state_idx" ON "cycle_counts"("state");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "cycle_count_items_cycleCountId_idx" ON "cycle_count_items"("cycleCountId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "reorder_rules_productId_warehouseId_locationId_key" ON "reorder_rules"("productId", "warehouseId", "locationId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "packaging_barcode_key" ON "packaging"("barcode");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "permissions_name_key" ON "permissions"("name");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "role_permissions_roleId_permissionId_key" ON "role_permissions"("roleId", "permissionId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "user_role_assignments_userId_key" ON "user_role_assignments"("userId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "products_barcode_key" ON "products"("barcode");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "products_internalReference_key" ON "products"("internalReference");

-- AddForeignKey
-- Add constraint products_packagingId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'products_packagingId_fkey' 
        AND conrelid = 'products'::regclass
    ) THEN
        ALTER TABLE "products" ADD CONSTRAINT "products_packagingId_fkey" FOREIGN KEY ("packagingId") REFERENCES "packaging"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
-- Add constraint locations_warehouseId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'locations_warehouseId_fkey' 
        AND conrelid = 'locations'::regclass
    ) THEN
        ALTER TABLE "locations" ADD CONSTRAINT "locations_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
-- Add constraint locations_parentId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'locations_parentId_fkey' 
        AND conrelid = 'locations'::regclass
    ) THEN
        ALTER TABLE "locations" ADD CONSTRAINT "locations_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
-- Add constraint stock_moves_productId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'stock_moves_productId_fkey' 
        AND conrelid = 'stock_moves'::regclass
    ) THEN
        ALTER TABLE "stock_moves" ADD CONSTRAINT "stock_moves_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
-- Add constraint stock_moves_warehouseId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'stock_moves_warehouseId_fkey' 
        AND conrelid = 'stock_moves'::regclass
    ) THEN
        ALTER TABLE "stock_moves" ADD CONSTRAINT "stock_moves_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
-- Add constraint stock_moves_locationId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'stock_moves_locationId_fkey' 
        AND conrelid = 'stock_moves'::regclass
    ) THEN
        ALTER TABLE "stock_moves" ADD CONSTRAINT "stock_moves_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
-- Add constraint stock_moves_destinationLocationId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'stock_moves_destinationLocationId_fkey' 
        AND conrelid = 'stock_moves'::regclass
    ) THEN
        ALTER TABLE "stock_moves" ADD CONSTRAINT "stock_moves_destinationLocationId_fkey" FOREIGN KEY ("destinationLocationId") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
-- Add constraint stock_moves_createdBy_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'stock_moves_createdBy_fkey' 
        AND conrelid = 'stock_moves'::regclass
    ) THEN
        ALTER TABLE "stock_moves" ADD CONSTRAINT "stock_moves_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
-- Add constraint stock_moves_processedBy_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'stock_moves_processedBy_fkey' 
        AND conrelid = 'stock_moves'::regclass
    ) THEN
        ALTER TABLE "stock_moves" ADD CONSTRAINT "stock_moves_processedBy_fkey" FOREIGN KEY ("processedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
-- Add constraint stock_quantities_productId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'stock_quantities_productId_fkey' 
        AND conrelid = 'stock_quantities'::regclass
    ) THEN
        ALTER TABLE "stock_quantities" ADD CONSTRAINT "stock_quantities_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
-- Add constraint stock_quantities_warehouseId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'stock_quantities_warehouseId_fkey' 
        AND conrelid = 'stock_quantities'::regclass
    ) THEN
        ALTER TABLE "stock_quantities" ADD CONSTRAINT "stock_quantities_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
-- Add constraint stock_quantities_locationId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'stock_quantities_locationId_fkey' 
        AND conrelid = 'stock_quantities'::regclass
    ) THEN
        ALTER TABLE "stock_quantities" ADD CONSTRAINT "stock_quantities_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
-- Add constraint inventory_adjustments_productId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'inventory_adjustments_productId_fkey' 
        AND conrelid = 'inventory_adjustments'::regclass
    ) THEN
        ALTER TABLE "inventory_adjustments" ADD CONSTRAINT "inventory_adjustments_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
-- Add constraint inventory_adjustments_warehouseId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'inventory_adjustments_warehouseId_fkey' 
        AND conrelid = 'inventory_adjustments'::regclass
    ) THEN
        ALTER TABLE "inventory_adjustments" ADD CONSTRAINT "inventory_adjustments_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
-- Add constraint inventory_adjustments_locationId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'inventory_adjustments_locationId_fkey' 
        AND conrelid = 'inventory_adjustments'::regclass
    ) THEN
        ALTER TABLE "inventory_adjustments" ADD CONSTRAINT "inventory_adjustments_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
-- Add constraint inventory_adjustments_createdBy_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'inventory_adjustments_createdBy_fkey' 
        AND conrelid = 'inventory_adjustments'::regclass
    ) THEN
        ALTER TABLE "inventory_adjustments" ADD CONSTRAINT "inventory_adjustments_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
-- Add constraint inventory_adjustments_approvedBy_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'inventory_adjustments_approvedBy_fkey' 
        AND conrelid = 'inventory_adjustments'::regclass
    ) THEN
        ALTER TABLE "inventory_adjustments" ADD CONSTRAINT "inventory_adjustments_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
-- Add constraint lot_numbers_productId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'lot_numbers_productId_fkey' 
        AND conrelid = 'lot_numbers'::regclass
    ) THEN
        ALTER TABLE "lot_numbers" ADD CONSTRAINT "lot_numbers_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
-- Add constraint lot_numbers_warehouseId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'lot_numbers_warehouseId_fkey' 
        AND conrelid = 'lot_numbers'::regclass
    ) THEN
        ALTER TABLE "lot_numbers" ADD CONSTRAINT "lot_numbers_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
-- Add constraint lot_numbers_locationId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'lot_numbers_locationId_fkey' 
        AND conrelid = 'lot_numbers'::regclass
    ) THEN
        ALTER TABLE "lot_numbers" ADD CONSTRAINT "lot_numbers_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
-- Add constraint serial_numbers_productId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'serial_numbers_productId_fkey' 
        AND conrelid = 'serial_numbers'::regclass
    ) THEN
        ALTER TABLE "serial_numbers" ADD CONSTRAINT "serial_numbers_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
-- Add constraint serial_numbers_warehouseId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'serial_numbers_warehouseId_fkey' 
        AND conrelid = 'serial_numbers'::regclass
    ) THEN
        ALTER TABLE "serial_numbers" ADD CONSTRAINT "serial_numbers_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
-- Add constraint serial_numbers_locationId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'serial_numbers_locationId_fkey' 
        AND conrelid = 'serial_numbers'::regclass
    ) THEN
        ALTER TABLE "serial_numbers" ADD CONSTRAINT "serial_numbers_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
-- Add constraint cycle_counts_warehouseId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'cycle_counts_warehouseId_fkey' 
        AND conrelid = 'cycle_counts'::regclass
    ) THEN
        ALTER TABLE "cycle_counts" ADD CONSTRAINT "cycle_counts_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
-- Add constraint cycle_counts_locationId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'cycle_counts_locationId_fkey' 
        AND conrelid = 'cycle_counts'::regclass
    ) THEN
        ALTER TABLE "cycle_counts" ADD CONSTRAINT "cycle_counts_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
-- Add constraint cycle_counts_productId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'cycle_counts_productId_fkey' 
        AND conrelid = 'cycle_counts'::regclass
    ) THEN
        ALTER TABLE "cycle_counts" ADD CONSTRAINT "cycle_counts_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
-- Add constraint cycle_counts_createdBy_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'cycle_counts_createdBy_fkey' 
        AND conrelid = 'cycle_counts'::regclass
    ) THEN
        ALTER TABLE "cycle_counts" ADD CONSTRAINT "cycle_counts_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
-- Add constraint cycle_counts_completedBy_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'cycle_counts_completedBy_fkey' 
        AND conrelid = 'cycle_counts'::regclass
    ) THEN
        ALTER TABLE "cycle_counts" ADD CONSTRAINT "cycle_counts_completedBy_fkey" FOREIGN KEY ("completedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
-- Add constraint cycle_count_items_cycleCountId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'cycle_count_items_cycleCountId_fkey' 
        AND conrelid = 'cycle_count_items'::regclass
    ) THEN
        ALTER TABLE "cycle_count_items" ADD CONSTRAINT "cycle_count_items_cycleCountId_fkey" FOREIGN KEY ("cycleCountId") REFERENCES "cycle_counts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
-- Add constraint cycle_count_items_productId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'cycle_count_items_productId_fkey' 
        AND conrelid = 'cycle_count_items'::regclass
    ) THEN
        ALTER TABLE "cycle_count_items" ADD CONSTRAINT "cycle_count_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
-- Add constraint reorder_rules_productId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'reorder_rules_productId_fkey' 
        AND conrelid = 'reorder_rules'::regclass
    ) THEN
        ALTER TABLE "reorder_rules" ADD CONSTRAINT "reorder_rules_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
-- Add constraint reorder_rules_warehouseId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'reorder_rules_warehouseId_fkey' 
        AND conrelid = 'reorder_rules'::regclass
    ) THEN
        ALTER TABLE "reorder_rules" ADD CONSTRAINT "reorder_rules_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
-- Add constraint reorder_rules_locationId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'reorder_rules_locationId_fkey' 
        AND conrelid = 'reorder_rules'::regclass
    ) THEN
        ALTER TABLE "reorder_rules" ADD CONSTRAINT "reorder_rules_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
-- Add constraint role_permissions_roleId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'role_permissions_roleId_fkey' 
        AND conrelid = 'role_permissions'::regclass
    ) THEN
        ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
-- Add constraint role_permissions_permissionId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'role_permissions_permissionId_fkey' 
        AND conrelid = 'role_permissions'::regclass
    ) THEN
        ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
-- Add constraint user_role_assignments_userId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'user_role_assignments_userId_fkey' 
        AND conrelid = 'user_role_assignments'::regclass
    ) THEN
        ALTER TABLE "user_role_assignments" ADD CONSTRAINT "user_role_assignments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
-- Add constraint user_role_assignments_roleId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'user_role_assignments_roleId_fkey' 
        AND conrelid = 'user_role_assignments'::regclass
    ) THEN
        ALTER TABLE "user_role_assignments" ADD CONSTRAINT "user_role_assignments_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
-- Add constraint user_role_assignments_assignedBy_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'user_role_assignments_assignedBy_fkey' 
        AND conrelid = 'user_role_assignments'::regclass
    ) THEN
        ALTER TABLE "user_role_assignments" ADD CONSTRAINT "user_role_assignments_assignedBy_fkey" FOREIGN KEY ("assignedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;


COMMIT;

-- If this migration failed, you can continue with the next one
-- Just comment out the failed migration section above

-- ============================================
-- Migration 48/59: 20250707022004_remove_old_role_permissions_columns
-- ============================================

BEGIN;

/*
  Warnings:

  - You are about to drop the column `permissions` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "permissions",
DROP COLUMN "role";


COMMIT;

-- If this migration failed, you can continue with the next one
-- Just comment out the failed migration section above

-- ============================================
-- Migration 49/59: 20250707235802_add_interview_system
-- ============================================

BEGIN;

-- CreateTable
CREATE TABLE IF NOT EXISTS "application_interviews" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "interviewerId" TEXT NOT NULL,
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "notes" TEXT,
    "interviewNotes" TEXT,
    "overallScore" DOUBLE PRECISION,
    "overallComment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "application_interviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "interview_criteria" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "maxScore" INTEGER NOT NULL DEFAULT 10,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "interview_criteria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "interview_scores" (
    "id" TEXT NOT NULL,
    "interviewId" TEXT NOT NULL,
    "criteriaId" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "comments" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "interview_scores_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "application_interviews_applicationId_interviewerId_key" ON "application_interviews"("applicationId", "interviewerId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "interview_scores_interviewId_criteriaId_key" ON "interview_scores"("interviewId", "criteriaId");

-- AddForeignKey
-- Add constraint application_interviews_applicationId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'application_interviews_applicationId_fkey' 
        AND conrelid = 'application_interviews'::regclass
    ) THEN
        ALTER TABLE "application_interviews" ADD CONSTRAINT "application_interviews_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
-- Add constraint application_interviews_interviewerId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'application_interviews_interviewerId_fkey' 
        AND conrelid = 'application_interviews'::regclass
    ) THEN
        ALTER TABLE "application_interviews" ADD CONSTRAINT "application_interviews_interviewerId_fkey" FOREIGN KEY ("interviewerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
-- Add constraint interview_scores_interviewId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'interview_scores_interviewId_fkey' 
        AND conrelid = 'interview_scores'::regclass
    ) THEN
        ALTER TABLE "interview_scores" ADD CONSTRAINT "interview_scores_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "application_interviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
-- Add constraint interview_scores_criteriaId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'interview_scores_criteriaId_fkey' 
        AND conrelid = 'interview_scores'::regclass
    ) THEN
        ALTER TABLE "interview_scores" ADD CONSTRAINT "interview_scores_criteriaId_fkey" FOREIGN KEY ("criteriaId") REFERENCES "interview_criteria"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;


COMMIT;

-- If this migration failed, you can continue with the next one
-- Just comment out the failed migration section above

-- ============================================
-- Migration 50/59: 20250708213820_add_interview_invited_status
-- ============================================

BEGIN;

-- AlterEnum
ALTER TYPE "ApplicationStatus" ADD VALUE 'INTERVIEW_INVITED';


COMMIT;

-- If this migration failed, you can continue with the next one
-- Just comment out the failed migration section above

-- ============================================
-- Migration 51/59: 20250716022610_add_order_to_interview_criteria
-- ============================================

BEGIN;

-- AlterTable
ALTER TABLE "interview_criteria" ADD COLUMN IF NOT EXISTS "order" INTEGER NOT NULL DEFAULT 0;


COMMIT;

-- If this migration failed, you can continue with the next one
-- Just comment out the failed migration section above

-- ============================================
-- Migration 52/59: 20250825104712_add_ddin_and_mvend_fields_to_users
-- ============================================

BEGIN;

-- AlterTable
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "ddin_username" TEXT,
                     ADD COLUMN     "ddin_password" TEXT,
                     ADD COLUMN     "mvend_wallet_id" TEXT,
                     ADD COLUMN     "mvend_linked_msisdn" TEXT;


COMMIT;

-- If this migration failed, you can continue with the next one
-- Just comment out the failed migration section above

-- ============================================
-- Migration 53/59: 20250825160940_add_mvend_member_id_to_users
-- ============================================

BEGIN;

-- AlterTable
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "mvend_member_id" TEXT;


COMMIT;

-- If this migration failed, you can continue with the next one
-- Just comment out the failed migration section above

-- ============================================
-- Migration 54/59: 20250825164419_add_otp_table
-- ============================================

BEGIN;

-- CreateTable
CREATE TABLE IF NOT EXISTS "otps" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "otp" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'PASSWORD_RESET',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "otps_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "otps_phone_type_idx" ON "otps"("phone", "type");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "otps_expiresAt_idx" ON "otps"("expiresAt");


COMMIT;

-- If this migration failed, you can continue with the next one
-- Just comment out the failed migration section above

-- ============================================
-- Migration 55/59: 20250825170000_add_user_fields_national_id_gender_district
-- ============================================

BEGIN;

-- AlterTable
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "national_id" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "gender" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "district" TEXT;


COMMIT;

-- If this migration failed, you can continue with the next one
-- Just comment out the failed migration section above

-- ============================================
-- Migration 56/59: 20251013T140912_add_business_price_to_product
-- ============================================

BEGIN;

-- AddBusinessPriceToProduct
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "businessPrice" DOUBLE PRECISION;

COMMIT;

-- If this migration failed, you can continue with the next one
-- Just comment out the failed migration section above

-- ============================================
-- Migration 57/59: 20251017121451_add_mcc_inventory_integration
-- ============================================

BEGIN;

-- Migration: Add MCC-Inventory Integration
-- This migration adds MCC management models and integrates them with the inventory system

-- CreateEnum: MCCWarehouseType
-- Create type MCCWarehouseType if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'MCCWarehouseType') THEN
        CREATE TYPE "MCCWarehouseType" AS ENUM ('COLLECTION_CENTER', 'PROCESSING_PLANT', 'COLD_STORAGE', 'DISTRIBUTION_CENTER');
    END IF;
END $$;

-- CreateEnum: MCCProductType  
-- Create type MCCProductType if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'MCCProductType') THEN
        CREATE TYPE "MCCProductType" AS ENUM ('RAW_MILK', 'PROCESSED_MILK', 'MILK_PRODUCTS', 'BYPRODUCTS');
    END IF;
END $$;

-- CreateEnum: MilkCollectionStatus
-- Create type MilkCollectionStatus if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'MilkCollectionStatus') THEN
        CREATE TYPE "MilkCollectionStatus" AS ENUM ('PENDING', 'APPROVED', 'PAID', 'PROCESSED');
    END IF;
END $$;

-- CreateEnum: MCCPeriodStatus
-- Create type MCCPeriodStatus if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'MCCPeriodStatus') THEN
        CREATE TYPE "MCCPeriodStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'CLOSED');
    END IF;
END $$;

-- CreateTable: MCC
CREATE TABLE IF NOT EXISTS "mccs" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "contactInfo" JSONB NOT NULL DEFAULT '{}',
    "settings" JSONB NOT NULL DEFAULT '{}',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mccs_pkey" PRIMARY KEY ("id")
);

-- CreateTable: MCCWarehouse
CREATE TABLE IF NOT EXISTS "mcc_warehouses" (
    "id" TEXT NOT NULL,
    "mccId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "MCCWarehouseType" NOT NULL,
    "location" TEXT NOT NULL,
    "capacity" DOUBLE PRECISION NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mcc_warehouses_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Farmer
CREATE TABLE IF NOT EXISTS "farmers" (
    "id" TEXT NOT NULL,
    "mccId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "registrationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "totalAmountEarned" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastCollectionDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "farmers_pkey" PRIMARY KEY ("id")
);

-- CreateTable: MCCPeriod
CREATE TABLE IF NOT EXISTS "mcc_periods" (
    "id" TEXT NOT NULL,
    "mccId" TEXT NOT NULL,
    "periodNumber" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" "MCCPeriodStatus" NOT NULL DEFAULT 'ACTIVE',
    "totalFarmers" INTEGER NOT NULL DEFAULT 0,
    "totalMilkCollected" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalDeductions" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalAdvances" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mcc_periods_pkey" PRIMARY KEY ("id")
);

-- CreateTable: MilkCollection
CREATE TABLE IF NOT EXISTS "milk_collections" (
    "id" TEXT NOT NULL,
    "farmerId" TEXT NOT NULL,
    "mccPeriodId" TEXT,
    "collectionDate" TIMESTAMP(3) NOT NULL,
    "period" INTEGER NOT NULL,
    "totalLiters" DOUBLE PRECISION NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "stockMoveId" TEXT,
    "warehouseId" TEXT,
    "locationId" TEXT,
    "productId" TEXT,
    "deductions" JSONB NOT NULL DEFAULT '{}',
    "advances" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalDeductions" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "netPayment" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" "MilkCollectionStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "milk_collections_pkey" PRIMARY KEY ("id")
);

-- CreateTable: MilkProcessing
CREATE TABLE IF NOT EXISTS "milk_processing" (
    "id" TEXT NOT NULL,
    "mccId" TEXT NOT NULL,
    "rawMilkProductId" TEXT NOT NULL,
    "processedProductId" TEXT NOT NULL,
    "inputQuantity" DOUBLE PRECISION NOT NULL,
    "outputQuantity" DOUBLE PRECISION NOT NULL,
    "processingDate" TIMESTAMP(3) NOT NULL,
    "processingSteps" JSONB NOT NULL DEFAULT '{}',
    "qualityMetrics" JSONB NOT NULL DEFAULT '{}',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "milk_processing_pkey" PRIMARY KEY ("id")
);

-- Add MCC-specific fields to Product table
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "mccProductType" "MCCProductType";
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "mccWarehouseId" TEXT;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "processingSteps" JSONB;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "shelfLife" INTEGER;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "temperatureRange" JSONB;

-- Add MCC relations to User table
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "mccId" TEXT;

-- CreateIndex: MCCWarehouse
CREATE INDEX IF NOT EXISTS "mcc_warehouses_mccId_idx" ON "mcc_warehouses"("mccId");

-- CreateIndex: Farmer
CREATE INDEX IF NOT EXISTS "farmers_mccId_idx" ON "farmers"("mccId");
CREATE INDEX IF NOT EXISTS "farmers_phone_idx" ON "farmers"("phone");

-- CreateIndex: MCCPeriod
CREATE INDEX IF NOT EXISTS "mcc_periods_mccId_idx" ON "mcc_periods"("mccId");
CREATE INDEX IF NOT EXISTS "mcc_periods_periodNumber_idx" ON "mcc_periods"("periodNumber");

-- CreateIndex: MilkCollection
CREATE INDEX IF NOT EXISTS "milk_collections_farmerId_idx" ON "milk_collections"("farmerId");
CREATE INDEX IF NOT EXISTS "milk_collections_stockMoveId_idx" ON "milk_collections"("stockMoveId");
CREATE INDEX IF NOT EXISTS "milk_collections_productId_idx" ON "milk_collections"("productId");
CREATE INDEX IF NOT EXISTS "milk_collections_collectionDate_idx" ON "milk_collections"("collectionDate");

-- CreateIndex: MilkProcessing
CREATE INDEX IF NOT EXISTS "milk_processing_mccId_idx" ON "milk_processing"("mccId");
CREATE INDEX IF NOT EXISTS "milk_processing_rawMilkProductId_idx" ON "milk_processing"("rawMilkProductId");
CREATE INDEX IF NOT EXISTS "milk_processing_processedProductId_idx" ON "milk_processing"("processedProductId");

-- CreateIndex: Products MCC fields
CREATE INDEX IF NOT EXISTS "products_mccProductType_idx" ON "products"("mccProductType");
CREATE INDEX IF NOT EXISTS "products_mccWarehouseId_idx" ON "products"("mccWarehouseId");

-- CreateIndex: Users MCC relation
CREATE INDEX IF NOT EXISTS "users_mccId_idx" ON "users"("mccId");

-- AddForeignKey: MCCWarehouse
-- Add constraint mcc_warehouses_mccId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'mcc_warehouses_mccId_fkey' 
        AND conrelid = 'mcc_warehouses'::regclass
    ) THEN
        ALTER TABLE "mcc_warehouses" ADD CONSTRAINT "mcc_warehouses_mccId_fkey" FOREIGN KEY ("mccId") REFERENCES "mccs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey: Farmer
-- Add constraint farmers_mccId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'farmers_mccId_fkey' 
        AND conrelid = 'farmers'::regclass
    ) THEN
        ALTER TABLE "farmers" ADD CONSTRAINT "farmers_mccId_fkey" FOREIGN KEY ("mccId") REFERENCES "mccs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey: MCCPeriod
-- Add constraint mcc_periods_mccId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'mcc_periods_mccId_fkey' 
        AND conrelid = 'mcc_periods'::regclass
    ) THEN
        ALTER TABLE "mcc_periods" ADD CONSTRAINT "mcc_periods_mccId_fkey" FOREIGN KEY ("mccId") REFERENCES "mccs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey: MilkCollection
-- Add constraint milk_collections_farmerId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'milk_collections_farmerId_fkey' 
        AND conrelid = 'milk_collections'::regclass
    ) THEN
        ALTER TABLE "milk_collections" ADD CONSTRAINT "milk_collections_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "farmers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;
-- Add constraint milk_collections_stockMoveId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'milk_collections_stockMoveId_fkey' 
        AND conrelid = 'milk_collections'::regclass
    ) THEN
        ALTER TABLE "milk_collections" ADD CONSTRAINT "milk_collections_stockMoveId_fkey" FOREIGN KEY ("stockMoveId") REFERENCES "stock_moves"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
-- Add constraint milk_collections_warehouseId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'milk_collections_warehouseId_fkey' 
        AND conrelid = 'milk_collections'::regclass
    ) THEN
        ALTER TABLE "milk_collections" ADD CONSTRAINT "milk_collections_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
-- Add constraint milk_collections_locationId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'milk_collections_locationId_fkey' 
        AND conrelid = 'milk_collections'::regclass
    ) THEN
        ALTER TABLE "milk_collections" ADD CONSTRAINT "milk_collections_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
-- Add constraint milk_collections_productId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'milk_collections_productId_fkey' 
        AND conrelid = 'milk_collections'::regclass
    ) THEN
        ALTER TABLE "milk_collections" ADD CONSTRAINT "milk_collections_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
-- Add constraint milk_collections_mccPeriodId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'milk_collections_mccPeriodId_fkey' 
        AND conrelid = 'milk_collections'::regclass
    ) THEN
        ALTER TABLE "milk_collections" ADD CONSTRAINT "milk_collections_mccPeriodId_fkey" FOREIGN KEY ("mccPeriodId") REFERENCES "mcc_periods"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey: MilkProcessing
-- Add constraint milk_processing_mccId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'milk_processing_mccId_fkey' 
        AND conrelid = 'milk_processing'::regclass
    ) THEN
        ALTER TABLE "milk_processing" ADD CONSTRAINT "milk_processing_mccId_fkey" FOREIGN KEY ("mccId") REFERENCES "mccs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;
-- Add constraint milk_processing_rawMilkProductId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'milk_processing_rawMilkProductId_fkey' 
        AND conrelid = 'milk_processing'::regclass
    ) THEN
        ALTER TABLE "milk_processing" ADD CONSTRAINT "milk_processing_rawMilkProductId_fkey" FOREIGN KEY ("rawMilkProductId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;
-- Add constraint milk_processing_processedProductId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'milk_processing_processedProductId_fkey' 
        AND conrelid = 'milk_processing'::regclass
    ) THEN
        ALTER TABLE "milk_processing" ADD CONSTRAINT "milk_processing_processedProductId_fkey" FOREIGN KEY ("processedProductId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey: Products MCC fields
-- Add constraint products_mccWarehouseId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'products_mccWarehouseId_fkey' 
        AND conrelid = 'products'::regclass
    ) THEN
        ALTER TABLE "products" ADD CONSTRAINT "products_mccWarehouseId_fkey" FOREIGN KEY ("mccWarehouseId") REFERENCES "mcc_warehouses"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey: Users MCC relation
-- Add constraint users_mccId_fkey if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'users_mccId_fkey' 
        AND conrelid = 'users'::regclass
    ) THEN
        ALTER TABLE "users" ADD CONSTRAINT "users_mccId_fkey" FOREIGN KEY ("mccId") REFERENCES "mccs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;























COMMIT;

-- If this migration failed, you can continue with the next one
-- Just comment out the failed migration section above

-- ============================================
-- Migration 58/59: add_employer_permissions
-- ============================================

BEGIN;

-- Add applications.view permission to existing EMPLOYER users
UPDATE "User"
SET permissions = array_append(permissions, 'applications.view')
WHERE role = 'EMPLOYER' AND NOT 'applications.view' = ANY(permissions);

-- Create a trigger to automatically add applications.view permission to new EMPLOYER users
CREATE OR REPLACE FUNCTION add_employer_permissions()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.role = 'EMPLOYER' THEN
        NEW.permissions = array_append(COALESCE(NEW.permissions, ARRAY[]::text[]), 'applications.view');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER employer_permissions_trigger
    BEFORE INSERT OR UPDATE ON "User"
    FOR EACH ROW
    EXECUTE FUNCTION add_employer_permissions(); 

COMMIT;

-- If this migration failed, you can continue with the next one
-- Just comment out the failed migration section above

-- ============================================
-- Migration 59/59: manual_update_product_type_enum
-- ============================================

BEGIN;

-- Manual migration to update ProductType enum values
-- This migration changes the enum from STOCKABLE/CONSUMABLE/SERVICE to PHYSICAL/DIGITAL/SERVICE

-- First, update existing data to use new enum values
UPDATE products SET "productType" = 'PHYSICAL' WHERE "productType" = 'STOCKABLE';
UPDATE products SET "productType" = 'PHYSICAL' WHERE "productType" = 'CONSUMABLE';

-- Drop the existing enum type
DROP TYPE IF EXISTS "ProductType" CASCADE;

-- Create the new enum type with updated values
-- Create type ProductType if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ProductType') THEN
        CREATE TYPE "ProductType" AS ENUM ('PHYSICAL', 'DIGITAL', 'SERVICE');
    END IF;
END $$;

-- Add the column back with the new enum type
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "productType_new" "ProductType" NOT NULL DEFAULT 'PHYSICAL';

-- Copy data from old column to new column
UPDATE "products" SET "productType_new" = "productType"::text::"ProductType";

-- Drop the old column
ALTER TABLE "products" DROP COLUMN "productType";

-- Rename the new column to the original name
ALTER TABLE "products" RENAME COLUMN "productType_new" TO "productType";

-- Verify the changes
SELECT DISTINCT "productType" FROM products;


COMMIT;

-- If this migration failed, you can continue with the next one
-- Just comment out the failed migration section above

-- ============================================
-- End of all migrations
-- ============================================

-- All migrations completed successfully!
-- If you encountered errors, check the migration sections above
-- and re-run only the failed migrations after fixing issues.
