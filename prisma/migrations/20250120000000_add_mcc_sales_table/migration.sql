-- Migration: Add MCC Sales Table
-- This migration adds the mcc_sales table to track milk sales to companies

-- CreateEnum: PaymentStatus (only if it doesn't exist)
DO $$ BEGIN
    CREATE TYPE "PaymentStatus" AS ENUM ('pending', 'paid', 'partial');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateTable: MCC Sales (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS "mcc_sales" (
    "id" TEXT NOT NULL,
    "mccId" TEXT NOT NULL,
    "litersSold" DOUBLE PRECISION NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "companyName" TEXT NOT NULL,
    "companyContact" TEXT NOT NULL,
    "companyAddress" TEXT NOT NULL DEFAULT '',
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'pending',
    "saleDate" TIMESTAMP(3) NOT NULL,
    "notes" TEXT NOT NULL DEFAULT '',
    "recordedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mcc_sales_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: MCC Sales (only if they don't exist)
CREATE INDEX IF NOT EXISTS "mcc_sales_mccId_idx" ON "mcc_sales"("mccId");
CREATE INDEX IF NOT EXISTS "mcc_sales_saleDate_idx" ON "mcc_sales"("saleDate");
CREATE INDEX IF NOT EXISTS "mcc_sales_paymentStatus_idx" ON "mcc_sales"("paymentStatus");
CREATE INDEX IF NOT EXISTS "mcc_sales_companyName_idx" ON "mcc_sales"("companyName");





