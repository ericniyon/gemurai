-- AlterTable
ALTER TABLE "withdrawal_requests" ADD COLUMN     "adminComment" TEXT,
ADD COLUMN     "processedAt" TIMESTAMP(3),
ADD COLUMN     "processedById" TEXT;

-- AddForeignKey
ALTER TABLE "withdrawal_requests" ADD CONSTRAINT "withdrawal_requests_processedById_fkey" FOREIGN KEY ("processedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
