-- Option A: Link mcc_warehouses to global Warehouse; commodities and crop_types to inventory product
-- Receive-into-warehouse flow for HarvestPlus collections

-- Add globalWarehouseId to mcc_warehouses
ALTER TABLE "mcc_warehouses" ADD COLUMN IF NOT EXISTS "globalWarehouseId" TEXT;

-- Add inventoryProductId to commodities
ALTER TABLE "commodities" ADD COLUMN IF NOT EXISTS "inventoryProductId" TEXT;

-- Add inventoryProductId to crop_types
ALTER TABLE "crop_types" ADD COLUMN IF NOT EXISTS "inventoryProductId" TEXT;

-- Create index for mcc_warehouses.globalWarehouseId
CREATE INDEX IF NOT EXISTS "mcc_warehouses_globalWarehouseId_idx" ON "mcc_warehouses"("globalWarehouseId");

-- Create index for commodities.inventoryProductId
CREATE INDEX IF NOT EXISTS "commodities_inventoryProductId_idx" ON "commodities"("inventoryProductId");

-- Create index for crop_types.inventoryProductId
CREATE INDEX IF NOT EXISTS "crop_types_inventoryProductId_idx" ON "crop_types"("inventoryProductId");

-- Add foreign key mcc_warehouses -> warehouses
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'mcc_warehouses_globalWarehouseId_fkey'
  ) THEN
    ALTER TABLE "mcc_warehouses" ADD CONSTRAINT "mcc_warehouses_globalWarehouseId_fkey"
      FOREIGN KEY ("globalWarehouseId") REFERENCES "warehouses"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- Add foreign key commodities -> products
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'commodities_inventoryProductId_fkey'
  ) THEN
    ALTER TABLE "commodities" ADD CONSTRAINT "commodities_inventoryProductId_fkey"
      FOREIGN KEY ("inventoryProductId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- Add foreign key crop_types -> products
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'crop_types_inventoryProductId_fkey'
  ) THEN
    ALTER TABLE "crop_types" ADD CONSTRAINT "crop_types_inventoryProductId_fkey"
      FOREIGN KEY ("inventoryProductId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
