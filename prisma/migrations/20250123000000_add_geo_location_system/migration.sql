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

-- 4. Add geo-location fields to mcc_customers (only if table exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'mcc_customers') THEN
        ALTER TABLE "mcc_customers" 
        ADD COLUMN IF NOT EXISTS "gpsLatitude" DOUBLE PRECISION,
        ADD COLUMN IF NOT EXISTS "gpsLongitude" DOUBLE PRECISION,
        ADD COLUMN IF NOT EXISTS "geoConsent" BOOLEAN DEFAULT false,
        ADD COLUMN IF NOT EXISTS "geoConsentAt" TIMESTAMP(3),
        ADD COLUMN IF NOT EXISTS "geoCreatedAt" TIMESTAMP(3),
        ADD COLUMN IF NOT EXISTS "geoUpdatedAt" TIMESTAMP(3);
    END IF;
END $$;

-- 5. Add geo-location fields to suppliers
ALTER TABLE "suppliers" 
ADD COLUMN IF NOT EXISTS "gpsLatitude" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "gpsLongitude" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "geoConsent" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "geoConsentAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "geoCreatedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "geoUpdatedAt" TIMESTAMP(3);

-- 6. Add geo-location fields to farmers
ALTER TABLE "farmers" 
ADD COLUMN IF NOT EXISTS "gpsLatitude" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "gpsLongitude" DOUBLE PRECISION,
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
-- Create index for mcc_customers only if table exists
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'mcc_customers') THEN
        CREATE INDEX IF NOT EXISTS "mcc_customers_gpsLatitude_gpsLongitude_idx" ON "mcc_customers"("gpsLatitude", "gpsLongitude") WHERE "gpsLatitude" IS NOT NULL AND "gpsLongitude" IS NOT NULL;
    END IF;
END $$;
CREATE INDEX IF NOT EXISTS "suppliers_gpsLatitude_gpsLongitude_idx" ON "suppliers"("gpsLatitude", "gpsLongitude") WHERE "gpsLatitude" IS NOT NULL AND "gpsLongitude" IS NOT NULL;
-- Create index for farmers only if columns exist
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'farmers' 
        AND column_name = 'gpsLatitude'
    ) THEN
        CREATE INDEX IF NOT EXISTS "farmers_gpsLatitude_gpsLongitude_idx" ON "farmers"("gpsLatitude", "gpsLongitude") WHERE "gpsLatitude" IS NOT NULL AND "gpsLongitude" IS NOT NULL;
    END IF;
END $$;

-- 9. Create indexes for audit logs
CREATE INDEX IF NOT EXISTS "geo_audit_logs_userId_idx" ON "geo_audit_logs"("userId");
CREATE INDEX IF NOT EXISTS "geo_audit_logs_entityType_entityId_idx" ON "geo_audit_logs"("entityType", "entityId");
CREATE INDEX IF NOT EXISTS "geo_audit_logs_action_idx" ON "geo_audit_logs"("action");
CREATE INDEX IF NOT EXISTS "geo_audit_logs_timestamp_idx" ON "geo_audit_logs"("timestamp");
