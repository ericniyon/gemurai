-- Create interview_scores_complete table
CREATE TABLE IF NOT EXISTS "public"."interview_scores_complete" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "totalScore" DOUBLE PRECISION NOT NULL,
    "totalPossibleScore" DOUBLE PRECISION NOT NULL,
    "scores" JSONB NOT NULL,
    "subScores" JSONB,
    "sections" JSONB NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "interview_scores_complete_pkey" PRIMARY KEY ("id")
);

-- Create unique constraint on applicationId
CREATE UNIQUE INDEX IF NOT EXISTS "interview_scores_complete_applicationId_key" ON "public"."interview_scores_complete"("applicationId");

-- Add foreign key constraint
ALTER TABLE "public"."interview_scores_complete" ADD CONSTRAINT "interview_scores_complete_applicationId_fkey" 
FOREIGN KEY ("applicationId") REFERENCES "public"."applications"("id") ON DELETE CASCADE ON UPDATE CASCADE; 