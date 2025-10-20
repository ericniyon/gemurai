-- Fix invalid ProductType enum values
-- This script updates any products with invalid productType values to use valid enum values

-- First, let's see what invalid values exist
SELECT DISTINCT "productType" FROM products WHERE "productType" NOT IN ('PHYSICAL', 'DIGITAL', 'SERVICE');

-- Update any products with 'STOCKABLE' to 'PHYSICAL' (most appropriate default)
UPDATE products 
SET "productType" = 'PHYSICAL' 
WHERE "productType" = 'STOCKABLE';

-- Update any products with 'CONSUMABLE' to 'PHYSICAL' (most appropriate default)
UPDATE products 
SET "productType" = 'PHYSICAL' 
WHERE "productType" = 'CONSUMABLE';

-- Update any other invalid values to 'PHYSICAL' as default
UPDATE products 
SET "productType" = 'PHYSICAL' 
WHERE "productType" NOT IN ('PHYSICAL', 'DIGITAL', 'SERVICE');

-- Verify the fix
SELECT DISTINCT "productType" FROM products;
