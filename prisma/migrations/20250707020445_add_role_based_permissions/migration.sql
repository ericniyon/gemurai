/*
  Warnings:

  - A unique constraint covering the columns `[barcode]` on the table `products` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[internalReference]` on the table `products` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('STOCKABLE', 'CONSUMABLE', 'SERVICE');

-- CreateEnum
CREATE TYPE "ProductTracking" AS ENUM ('NONE', 'LOT', 'SERIAL', 'LOT_AND_SERIAL');

-- CreateEnum
CREATE TYPE "LocationType" AS ENUM ('STORAGE', 'PICKING', 'RECEIVING', 'SHIPPING', 'PRODUCTION', 'SCRAP', 'TRANSIT');

-- CreateEnum
CREATE TYPE "StockMoveType" AS ENUM ('INCOMING', 'OUTGOING', 'INTERNAL', 'RETURN', 'ADJUSTMENT', 'PRODUCTION', 'SCRAP');

-- CreateEnum
CREATE TYPE "StockMoveState" AS ENUM ('DRAFT', 'CONFIRMED', 'ASSIGNED', 'DONE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "InventoryAdjustmentType" AS ENUM ('INCREASE', 'DECREASE', 'SET');

-- CreateEnum
CREATE TYPE "InventoryAdjustmentState" AS ENUM ('DRAFT', 'APPROVED', 'DONE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SerialNumberStatus" AS ENUM ('AVAILABLE', 'RESERVED', 'SOLD', 'SCRAPPED', 'LOST');

-- CreateEnum
CREATE TYPE "CycleCountState" AS ENUM ('DRAFT', 'IN_PROGRESS', 'DONE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ValuationMethod" AS ENUM ('FIFO', 'LIFO', 'AVCO');

-- CreateEnum
CREATE TYPE "ProductRoute" AS ENUM ('BUY', 'MTO', 'DROPSHIP', 'MANUFACTURE', 'CROSSDOCK', 'CONSIGNMENT');

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "barcode" TEXT,
ADD COLUMN     "costPrice" DOUBLE PRECISION,
ADD COLUMN     "customAttributes" JSONB,
ADD COLUMN     "height" DOUBLE PRECISION,
ADD COLUMN     "internalReference" TEXT,
ADD COLUMN     "lastPurchasePrice" DOUBLE PRECISION,
ADD COLUMN     "leadTime" INTEGER DEFAULT 7,
ADD COLUMN     "length" DOUBLE PRECISION,
ADD COLUMN     "maxStockLevel" INTEGER,
ADD COLUMN     "packagingId" TEXT,
ADD COLUMN     "productType" "ProductType" NOT NULL DEFAULT 'STOCKABLE',
ADD COLUMN     "purchaseUnitOfMeasure" TEXT,
ADD COLUMN     "reorderPoint" INTEGER DEFAULT 10,
ADD COLUMN     "routes" "ProductRoute"[],
ADD COLUMN     "salesUnitOfMeasure" TEXT,
ADD COLUMN     "standardPrice" DOUBLE PRECISION,
ADD COLUMN     "supplierInfo" JSONB,
ADD COLUMN     "tracking" "ProductTracking" NOT NULL DEFAULT 'NONE',
ADD COLUMN     "unitOfMeasure" TEXT NOT NULL DEFAULT 'Units',
ADD COLUMN     "valuationMethod" "ValuationMethod" DEFAULT 'FIFO',
ADD COLUMN     "volume" DOUBLE PRECISION,
ADD COLUMN     "width" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "warehouses" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "address" TEXT,
    "city" TEXT,
    "country" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isMain" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "warehouses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "locations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "warehouseId" TEXT NOT NULL,
    "parentId" TEXT,
    "locationType" "LocationType" NOT NULL DEFAULT 'STORAGE',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "maxCapacity" INTEGER,
    "currentCapacity" INTEGER DEFAULT 0,
    "barcode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_moves" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "warehouseId" TEXT,
    "locationId" TEXT,
    "destinationLocationId" TEXT,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unitPrice" DOUBLE PRECISION,
    "moveType" "StockMoveType" NOT NULL,
    "state" "StockMoveState" NOT NULL DEFAULT 'DRAFT',
    "priority" TEXT NOT NULL DEFAULT 'normal',
    "scheduledDate" TIMESTAMP(3),
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "origin" TEXT,
    "reference" TEXT,
    "notes" TEXT,
    "createdBy" TEXT NOT NULL,
    "processedBy" TEXT,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stock_moves_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_quantities" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "warehouseId" TEXT,
    "locationId" TEXT,
    "quantity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reservedQuantity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "availableQuantity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stock_quantities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_adjustments" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "warehouseId" TEXT,
    "locationId" TEXT,
    "quantity" DOUBLE PRECISION NOT NULL,
    "adjustmentType" "InventoryAdjustmentType" NOT NULL,
    "reason" TEXT NOT NULL,
    "notes" TEXT,
    "state" "InventoryAdjustmentState" NOT NULL DEFAULT 'DRAFT',
    "createdBy" TEXT NOT NULL,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_adjustments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lot_numbers" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "lotNumber" TEXT NOT NULL,
    "expiryDate" TIMESTAMP(3),
    "quantity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "warehouseId" TEXT,
    "locationId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lot_numbers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "serial_numbers" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "serialNumber" TEXT NOT NULL,
    "warehouseId" TEXT,
    "locationId" TEXT,
    "status" "SerialNumberStatus" NOT NULL DEFAULT 'AVAILABLE',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "serial_numbers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cycle_counts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "warehouseId" TEXT,
    "locationId" TEXT,
    "productId" TEXT,
    "state" "CycleCountState" NOT NULL DEFAULT 'DRAFT',
    "scheduledDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdBy" TEXT NOT NULL,
    "completedBy" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cycle_counts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cycle_count_items" (
    "id" TEXT NOT NULL,
    "cycleCountId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "expectedQuantity" DOUBLE PRECISION NOT NULL,
    "countedQuantity" DOUBLE PRECISION,
    "variance" DOUBLE PRECISION,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cycle_count_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reorder_rules" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "warehouseId" TEXT,
    "locationId" TEXT,
    "minQuantity" DOUBLE PRECISION NOT NULL,
    "maxQuantity" DOUBLE PRECISION,
    "orderQuantity" DOUBLE PRECISION NOT NULL,
    "leadTime" INTEGER NOT NULL DEFAULT 7,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reorder_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "packaging" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "unitsPerPackage" INTEGER,
    "weight" DOUBLE PRECISION,
    "volume" DOUBLE PRECISION,
    "length" DOUBLE PRECISION,
    "width" DOUBLE PRECISION,
    "height" DOUBLE PRECISION,
    "barcode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "packaging_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permissions" (
    "id" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_role_assignments" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "assignedBy" TEXT,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "user_role_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "warehouses_code_key" ON "warehouses"("code");

-- CreateIndex
CREATE UNIQUE INDEX "locations_warehouseId_code_key" ON "locations"("warehouseId", "code");

-- CreateIndex
CREATE INDEX "stock_moves_productId_idx" ON "stock_moves"("productId");

-- CreateIndex
CREATE INDEX "stock_moves_state_idx" ON "stock_moves"("state");

-- CreateIndex
CREATE INDEX "stock_moves_moveType_idx" ON "stock_moves"("moveType");

-- CreateIndex
CREATE INDEX "stock_moves_date_idx" ON "stock_moves"("date");

-- CreateIndex
CREATE INDEX "stock_quantities_productId_idx" ON "stock_quantities"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "stock_quantities_productId_warehouseId_locationId_key" ON "stock_quantities"("productId", "warehouseId", "locationId");

-- CreateIndex
CREATE INDEX "inventory_adjustments_productId_idx" ON "inventory_adjustments"("productId");

-- CreateIndex
CREATE INDEX "inventory_adjustments_state_idx" ON "inventory_adjustments"("state");

-- CreateIndex
CREATE INDEX "lot_numbers_productId_idx" ON "lot_numbers"("productId");

-- CreateIndex
CREATE INDEX "lot_numbers_expiryDate_idx" ON "lot_numbers"("expiryDate");

-- CreateIndex
CREATE UNIQUE INDEX "lot_numbers_productId_lotNumber_key" ON "lot_numbers"("productId", "lotNumber");

-- CreateIndex
CREATE UNIQUE INDEX "serial_numbers_serialNumber_key" ON "serial_numbers"("serialNumber");

-- CreateIndex
CREATE INDEX "serial_numbers_productId_idx" ON "serial_numbers"("productId");

-- CreateIndex
CREATE INDEX "serial_numbers_status_idx" ON "serial_numbers"("status");

-- CreateIndex
CREATE INDEX "cycle_counts_state_idx" ON "cycle_counts"("state");

-- CreateIndex
CREATE INDEX "cycle_count_items_cycleCountId_idx" ON "cycle_count_items"("cycleCountId");

-- CreateIndex
CREATE UNIQUE INDEX "reorder_rules_productId_warehouseId_locationId_key" ON "reorder_rules"("productId", "warehouseId", "locationId");

-- CreateIndex
CREATE UNIQUE INDEX "packaging_barcode_key" ON "packaging"("barcode");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_name_key" ON "permissions"("name");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "role_permissions_roleId_permissionId_key" ON "role_permissions"("roleId", "permissionId");

-- CreateIndex
CREATE UNIQUE INDEX "user_role_assignments_userId_key" ON "user_role_assignments"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "products_barcode_key" ON "products"("barcode");

-- CreateIndex
CREATE UNIQUE INDEX "products_internalReference_key" ON "products"("internalReference");

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_packagingId_fkey" FOREIGN KEY ("packagingId") REFERENCES "packaging"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "locations" ADD CONSTRAINT "locations_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "locations" ADD CONSTRAINT "locations_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_moves" ADD CONSTRAINT "stock_moves_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_moves" ADD CONSTRAINT "stock_moves_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_moves" ADD CONSTRAINT "stock_moves_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_moves" ADD CONSTRAINT "stock_moves_destinationLocationId_fkey" FOREIGN KEY ("destinationLocationId") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_moves" ADD CONSTRAINT "stock_moves_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_moves" ADD CONSTRAINT "stock_moves_processedBy_fkey" FOREIGN KEY ("processedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_quantities" ADD CONSTRAINT "stock_quantities_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_quantities" ADD CONSTRAINT "stock_quantities_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_quantities" ADD CONSTRAINT "stock_quantities_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_adjustments" ADD CONSTRAINT "inventory_adjustments_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_adjustments" ADD CONSTRAINT "inventory_adjustments_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_adjustments" ADD CONSTRAINT "inventory_adjustments_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_adjustments" ADD CONSTRAINT "inventory_adjustments_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_adjustments" ADD CONSTRAINT "inventory_adjustments_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lot_numbers" ADD CONSTRAINT "lot_numbers_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lot_numbers" ADD CONSTRAINT "lot_numbers_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lot_numbers" ADD CONSTRAINT "lot_numbers_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "serial_numbers" ADD CONSTRAINT "serial_numbers_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "serial_numbers" ADD CONSTRAINT "serial_numbers_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "serial_numbers" ADD CONSTRAINT "serial_numbers_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cycle_counts" ADD CONSTRAINT "cycle_counts_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cycle_counts" ADD CONSTRAINT "cycle_counts_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cycle_counts" ADD CONSTRAINT "cycle_counts_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cycle_counts" ADD CONSTRAINT "cycle_counts_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cycle_counts" ADD CONSTRAINT "cycle_counts_completedBy_fkey" FOREIGN KEY ("completedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cycle_count_items" ADD CONSTRAINT "cycle_count_items_cycleCountId_fkey" FOREIGN KEY ("cycleCountId") REFERENCES "cycle_counts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cycle_count_items" ADD CONSTRAINT "cycle_count_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reorder_rules" ADD CONSTRAINT "reorder_rules_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reorder_rules" ADD CONSTRAINT "reorder_rules_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reorder_rules" ADD CONSTRAINT "reorder_rules_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_role_assignments" ADD CONSTRAINT "user_role_assignments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_role_assignments" ADD CONSTRAINT "user_role_assignments_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_role_assignments" ADD CONSTRAINT "user_role_assignments_assignedBy_fkey" FOREIGN KEY ("assignedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
