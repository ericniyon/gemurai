-- Training portal: enums and tables only (no changes to farmers, milk_collections, etc.)
-- Run with: npx prisma db execute --file prisma/migrations/20250308_add_training_tables.sql

CREATE TYPE "TrainingTargetRole" AS ENUM ('Farmer', 'Agent', 'QualityOfficer', 'WarehouseOfficer');
CREATE TYPE "TrainingDifficultyLevel" AS ENUM ('Beginner', 'Intermediate', 'Advanced');
CREATE TYPE "TrainingLessonContentType" AS ENUM ('video', 'pdf', 'text', 'image');

CREATE TABLE "training_modules" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "commodityId" TEXT,
    "targetRole" "TrainingTargetRole" NOT NULL,
    "durationMinutes" INTEGER NOT NULL DEFAULT 0,
    "difficultyLevel" "TrainingDifficultyLevel" NOT NULL DEFAULT 'Beginner',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "training_modules_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "training_lessons" (
    "id" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "contentType" "TrainingLessonContentType" NOT NULL,
    "contentUrl" TEXT,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "durationMinutes" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "training_lessons_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "user_training_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_training_progress_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "user_certifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "certificationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiryDate" TIMESTAMP(3),
    "certificateNumber" TEXT NOT NULL,

    CONSTRAINT "user_certifications_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "user_training_progress_userId_moduleId_lessonId_key" ON "user_training_progress"("userId", "moduleId", "lessonId");
CREATE UNIQUE INDEX "user_certifications_certificateNumber_key" ON "user_certifications"("certificateNumber");

CREATE INDEX "training_modules_commodityId_idx" ON "training_modules"("commodityId");
CREATE INDEX "training_modules_targetRole_idx" ON "training_modules"("targetRole");
CREATE INDEX "training_modules_isActive_idx" ON "training_modules"("isActive");
CREATE INDEX "training_modules_isPublic_idx" ON "training_modules"("isPublic");

CREATE INDEX "training_lessons_moduleId_idx" ON "training_lessons"("moduleId");
CREATE INDEX "training_lessons_orderIndex_idx" ON "training_lessons"("orderIndex");

CREATE INDEX "user_training_progress_userId_idx" ON "user_training_progress"("userId");
CREATE INDEX "user_training_progress_moduleId_idx" ON "user_training_progress"("moduleId");

CREATE INDEX "user_certifications_userId_idx" ON "user_certifications"("userId");
CREATE INDEX "user_certifications_moduleId_idx" ON "user_certifications"("moduleId");
CREATE INDEX "user_certifications_certificateNumber_idx" ON "user_certifications"("certificateNumber");

ALTER TABLE "training_modules" ADD CONSTRAINT "training_modules_commodityId_fkey" FOREIGN KEY ("commodityId") REFERENCES "commodities"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "training_lessons" ADD CONSTRAINT "training_lessons_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "training_modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_training_progress" ADD CONSTRAINT "user_training_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_training_progress" ADD CONSTRAINT "user_training_progress_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "training_modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_training_progress" ADD CONSTRAINT "user_training_progress_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "training_lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_certifications" ADD CONSTRAINT "user_certifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_certifications" ADD CONSTRAINT "user_certifications_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "training_modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;
