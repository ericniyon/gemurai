-- CreateEnum: CollectionPointType (FR-1)
CREATE TYPE "CollectionPointType" AS ENUM ('FARM_GATE', 'VILLAGE_HUB', 'COLLECTION_CENTER', 'COLD_ROOM', 'PROCESSOR_INTAKE');

-- CreateEnum: TransportMode (FR-2)
CREATE TYPE "TransportMode" AS ENUM ('BICYCLE', 'MOTORCYCLE', 'TRICYCLE', 'FOUR_WHEELER');

-- CreateEnum: AvailabilitySignalSource (Journey 0)
CREATE TYPE "AvailabilitySignalSource" AS ENUM ('PCA', 'FARMER_SELF', 'COOP_SCOUT');

-- CreateEnum: AvailabilitySignalStatus
CREATE TYPE "AvailabilitySignalStatus" AS ENUM ('ACTIVE', 'RESERVED', 'COLLECTED', 'EXPIRED');

-- AlterTable: commodity_collections - add collectionPointType and transportMode (optional strings for flexibility; use enum values)
ALTER TABLE "commodity_collections" ADD COLUMN IF NOT EXISTS "collectionPointType" TEXT;
ALTER TABLE "commodity_collections" ADD COLUMN IF NOT EXISTS "transportMode" TEXT;

-- CreateTable: pre_collection_availability_signals (Journey 0 - Pre-Collection Agent)
CREATE TABLE IF NOT EXISTS "pre_collection_availability_signals" (
    "id" TEXT NOT NULL,
    "commodityId" TEXT NOT NULL,
    "farmerId" TEXT,
    "createdByUserId" TEXT,
    "sourceType" "AvailabilitySignalSource" NOT NULL,
    "status" "AvailabilitySignalStatus" NOT NULL DEFAULT 'ACTIVE',
    "estimatedQuantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "readinessAt" TIMESTAMP(3) NOT NULL,
    "qualityIndicators" JSONB DEFAULT '{}',
    "locationDescription" TEXT,
    "gpsLatitude" DOUBLE PRECISION,
    "gpsLongitude" DOUBLE PRECISION,
    "storageCondition" TEXT NOT NULL,
    "mccId" TEXT,
    "expiresAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pre_collection_availability_signals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "pre_collection_availability_signals_commodityId_idx" ON "pre_collection_availability_signals"("commodityId");
CREATE INDEX IF NOT EXISTS "pre_collection_availability_signals_farmerId_idx" ON "pre_collection_availability_signals"("farmerId");
CREATE INDEX IF NOT EXISTS "pre_collection_availability_signals_status_idx" ON "pre_collection_availability_signals"("status");
CREATE INDEX IF NOT EXISTS "pre_collection_availability_signals_readinessAt_idx" ON "pre_collection_availability_signals"("readinessAt");
CREATE INDEX IF NOT EXISTS "pre_collection_availability_signals_mccId_idx" ON "pre_collection_availability_signals"("mccId");
CREATE INDEX IF NOT EXISTS "pre_collection_availability_signals_createdByUserId_idx" ON "pre_collection_availability_signals"("createdByUserId");

-- AddForeignKey (optional - may already exist in some setups)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pre_collection_availability_signals_commodityId_fkey') THEN
        ALTER TABLE "pre_collection_availability_signals" ADD CONSTRAINT "pre_collection_availability_signals_commodityId_fkey"
            FOREIGN KEY ("commodityId") REFERENCES "commodities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pre_collection_availability_signals_farmerId_fkey') THEN
        ALTER TABLE "pre_collection_availability_signals" ADD CONSTRAINT "pre_collection_availability_signals_farmerId_fkey"
            FOREIGN KEY ("farmerId") REFERENCES "farmers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pre_collection_availability_signals_createdByUserId_fkey') THEN
        ALTER TABLE "pre_collection_availability_signals" ADD CONSTRAINT "pre_collection_availability_signals_createdByUserId_fkey"
            FOREIGN KEY ("createdByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pre_collection_availability_signals_mccId_fkey') THEN
        ALTER TABLE "pre_collection_availability_signals" ADD CONSTRAINT "pre_collection_availability_signals_mccId_fkey"
            FOREIGN KEY ("mccId") REFERENCES "mccs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
