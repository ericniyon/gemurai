-- CreateTable
CREATE TABLE "application_interviews" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "interviewerId" TEXT NOT NULL,
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "notes" TEXT,
    "interviewNotes" TEXT,
    "overallScore" DOUBLE PRECISION,
    "overallComment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "application_interviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interview_criteria" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "maxScore" INTEGER NOT NULL DEFAULT 10,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "interview_criteria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interview_scores" (
    "id" TEXT NOT NULL,
    "interviewId" TEXT NOT NULL,
    "criteriaId" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "comments" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "interview_scores_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "application_interviews_applicationId_interviewerId_key" ON "application_interviews"("applicationId", "interviewerId");

-- CreateIndex
CREATE UNIQUE INDEX "interview_scores_interviewId_criteriaId_key" ON "interview_scores"("interviewId", "criteriaId");

-- AddForeignKey
ALTER TABLE "application_interviews" ADD CONSTRAINT "application_interviews_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application_interviews" ADD CONSTRAINT "application_interviews_interviewerId_fkey" FOREIGN KEY ("interviewerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_scores" ADD CONSTRAINT "interview_scores_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "application_interviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_scores" ADD CONSTRAINT "interview_scores_criteriaId_fkey" FOREIGN KEY ("criteriaId") REFERENCES "interview_criteria"("id") ON DELETE CASCADE ON UPDATE CASCADE;
