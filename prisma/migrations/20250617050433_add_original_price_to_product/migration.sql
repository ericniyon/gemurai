/*
  Warnings:

  - You are about to drop the column `businessAddress` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `businessName` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `businessRegistrationNumber` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `isVerified` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `StockOrder` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "StockOrder" DROP CONSTRAINT "StockOrder_productId_fkey";

-- DropForeignKey
ALTER TABLE "StockOrder" DROP CONSTRAINT "StockOrder_requestedById_fkey";

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "originalPrice" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "businessAddress",
DROP COLUMN "businessName",
DROP COLUMN "businessRegistrationNumber",
DROP COLUMN "isVerified";

-- DropTable
DROP TABLE "StockOrder";
