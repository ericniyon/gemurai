/*
  Warnings:

  - You are about to drop the column `employerId` on the `products` table. All the data in the column will be lost.
  - Added the required column `sellerId` to the `products` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "products" DROP CONSTRAINT "products_employerId_fkey";

-- AlterTable
ALTER TABLE "products" DROP COLUMN "employerId",
ADD COLUMN     "images" TEXT[],
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "sellerId" TEXT NOT NULL,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'active',
ADD COLUMN     "stock" INTEGER NOT NULL DEFAULT 0;
