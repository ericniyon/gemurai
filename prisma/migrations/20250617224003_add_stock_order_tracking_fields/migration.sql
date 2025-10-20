-- AlterTable
ALTER TABLE "stock_orders" ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "approvedById" TEXT,
ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "completedById" TEXT,
ADD COLUMN     "note" TEXT,
ADD COLUMN     "paymentConfirmedAt" TIMESTAMP(3),
ADD COLUMN     "paymentConfirmedById" TEXT,
ADD COLUMN     "rejectedAt" TIMESTAMP(3),
ADD COLUMN     "rejectedById" TEXT;

-- AddForeignKey
ALTER TABLE "stock_orders" ADD CONSTRAINT "stock_orders_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_orders" ADD CONSTRAINT "stock_orders_rejectedById_fkey" FOREIGN KEY ("rejectedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_orders" ADD CONSTRAINT "stock_orders_paymentConfirmedById_fkey" FOREIGN KEY ("paymentConfirmedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_orders" ADD CONSTRAINT "stock_orders_completedById_fkey" FOREIGN KEY ("completedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
