-- Migration: Add Payment Dashboard fields to farmers table
-- Adds iKOFI ID, bank account details, and total volume collected

DO $$
BEGIN
    -- Add ikofiId
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'farmers' 
        AND column_name = 'ikofiId'
    ) THEN
        ALTER TABLE "farmers" ADD COLUMN "ikofiId" TEXT;
        CREATE UNIQUE INDEX IF NOT EXISTS "farmers_ikofiId_key" ON "farmers"("ikofiId") WHERE "ikofiId" IS NOT NULL;
    END IF;

    -- Add bankAccountNumber
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'farmers' 
        AND column_name = 'bankAccountNumber'
    ) THEN
        ALTER TABLE "farmers" ADD COLUMN "bankAccountNumber" TEXT;
    END IF;

    -- Add bankName
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'farmers' 
        AND column_name = 'bankName'
    ) THEN
        ALTER TABLE "farmers" ADD COLUMN "bankName" TEXT;
    END IF;

    -- Add totalVolumeCollected
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'farmers' 
        AND column_name = 'totalVolumeCollected'
    ) THEN
        ALTER TABLE "farmers" ADD COLUMN "totalVolumeCollected" DOUBLE PRECISION NOT NULL DEFAULT 0;
    END IF;
END $$;
