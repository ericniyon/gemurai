-- Migration: Add region field to season_plans table
-- This allows region-specific season calendars

-- Add region column to season_plans table
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'season_plans') THEN
        IF NOT EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'season_plans' 
            AND column_name = 'region'
        ) THEN
            ALTER TABLE "season_plans" ADD COLUMN "region" TEXT;
        END IF;
    END IF;
END $$;

-- Create index for region filtering
CREATE INDEX IF NOT EXISTS "season_plans_region_idx" ON "season_plans"("region");
