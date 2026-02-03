-- Migration: HarvestPlus Remaining Implementation
-- Fixes mcc_payments for commodity collections, adds is_perishable, REGULATOR role, InventoryBatch

-- 1. Extend mcc_payments to support commodity_collections
-- Make collectionId nullable (for milk_collections - legacy)
ALTER TABLE "mcc_payments" ALTER COLUMN "collectionId" DROP NOT NULL;

-- Add commodityCollectionId for commodity_collections
ALTER TABLE "mcc_payments" ADD COLUMN IF NOT EXISTS "commodityCollectionId" TEXT;

-- Add FK for commodityCollectionId -> commodity_collections
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'mcc_payments_commodityCollectionId_fkey'
    ) THEN
        ALTER TABLE "mcc_payments" 
        ADD CONSTRAINT "mcc_payments_commodityCollectionId_fkey" 
        FOREIGN KEY ("commodityCollectionId") REFERENCES "commodity_collections"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- Note: collectionId FK to milk_collections remains; nullable collectionId allows commodity payments to use commodityCollectionId only
CREATE INDEX IF NOT EXISTS "mcc_payments_commodityCollectionId_idx" ON "mcc_payments"("commodityCollectionId");

-- 2. Add isPerishable to commodities
ALTER TABLE "commodities" ADD COLUMN IF NOT EXISTS "isPerishable" BOOLEAN NOT NULL DEFAULT false;

-- 3. Add REGULATOR to UserRole enum
DO $$
BEGIN
    ALTER TYPE "UserRole" ADD VALUE 'REGULATOR';
EXCEPTION
    WHEN duplicate_object THEN NULL; -- Already exists
END $$;

-- 4. Create inventory_batches table
CREATE TABLE IF NOT EXISTS "inventory_batches" (
    "id" TEXT NOT NULL,
    "commodityId" TEXT NOT NULL,
    "grade" TEXT,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "storageLocation" TEXT,
    "ownerType" TEXT NOT NULL,
    "financingStatus" TEXT,
    "batchId" TEXT,
    "mccId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_batches_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "inventory_batches_commodityId_idx" ON "inventory_batches"("commodityId");
CREATE INDEX IF NOT EXISTS "inventory_batches_ownerType_idx" ON "inventory_batches"("ownerType");
CREATE INDEX IF NOT EXISTS "inventory_batches_mccId_idx" ON "inventory_batches"("mccId");
CREATE INDEX IF NOT EXISTS "inventory_batches_financingStatus_idx" ON "inventory_batches"("financingStatus");

ALTER TABLE "inventory_batches" ADD CONSTRAINT "inventory_batches_commodityId_fkey" 
    FOREIGN KEY ("commodityId") REFERENCES "commodities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "inventory_batches" ADD CONSTRAINT "inventory_batches_mccId_fkey" 
    FOREIGN KEY ("mccId") REFERENCES "mccs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
