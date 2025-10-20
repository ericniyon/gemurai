-- Manual migration to update ProductType enum values
-- This migration changes the enum from STOCKABLE/CONSUMABLE/SERVICE to PHYSICAL/DIGITAL/SERVICE

-- First, update existing data to use new enum values
UPDATE products SET "productType" = 'PHYSICAL' WHERE "productType" = 'STOCKABLE';
UPDATE products SET "productType" = 'PHYSICAL' WHERE "productType" = 'CONSUMABLE';

-- Drop the existing enum type
DROP TYPE IF EXISTS "ProductType" CASCADE;

-- Create the new enum type with updated values
CREATE TYPE "ProductType" AS ENUM ('PHYSICAL', 'DIGITAL', 'SERVICE');

-- Add the column back with the new enum type
ALTER TABLE "products" ADD COLUMN "productType_new" "ProductType" NOT NULL DEFAULT 'PHYSICAL';

-- Copy data from old column to new column
UPDATE "products" SET "productType_new" = "productType"::text::"ProductType";

-- Drop the old column
ALTER TABLE "products" DROP COLUMN "productType";

-- Rename the new column to the original name
ALTER TABLE "products" RENAME COLUMN "productType_new" TO "productType";

-- Verify the changes
SELECT DISTINCT "productType" FROM products;
