-- AlterTable
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "displayId" TEXT;

-- CreateUniqueIndex
CREATE UNIQUE INDEX IF NOT EXISTS "users_displayId_key" ON "users"("displayId");
