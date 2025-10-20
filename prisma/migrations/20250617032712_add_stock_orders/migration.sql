/*
  Warnings:

  - You are about to drop the column `isNew` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `isPopular` on the `products` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "products" DROP COLUMN "isNew",
DROP COLUMN "isPopular";

-- CreateTable
CREATE TABLE "StockOrder" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "requestedById" TEXT NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StockOrder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StockOrder_productId_idx" ON "StockOrder"("productId");

-- CreateIndex
CREATE INDEX "StockOrder_requestedById_idx" ON "StockOrder"("requestedById");

-- AddForeignKey
ALTER TABLE "StockOrder" ADD CONSTRAINT "StockOrder_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockOrder" ADD CONSTRAINT "StockOrder_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
