/*
  Warnings:

  - You are about to drop the column `evaluatedBy` on the `ApplicationEvaluation` table. All the data in the column will be lost.
  - You are about to drop the column `maxScore` on the `ApplicationEvaluation` table. All the data in the column will be lost.
  - Added the required column `evaluatorId` to the `ApplicationEvaluation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `score` to the `ApplicationEvaluation` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ApplicationEvaluation" DROP CONSTRAINT "ApplicationEvaluation_evaluatedBy_fkey";

-- DropIndex
DROP INDEX "ApplicationEvaluation_evaluatedBy_idx";

-- AlterTable
ALTER TABLE "ApplicationEvaluation" DROP COLUMN "evaluatedBy",
DROP COLUMN "maxScore",
ADD COLUMN     "evaluatorId" TEXT NOT NULL,
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "questionScores" JSONB,
ADD COLUMN     "score" DOUBLE PRECISION NOT NULL,
ALTER COLUMN "overallLevel" DROP NOT NULL,
ALTER COLUMN "recommendations" DROP NOT NULL,
ALTER COLUMN "scores" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "ApplicationEvaluation_evaluatorId_idx" ON "ApplicationEvaluation"("evaluatorId");

-- AddForeignKey
ALTER TABLE "ApplicationEvaluation" ADD CONSTRAINT "ApplicationEvaluation_evaluatorId_fkey" FOREIGN KEY ("evaluatorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
