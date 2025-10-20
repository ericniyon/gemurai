/*
  Warnings:

  - You are about to drop the column `overallComment` on the `application_evaluations` table. All the data in the column will be lost.
  - You are about to drop the column `overallScore` on the `application_evaluations` table. All the data in the column will be lost.
  - You are about to drop the column `questions` on the `application_evaluations` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `application_evaluations` table. All the data in the column will be lost.
  - You are about to drop the `stock_orders` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `feedback` to the `application_evaluations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `score` to the `application_evaluations` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "application_evaluations" DROP CONSTRAINT "application_evaluations_applicationId_fkey";

-- DropForeignKey
ALTER TABLE "stock_orders" DROP CONSTRAINT "stock_orders_approvedById_fkey";

-- DropForeignKey
ALTER TABLE "stock_orders" DROP CONSTRAINT "stock_orders_completedById_fkey";

-- DropForeignKey
ALTER TABLE "stock_orders" DROP CONSTRAINT "stock_orders_paymentConfirmedById_fkey";

-- DropForeignKey
ALTER TABLE "stock_orders" DROP CONSTRAINT "stock_orders_productId_fkey";

-- DropForeignKey
ALTER TABLE "stock_orders" DROP CONSTRAINT "stock_orders_rejectedById_fkey";

-- DropForeignKey
ALTER TABLE "stock_orders" DROP CONSTRAINT "stock_orders_requestedById_fkey";

-- AlterTable
ALTER TABLE "application_evaluations" DROP COLUMN "overallComment",
DROP COLUMN "overallScore",
DROP COLUMN "questions",
DROP COLUMN "status",
ADD COLUMN     "feedback" TEXT NOT NULL,
ADD COLUMN     "improvements" TEXT[],
ADD COLUMN     "questionScores" JSONB,
ADD COLUMN     "score" INTEGER NOT NULL,
ADD COLUMN     "strengths" TEXT[],
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'MANUAL';

-- DropTable
DROP TABLE "stock_orders";

-- CreateTable
CREATE TABLE "StockOrder" (
    "id" TEXT NOT NULL,
    "dccId" TEXT NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "requestDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estimatedDelivery" TIMESTAMP(3),
    "notes" TEXT,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "rejectedBy" TEXT,
    "rejectedAt" TIMESTAMP(3),
    "paymentConfirmedBy" TEXT,
    "paymentConfirmedAt" TIMESTAMP(3),
    "completedBy" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StockOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockOrderProduct" (
    "id" TEXT NOT NULL,
    "stockOrderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "currentStock" INTEGER NOT NULL,
    "requestedStock" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StockOrderProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "stockOrderId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "method" TEXT,
    "reference" TEXT,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "form_configs" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "sections" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "form_configs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StockOrder_dccId_idx" ON "StockOrder"("dccId");

-- CreateIndex
CREATE INDEX "StockOrder_status_idx" ON "StockOrder"("status");

-- CreateIndex
CREATE INDEX "StockOrder_priority_idx" ON "StockOrder"("priority");

-- CreateIndex
CREATE INDEX "StockOrderProduct_stockOrderId_idx" ON "StockOrderProduct"("stockOrderId");

-- CreateIndex
CREATE INDEX "StockOrderProduct_productId_idx" ON "StockOrderProduct"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_stockOrderId_key" ON "Payment"("stockOrderId");

-- CreateIndex
CREATE INDEX "Payment_status_idx" ON "Payment"("status");

-- CreateIndex
CREATE INDEX "application_evaluations_applicationId_idx" ON "application_evaluations"("applicationId");

-- CreateIndex
CREATE INDEX "application_evaluations_evaluatorId_idx" ON "application_evaluations"("evaluatorId");

-- CreateIndex
CREATE INDEX "applications_userId_idx" ON "applications"("userId");

-- AddForeignKey
ALTER TABLE "application_evaluations" ADD CONSTRAINT "application_evaluations_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "applications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockOrder" ADD CONSTRAINT "StockOrder_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockOrder" ADD CONSTRAINT "StockOrder_completedBy_fkey" FOREIGN KEY ("completedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockOrder" ADD CONSTRAINT "StockOrder_dccId_fkey" FOREIGN KEY ("dccId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockOrder" ADD CONSTRAINT "StockOrder_paymentConfirmedBy_fkey" FOREIGN KEY ("paymentConfirmedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockOrder" ADD CONSTRAINT "StockOrder_rejectedBy_fkey" FOREIGN KEY ("rejectedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockOrderProduct" ADD CONSTRAINT "StockOrderProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockOrderProduct" ADD CONSTRAINT "StockOrderProduct_stockOrderId_fkey" FOREIGN KEY ("stockOrderId") REFERENCES "StockOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_stockOrderId_fkey" FOREIGN KEY ("stockOrderId") REFERENCES "StockOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
