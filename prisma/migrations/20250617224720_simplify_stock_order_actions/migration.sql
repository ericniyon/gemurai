/*
  Warnings:

  - You are about to drop the column `completedAt` on the `stock_orders` table. All the data in the column will be lost.
  - You are about to drop the column `completedById` on the `stock_orders` table. All the data in the column will be lost.
  - You are about to drop the column `rejectedAt` on the `stock_orders` table. All the data in the column will be lost.
  - You are about to drop the column `rejectedById` on the `stock_orders` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "stock_orders" DROP CONSTRAINT "stock_orders_completedById_fkey";

-- DropForeignKey
ALTER TABLE "stock_orders" DROP CONSTRAINT "stock_orders_rejectedById_fkey";

-- AlterTable
ALTER TABLE "stock_orders" DROP COLUMN "completedAt",
DROP COLUMN "completedById",
DROP COLUMN "rejectedAt",
DROP COLUMN "rejectedById";
