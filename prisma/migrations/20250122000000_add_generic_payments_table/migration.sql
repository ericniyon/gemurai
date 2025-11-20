-- Migration: Add Generic Payments Table
-- This migration adds the payments table to track generic farmer payments

-- CreateTable: Payments
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "farmerId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "method" TEXT,
    "reference" TEXT,
    "paidAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: Payments
CREATE INDEX "payments_farmerId_idx" ON "payments"("farmerId");
CREATE INDEX "payments_paidAt_idx" ON "payments"("paidAt");

-- AddForeignKey: Payments
ALTER TABLE "payments" ADD CONSTRAINT "payments_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "farmers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;







