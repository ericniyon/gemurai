-- Migration: Add MCC-Inventory Integration
-- This migration adds MCC management models and integrates them with the inventory system

-- CreateEnum: MCCWarehouseType
CREATE TYPE "MCCWarehouseType" AS ENUM ('COLLECTION_CENTER', 'PROCESSING_PLANT', 'COLD_STORAGE', 'DISTRIBUTION_CENTER');

-- CreateEnum: MCCProductType  
CREATE TYPE "MCCProductType" AS ENUM ('RAW_MILK', 'PROCESSED_MILK', 'MILK_PRODUCTS', 'BYPRODUCTS');

-- CreateEnum: MilkCollectionStatus
CREATE TYPE "MilkCollectionStatus" AS ENUM ('PENDING', 'APPROVED', 'PAID', 'PROCESSED');

-- CreateEnum: MCCPeriodStatus
CREATE TYPE "MCCPeriodStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'CLOSED');

-- CreateTable: MCC
CREATE TABLE "mccs" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "contactInfo" JSONB NOT NULL DEFAULT '{}',
    "settings" JSONB NOT NULL DEFAULT '{}',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mccs_pkey" PRIMARY KEY ("id")
);

-- CreateTable: MCCWarehouse
CREATE TABLE "mcc_warehouses" (
    "id" TEXT NOT NULL,
    "mccId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "MCCWarehouseType" NOT NULL,
    "location" TEXT NOT NULL,
    "capacity" DOUBLE PRECISION NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mcc_warehouses_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Farmer
CREATE TABLE "farmers" (
    "id" TEXT NOT NULL,
    "mccId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "registrationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "totalAmountEarned" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastCollectionDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "farmers_pkey" PRIMARY KEY ("id")
);

-- CreateTable: MCCPeriod
CREATE TABLE "mcc_periods" (
    "id" TEXT NOT NULL,
    "mccId" TEXT NOT NULL,
    "periodNumber" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" "MCCPeriodStatus" NOT NULL DEFAULT 'ACTIVE',
    "totalFarmers" INTEGER NOT NULL DEFAULT 0,
    "totalMilkCollected" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalDeductions" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalAdvances" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mcc_periods_pkey" PRIMARY KEY ("id")
);

-- CreateTable: MilkCollection
CREATE TABLE "milk_collections" (
    "id" TEXT NOT NULL,
    "farmerId" TEXT NOT NULL,
    "mccPeriodId" TEXT,
    "collectionDate" TIMESTAMP(3) NOT NULL,
    "period" INTEGER NOT NULL,
    "totalLiters" DOUBLE PRECISION NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "stockMoveId" TEXT,
    "warehouseId" TEXT,
    "locationId" TEXT,
    "productId" TEXT,
    "deductions" JSONB NOT NULL DEFAULT '{}',
    "advances" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalDeductions" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "netPayment" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" "MilkCollectionStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "milk_collections_pkey" PRIMARY KEY ("id")
);

-- CreateTable: MilkProcessing
CREATE TABLE "milk_processing" (
    "id" TEXT NOT NULL,
    "mccId" TEXT NOT NULL,
    "rawMilkProductId" TEXT NOT NULL,
    "processedProductId" TEXT NOT NULL,
    "inputQuantity" DOUBLE PRECISION NOT NULL,
    "outputQuantity" DOUBLE PRECISION NOT NULL,
    "processingDate" TIMESTAMP(3) NOT NULL,
    "processingSteps" JSONB NOT NULL DEFAULT '{}',
    "qualityMetrics" JSONB NOT NULL DEFAULT '{}',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "milk_processing_pkey" PRIMARY KEY ("id")
);

-- Add MCC-specific fields to Product table
ALTER TABLE "products" ADD COLUMN "mccProductType" "MCCProductType";
ALTER TABLE "products" ADD COLUMN "mccWarehouseId" TEXT;
ALTER TABLE "products" ADD COLUMN "processingSteps" JSONB;
ALTER TABLE "products" ADD COLUMN "shelfLife" INTEGER;
ALTER TABLE "products" ADD COLUMN "temperatureRange" JSONB;

-- Add MCC relations to User table
ALTER TABLE "users" ADD COLUMN "mccId" TEXT;

-- CreateIndex: MCCWarehouse
CREATE INDEX "mcc_warehouses_mccId_idx" ON "mcc_warehouses"("mccId");

-- CreateIndex: Farmer
CREATE INDEX "farmers_mccId_idx" ON "farmers"("mccId");
CREATE INDEX "farmers_phone_idx" ON "farmers"("phone");

-- CreateIndex: MCCPeriod
CREATE INDEX "mcc_periods_mccId_idx" ON "mcc_periods"("mccId");
CREATE INDEX "mcc_periods_periodNumber_idx" ON "mcc_periods"("periodNumber");

-- CreateIndex: MilkCollection
CREATE INDEX "milk_collections_farmerId_idx" ON "milk_collections"("farmerId");
CREATE INDEX "milk_collections_stockMoveId_idx" ON "milk_collections"("stockMoveId");
CREATE INDEX "milk_collections_productId_idx" ON "milk_collections"("productId");
CREATE INDEX "milk_collections_collectionDate_idx" ON "milk_collections"("collectionDate");

-- CreateIndex: MilkProcessing
CREATE INDEX "milk_processing_mccId_idx" ON "milk_processing"("mccId");
CREATE INDEX "milk_processing_rawMilkProductId_idx" ON "milk_processing"("rawMilkProductId");
CREATE INDEX "milk_processing_processedProductId_idx" ON "milk_processing"("processedProductId");

-- CreateIndex: Products MCC fields
CREATE INDEX "products_mccProductType_idx" ON "products"("mccProductType");
CREATE INDEX "products_mccWarehouseId_idx" ON "products"("mccWarehouseId");

-- CreateIndex: Users MCC relation
CREATE INDEX "users_mccId_idx" ON "users"("mccId");

-- AddForeignKey: MCCWarehouse
ALTER TABLE "mcc_warehouses" ADD CONSTRAINT "mcc_warehouses_mccId_fkey" FOREIGN KEY ("mccId") REFERENCES "mccs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey: Farmer
ALTER TABLE "farmers" ADD CONSTRAINT "farmers_mccId_fkey" FOREIGN KEY ("mccId") REFERENCES "mccs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey: MCCPeriod
ALTER TABLE "mcc_periods" ADD CONSTRAINT "mcc_periods_mccId_fkey" FOREIGN KEY ("mccId") REFERENCES "mccs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey: MilkCollection
ALTER TABLE "milk_collections" ADD CONSTRAINT "milk_collections_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "farmers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "milk_collections" ADD CONSTRAINT "milk_collections_stockMoveId_fkey" FOREIGN KEY ("stockMoveId") REFERENCES "stock_moves"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "milk_collections" ADD CONSTRAINT "milk_collections_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "milk_collections" ADD CONSTRAINT "milk_collections_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "milk_collections" ADD CONSTRAINT "milk_collections_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "milk_collections" ADD CONSTRAINT "milk_collections_mccPeriodId_fkey" FOREIGN KEY ("mccPeriodId") REFERENCES "mcc_periods"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey: MilkProcessing
ALTER TABLE "milk_processing" ADD CONSTRAINT "milk_processing_mccId_fkey" FOREIGN KEY ("mccId") REFERENCES "mccs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "milk_processing" ADD CONSTRAINT "milk_processing_rawMilkProductId_fkey" FOREIGN KEY ("rawMilkProductId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "milk_processing" ADD CONSTRAINT "milk_processing_processedProductId_fkey" FOREIGN KEY ("processedProductId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey: Products MCC fields
ALTER TABLE "products" ADD CONSTRAINT "products_mccWarehouseId_fkey" FOREIGN KEY ("mccWarehouseId") REFERENCES "mcc_warehouses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey: Users MCC relation
ALTER TABLE "users" ADD CONSTRAINT "users_mccId_fkey" FOREIGN KEY ("mccId") REFERENCES "mccs"("id") ON DELETE SET NULL ON UPDATE CASCADE;





















