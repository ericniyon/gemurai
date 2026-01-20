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

-- 3. Add fields to mcc_customers (only if table exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'mcc_customers') THEN
        ALTER TABLE "mcc_customers" 
        ADD COLUMN IF NOT EXISTS "latitude" DOUBLE PRECISION,
        ADD COLUMN IF NOT EXISTS "longitude" DOUBLE PRECISION;
    END IF;
END $$;

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
-- Create index for mcc_customers only if table exists
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'mcc_customers') THEN
        CREATE INDEX IF NOT EXISTS "mcc_customers_latitude_longitude_idx" ON "mcc_customers"("latitude", "longitude");
    END IF;
END $$;
CREATE INDEX IF NOT EXISTS "suppliers_latitude_longitude_idx" ON "suppliers"("latitude", "longitude");
CREATE INDEX IF NOT EXISTS "users_latitude_longitude_idx" ON "users"("latitude", "longitude");
CREATE INDEX IF NOT EXISTS "mcc_warehouses_latitude_longitude_idx" ON "mcc_warehouses"("latitude", "longitude");
CREATE INDEX IF NOT EXISTS "farmers_latitude_longitude_idx" ON "farmers"("latitude", "longitude");
CREATE INDEX IF NOT EXISTS "milk_collections_latitude_longitude_idx" ON "milk_collections"("latitude", "longitude");
