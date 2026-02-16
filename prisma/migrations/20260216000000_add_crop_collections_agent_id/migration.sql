-- AlterTable: add agentId to crop_collections for Umucunda (agent) deliveries
ALTER TABLE "crop_collections" ADD COLUMN IF NOT EXISTS "agentId" TEXT;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "crop_collections_agentId_idx" ON "crop_collections"("agentId");

-- AddForeignKey
ALTER TABLE "crop_collections" ADD CONSTRAINT "crop_collections_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
