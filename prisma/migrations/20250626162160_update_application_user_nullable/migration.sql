-- DropForeignKey
ALTER TABLE "applications" DROP CONSTRAINT IF EXISTS "applications_userId_fkey";

-- AddForeignKey with SET NULL
ALTER TABLE "applications" ADD CONSTRAINT "applications_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE; 