-- Fix commodity_collections.status: migrate from TEXT to CommodityCollectionStatus enum
-- The table was originally created with TEXT status (20250123 migration).
-- Prisma schema expects CommodityCollectionStatus enum type.

-- Ensure the enum exists
DO $$ BEGIN
    CREATE TYPE "CommodityCollectionStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'PAID', 'PROCESSED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Drop default, alter type, restore default
ALTER TABLE "commodity_collections" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "commodity_collections" 
  ALTER COLUMN "status" TYPE "CommodityCollectionStatus" 
  USING "status"::"CommodityCollectionStatus";
ALTER TABLE "commodity_collections" ALTER COLUMN "status" SET DEFAULT 'PENDING'::"CommodityCollectionStatus";
