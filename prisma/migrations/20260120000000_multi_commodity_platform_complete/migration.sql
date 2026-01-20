-- Migration: Multi-Commodity Platform Complete
-- Comprehensive migration for HarvestPlus by GEMURA multi-commodity aggregation platform
-- This migration ensures all tables, enums, indexes, and foreign keys are properly created

-- ============================================
-- 1. ENUMS
-- ============================================

-- Commodity Pricing Method Enum
DO $$ BEGIN
    CREATE TYPE "CommodityPricingMethod" AS ENUM ('SPOT', 'GRADE_BASED', 'DEFERRED', 'POST_SALE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Quality Field Type Enum
DO $$ BEGIN
    CREATE TYPE "QualityFieldType" AS ENUM ('NUMERIC', 'DROPDOWN', 'BOOLEAN', 'INDICATOR', 'TEXT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Quality Data Type Enum
DO $$ BEGIN
    CREATE TYPE "QualityDataType" AS ENUM ('PERCENTAGE', 'DECIMAL', 'INTEGER', 'STRING', 'BOOLEAN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Quality Rule Type Enum
DO $$ BEGIN
    CREATE TYPE "QualityRuleType" AS ENUM ('PASS', 'FAIL', 'CONDITIONAL', 'WARNING');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Commodity Collection Status Enum
DO $$ BEGIN
    CREATE TYPE "CommodityCollectionStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'PAID', 'PROCESSED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- 2. TABLES
-- ============================================

-- Commodity Categories
CREATE TABLE IF NOT EXISTS "commodity_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "defaultStorageType" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "commodity_categories_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "commodity_categories_name_key" UNIQUE ("name")
);

-- Commodities
CREATE TABLE IF NOT EXISTS "commodities" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "unitOfMeasure" TEXT NOT NULL,
    "pricingMethod" "CommodityPricingMethod" NOT NULL,
    "storageType" TEXT NOT NULL,
    "defaultCollectionCenterType" TEXT,
    "defaultCollectionFrequency" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "commodities_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "commodities_code_key" UNIQUE ("code")
);

-- Commodity Quality Fields
CREATE TABLE IF NOT EXISTS "commodity_quality_fields" (
    "id" TEXT NOT NULL,
    "commodityId" TEXT NOT NULL,
    "fieldName" TEXT NOT NULL,
    "fieldType" "QualityFieldType" NOT NULL,
    "dataType" "QualityDataType" NOT NULL,
    "options" JSONB,
    "isMandatory" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "commodity_quality_fields_pkey" PRIMARY KEY ("id")
);

-- Commodity Quality Rules
CREATE TABLE IF NOT EXISTS "commodity_quality_rules" (
    "id" TEXT NOT NULL,
    "commodityId" TEXT NOT NULL,
    "qualityFieldId" TEXT,
    "ruleName" TEXT NOT NULL,
    "ruleType" "QualityRuleType" NOT NULL,
    "thresholdValue" DOUBLE PRECISION,
    "thresholdOperator" TEXT,
    "impactOnPricing" BOOLEAN NOT NULL DEFAULT false,
    "pricingMultiplier" DOUBLE PRECISION,
    "errorMessage" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "commodity_quality_rules_pkey" PRIMARY KEY ("id")
);

-- Season Plans
CREATE TABLE IF NOT EXISTS "season_plans" (
    "id" TEXT NOT NULL,
    "farmerId" TEXT NOT NULL,
    "commodityId" TEXT NOT NULL,
    "season" TEXT NOT NULL,
    "plotHerdReference" TEXT,
    "expectedHarvestVolume" DOUBLE PRECISION NOT NULL,
    "expectedHarvestStartDate" TIMESTAMP(3) NOT NULL,
    "expectedHarvestEndDate" TIMESTAMP(3) NOT NULL,
    "collectionFrequency" TEXT,
    "region" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PLANNED',
    "actualHarvestVolume" DOUBLE PRECISION,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "season_plans_pkey" PRIMARY KEY ("id")
);

-- Input Catalog
CREATE TABLE IF NOT EXISTS "input_catalog" (
    "id" TEXT NOT NULL,
    "commodityId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "pricingReference" DOUBLE PRECISION,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "input_catalog_pkey" PRIMARY KEY ("id")
);

-- Input Usage Logs
CREATE TABLE IF NOT EXISTS "input_usage_logs" (
    "id" TEXT NOT NULL,
    "seasonPlanId" TEXT NOT NULL,
    "inputCatalogId" TEXT NOT NULL,
    "farmerId" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "usageDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cost" DOUBLE PRECISION,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "input_usage_logs_pkey" PRIMARY KEY ("id")
);

-- ID Verifications
CREATE TABLE IF NOT EXISTS "id_verifications" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "nationalId" TEXT NOT NULL,
    "agentId" TEXT,
    "verificationStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "verifiedBy" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "verificationMethod" TEXT,
    "verificationNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "id_verifications_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "id_verifications_entityType_entityId_key" UNIQUE ("entityType", "entityId")
);

-- Commodity Collections
CREATE TABLE IF NOT EXISTS "commodity_collections" (
    "id" TEXT NOT NULL,
    "commodityId" TEXT NOT NULL,
    "farmerId" TEXT NOT NULL,
    "mccId" TEXT NOT NULL,
    "periodId" TEXT,
    "collectionDate" TIMESTAMP(3) NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "qualityData" JSONB NOT NULL DEFAULT '{}',
    "qualityScore" DOUBLE PRECISION,
    "pricePerUnit" DOUBLE PRECISION NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "deductions" JSONB NOT NULL DEFAULT '{}',
    "advances" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "agentAdvance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalDeductions" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "netPayment" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" "CommodityCollectionStatus" NOT NULL DEFAULT 'PENDING',
    "warehouseId" TEXT,
    "locationId" TEXT,
    "productId" TEXT,
    "stockMoveId" TEXT,
    "agentId" TEXT,
    "batchId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "commodity_collections_pkey" PRIMARY KEY ("id")
);

-- Agent Prepayments
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
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "agent_prepayments_pkey" PRIMARY KEY ("id")
);

-- Agent Prepayment Audit
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

-- ============================================
-- 3. INDEXES
-- ============================================

-- Commodity Categories Indexes
CREATE INDEX IF NOT EXISTS "commodity_categories_status_idx" ON "commodity_categories"("status");

-- Commodities Indexes
CREATE INDEX IF NOT EXISTS "commodities_code_idx" ON "commodities"("code");
CREATE INDEX IF NOT EXISTS "commodities_categoryId_idx" ON "commodities"("categoryId");
CREATE INDEX IF NOT EXISTS "commodities_isActive_idx" ON "commodities"("isActive");

-- Quality Fields Indexes
CREATE INDEX IF NOT EXISTS "commodity_quality_fields_commodityId_idx" ON "commodity_quality_fields"("commodityId");
CREATE INDEX IF NOT EXISTS "commodity_quality_fields_displayOrder_idx" ON "commodity_quality_fields"("displayOrder");

-- Quality Rules Indexes
CREATE INDEX IF NOT EXISTS "commodity_quality_rules_commodityId_idx" ON "commodity_quality_rules"("commodityId");
CREATE INDEX IF NOT EXISTS "commodity_quality_rules_isActive_idx" ON "commodity_quality_rules"("isActive");

-- Season Plans Indexes
CREATE INDEX IF NOT EXISTS "season_plans_farmerId_idx" ON "season_plans"("farmerId");
CREATE INDEX IF NOT EXISTS "season_plans_commodityId_idx" ON "season_plans"("commodityId");
CREATE INDEX IF NOT EXISTS "season_plans_season_idx" ON "season_plans"("season");
CREATE INDEX IF NOT EXISTS "season_plans_status_idx" ON "season_plans"("status");
CREATE INDEX IF NOT EXISTS "season_plans_region_idx" ON "season_plans"("region");

-- Input Catalog Indexes
CREATE INDEX IF NOT EXISTS "input_catalog_commodityId_idx" ON "input_catalog"("commodityId");
CREATE INDEX IF NOT EXISTS "input_catalog_category_idx" ON "input_catalog"("category");

-- Input Usage Logs Indexes
CREATE INDEX IF NOT EXISTS "input_usage_logs_seasonPlanId_idx" ON "input_usage_logs"("seasonPlanId");
CREATE INDEX IF NOT EXISTS "input_usage_logs_farmerId_idx" ON "input_usage_logs"("farmerId");
CREATE INDEX IF NOT EXISTS "input_usage_logs_usageDate_idx" ON "input_usage_logs"("usageDate");

-- ID Verifications Indexes
CREATE INDEX IF NOT EXISTS "id_verifications_nationalId_idx" ON "id_verifications"("nationalId");
CREATE INDEX IF NOT EXISTS "id_verifications_verificationStatus_idx" ON "id_verifications"("verificationStatus");
CREATE INDEX IF NOT EXISTS "id_verifications_entityType_entityId_idx" ON "id_verifications"("entityType", "entityId");

-- Commodity Collections Indexes
CREATE INDEX IF NOT EXISTS "commodity_collections_commodityId_idx" ON "commodity_collections"("commodityId");
CREATE INDEX IF NOT EXISTS "commodity_collections_farmerId_idx" ON "commodity_collections"("farmerId");
CREATE INDEX IF NOT EXISTS "commodity_collections_mccId_idx" ON "commodity_collections"("mccId");
CREATE INDEX IF NOT EXISTS "commodity_collections_collectionDate_idx" ON "commodity_collections"("collectionDate");
CREATE INDEX IF NOT EXISTS "commodity_collections_status_idx" ON "commodity_collections"("status");
CREATE INDEX IF NOT EXISTS "commodity_collections_agentId_idx" ON "commodity_collections"("agentId");

-- Agent Prepayments Indexes
CREATE INDEX IF NOT EXISTS "agent_prepayments_farmerId_idx" ON "agent_prepayments"("farmerId");
CREATE INDEX IF NOT EXISTS "agent_prepayments_agentId_idx" ON "agent_prepayments"("agentId");
CREATE INDEX IF NOT EXISTS "agent_prepayments_commodityId_idx" ON "agent_prepayments"("commodityId");
CREATE INDEX IF NOT EXISTS "agent_prepayments_batchId_idx" ON "agent_prepayments"("batchId");
CREATE INDEX IF NOT EXISTS "agent_prepayments_collectionId_idx" ON "agent_prepayments"("collectionId");
CREATE INDEX IF NOT EXISTS "agent_prepayments_status_idx" ON "agent_prepayments"("status");
CREATE INDEX IF NOT EXISTS "agent_prepayments_recordedAt_idx" ON "agent_prepayments"("recordedAt");

-- Agent Prepayment Audit Indexes
CREATE INDEX IF NOT EXISTS "agent_prepayment_audit_prepaymentId_idx" ON "agent_prepayment_audit"("prepaymentId");
CREATE INDEX IF NOT EXISTS "agent_prepayment_audit_performedBy_idx" ON "agent_prepayment_audit"("performedBy");
CREATE INDEX IF NOT EXISTS "agent_prepayment_audit_action_idx" ON "agent_prepayment_audit"("action");
CREATE INDEX IF NOT EXISTS "agent_prepayment_audit_createdAt_idx" ON "agent_prepayment_audit"("createdAt");

-- ============================================
-- 4. FOREIGN KEY CONSTRAINTS
-- ============================================

DO $$
BEGIN
    -- Commodities -> Commodity Categories
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'commodities_categoryId_fkey'
    ) THEN
        ALTER TABLE "commodities" 
        ADD CONSTRAINT "commodities_categoryId_fkey" 
        FOREIGN KEY ("categoryId") REFERENCES "commodity_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;

    -- Quality Fields -> Commodities
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'commodity_quality_fields_commodityId_fkey'
    ) THEN
        ALTER TABLE "commodity_quality_fields" 
        ADD CONSTRAINT "commodity_quality_fields_commodityId_fkey" 
        FOREIGN KEY ("commodityId") REFERENCES "commodities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    -- Quality Rules -> Commodities
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'commodity_quality_rules_commodityId_fkey'
    ) THEN
        ALTER TABLE "commodity_quality_rules" 
        ADD CONSTRAINT "commodity_quality_rules_commodityId_fkey" 
        FOREIGN KEY ("commodityId") REFERENCES "commodities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    -- Quality Rules -> Quality Fields
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'commodity_quality_rules_qualityFieldId_fkey'
    ) THEN
        ALTER TABLE "commodity_quality_rules" 
        ADD CONSTRAINT "commodity_quality_rules_qualityFieldId_fkey" 
        FOREIGN KEY ("qualityFieldId") REFERENCES "commodity_quality_fields"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    -- Season Plans -> Farmers
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'season_plans_farmerId_fkey'
    ) THEN
        ALTER TABLE "season_plans" 
        ADD CONSTRAINT "season_plans_farmerId_fkey" 
        FOREIGN KEY ("farmerId") REFERENCES "farmers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    -- Season Plans -> Commodities
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'season_plans_commodityId_fkey'
    ) THEN
        ALTER TABLE "season_plans" 
        ADD CONSTRAINT "season_plans_commodityId_fkey" 
        FOREIGN KEY ("commodityId") REFERENCES "commodities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;

    -- Input Catalog -> Commodities
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'input_catalog_commodityId_fkey'
    ) THEN
        ALTER TABLE "input_catalog" 
        ADD CONSTRAINT "input_catalog_commodityId_fkey" 
        FOREIGN KEY ("commodityId") REFERENCES "commodities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;

    -- Input Usage Logs -> Season Plans
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'input_usage_logs_seasonPlanId_fkey'
    ) THEN
        ALTER TABLE "input_usage_logs" 
        ADD CONSTRAINT "input_usage_logs_seasonPlanId_fkey" 
        FOREIGN KEY ("seasonPlanId") REFERENCES "season_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    -- Input Usage Logs -> Input Catalog
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'input_usage_logs_inputCatalogId_fkey'
    ) THEN
        ALTER TABLE "input_usage_logs" 
        ADD CONSTRAINT "input_usage_logs_inputCatalogId_fkey" 
        FOREIGN KEY ("inputCatalogId") REFERENCES "input_catalog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;

    -- Input Usage Logs -> Farmers
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'input_usage_logs_farmerId_fkey'
    ) THEN
        ALTER TABLE "input_usage_logs" 
        ADD CONSTRAINT "input_usage_logs_farmerId_fkey" 
        FOREIGN KEY ("farmerId") REFERENCES "farmers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    -- ID Verifications -> Users (verifiedBy)
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'id_verifications_verifiedBy_fkey'
    ) THEN
        ALTER TABLE "id_verifications" 
        ADD CONSTRAINT "id_verifications_verifiedBy_fkey" 
        FOREIGN KEY ("verifiedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;

    -- Commodity Collections -> Commodities
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'commodity_collections_commodityId_fkey'
    ) THEN
        ALTER TABLE "commodity_collections" 
        ADD CONSTRAINT "commodity_collections_commodityId_fkey" 
        FOREIGN KEY ("commodityId") REFERENCES "commodities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;

    -- Commodity Collections -> Farmers
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'commodity_collections_farmerId_fkey'
    ) THEN
        ALTER TABLE "commodity_collections" 
        ADD CONSTRAINT "commodity_collections_farmerId_fkey" 
        FOREIGN KEY ("farmerId") REFERENCES "farmers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;

    -- Commodity Collections -> MCCs
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'commodity_collections_mccId_fkey'
    ) THEN
        ALTER TABLE "commodity_collections" 
        ADD CONSTRAINT "commodity_collections_mccId_fkey" 
        FOREIGN KEY ("mccId") REFERENCES "mccs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;

    -- Commodity Collections -> Warehouse (optional)
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'commodity_collections_warehouseId_fkey'
    ) THEN
        ALTER TABLE "commodity_collections" 
        ADD CONSTRAINT "commodity_collections_warehouseId_fkey" 
        FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;

    -- Commodity Collections -> Location (optional)
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'commodity_collections_locationId_fkey'
    ) THEN
        ALTER TABLE "commodity_collections" 
        ADD CONSTRAINT "commodity_collections_locationId_fkey" 
        FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;

    -- Commodity Collections -> Products (optional)
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'commodity_collections_productId_fkey'
    ) THEN
        ALTER TABLE "commodity_collections" 
        ADD CONSTRAINT "commodity_collections_productId_fkey" 
        FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;

    -- Commodity Collections -> StockMove (optional)
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'commodity_collections_stockMoveId_fkey'
    ) THEN
        ALTER TABLE "commodity_collections" 
        ADD CONSTRAINT "commodity_collections_stockMoveId_fkey" 
        FOREIGN KEY ("stockMoveId") REFERENCES "StockMove"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;

    -- Commodity Collections -> Users (agent)
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'commodity_collections_agentId_fkey'
    ) THEN
        ALTER TABLE "commodity_collections" 
        ADD CONSTRAINT "commodity_collections_agentId_fkey" 
        FOREIGN KEY ("agentId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;

    -- Agent Prepayments -> Farmers
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'agent_prepayments_farmerId_fkey'
    ) THEN
        ALTER TABLE "agent_prepayments" 
        ADD CONSTRAINT "agent_prepayments_farmerId_fkey" 
        FOREIGN KEY ("farmerId") REFERENCES "farmers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    -- Agent Prepayments -> Users (agent)
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'agent_prepayments_agentId_fkey'
    ) THEN
        ALTER TABLE "agent_prepayments" 
        ADD CONSTRAINT "agent_prepayments_agentId_fkey" 
        FOREIGN KEY ("agentId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    -- Agent Prepayments -> Commodities (optional)
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'agent_prepayments_commodityId_fkey'
    ) THEN
        ALTER TABLE "agent_prepayments" 
        ADD CONSTRAINT "agent_prepayments_commodityId_fkey" 
        FOREIGN KEY ("commodityId") REFERENCES "commodities"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;

    -- Agent Prepayments -> Bulk Batches (optional)
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'agent_prepayments_batchId_fkey'
    ) THEN
        ALTER TABLE "agent_prepayments" 
        ADD CONSTRAINT "agent_prepayments_batchId_fkey" 
        FOREIGN KEY ("batchId") REFERENCES "bulk_batches"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;

    -- Agent Prepayments -> Commodity Collections (optional)
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'agent_prepayments_collectionId_fkey'
    ) THEN
        ALTER TABLE "agent_prepayments" 
        ADD CONSTRAINT "agent_prepayments_collectionId_fkey" 
        FOREIGN KEY ("collectionId") REFERENCES "commodity_collections"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;

    -- Agent Prepayment Audit -> Agent Prepayments
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'agent_prepayment_audit_prepaymentId_fkey'
    ) THEN
        ALTER TABLE "agent_prepayment_audit" 
        ADD CONSTRAINT "agent_prepayment_audit_prepaymentId_fkey" 
        FOREIGN KEY ("prepaymentId") REFERENCES "agent_prepayments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    -- Agent Prepayment Audit -> Users (performer)
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'agent_prepayment_audit_performedBy_fkey'
    ) THEN
        ALTER TABLE "agent_prepayment_audit" 
        ADD CONSTRAINT "agent_prepayment_audit_performedBy_fkey" 
        FOREIGN KEY ("performedBy") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- ============================================
-- 5. ADD MISSING COLUMNS TO EXISTING TABLES
-- ============================================

-- Add iKOFI ID and bank details to farmers table if not exists
DO $$
BEGIN
    -- Add ikofiId column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'farmers' AND column_name = 'ikofiId'
    ) THEN
        ALTER TABLE "farmers" ADD COLUMN "ikofiId" TEXT;
        CREATE UNIQUE INDEX IF NOT EXISTS "farmers_ikofiId_key" ON "farmers"("ikofiId") WHERE "ikofiId" IS NOT NULL;
    END IF;

    -- Add bankAccountNumber column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'farmers' AND column_name = 'bankAccountNumber'
    ) THEN
        ALTER TABLE "farmers" ADD COLUMN "bankAccountNumber" TEXT;
    END IF;

    -- Add bankName column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'farmers' AND column_name = 'bankName'
    ) THEN
        ALTER TABLE "farmers" ADD COLUMN "bankName" TEXT;
    END IF;

    -- Add totalVolumeCollected column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'farmers' AND column_name = 'totalVolumeCollected'
    ) THEN
        ALTER TABLE "farmers" ADD COLUMN "totalVolumeCollected" DOUBLE PRECISION NOT NULL DEFAULT 0;
    END IF;
END $$;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
