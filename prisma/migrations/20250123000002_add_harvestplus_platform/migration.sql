-- Migration: HarvestPlus Multi-Commodity Platform
-- Complete implementation of Commodity Studio and multi-commodity support

-- 1. Create commodity_categories table
CREATE TABLE IF NOT EXISTS "commodity_categories" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL UNIQUE,
  "description" TEXT,
  "defaultStorageType" TEXT,
  "status" TEXT NOT NULL DEFAULT 'active',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "commodity_categories_pkey" PRIMARY KEY ("id")
);

-- 2. Create commodities table
CREATE TABLE IF NOT EXISTS "commodities" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "code" TEXT NOT NULL UNIQUE,
  "categoryId" TEXT NOT NULL,
  "unitOfMeasure" TEXT NOT NULL,
  "pricingMethod" TEXT NOT NULL,
  "storageType" TEXT NOT NULL,
  "defaultCollectionCenterType" TEXT,
  "defaultCollectionFrequency" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "commodities_pkey" PRIMARY KEY ("id")
);

-- 3. Create commodity_quality_fields table
CREATE TABLE IF NOT EXISTS "commodity_quality_fields" (
  "id" TEXT NOT NULL,
  "commodityId" TEXT NOT NULL,
  "fieldName" TEXT NOT NULL,
  "fieldType" TEXT NOT NULL,
  "dataType" TEXT NOT NULL,
  "options" JSONB,
  "isMandatory" BOOLEAN NOT NULL DEFAULT false,
  "displayOrder" INTEGER NOT NULL DEFAULT 0,
  "description" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "commodity_quality_fields_pkey" PRIMARY KEY ("id")
);

-- 4. Create commodity_quality_rules table
CREATE TABLE IF NOT EXISTS "commodity_quality_rules" (
  "id" TEXT NOT NULL,
  "commodityId" TEXT NOT NULL,
  "qualityFieldId" TEXT,
  "ruleName" TEXT NOT NULL,
  "ruleType" TEXT NOT NULL,
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

-- 5. Create season_plans table
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
  "status" TEXT NOT NULL DEFAULT 'PLANNED',
  "actualHarvestVolume" DOUBLE PRECISION,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "season_plans_pkey" PRIMARY KEY ("id")
);

-- 6. Create input_catalog table
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

-- 7. Create input_usage_logs table
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

-- 8. Create id_verifications table
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

-- 9. Create commodity_collections table
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
  "status" TEXT NOT NULL DEFAULT 'PENDING',
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

-- 10. Add foreign keys (using DO blocks to check if constraint exists)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'commodities_categoryId_fkey') THEN
        ALTER TABLE "commodities" ADD CONSTRAINT "commodities_categoryId_fkey" 
        FOREIGN KEY ("categoryId") REFERENCES "commodity_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'commodity_quality_fields_commodityId_fkey') THEN
        ALTER TABLE "commodity_quality_fields" ADD CONSTRAINT "commodity_quality_fields_commodityId_fkey" 
        FOREIGN KEY ("commodityId") REFERENCES "commodities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'commodity_quality_rules_commodityId_fkey') THEN
        ALTER TABLE "commodity_quality_rules" ADD CONSTRAINT "commodity_quality_rules_commodityId_fkey" 
        FOREIGN KEY ("commodityId") REFERENCES "commodities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'commodity_quality_rules_qualityFieldId_fkey') THEN
        ALTER TABLE "commodity_quality_rules" ADD CONSTRAINT "commodity_quality_rules_qualityFieldId_fkey" 
        FOREIGN KEY ("qualityFieldId") REFERENCES "commodity_quality_fields"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'season_plans_farmerId_fkey') THEN
        ALTER TABLE "season_plans" ADD CONSTRAINT "season_plans_farmerId_fkey" 
        FOREIGN KEY ("farmerId") REFERENCES "farmers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'season_plans_commodityId_fkey') THEN
        ALTER TABLE "season_plans" ADD CONSTRAINT "season_plans_commodityId_fkey" 
        FOREIGN KEY ("commodityId") REFERENCES "commodities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'input_catalog_commodityId_fkey') THEN
        ALTER TABLE "input_catalog" ADD CONSTRAINT "input_catalog_commodityId_fkey" 
        FOREIGN KEY ("commodityId") REFERENCES "commodities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'input_usage_logs_seasonPlanId_fkey') THEN
        ALTER TABLE "input_usage_logs" ADD CONSTRAINT "input_usage_logs_seasonPlanId_fkey" 
        FOREIGN KEY ("seasonPlanId") REFERENCES "season_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'input_usage_logs_inputCatalogId_fkey') THEN
        ALTER TABLE "input_usage_logs" ADD CONSTRAINT "input_usage_logs_inputCatalogId_fkey" 
        FOREIGN KEY ("inputCatalogId") REFERENCES "input_catalog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'input_usage_logs_farmerId_fkey') THEN
        ALTER TABLE "input_usage_logs" ADD CONSTRAINT "input_usage_logs_farmerId_fkey" 
        FOREIGN KEY ("farmerId") REFERENCES "farmers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'id_verifications_verifiedBy_fkey') THEN
        ALTER TABLE "id_verifications" ADD CONSTRAINT "id_verifications_verifiedBy_fkey" 
        FOREIGN KEY ("verifiedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'commodity_collections_commodityId_fkey') THEN
        ALTER TABLE "commodity_collections" ADD CONSTRAINT "commodity_collections_commodityId_fkey" 
        FOREIGN KEY ("commodityId") REFERENCES "commodities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'commodity_collections_farmerId_fkey') THEN
        ALTER TABLE "commodity_collections" ADD CONSTRAINT "commodity_collections_farmerId_fkey" 
        FOREIGN KEY ("farmerId") REFERENCES "farmers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'commodity_collections_mccId_fkey') THEN
        ALTER TABLE "commodity_collections" ADD CONSTRAINT "commodity_collections_mccId_fkey" 
        FOREIGN KEY ("mccId") REFERENCES "mccs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'commodity_collections_warehouseId_fkey') THEN
        ALTER TABLE "commodity_collections" ADD CONSTRAINT "commodity_collections_warehouseId_fkey" 
        FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'commodity_collections_locationId_fkey') THEN
        ALTER TABLE "commodity_collections" ADD CONSTRAINT "commodity_collections_locationId_fkey" 
        FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'commodity_collections_productId_fkey') THEN
        ALTER TABLE "commodity_collections" ADD CONSTRAINT "commodity_collections_productId_fkey" 
        FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'commodity_collections_stockMoveId_fkey') THEN
        ALTER TABLE "commodity_collections" ADD CONSTRAINT "commodity_collections_stockMoveId_fkey" 
        FOREIGN KEY ("stockMoveId") REFERENCES "stock_moves"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'commodity_collections_agentId_fkey') THEN
        ALTER TABLE "commodity_collections" ADD CONSTRAINT "commodity_collections_agentId_fkey" 
        FOREIGN KEY ("agentId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- 11. Create indexes
CREATE INDEX IF NOT EXISTS "commodity_categories_status_idx" ON "commodity_categories"("status");
CREATE INDEX IF NOT EXISTS "commodities_code_idx" ON "commodities"("code");
CREATE INDEX IF NOT EXISTS "commodities_categoryId_idx" ON "commodities"("categoryId");
CREATE INDEX IF NOT EXISTS "commodities_isActive_idx" ON "commodities"("isActive");
CREATE INDEX IF NOT EXISTS "commodity_quality_fields_commodityId_idx" ON "commodity_quality_fields"("commodityId");
CREATE INDEX IF NOT EXISTS "commodity_quality_fields_displayOrder_idx" ON "commodity_quality_fields"("displayOrder");
CREATE INDEX IF NOT EXISTS "commodity_quality_rules_commodityId_idx" ON "commodity_quality_rules"("commodityId");
CREATE INDEX IF NOT EXISTS "commodity_quality_rules_isActive_idx" ON "commodity_quality_rules"("isActive");
CREATE INDEX IF NOT EXISTS "season_plans_farmerId_idx" ON "season_plans"("farmerId");
CREATE INDEX IF NOT EXISTS "season_plans_commodityId_idx" ON "season_plans"("commodityId");
CREATE INDEX IF NOT EXISTS "season_plans_season_idx" ON "season_plans"("season");
CREATE INDEX IF NOT EXISTS "season_plans_status_idx" ON "season_plans"("status");
CREATE INDEX IF NOT EXISTS "input_catalog_commodityId_idx" ON "input_catalog"("commodityId");
CREATE INDEX IF NOT EXISTS "input_catalog_category_idx" ON "input_catalog"("category");
CREATE INDEX IF NOT EXISTS "input_usage_logs_seasonPlanId_idx" ON "input_usage_logs"("seasonPlanId");
CREATE INDEX IF NOT EXISTS "input_usage_logs_farmerId_idx" ON "input_usage_logs"("farmerId");
CREATE INDEX IF NOT EXISTS "input_usage_logs_usageDate_idx" ON "input_usage_logs"("usageDate");
CREATE INDEX IF NOT EXISTS "id_verifications_nationalId_idx" ON "id_verifications"("nationalId");
CREATE INDEX IF NOT EXISTS "id_verifications_verificationStatus_idx" ON "id_verifications"("verificationStatus");
CREATE INDEX IF NOT EXISTS "id_verifications_entityType_entityId_idx" ON "id_verifications"("entityType", "entityId");
CREATE INDEX IF NOT EXISTS "commodity_collections_commodityId_idx" ON "commodity_collections"("commodityId");
CREATE INDEX IF NOT EXISTS "commodity_collections_farmerId_idx" ON "commodity_collections"("farmerId");
CREATE INDEX IF NOT EXISTS "commodity_collections_mccId_idx" ON "commodity_collections"("mccId");
CREATE INDEX IF NOT EXISTS "commodity_collections_collectionDate_idx" ON "commodity_collections"("collectionDate");
CREATE INDEX IF NOT EXISTS "commodity_collections_status_idx" ON "commodity_collections"("status");
CREATE INDEX IF NOT EXISTS "commodity_collections_agentId_idx" ON "commodity_collections"("agentId");
