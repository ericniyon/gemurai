-- Migration: Add MCC Comprehensive Features
-- This migration adds comprehensive MCC management features including:
-- - Quality test fields for milk collections
-- - Traceability fields (sample tags, geolocation, photos)
-- - Bulk batches for milk bulking
-- - Staff and workforce management
-- - Vehicles and transport management
-- - Power assets tracking
-- - Capacity assessments
-- - Suppliers and procurements
-- - Assets and rentals
-- - Farmer accounts and ledger
-- - Sales and sale items
-- - Questionnaires and responses

-- AlterTable: Add fields to mccs
ALTER TABLE "mccs" ADD COLUMN IF NOT EXISTS "code" TEXT;
ALTER TABLE "mccs" ADD COLUMN IF NOT EXISTS "region" TEXT;
ALTER TABLE "mccs" ADD COLUMN IF NOT EXISTS "address" TEXT;
ALTER TABLE "mccs" ADD COLUMN IF NOT EXISTS "managerUserId" TEXT;

-- CreateIndex: Add unique constraint on mccs.code
CREATE UNIQUE INDEX IF NOT EXISTS "mccs_code_key" ON "mccs"("code");

-- CreateIndex: Add unique constraint on mccs.managerUserId
CREATE UNIQUE INDEX IF NOT EXISTS "mccs_managerUserId_key" ON "mccs"("managerUserId");

-- CreateIndex: Add index on mccs.code
CREATE INDEX IF NOT EXISTS "mccs_code_idx" ON "mccs"("code");

-- CreateIndex: Add index on mccs.managerUserId
CREATE INDEX IF NOT EXISTS "mccs_managerUserId_idx" ON "mccs"("managerUserId");

-- AlterTable: Add fields to farmers
ALTER TABLE "farmers" ADD COLUMN IF NOT EXISTS "farmerCode" TEXT;
ALTER TABLE "farmers" ADD COLUMN IF NOT EXISTS "village" TEXT;
ALTER TABLE "farmers" ADD COLUMN IF NOT EXISTS "defaultPriceGroup" TEXT;

-- CreateIndex: Add unique constraint on farmers.farmerCode
CREATE UNIQUE INDEX IF NOT EXISTS "farmers_farmerCode_key" ON "farmers"("farmerCode");

-- CreateIndex: Add index on farmers.farmerCode
CREATE INDEX IF NOT EXISTS "farmers_farmerCode_idx" ON "farmers"("farmerCode");

-- AlterTable: Add quality and traceability fields to milk_collections
ALTER TABLE "milk_collections" ADD COLUMN IF NOT EXISTS "mccId" TEXT;
ALTER TABLE "milk_collections" ADD COLUMN IF NOT EXISTS "fat" DOUBLE PRECISION;
ALTER TABLE "milk_collections" ADD COLUMN IF NOT EXISTS "protein" DOUBLE PRECISION;
ALTER TABLE "milk_collections" ADD COLUMN IF NOT EXISTS "lactometerReading" DOUBLE PRECISION;
ALTER TABLE "milk_collections" ADD COLUMN IF NOT EXISTS "antibioticTest" BOOLEAN DEFAULT false;
ALTER TABLE "milk_collections" ADD COLUMN IF NOT EXISTS "tempCelsius" DOUBLE PRECISION;
ALTER TABLE "milk_collections" ADD COLUMN IF NOT EXISTS "timeSinceMilkingHours" DOUBLE PRECISION;
ALTER TABLE "milk_collections" ADD COLUMN IF NOT EXISTS "qualityStatus" TEXT DEFAULT 'pending';
ALTER TABLE "milk_collections" ADD COLUMN IF NOT EXISTS "qualityNotes" TEXT;
ALTER TABLE "milk_collections" ADD COLUMN IF NOT EXISTS "sampleTag" TEXT;
ALTER TABLE "milk_collections" ADD COLUMN IF NOT EXISTS "agentId" TEXT;
ALTER TABLE "milk_collections" ADD COLUMN IF NOT EXISTS "photoUrl" TEXT;
ALTER TABLE "milk_collections" ADD COLUMN IF NOT EXISTS "geolocation" JSONB;
ALTER TABLE "milk_collections" ADD COLUMN IF NOT EXISTS "synced" BOOLEAN DEFAULT false;
ALTER TABLE "milk_collections" ADD COLUMN IF NOT EXISTS "batchId" TEXT;

-- CreateIndex: Add unique constraint on milk_collections.sampleTag
CREATE UNIQUE INDEX IF NOT EXISTS "milk_collections_sampleTag_key" ON "milk_collections"("sampleTag") WHERE "sampleTag" IS NOT NULL;

-- CreateIndex: Add indexes on milk_collections
CREATE INDEX IF NOT EXISTS "milk_collections_sampleTag_idx" ON "milk_collections"("sampleTag");
CREATE INDEX IF NOT EXISTS "milk_collections_agentId_idx" ON "milk_collections"("agentId");
CREATE INDEX IF NOT EXISTS "milk_collections_mccId_idx" ON "milk_collections"("mccId");
CREATE INDEX IF NOT EXISTS "milk_collections_qualityStatus_idx" ON "milk_collections"("qualityStatus");

-- CreateTable: bulk_batches
CREATE TABLE IF NOT EXISTS "bulk_batches" (
    "id" TEXT NOT NULL,
    "mccId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dispatched" BOOLEAN NOT NULL DEFAULT false,
    "dispatchedToProcessorId" TEXT,
    "totalLiters" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "bulk_batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable: staff
CREATE TABLE IF NOT EXISTS "staff" (
    "id" TEXT NOT NULL,
    "userId" TEXT UNIQUE,
    "mccId" TEXT,
    "position" TEXT,
    "employmentType" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "trainingLevel" TEXT,
    "certifications" TEXT[],
    "payrollAccount" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable: vehicles
CREATE TABLE IF NOT EXISTS "vehicles" (
    "id" TEXT NOT NULL,
    "regNo" TEXT NOT NULL,
    "vehicleType" TEXT,
    "capacityLiters" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'available',
    "lastMaintenance" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable: power_assets
CREATE TABLE IF NOT EXISTS "power_assets" (
    "id" TEXT NOT NULL,
    "mccId" TEXT NOT NULL,
    "name" TEXT,
    "assetType" TEXT,
    "capacityKw" DOUBLE PRECISION,
    "lastTested" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'operational',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "power_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable: capacity_assessments
CREATE TABLE IF NOT EXISTS "capacity_assessments" (
    "id" TEXT NOT NULL,
    "mccId" TEXT NOT NULL,
    "assessedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assessorUserId" TEXT,
    "staffCount" INTEGER,
    "trainedStaffCount" INTEGER,
    "coolingCapacityLiters" DOUBLE PRECISION,
    "estimatedDailyDemandLiters" DOUBLE PRECISION,
    "transportCapacityLiters" DOUBLE PRECISION,
    "powerOk" BOOLEAN,
    "notes" TEXT,

    CONSTRAINT "capacity_assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable: suppliers
CREATE TABLE IF NOT EXISTS "suppliers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id")
);

-- CreateTable: procurements
CREATE TABLE IF NOT EXISTS "procurements" (
    "id" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "mccId" TEXT,
    "procuredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalAmount" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'received',

    CONSTRAINT "procurements_pkey" PRIMARY KEY ("id")
);

-- CreateTable: procurement_items
CREATE TABLE IF NOT EXISTS "procurement_items" (
    "id" TEXT NOT NULL,
    "procurementId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "qty" DOUBLE PRECISION NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "procurement_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable: assets
CREATE TABLE IF NOT EXISTS "assets" (
    "id" TEXT NOT NULL,
    "serial" TEXT NOT NULL,
    "name" TEXT,
    "assetType" TEXT,
    "status" TEXT NOT NULL DEFAULT 'available',
    "currentHolderType" TEXT,
    "currentHolderId" TEXT,
    "purchasedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable: rentals
CREATE TABLE IF NOT EXISTS "rentals" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "farmerId" TEXT,
    "mccId" TEXT,
    "rentStart" TIMESTAMP(3),
    "rentEnd" TIMESTAMP(3),
    "rentFeePerDay" DOUBLE PRECISION,
    "deposit" DOUBLE PRECISION,
    "returned" BOOLEAN NOT NULL DEFAULT false,
    "returnedAt" TIMESTAMP(3),
    "contractDoc" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rentals_pkey" PRIMARY KEY ("id")
);

-- CreateTable: farmer_accounts
CREATE TABLE IF NOT EXISTS "farmer_accounts" (
    "id" TEXT NOT NULL,
    "farmerId" TEXT NOT NULL,
    "balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "farmer_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable: farmer_ledger
CREATE TABLE IF NOT EXISTS "farmer_ledger" (
    "id" TEXT NOT NULL,
    "farmerId" TEXT NOT NULL,
    "entryAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "balanceAfter" DOUBLE PRECISION NOT NULL,
    "refId" TEXT,
    "notes" TEXT,

    CONSTRAINT "farmer_ledger_pkey" PRIMARY KEY ("id")
);

-- CreateTable: sales
CREATE TABLE IF NOT EXISTS "sales" (
    "id" TEXT NOT NULL,
    "mccId" TEXT NOT NULL,
    "farmerId" TEXT,
    "agentId" TEXT,
    "saleAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "paymentMethod" TEXT,
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "invoiceNo" TEXT,

    CONSTRAINT "sales_pkey" PRIMARY KEY ("id")
);

-- CreateTable: sale_items
CREATE TABLE IF NOT EXISTS "sale_items" (
    "id" TEXT NOT NULL,
    "saleId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "qty" DOUBLE PRECISION NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "sale_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable: questionnaires
CREATE TABLE IF NOT EXISTS "questionnaires" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "schema" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "questionnaires_pkey" PRIMARY KEY ("id")
);

-- CreateTable: questionnaire_responses
CREATE TABLE IF NOT EXISTS "questionnaire_responses" (
    "id" TEXT NOT NULL,
    "questionnaireId" TEXT NOT NULL,
    "mccId" TEXT,
    "farmerId" TEXT,
    "respondentUserId" TEXT,
    "response" JSONB,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "questionnaire_responses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: Add unique constraint on vehicles.regNo
CREATE UNIQUE INDEX IF NOT EXISTS "vehicles_regNo_key" ON "vehicles"("regNo");

-- CreateIndex: Add unique constraint on assets.serial
CREATE UNIQUE INDEX IF NOT EXISTS "assets_serial_key" ON "assets"("serial");

-- CreateIndex: Add unique constraint on questionnaires.code
CREATE UNIQUE INDEX IF NOT EXISTS "questionnaires_code_key" ON "questionnaires"("code");

-- CreateIndex: Add unique constraint on farmer_accounts.farmerId
CREATE UNIQUE INDEX IF NOT EXISTS "farmer_accounts_farmerId_key" ON "farmer_accounts"("farmerId");

-- CreateIndex: Add indexes
CREATE INDEX IF NOT EXISTS "bulk_batches_mccId_idx" ON "bulk_batches"("mccId");
CREATE INDEX IF NOT EXISTS "bulk_batches_dispatched_idx" ON "bulk_batches"("dispatched");
CREATE INDEX IF NOT EXISTS "staff_mccId_idx" ON "staff"("mccId");
CREATE INDEX IF NOT EXISTS "staff_userId_idx" ON "staff"("userId");
CREATE INDEX IF NOT EXISTS "vehicles_status_idx" ON "vehicles"("status");
CREATE INDEX IF NOT EXISTS "power_assets_mccId_idx" ON "power_assets"("mccId");
CREATE INDEX IF NOT EXISTS "power_assets_status_idx" ON "power_assets"("status");
CREATE INDEX IF NOT EXISTS "capacity_assessments_mccId_assessedAt_idx" ON "capacity_assessments"("mccId", "assessedAt" DESC);
CREATE INDEX IF NOT EXISTS "procurements_mccId_idx" ON "procurements"("mccId");
CREATE INDEX IF NOT EXISTS "procurements_supplierId_idx" ON "procurements"("supplierId");
CREATE INDEX IF NOT EXISTS "procurement_items_procurementId_idx" ON "procurement_items"("procurementId");
CREATE INDEX IF NOT EXISTS "procurement_items_productId_idx" ON "procurement_items"("productId");
CREATE INDEX IF NOT EXISTS "assets_status_idx" ON "assets"("status");
CREATE INDEX IF NOT EXISTS "assets_assetType_idx" ON "assets"("assetType");
CREATE INDEX IF NOT EXISTS "rentals_assetId_idx" ON "rentals"("assetId");
CREATE INDEX IF NOT EXISTS "rentals_farmerId_idx" ON "rentals"("farmerId");
CREATE INDEX IF NOT EXISTS "rentals_mccId_idx" ON "rentals"("mccId");
CREATE INDEX IF NOT EXISTS "farmer_ledger_farmerId_entryAt_idx" ON "farmer_ledger"("farmerId", "entryAt" DESC);
CREATE INDEX IF NOT EXISTS "sales_mccId_idx" ON "sales"("mccId");
CREATE INDEX IF NOT EXISTS "sales_farmerId_idx" ON "sales"("farmerId");
CREATE INDEX IF NOT EXISTS "sales_saleAt_idx" ON "sales"("saleAt");
CREATE INDEX IF NOT EXISTS "sale_items_saleId_idx" ON "sale_items"("saleId");
CREATE INDEX IF NOT EXISTS "sale_items_productId_idx" ON "sale_items"("productId");
CREATE INDEX IF NOT EXISTS "questionnaire_responses_questionnaireId_idx" ON "questionnaire_responses"("questionnaireId");
CREATE INDEX IF NOT EXISTS "questionnaire_responses_mccId_idx" ON "questionnaire_responses"("mccId");
CREATE INDEX IF NOT EXISTS "questionnaire_responses_farmerId_idx" ON "questionnaire_responses"("farmerId");

-- AddForeignKey: Add foreign keys
ALTER TABLE "mccs" ADD CONSTRAINT "mccs_managerUserId_fkey" FOREIGN KEY ("managerUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "milk_collections" ADD CONSTRAINT "milk_collections_mccId_fkey" FOREIGN KEY ("mccId") REFERENCES "mccs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "milk_collections" ADD CONSTRAINT "milk_collections_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "milk_collections" ADD CONSTRAINT "milk_collections_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "bulk_batches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "bulk_batches" ADD CONSTRAINT "bulk_batches_mccId_fkey" FOREIGN KEY ("mccId") REFERENCES "mccs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "staff" ADD CONSTRAINT "staff_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "staff" ADD CONSTRAINT "staff_mccId_fkey" FOREIGN KEY ("mccId") REFERENCES "mccs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "power_assets" ADD CONSTRAINT "power_assets_mccId_fkey" FOREIGN KEY ("mccId") REFERENCES "mccs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "capacity_assessments" ADD CONSTRAINT "capacity_assessments_mccId_fkey" FOREIGN KEY ("mccId") REFERENCES "mccs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "capacity_assessments" ADD CONSTRAINT "capacity_assessments_assessorUserId_fkey" FOREIGN KEY ("assessorUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "procurements" ADD CONSTRAINT "procurements_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "procurements" ADD CONSTRAINT "procurements_mccId_fkey" FOREIGN KEY ("mccId") REFERENCES "mccs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "procurement_items" ADD CONSTRAINT "procurement_items_procurementId_fkey" FOREIGN KEY ("procurementId") REFERENCES "procurements"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "procurement_items" ADD CONSTRAINT "procurement_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "rentals" ADD CONSTRAINT "rentals_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "rentals" ADD CONSTRAINT "rentals_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "farmers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "rentals" ADD CONSTRAINT "rentals_mccId_fkey" FOREIGN KEY ("mccId") REFERENCES "mccs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "farmer_accounts" ADD CONSTRAINT "farmer_accounts_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "farmers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "farmer_ledger" ADD CONSTRAINT "farmer_ledger_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "farmers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "sales" ADD CONSTRAINT "sales_mccId_fkey" FOREIGN KEY ("mccId") REFERENCES "mccs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "sales" ADD CONSTRAINT "sales_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "farmers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "sales" ADD CONSTRAINT "sales_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "sale_items" ADD CONSTRAINT "sale_items_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "sales"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "sale_items" ADD CONSTRAINT "sale_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "questionnaire_responses" ADD CONSTRAINT "questionnaire_responses_questionnaireId_fkey" FOREIGN KEY ("questionnaireId") REFERENCES "questionnaires"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "questionnaire_responses" ADD CONSTRAINT "questionnaire_responses_mccId_fkey" FOREIGN KEY ("mccId") REFERENCES "mccs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "questionnaire_responses" ADD CONSTRAINT "questionnaire_responses_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "farmers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "questionnaire_responses" ADD CONSTRAINT "questionnaire_responses_respondentUserId_fkey" FOREIGN KEY ("respondentUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

