-- Migration: Add MCC Payments Table
-- This migration adds the mcc_payments table to track farmer payments

-- CreateEnum: PaymentMethod
CREATE TYPE "PaymentMethod" AS ENUM ('cash', 'mobile_money', 'bank_transfer');

-- CreateTable: MCC Payments
CREATE TABLE "mcc_payments" (
    "id" TEXT NOT NULL,
    "farmerId" TEXT NOT NULL,
    "collectionId" TEXT NOT NULL,
    "mccId" TEXT NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "deductions" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "advances" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "netPayment" DOUBLE PRECISION NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'pending',
    "paymentDate" TIMESTAMP(3) NOT NULL,
    "processedBy" TEXT NOT NULL,
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mcc_payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: MCC Payments
CREATE INDEX "mcc_payments_farmerId_idx" ON "mcc_payments"("farmerId");
CREATE INDEX "mcc_payments_collectionId_idx" ON "mcc_payments"("collectionId");
CREATE INDEX "mcc_payments_mccId_idx" ON "mcc_payments"("mccId");
CREATE INDEX "mcc_payments_paymentDate_idx" ON "mcc_payments"("paymentDate");
CREATE INDEX "mcc_payments_paymentStatus_idx" ON "mcc_payments"("paymentStatus");

-- AddForeignKey: MCC Payments
ALTER TABLE "mcc_payments" ADD CONSTRAINT "mcc_payments_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "farmers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "mcc_payments" ADD CONSTRAINT "mcc_payments_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "milk_collections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "mcc_payments" ADD CONSTRAINT "mcc_payments_mccId_fkey" FOREIGN KEY ("mccId") REFERENCES "mccs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
