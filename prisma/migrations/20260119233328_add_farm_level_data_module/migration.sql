-- Migration: Add Farm-Level Data Module
-- Adds fields for farmer profile, agent assignments, and payment methods

-- Add PaymentMethod enum value if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'ikofi' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'PaymentMethod')) THEN
        ALTER TYPE "PaymentMethod" ADD VALUE 'ikofi';
    END IF;
END $$;

-- Add new fields to farmers table
DO $$
BEGIN
    -- Add defaultCollectionCenterId
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'farmers' 
        AND column_name = 'defaultCollectionCenterId'
    ) THEN
        ALTER TABLE "farmers" ADD COLUMN "defaultCollectionCenterId" TEXT;
    END IF;

    -- Add paymentMethod
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'farmers' 
        AND column_name = 'paymentMethod'
    ) THEN
        ALTER TABLE "farmers" ADD COLUMN "paymentMethod" "PaymentMethod";
    END IF;

    -- Add district
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'farmers' 
        AND column_name = 'district'
    ) THEN
        ALTER TABLE "farmers" ADD COLUMN "district" TEXT;
    END IF;

    -- Add sector
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'farmers' 
        AND column_name = 'sector'
    ) THEN
        ALTER TABLE "farmers" ADD COLUMN "sector" TEXT;
    END IF;

    -- Add cell
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'farmers' 
        AND column_name = 'cell'
    ) THEN
        ALTER TABLE "farmers" ADD COLUMN "cell" TEXT;
    END IF;
END $$;

-- Create farmer_agent_assignments table
CREATE TABLE IF NOT EXISTS "farmer_agent_assignments" (
    "id" TEXT NOT NULL,
    "farmerId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedBy" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "farmer_agent_assignments_pkey" PRIMARY KEY ("id")
);

-- Create unique constraint for farmer-agent pairs
CREATE UNIQUE INDEX IF NOT EXISTS "farmer_agent_assignments_farmerId_agentId_key" 
ON "farmer_agent_assignments"("farmerId", "agentId");

-- Create indexes
CREATE INDEX IF NOT EXISTS "farmer_agent_assignments_farmerId_idx" 
ON "farmer_agent_assignments"("farmerId");

CREATE INDEX IF NOT EXISTS "farmer_agent_assignments_agentId_idx" 
ON "farmer_agent_assignments"("agentId");

CREATE INDEX IF NOT EXISTS "farmer_agent_assignments_isActive_idx" 
ON "farmer_agent_assignments"("isActive");

-- Add foreign key constraints
DO $$
BEGIN
    -- Add foreign key to farmers
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'farmer_agent_assignments_farmerId_fkey'
    ) THEN
        ALTER TABLE "farmer_agent_assignments" 
        ADD CONSTRAINT "farmer_agent_assignments_farmerId_fkey" 
        FOREIGN KEY ("farmerId") REFERENCES "farmers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    -- Add foreign key to users (agents)
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'farmer_agent_assignments_agentId_fkey'
    ) THEN
        ALTER TABLE "farmer_agent_assignments" 
        ADD CONSTRAINT "farmer_agent_assignments_agentId_fkey" 
        FOREIGN KEY ("agentId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    -- Add foreign key for assignedBy
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'farmer_agent_assignments_assignedBy_fkey'
    ) THEN
        ALTER TABLE "farmer_agent_assignments" 
        ADD CONSTRAINT "farmer_agent_assignments_assignedBy_fkey" 
        FOREIGN KEY ("assignedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;

    -- Add foreign key for defaultCollectionCenterId
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'farmers_defaultCollectionCenterId_fkey'
    ) THEN
        ALTER TABLE "farmers" 
        ADD CONSTRAINT "farmers_defaultCollectionCenterId_fkey" 
        FOREIGN KEY ("defaultCollectionCenterId") REFERENCES "mccs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- Create indexes on farmers table for new fields
CREATE INDEX IF NOT EXISTS "farmers_defaultCollectionCenterId_idx" 
ON "farmers"("defaultCollectionCenterId");

CREATE INDEX IF NOT EXISTS "farmers_paymentMethod_idx" 
ON "farmers"("paymentMethod");

CREATE INDEX IF NOT EXISTS "farmers_district_idx" 
ON "farmers"("district");

CREATE INDEX IF NOT EXISTS "farmers_sector_idx" 
ON "farmers"("sector");

CREATE INDEX IF NOT EXISTS "farmers_cell_idx" 
ON "farmers"("cell");
