-- Phase 9: Exports, Reporting, and Audit governance persistence

CREATE TABLE "soroma_export_jobs" (
  "id" TEXT NOT NULL,
  "workspaceType" "SoromaWorkspaceType" NOT NULL,
  "tenantId" TEXT,
  "requestedById" TEXT,
  "dataset" TEXT NOT NULL,
  "format" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "filters" JSONB,
  "rowCount" INTEGER,
  "summary" JSONB,
  "startedAt" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),
  "errorMessage" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "soroma_export_jobs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "soroma_report_schedules" (
  "id" TEXT NOT NULL,
  "workspaceType" "SoromaWorkspaceType" NOT NULL,
  "tenantId" TEXT,
  "createdById" TEXT,
  "name" TEXT NOT NULL,
  "dataset" TEXT NOT NULL,
  "format" TEXT NOT NULL,
  "cadence" TEXT NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "filters" JSONB,
  "nextRunAt" TIMESTAMP(3) NOT NULL,
  "lastRunAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "soroma_report_schedules_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "soroma_export_jobs_workspaceType_status_idx"
ON "soroma_export_jobs"("workspaceType", "status");

CREATE INDEX "soroma_export_jobs_tenantId_idx"
ON "soroma_export_jobs"("tenantId");

CREATE INDEX "soroma_export_jobs_createdAt_idx"
ON "soroma_export_jobs"("createdAt");

CREATE INDEX "soroma_report_schedules_workspaceType_isActive_idx"
ON "soroma_report_schedules"("workspaceType", "isActive");

CREATE INDEX "soroma_report_schedules_tenantId_isActive_idx"
ON "soroma_report_schedules"("tenantId", "isActive");

CREATE INDEX "soroma_report_schedules_nextRunAt_idx"
ON "soroma_report_schedules"("nextRunAt");

ALTER TABLE "soroma_export_jobs"
ADD CONSTRAINT "soroma_export_jobs_tenantId_fkey"
FOREIGN KEY ("tenantId") REFERENCES "soroma_tenants"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "soroma_report_schedules"
ADD CONSTRAINT "soroma_report_schedules_tenantId_fkey"
FOREIGN KEY ("tenantId") REFERENCES "soroma_tenants"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
