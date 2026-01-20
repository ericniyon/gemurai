-- Migration: Add CommodityPricingMethod enum type
-- This migration creates the enum type and converts the existing TEXT column to use it

-- 1. Create the enum type if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'CommodityPricingMethod') THEN
        CREATE TYPE "CommodityPricingMethod" AS ENUM ('SPOT', 'GRADE_BASED', 'DEFERRED', 'POST_SALE');
    END IF;
END $$;

-- 2. Check if commodities table exists and has pricingMethod column
DO $$
BEGIN
    -- Check if table exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'commodities') THEN
        -- Check if column exists and is TEXT type
        IF EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'commodities' 
            AND column_name = 'pricingMethod'
            AND data_type = 'text'
        ) THEN
            -- Convert TEXT column to enum type
            -- First, ensure all existing values are valid enum values
            UPDATE "commodities" 
            SET "pricingMethod" = 'SPOT' 
            WHERE "pricingMethod" NOT IN ('SPOT', 'GRADE_BASED', 'DEFERRED', 'POST_SALE');
            
            -- Alter the column type to use the enum
            ALTER TABLE "commodities" 
            ALTER COLUMN "pricingMethod" TYPE "CommodityPricingMethod" 
            USING "pricingMethod"::"CommodityPricingMethod";
        END IF;
    END IF;
END $$;
