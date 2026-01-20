-- Migration: Add Agent Prepayment System
-- Supports agent prepayments to farmers before delivery with full audit trail

-- Create agent_prepayments table
CREATE TABLE IF NOT EXISTS "agent_prepayments" (
    "id" TEXT NOT NULL,
    "farmerId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "commodityId" TEXT,
    "batchId" TEXT,
    "collectionId" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'RWF',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "settlementId" TEXT,
    "notes" TEXT,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "settledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agent_prepayments_pkey" PRIMARY KEY ("id")
);

-- Create agent_prepayment_audit table
CREATE TABLE IF NOT EXISTS "agent_prepayment_audit" (
    "id" TEXT NOT NULL,
    "prepaymentId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "performedBy" TEXT NOT NULL,
    "oldValue" JSONB,
    "newValue" JSONB,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_prepayment_audit_pkey" PRIMARY KEY ("id")
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "agent_prepayments_farmerId_idx" ON "agent_prepayments"("farmerId");
CREATE INDEX IF NOT EXISTS "agent_prepayments_agentId_idx" ON "agent_prepayments"("agentId");
CREATE INDEX IF NOT EXISTS "agent_prepayments_commodityId_idx" ON "agent_prepayments"("commodityId");
CREATE INDEX IF NOT EXISTS "agent_prepayments_batchId_idx" ON "agent_prepayments"("batchId");
CREATE INDEX IF NOT EXISTS "agent_prepayments_collectionId_idx" ON "agent_prepayments"("collectionId");
CREATE INDEX IF NOT EXISTS "agent_prepayments_status_idx" ON "agent_prepayments"("status");
CREATE INDEX IF NOT EXISTS "agent_prepayments_recordedAt_idx" ON "agent_prepayments"("recordedAt");

CREATE INDEX IF NOT EXISTS "agent_prepayment_audit_prepaymentId_idx" ON "agent_prepayment_audit"("prepaymentId");
CREATE INDEX IF NOT EXISTS "agent_prepayment_audit_performedBy_idx" ON "agent_prepayment_audit"("performedBy");
CREATE INDEX IF NOT EXISTS "agent_prepayment_audit_action_idx" ON "agent_prepayment_audit"("action");
CREATE INDEX IF NOT EXISTS "agent_prepayment_audit_createdAt_idx" ON "agent_prepayment_audit"("createdAt");

-- Add foreign key constraints
DO $$
BEGIN
    -- Foreign key to farmers
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'agent_prepayments_farmerId_fkey'
    ) THEN
        ALTER TABLE "agent_prepayments" 
        ADD CONSTRAINT "agent_prepayments_farmerId_fkey" 
        FOREIGN KEY ("farmerId") REFERENCES "farmers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    -- Foreign key to users (agents)
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'agent_prepayments_agentId_fkey'
    ) THEN
        ALTER TABLE "agent_prepayments" 
        ADD CONSTRAINT "agent_prepayments_agentId_fkey" 
        FOREIGN KEY ("agentId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    -- Foreign key to commodities
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'agent_prepayments_commodityId_fkey'
    ) THEN
        ALTER TABLE "agent_prepayments" 
        ADD CONSTRAINT "agent_prepayments_commodityId_fkey" 
        FOREIGN KEY ("commodityId") REFERENCES "commodities"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;

    -- Foreign key to bulk_batches
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'agent_prepayments_batchId_fkey'
    ) THEN
        ALTER TABLE "agent_prepayments" 
        ADD CONSTRAINT "agent_prepayments_batchId_fkey" 
        FOREIGN KEY ("batchId") REFERENCES "bulk_batches"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;

    -- Foreign key to commodity_collections
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'agent_prepayments_collectionId_fkey'
    ) THEN
        ALTER TABLE "agent_prepayments" 
        ADD CONSTRAINT "agent_prepayments_collectionId_fkey" 
        FOREIGN KEY ("collectionId") REFERENCES "commodity_collections"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;

    -- Foreign key for audit trail
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'agent_prepayment_audit_prepaymentId_fkey'
    ) THEN
        ALTER TABLE "agent_prepayment_audit" 
        ADD CONSTRAINT "agent_prepayment_audit_prepaymentId_fkey" 
        FOREIGN KEY ("prepaymentId") REFERENCES "agent_prepayments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    -- Foreign key for audit performer
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'agent_prepayment_audit_performedBy_fkey'
    ) THEN
        ALTER TABLE "agent_prepayment_audit" 
        ADD CONSTRAINT "agent_prepayment_audit_performedBy_fkey" 
        FOREIGN KEY ("performedBy") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
