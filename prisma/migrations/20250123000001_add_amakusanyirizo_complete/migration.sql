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

-- 10. Add foreign keys (using DO blocks to check if constraint exists)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'crop_collections_farmerId_fkey') THEN
        ALTER TABLE "crop_collections" ADD CONSTRAINT "crop_collections_farmerId_fkey" 
        FOREIGN KEY ("farmerId") REFERENCES "farmers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'crop_collections_mccId_fkey') THEN
        ALTER TABLE "crop_collections" ADD CONSTRAINT "crop_collections_mccId_fkey" 
        FOREIGN KEY ("mccId") REFERENCES "mccs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'crop_collections_cropTypeId_fkey') THEN
        ALTER TABLE "crop_collections" ADD CONSTRAINT "crop_collections_cropTypeId_fkey" 
        FOREIGN KEY ("cropTypeId") REFERENCES "crop_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'crop_collections_cropPeriodId_fkey') THEN
        ALTER TABLE "crop_collections" ADD CONSTRAINT "crop_collections_cropPeriodId_fkey" 
        FOREIGN KEY ("cropPeriodId") REFERENCES "crop_periods"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'crop_collections_warehouseId_fkey') THEN
        ALTER TABLE "crop_collections" ADD CONSTRAINT "crop_collections_warehouseId_fkey" 
        FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'crop_collections_locationId_fkey') THEN
        ALTER TABLE "crop_collections" ADD CONSTRAINT "crop_collections_locationId_fkey" 
        FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'crop_collections_productId_fkey') THEN
        ALTER TABLE "crop_collections" ADD CONSTRAINT "crop_collections_productId_fkey" 
        FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'crop_collections_stockMoveId_fkey') THEN
        ALTER TABLE "crop_collections" ADD CONSTRAINT "crop_collections_stockMoveId_fkey" 
        FOREIGN KEY ("stockMoveId") REFERENCES "stock_moves"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'crop_periods_mccId_fkey') THEN
        ALTER TABLE "crop_periods" ADD CONSTRAINT "crop_periods_mccId_fkey" 
        FOREIGN KEY ("mccId") REFERENCES "mccs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'crop_processing_mccId_fkey') THEN
        ALTER TABLE "crop_processing" ADD CONSTRAINT "crop_processing_mccId_fkey" 
        FOREIGN KEY ("mccId") REFERENCES "mccs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'crop_processing_rawCropProductId_fkey') THEN
        ALTER TABLE "crop_processing" ADD CONSTRAINT "crop_processing_rawCropProductId_fkey" 
        FOREIGN KEY ("rawCropProductId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'crop_processing_processedProductId_fkey') THEN
        ALTER TABLE "crop_processing" ADD CONSTRAINT "crop_processing_processedProductId_fkey" 
        FOREIGN KEY ("processedProductId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'service_deliveries_serviceId_fkey') THEN
        ALTER TABLE "service_deliveries" ADD CONSTRAINT "service_deliveries_serviceId_fkey" 
        FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'service_deliveries_farmerId_fkey') THEN
        ALTER TABLE "service_deliveries" ADD CONSTRAINT "service_deliveries_farmerId_fkey" 
        FOREIGN KEY ("farmerId") REFERENCES "farmers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'service_deliveries_mccId_fkey') THEN
        ALTER TABLE "service_deliveries" ADD CONSTRAINT "service_deliveries_mccId_fkey" 
        FOREIGN KEY ("mccId") REFERENCES "mccs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'service_deliveries_requestedBy_fkey') THEN
        ALTER TABLE "service_deliveries" ADD CONSTRAINT "service_deliveries_requestedBy_fkey" 
        FOREIGN KEY ("requestedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'reconciliation_records_mccId_fkey') THEN
        ALTER TABLE "reconciliation_records" ADD CONSTRAINT "reconciliation_records_mccId_fkey" 
        FOREIGN KEY ("mccId") REFERENCES "mccs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'reconciliation_records_resolvedBy_fkey') THEN
        ALTER TABLE "reconciliation_records" ADD CONSTRAINT "reconciliation_records_resolvedBy_fkey" 
        FOREIGN KEY ("resolvedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'rentals_signedBy_fkey') THEN
        ALTER TABLE "rentals" ADD CONSTRAINT "rentals_signedBy_fkey" 
        FOREIGN KEY ("signedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
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
