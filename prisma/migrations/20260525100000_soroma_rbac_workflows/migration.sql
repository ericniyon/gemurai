-- SOROMA Phase 2.1 RBAC + Phase 3 workflow enums (additive)

-- Batch status extensions
ALTER TYPE "SoromaBatchStatus" ADD VALUE IF NOT EXISTS 'STARTED';
ALTER TYPE "SoromaBatchStatus" ADD VALUE IF NOT EXISTS 'QC_REVIEW';
ALTER TYPE "SoromaBatchStatus" ADD VALUE IF NOT EXISTS 'ARCHIVED';

-- Shipment status extensions
ALTER TYPE "SoromaShipmentStatus" ADD VALUE IF NOT EXISTS 'ASSIGNED';
ALTER TYPE "SoromaShipmentStatus" ADD VALUE IF NOT EXISTS 'POD_RECEIVED';
ALTER TYPE "SoromaShipmentStatus" ADD VALUE IF NOT EXISTS 'CLOSED';

CREATE TABLE IF NOT EXISTS "soroma_permissions" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL DEFAULT 'GENERAL',
    "workspace" TEXT NOT NULL DEFAULT 'BOTH',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "soroma_permissions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "soroma_permissions_key_key" ON "soroma_permissions"("key");

CREATE TABLE IF NOT EXISTS "soroma_roles" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "workspace" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "soroma_roles_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "soroma_roles_key_key" ON "soroma_roles"("key");

CREATE TABLE IF NOT EXISTS "soroma_role_permissions" (
    "id" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,
    CONSTRAINT "soroma_role_permissions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "soroma_role_permissions_roleId_permissionId_key" ON "soroma_role_permissions"("roleId", "permissionId");

ALTER TABLE "soroma_role_permissions" ADD CONSTRAINT "soroma_role_permissions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "soroma_roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "soroma_role_permissions" ADD CONSTRAINT "soroma_role_permissions_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "soroma_permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "soroma_workflow_events" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "fromStatus" TEXT,
    "toStatus" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "userId" TEXT,
    "comment" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "soroma_workflow_events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "soroma_workflow_events_tenantId_idx" ON "soroma_workflow_events"("tenantId");
CREATE INDEX IF NOT EXISTS "soroma_workflow_events_entityType_entityId_idx" ON "soroma_workflow_events"("entityType", "entityId");
CREATE INDEX IF NOT EXISTS "soroma_workflow_events_createdAt_idx" ON "soroma_workflow_events"("createdAt");
