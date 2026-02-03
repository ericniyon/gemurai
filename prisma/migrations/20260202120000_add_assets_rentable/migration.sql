-- AlterTable: Add rentable column to assets (whether asset can be rented to farmers)
ALTER TABLE "assets" ADD COLUMN IF NOT EXISTS "rentable" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "assets_rentable_idx" ON "assets"("rentable");
