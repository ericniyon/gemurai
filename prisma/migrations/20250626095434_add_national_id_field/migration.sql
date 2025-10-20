/*
  Warnings:

  - You are about to drop the `provinces` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[nationalId]` on the table `applications` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "applications" ADD COLUMN     "nationalId" TEXT;

-- DropTable
DROP TABLE "provinces";

-- CreateIndex
CREATE UNIQUE INDEX "applications_nationalId_key" ON "applications"("nationalId");
