-- CreateTable
CREATE TABLE IF NOT EXISTS "quality_audit_log" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "commodityId" TEXT,
    "collectionId" TEXT,
    "action" TEXT NOT NULL,
    "oldValue" JSONB,
    "newValue" JSONB,
    "userId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quality_audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "quality_audit_log_entityType_idx" ON "quality_audit_log"("entityType");
CREATE INDEX IF NOT EXISTS "quality_audit_log_entityId_idx" ON "quality_audit_log"("entityId");
CREATE INDEX IF NOT EXISTS "quality_audit_log_commodityId_idx" ON "quality_audit_log"("commodityId");
CREATE INDEX IF NOT EXISTS "quality_audit_log_createdAt_idx" ON "quality_audit_log"("createdAt");
