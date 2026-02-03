-- AlterTable: Add type-specific spec columns to assets
ALTER TABLE "assets" ADD COLUMN IF NOT EXISTS "capacityLiters" DOUBLE PRECISION;
ALTER TABLE "assets" ADD COLUMN IF NOT EXISTS "weightKg" DOUBLE PRECISION;
ALTER TABLE "assets" ADD COLUMN IF NOT EXISTS "specifications" JSONB DEFAULT '{}';
