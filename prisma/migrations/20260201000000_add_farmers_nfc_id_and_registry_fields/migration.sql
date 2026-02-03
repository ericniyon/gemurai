-- Migration: Add missing farmers columns (nfcId, nationalId, herdSize, creditLimit, emergencyContact, email, address)
-- These fields exist in Prisma schema but were never migrated to the database

DO $$
BEGIN
    -- Add nfcId column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'farmers' AND column_name = 'nfcId'
    ) THEN
        ALTER TABLE "farmers" ADD COLUMN "nfcId" TEXT;
        CREATE UNIQUE INDEX IF NOT EXISTS "farmers_nfcId_key" ON "farmers"("nfcId") WHERE "nfcId" IS NOT NULL;
    END IF;

    -- Add nationalId column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'farmers' AND column_name = 'nationalId'
    ) THEN
        ALTER TABLE "farmers" ADD COLUMN "nationalId" TEXT;
        CREATE UNIQUE INDEX IF NOT EXISTS "farmers_nationalId_key" ON "farmers"("nationalId") WHERE "nationalId" IS NOT NULL;
    END IF;

    -- Add herdSize column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'farmers' AND column_name = 'herdSize'
    ) THEN
        ALTER TABLE "farmers" ADD COLUMN "herdSize" INTEGER;
    END IF;

    -- Add creditLimit column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'farmers' AND column_name = 'creditLimit'
    ) THEN
        ALTER TABLE "farmers" ADD COLUMN "creditLimit" DOUBLE PRECISION DEFAULT 0;
    END IF;

    -- Add emergencyContact column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'farmers' AND column_name = 'emergencyContact'
    ) THEN
        ALTER TABLE "farmers" ADD COLUMN "emergencyContact" TEXT;
    END IF;

    -- Add email column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'farmers' AND column_name = 'email'
    ) THEN
        ALTER TABLE "farmers" ADD COLUMN "email" TEXT;
    END IF;

    -- Add address column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'farmers' AND column_name = 'address'
    ) THEN
        ALTER TABLE "farmers" ADD COLUMN "address" TEXT;
    END IF;
END $$;
