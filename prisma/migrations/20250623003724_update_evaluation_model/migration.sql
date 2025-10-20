/*
  Warnings:

  - You are about to drop the column `evaluatorId` on the `ApplicationEvaluation` table. All the data in the column will be lost.
  - You are about to drop the column `metadata` on the `ApplicationEvaluation` table. All the data in the column will be lost.
  - You are about to drop the column `questionScores` on the `ApplicationEvaluation` table. All the data in the column will be lost.
  - You are about to drop the column `score` on the `ApplicationEvaluation` table. All the data in the column will be lost.
  - Added the required column `evaluatedBy` to the `ApplicationEvaluation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `maxScore` to the `ApplicationEvaluation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `overallLevel` to the `ApplicationEvaluation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recommendations` to the `ApplicationEvaluation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `scores` to the `ApplicationEvaluation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalScore` to the `ApplicationEvaluation` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ApplicationEvaluation" DROP CONSTRAINT "ApplicationEvaluation_evaluatorId_fkey";

-- DropIndex
DROP INDEX "ApplicationEvaluation_evaluatorId_idx";

-- AlterTable
ALTER TABLE "ApplicationEvaluation" DROP COLUMN "evaluatorId",
DROP COLUMN "metadata",
DROP COLUMN "questionScores",
DROP COLUMN "score",
ADD COLUMN     "evaluatedBy" TEXT NOT NULL,
ADD COLUMN     "maxScore" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "overallLevel" TEXT NOT NULL,
ADD COLUMN     "recommendations" JSONB NOT NULL,
ADD COLUMN     "scores" JSONB NOT NULL,
ADD COLUMN     "totalScore" DOUBLE PRECISION NOT NULL,
ALTER COLUMN "type" SET DEFAULT 'VULNERABILITY';

-- CreateIndex
CREATE INDEX "ApplicationEvaluation_evaluatedBy_idx" ON "ApplicationEvaluation"("evaluatedBy");

-- AddForeignKey
ALTER TABLE "ApplicationEvaluation" ADD CONSTRAINT "ApplicationEvaluation_evaluatedBy_fkey" FOREIGN KEY ("evaluatedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
