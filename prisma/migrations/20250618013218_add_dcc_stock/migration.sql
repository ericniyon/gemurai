/*
  Warnings:

  - You are about to drop the column `orderId` on the `order_items` table. All the data in the column will be lost.
  - You are about to drop the column `barcode` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `originalPrice` on the `products` table. All the data in the column will be lost.
  - The `certifications` column on the `products` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- DropIndex
DROP INDEX "products_barcode_key";

-- AlterTable
ALTER TABLE "order_items" DROP COLUMN "orderId";

-- AlterTable
ALTER TABLE "products" DROP COLUMN "barcode",
DROP COLUMN "originalPrice",
DROP COLUMN "certifications",
ADD COLUMN     "certifications" TEXT[],
ALTER COLUMN "minOrderQuantity" DROP NOT NULL,
ALTER COLUMN "minOrderQuantity" DROP DEFAULT;

-- CreateTable
CREATE TABLE "dcc_stocks" (
    "id" TEXT NOT NULL,
    "dccId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dcc_stocks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "dcc_stocks_dccId_productId_key" ON "dcc_stocks"("dccId", "productId");

-- AddForeignKey
ALTER TABLE "dcc_stocks" ADD CONSTRAINT "dcc_stocks_dccId_fkey" FOREIGN KEY ("dccId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dcc_stocks" ADD CONSTRAINT "dcc_stocks_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
