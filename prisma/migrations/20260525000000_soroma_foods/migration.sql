-- CreateEnum
CREATE TYPE "SoromaWorkspaceType" AS ENUM ('PLATFORM', 'TENANT');
-- CreateEnum
CREATE TYPE "SoromaTenantStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'ONBOARDING', 'INACTIVE');
-- CreateEnum
CREATE TYPE "SoromaSupplierType" AS ENUM ('COOPERATIVE', 'SMALLHOLDER_GROUP', 'COMPANY', 'INDIVIDUAL');
-- CreateEnum
CREATE TYPE "SoromaPOStatus" AS ENUM ('REQUESTED', 'RFQ_SENT', 'AWAITING_APPROVAL', 'APPROVED', 'PARTIALLY_RECEIVED', 'CLOSED', 'CANCELLED');
-- CreateEnum
CREATE TYPE "SoromaBatchStatus" AS ENUM ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD', 'CANCELLED');
-- CreateEnum
CREATE TYPE "SoromaOrderStatus" AS ENUM ('DRAFT', 'QUOTED', 'CONFIRMED', 'IN_FULFILLMENT', 'SHIPPED', 'DELIVERED', 'CANCELLED');
-- CreateEnum
CREATE TYPE "SoromaShipmentStatus" AS ENUM ('PLANNED', 'IN_TRANSIT', 'DELIVERED', 'DELAYED', 'CANCELLED');
-- CreateEnum
CREATE TYPE "SoromaPassportStatus" AS ENUM ('DRAFT', 'ISSUED', 'REVOKED', 'RECALLED');
-- CreateEnum
CREATE TYPE "SoromaAlertSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
-- CreateEnum
CREATE TYPE "SoromaAlertStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');
-- CreateEnum
CREATE TYPE "SoromaConnectorStatus" AS ENUM ('CONNECTED', 'PARTIAL', 'DOWN', 'PENDING');
-- CreateEnum
CREATE TYPE "SoromaOnboardingStage" AS ENUM ('APPLICATION_RECEIVED', 'UNDER_REVIEW', 'ASSESSMENT', 'SETUP', 'COMPLETED', 'REJECTED');
-- CreateTable
CREATE TABLE "soroma_tenants" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logo" TEXT,
    "country" TEXT NOT NULL DEFAULT 'RW',
    "currency" TEXT NOT NULL DEFAULT 'RWF',
    "timezone" TEXT NOT NULL DEFAULT 'Africa/Kigali',
    "valueChain" TEXT,
    "status" "SoromaTenantStatus" NOT NULL DEFAULT 'ONBOARDING',
    "onboardingStage" "SoromaOnboardingStage" NOT NULL DEFAULT 'APPLICATION_RECEIVED',
    "complianceScore" DOUBLE PRECISION,
    "district" TEXT,
    "region" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "soroma_tenants_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "soroma_tenant_memberships" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "soroma_tenant_memberships_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "soroma_platform_memberships" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "soroma_platform_memberships_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "soroma_suppliers" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "SoromaSupplierType" NOT NULL DEFAULT 'COMPANY',
    "commodity" TEXT,
    "district" TEXT,
    "contactPhone" TEXT,
    "contactEmail" TEXT,
    "qualityScore" DOUBLE PRECISION,
    "complianceStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "gpsLatitude" DOUBLE PRECISION,
    "gpsLongitude" DOUBLE PRECISION,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "soroma_suppliers_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "soroma_supplier_issues" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "severity" "SoromaAlertSeverity" NOT NULL DEFAULT 'MEDIUM',
    "status" "SoromaAlertStatus" NOT NULL DEFAULT 'OPEN',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "soroma_supplier_issues_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "soroma_purchase_orders" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "poNumber" TEXT NOT NULL,
    "commodity" TEXT,
    "orderDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deliveryDate" TIMESTAMP(3),
    "amount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'RWF',
    "status" "SoromaPOStatus" NOT NULL DEFAULT 'REQUESTED',
    "notes" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "soroma_purchase_orders_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "soroma_purchase_order_lines" (
    "id" TEXT NOT NULL,
    "purchaseOrderId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'kg',
    "unitPrice" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "lineTotal" DECIMAL(18,2) NOT NULL DEFAULT 0,

    CONSTRAINT "soroma_purchase_order_lines_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "soroma_raw_material_lots" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "supplierId" TEXT,
    "purchaseOrderId" TEXT,
    "lotNumber" TEXT NOT NULL,
    "commodity" TEXT,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'kg',
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiryDate" TIMESTAMP(3),
    "qcStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "soroma_raw_material_lots_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "soroma_production_lines" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "soroma_production_lines_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "soroma_production_batches" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "batchNumber" TEXT NOT NULL,
    "productName" TEXT,
    "lineId" TEXT,
    "status" "SoromaBatchStatus" NOT NULL DEFAULT 'PLANNED',
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "outputQty" DOUBLE PRECISION,
    "expectedQty" DOUBLE PRECISION,
    "yieldPct" DOUBLE PRECISION,
    "wastagePct" DOUBLE PRECISION,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "soroma_production_batches_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "soroma_batch_material_inputs" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "rawMaterialLotId" TEXT NOT NULL,
    "quantityUsed" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "soroma_batch_material_inputs_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "soroma_downtime_events" (
    "id" TEXT NOT NULL,
    "batchId" TEXT,
    "lineId" TEXT,
    "reason" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "minutes" INTEGER,

    CONSTRAINT "soroma_downtime_events_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "soroma_qc_exceptions" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "testType" TEXT NOT NULL,
    "result" TEXT NOT NULL,
    "severity" "SoromaAlertSeverity" NOT NULL DEFAULT 'MEDIUM',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "soroma_qc_exceptions_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "soroma_warehouses" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "capacity" DOUBLE PRECISION,
    "utilizationPct" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "soroma_warehouses_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "soroma_stock_lots" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "warehouseId" TEXT,
    "skuCode" TEXT NOT NULL,
    "skuName" TEXT NOT NULL,
    "category" TEXT,
    "quantity" DOUBLE PRECISION NOT NULL,
    "availableQty" DOUBLE PRECISION NOT NULL,
    "committedQty" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "unit" TEXT NOT NULL DEFAULT 'units',
    "expiryDate" TIMESTAMP(3),
    "batchId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "soroma_stock_lots_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "soroma_finished_sku_lots" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "skuCode" TEXT NOT NULL,
    "skuName" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "stockLotId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "soroma_finished_sku_lots_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "soroma_stock_movements" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "stockLotId" TEXT NOT NULL,
    "movementType" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "source" TEXT,
    "destination" TEXT,
    "reference" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "soroma_stock_movements_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "soroma_buyers" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "segment" TEXT,
    "location" TEXT,
    "district" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "contractStatus" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "soroma_buyers_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "soroma_customer_issues" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "severity" "SoromaAlertSeverity" NOT NULL DEFAULT 'MEDIUM',
    "status" "SoromaAlertStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "soroma_customer_issues_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "soroma_orders" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "orderDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "amount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'RWF',
    "status" "SoromaOrderStatus" NOT NULL DEFAULT 'DRAFT',
    "fulfillmentStatus" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "soroma_orders_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "soroma_order_lines" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "skuCode" TEXT NOT NULL,
    "skuName" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unitPrice" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "lineTotal" DECIMAL(18,2) NOT NULL DEFAULT 0,

    CONSTRAINT "soroma_order_lines_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "soroma_shipments" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "orderId" TEXT,
    "shipmentNumber" TEXT NOT NULL,
    "vehicleId" TEXT,
    "driverName" TEXT,
    "routeName" TEXT,
    "status" "SoromaShipmentStatus" NOT NULL DEFAULT 'PLANNED',
    "dispatchAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "podStatus" TEXT,
    "costAmount" DECIMAL(18,2),
    "currency" TEXT NOT NULL DEFAULT 'RWF',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "soroma_shipments_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "soroma_delivery_stops" (
    "id" TEXT NOT NULL,
    "shipmentId" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "location" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PLANNED',
    "arrivedAt" TIMESTAMP(3),

    CONSTRAINT "soroma_delivery_stops_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "soroma_logistics_exceptions" (
    "id" TEXT NOT NULL,
    "shipmentId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "severity" "SoromaAlertSeverity" NOT NULL DEFAULT 'MEDIUM',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "soroma_logistics_exceptions_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "soroma_passports" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "passportNo" TEXT NOT NULL,
    "batchId" TEXT,
    "skuLotId" TEXT,
    "status" "SoromaPassportStatus" NOT NULL DEFAULT 'DRAFT',
    "version" INTEGER NOT NULL DEFAULT 1,
    "qrCode" TEXT,
    "issuedAt" TIMESTAMP(3),
    "issuedById" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "soroma_passports_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "soroma_traceability_events" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "passportId" TEXT,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "soroma_traceability_events_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "soroma_passport_scans" (
    "id" TEXT NOT NULL,
    "passportId" TEXT NOT NULL,
    "scannedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "location" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,

    CONSTRAINT "soroma_passport_scans_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "soroma_passport_documents" (
    "id" TEXT NOT NULL,
    "passportId" TEXT NOT NULL,
    "docType" TEXT NOT NULL,
    "fileUrl" TEXT,
    "fileName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "soroma_passport_documents_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "soroma_certifications" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "supplierId" TEXT,
    "standard" TEXT NOT NULL,
    "certificateNo" TEXT,
    "issueDate" TIMESTAMP(3),
    "expiryDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "documentUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "soroma_certifications_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "soroma_audits" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "auditType" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "result" TEXT,
    "score" DOUBLE PRECISION,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "soroma_audits_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "soroma_capas" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "ownerId" TEXT,
    "dueDate" TIMESTAMP(3),
    "status" "SoromaAlertStatus" NOT NULL DEFAULT 'OPEN',
    "severity" "SoromaAlertSeverity" NOT NULL DEFAULT 'MEDIUM',
    "evidenceUrl" TEXT,
    "closedAt" TIMESTAMP(3),
    "closedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "soroma_capas_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "soroma_qc_tests" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "batchId" TEXT,
    "testType" TEXT NOT NULL,
    "result" TEXT NOT NULL,
    "passed" BOOLEAN NOT NULL,
    "testedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "soroma_qc_tests_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "soroma_connectors" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "authMethod" TEXT,
    "capabilities" JSONB,
    "status" "SoromaConnectorStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "soroma_connectors_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "soroma_tenant_connections" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "connectorId" TEXT NOT NULL,
    "externalAccountId" TEXT,
    "status" "SoromaConnectorStatus" NOT NULL DEFAULT 'PENDING',
    "lastSyncAt" TIMESTAMP(3),
    "successRate" DOUBLE PRECISION,
    "config" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "soroma_tenant_connections_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "soroma_product_mappings" (
    "id" TEXT NOT NULL,
    "connectionId" TEXT NOT NULL,
    "internalSku" TEXT NOT NULL,
    "externalSku" TEXT,
    "syncStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "lastSyncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "soroma_product_mappings_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "soroma_sync_jobs" (
    "id" TEXT NOT NULL,
    "connectionId" TEXT NOT NULL,
    "jobType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "soroma_sync_jobs_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "soroma_sync_logs" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "soroma_sync_logs_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "soroma_programs" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "year" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "soroma_programs_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "soroma_program_indicators" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "unit" TEXT,
    "targetValue" DOUBLE PRECISION,
    "sourceRule" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "soroma_program_indicators_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "soroma_program_targets" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "targetValue" DOUBLE PRECISION NOT NULL,
    "actualValue" DOUBLE PRECISION,
    "status" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "soroma_program_targets_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "soroma_indicator_values" (
    "id" TEXT NOT NULL,
    "indicatorId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "soroma_indicator_values_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "soroma_onboarding_applications" (
    "id" TEXT NOT NULL,
    "orgName" TEXT NOT NULL,
    "contactName" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "valueChain" TEXT,
    "district" TEXT,
    "stage" "SoromaOnboardingStage" NOT NULL DEFAULT 'APPLICATION_RECEIVED',
    "assignedToId" TEXT,
    "tenantId" TEXT,
    "documents" JSONB,
    "slaDueAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "soroma_onboarding_applications_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "soroma_alerts" (
    "id" TEXT NOT NULL,
    "scope" "SoromaWorkspaceType" NOT NULL,
    "tenantId" TEXT,
    "severity" "SoromaAlertSeverity" NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" "SoromaAlertStatus" NOT NULL DEFAULT 'OPEN',
    "assignedToId" TEXT,
    "entityType" TEXT,
    "entityId" TEXT,
    "metadata" JSONB,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "soroma_alerts_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "soroma_finance_records" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "recordType" TEXT NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'RWF',
    "reference" TEXT,
    "batchId" TEXT,
    "orderId" TEXT,
    "dueDate" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "soroma_finance_records_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "soroma_invoices" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "invoiceNo" TEXT NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'RWF',
    "dueDate" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "soroma_invoices_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "soroma_audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "tenantId" TEXT,
    "workspaceType" "SoromaWorkspaceType",
    "action" TEXT NOT NULL,
    "entityType" TEXT,
    "entityId" TEXT,
    "beforeState" JSONB,
    "afterState" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "soroma_audit_logs_pkey" PRIMARY KEY ("id")
);
-- CreateIndex
CREATE UNIQUE INDEX "soroma_tenants_slug_key" ON "soroma_tenants"("slug");
-- CreateIndex
CREATE INDEX "soroma_tenants_status_idx" ON "soroma_tenants"("status");
-- CreateIndex
CREATE INDEX "soroma_tenants_country_idx" ON "soroma_tenants"("country");
-- CreateIndex
CREATE INDEX "soroma_tenant_memberships_tenantId_idx" ON "soroma_tenant_memberships"("tenantId");
-- CreateIndex
CREATE INDEX "soroma_tenant_memberships_userId_idx" ON "soroma_tenant_memberships"("userId");
-- CreateIndex
CREATE UNIQUE INDEX "soroma_tenant_memberships_userId_tenantId_key" ON "soroma_tenant_memberships"("userId", "tenantId");
-- CreateIndex
CREATE UNIQUE INDEX "soroma_platform_memberships_userId_key" ON "soroma_platform_memberships"("userId");
-- CreateIndex
CREATE INDEX "soroma_suppliers_tenantId_idx" ON "soroma_suppliers"("tenantId");
-- CreateIndex
CREATE INDEX "soroma_suppliers_status_idx" ON "soroma_suppliers"("status");
-- CreateIndex
CREATE INDEX "soroma_supplier_issues_tenantId_idx" ON "soroma_supplier_issues"("tenantId");
-- CreateIndex
CREATE INDEX "soroma_supplier_issues_supplierId_idx" ON "soroma_supplier_issues"("supplierId");
-- CreateIndex
CREATE INDEX "soroma_purchase_orders_tenantId_idx" ON "soroma_purchase_orders"("tenantId");
-- CreateIndex
CREATE INDEX "soroma_purchase_orders_status_idx" ON "soroma_purchase_orders"("status");
-- CreateIndex
CREATE UNIQUE INDEX "soroma_purchase_orders_tenantId_poNumber_key" ON "soroma_purchase_orders"("tenantId", "poNumber");
-- CreateIndex
CREATE INDEX "soroma_purchase_order_lines_purchaseOrderId_idx" ON "soroma_purchase_order_lines"("purchaseOrderId");
-- CreateIndex
CREATE INDEX "soroma_raw_material_lots_tenantId_idx" ON "soroma_raw_material_lots"("tenantId");
-- CreateIndex
CREATE UNIQUE INDEX "soroma_raw_material_lots_tenantId_lotNumber_key" ON "soroma_raw_material_lots"("tenantId", "lotNumber");
-- CreateIndex
CREATE INDEX "soroma_production_lines_tenantId_idx" ON "soroma_production_lines"("tenantId");
-- CreateIndex
CREATE INDEX "soroma_production_batches_tenantId_idx" ON "soroma_production_batches"("tenantId");
-- CreateIndex
CREATE INDEX "soroma_production_batches_status_idx" ON "soroma_production_batches"("status");
-- CreateIndex
CREATE UNIQUE INDEX "soroma_production_batches_tenantId_batchNumber_key" ON "soroma_production_batches"("tenantId", "batchNumber");
-- CreateIndex
CREATE INDEX "soroma_batch_material_inputs_batchId_idx" ON "soroma_batch_material_inputs"("batchId");
-- CreateIndex
CREATE INDEX "soroma_downtime_events_batchId_idx" ON "soroma_downtime_events"("batchId");
-- CreateIndex
CREATE INDEX "soroma_qc_exceptions_batchId_idx" ON "soroma_qc_exceptions"("batchId");
-- CreateIndex
CREATE INDEX "soroma_warehouses_tenantId_idx" ON "soroma_warehouses"("tenantId");
-- CreateIndex
CREATE INDEX "soroma_stock_lots_tenantId_idx" ON "soroma_stock_lots"("tenantId");
-- CreateIndex
CREATE INDEX "soroma_stock_lots_warehouseId_idx" ON "soroma_stock_lots"("warehouseId");
-- CreateIndex
CREATE INDEX "soroma_stock_lots_category_idx" ON "soroma_stock_lots"("category");
-- CreateIndex
CREATE UNIQUE INDEX "soroma_finished_sku_lots_stockLotId_key" ON "soroma_finished_sku_lots"("stockLotId");
-- CreateIndex
CREATE INDEX "soroma_finished_sku_lots_tenantId_idx" ON "soroma_finished_sku_lots"("tenantId");
-- CreateIndex
CREATE INDEX "soroma_finished_sku_lots_batchId_idx" ON "soroma_finished_sku_lots"("batchId");
-- CreateIndex
CREATE INDEX "soroma_stock_movements_tenantId_idx" ON "soroma_stock_movements"("tenantId");
-- CreateIndex
CREATE INDEX "soroma_stock_movements_stockLotId_idx" ON "soroma_stock_movements"("stockLotId");
-- CreateIndex
CREATE INDEX "soroma_buyers_tenantId_idx" ON "soroma_buyers"("tenantId");
-- CreateIndex
CREATE INDEX "soroma_customer_issues_tenantId_idx" ON "soroma_customer_issues"("tenantId");
-- CreateIndex
CREATE INDEX "soroma_orders_tenantId_idx" ON "soroma_orders"("tenantId");
-- CreateIndex
CREATE INDEX "soroma_orders_status_idx" ON "soroma_orders"("status");
-- CreateIndex
CREATE UNIQUE INDEX "soroma_orders_tenantId_orderNumber_key" ON "soroma_orders"("tenantId", "orderNumber");
-- CreateIndex
CREATE INDEX "soroma_order_lines_orderId_idx" ON "soroma_order_lines"("orderId");
-- CreateIndex
CREATE INDEX "soroma_shipments_tenantId_idx" ON "soroma_shipments"("tenantId");
-- CreateIndex
CREATE INDEX "soroma_shipments_status_idx" ON "soroma_shipments"("status");
-- CreateIndex
CREATE UNIQUE INDEX "soroma_shipments_tenantId_shipmentNumber_key" ON "soroma_shipments"("tenantId", "shipmentNumber");
-- CreateIndex
CREATE INDEX "soroma_delivery_stops_shipmentId_idx" ON "soroma_delivery_stops"("shipmentId");
-- CreateIndex
CREATE INDEX "soroma_logistics_exceptions_shipmentId_idx" ON "soroma_logistics_exceptions"("shipmentId");
-- CreateIndex
CREATE INDEX "soroma_passports_tenantId_idx" ON "soroma_passports"("tenantId");
-- CreateIndex
CREATE INDEX "soroma_passports_status_idx" ON "soroma_passports"("status");
-- CreateIndex
CREATE UNIQUE INDEX "soroma_passports_tenantId_passportNo_key" ON "soroma_passports"("tenantId", "passportNo");
-- CreateIndex
CREATE INDEX "soroma_traceability_events_tenantId_idx" ON "soroma_traceability_events"("tenantId");
-- CreateIndex
CREATE INDEX "soroma_traceability_events_passportId_idx" ON "soroma_traceability_events"("passportId");
-- CreateIndex
CREATE INDEX "soroma_traceability_events_entityType_entityId_idx" ON "soroma_traceability_events"("entityType", "entityId");
-- CreateIndex
CREATE INDEX "soroma_passport_scans_passportId_idx" ON "soroma_passport_scans"("passportId");
-- CreateIndex
CREATE INDEX "soroma_passport_documents_passportId_idx" ON "soroma_passport_documents"("passportId");
-- CreateIndex
CREATE INDEX "soroma_certifications_tenantId_idx" ON "soroma_certifications"("tenantId");
-- CreateIndex
CREATE INDEX "soroma_certifications_expiryDate_idx" ON "soroma_certifications"("expiryDate");
-- CreateIndex
CREATE INDEX "soroma_audits_tenantId_idx" ON "soroma_audits"("tenantId");
-- CreateIndex
CREATE INDEX "soroma_capas_tenantId_idx" ON "soroma_capas"("tenantId");
-- CreateIndex
CREATE INDEX "soroma_capas_status_idx" ON "soroma_capas"("status");
-- CreateIndex
CREATE INDEX "soroma_qc_tests_tenantId_idx" ON "soroma_qc_tests"("tenantId");
-- CreateIndex
CREATE INDEX "soroma_qc_tests_batchId_idx" ON "soroma_qc_tests"("batchId");
-- CreateIndex
CREATE UNIQUE INDEX "soroma_connectors_code_key" ON "soroma_connectors"("code");
-- CreateIndex
CREATE INDEX "soroma_tenant_connections_tenantId_idx" ON "soroma_tenant_connections"("tenantId");
-- CreateIndex
CREATE UNIQUE INDEX "soroma_tenant_connections_tenantId_connectorId_key" ON "soroma_tenant_connections"("tenantId", "connectorId");
-- CreateIndex
CREATE INDEX "soroma_product_mappings_connectionId_idx" ON "soroma_product_mappings"("connectionId");
-- CreateIndex
CREATE INDEX "soroma_sync_jobs_connectionId_idx" ON "soroma_sync_jobs"("connectionId");
-- CreateIndex
CREATE INDEX "soroma_sync_logs_jobId_idx" ON "soroma_sync_logs"("jobId");
-- CreateIndex
CREATE UNIQUE INDEX "soroma_programs_code_key" ON "soroma_programs"("code");
-- CreateIndex
CREATE UNIQUE INDEX "soroma_program_indicators_programId_code_key" ON "soroma_program_indicators"("programId", "code");
-- CreateIndex
CREATE INDEX "soroma_program_targets_programId_idx" ON "soroma_program_targets"("programId");
-- CreateIndex
CREATE INDEX "soroma_indicator_values_indicatorId_idx" ON "soroma_indicator_values"("indicatorId");
-- CreateIndex
CREATE INDEX "soroma_onboarding_applications_stage_idx" ON "soroma_onboarding_applications"("stage");
-- CreateIndex
CREATE INDEX "soroma_alerts_tenantId_idx" ON "soroma_alerts"("tenantId");
-- CreateIndex
CREATE INDEX "soroma_alerts_scope_idx" ON "soroma_alerts"("scope");
-- CreateIndex
CREATE INDEX "soroma_alerts_status_idx" ON "soroma_alerts"("status");
-- CreateIndex
CREATE INDEX "soroma_alerts_severity_idx" ON "soroma_alerts"("severity");
-- CreateIndex
CREATE INDEX "soroma_finance_records_tenantId_idx" ON "soroma_finance_records"("tenantId");
-- CreateIndex
CREATE INDEX "soroma_finance_records_recordType_idx" ON "soroma_finance_records"("recordType");
-- CreateIndex
CREATE INDEX "soroma_invoices_tenantId_idx" ON "soroma_invoices"("tenantId");
-- CreateIndex
CREATE UNIQUE INDEX "soroma_invoices_tenantId_invoiceNo_key" ON "soroma_invoices"("tenantId", "invoiceNo");
-- CreateIndex
CREATE INDEX "soroma_audit_logs_userId_idx" ON "soroma_audit_logs"("userId");
-- CreateIndex
CREATE INDEX "soroma_audit_logs_tenantId_idx" ON "soroma_audit_logs"("tenantId");
-- CreateIndex
CREATE INDEX "soroma_audit_logs_action_idx" ON "soroma_audit_logs"("action");
-- CreateIndex
CREATE INDEX "soroma_audit_logs_createdAt_idx" ON "soroma_audit_logs"("createdAt");
-- AddForeignKey
ALTER TABLE "soroma_tenant_memberships" ADD CONSTRAINT "soroma_tenant_memberships_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "soroma_tenant_memberships" ADD CONSTRAINT "soroma_tenant_memberships_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "soroma_tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "soroma_platform_memberships" ADD CONSTRAINT "soroma_platform_memberships_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "soroma_suppliers" ADD CONSTRAINT "soroma_suppliers_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "soroma_tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "soroma_supplier_issues" ADD CONSTRAINT "soroma_supplier_issues_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "soroma_suppliers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "soroma_purchase_orders" ADD CONSTRAINT "soroma_purchase_orders_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "soroma_tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "soroma_purchase_orders" ADD CONSTRAINT "soroma_purchase_orders_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "soroma_suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "soroma_purchase_order_lines" ADD CONSTRAINT "soroma_purchase_order_lines_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "soroma_purchase_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "soroma_raw_material_lots" ADD CONSTRAINT "soroma_raw_material_lots_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "soroma_suppliers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "soroma_raw_material_lots" ADD CONSTRAINT "soroma_raw_material_lots_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "soroma_purchase_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "soroma_production_batches" ADD CONSTRAINT "soroma_production_batches_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "soroma_tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "soroma_production_batches" ADD CONSTRAINT "soroma_production_batches_lineId_fkey" FOREIGN KEY ("lineId") REFERENCES "soroma_production_lines"("id") ON DELETE SET NULL ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "soroma_batch_material_inputs" ADD CONSTRAINT "soroma_batch_material_inputs_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "soroma_production_batches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "soroma_batch_material_inputs" ADD CONSTRAINT "soroma_batch_material_inputs_rawMaterialLotId_fkey" FOREIGN KEY ("rawMaterialLotId") REFERENCES "soroma_raw_material_lots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "soroma_downtime_events" ADD CONSTRAINT "soroma_downtime_events_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "soroma_production_batches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "soroma_qc_exceptions" ADD CONSTRAINT "soroma_qc_exceptions_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "soroma_production_batches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "soroma_warehouses" ADD CONSTRAINT "soroma_warehouses_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "soroma_tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "soroma_stock_lots" ADD CONSTRAINT "soroma_stock_lots_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "soroma_tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "soroma_stock_lots" ADD CONSTRAINT "soroma_stock_lots_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "soroma_warehouses"("id") ON DELETE SET NULL ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "soroma_stock_lots" ADD CONSTRAINT "soroma_stock_lots_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "soroma_production_batches"("id") ON DELETE SET NULL ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "soroma_finished_sku_lots" ADD CONSTRAINT "soroma_finished_sku_lots_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "soroma_production_batches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "soroma_finished_sku_lots" ADD CONSTRAINT "soroma_finished_sku_lots_stockLotId_fkey" FOREIGN KEY ("stockLotId") REFERENCES "soroma_stock_lots"("id") ON DELETE SET NULL ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "soroma_stock_movements" ADD CONSTRAINT "soroma_stock_movements_stockLotId_fkey" FOREIGN KEY ("stockLotId") REFERENCES "soroma_stock_lots"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "soroma_buyers" ADD CONSTRAINT "soroma_buyers_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "soroma_tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "soroma_customer_issues" ADD CONSTRAINT "soroma_customer_issues_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "soroma_buyers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "soroma_orders" ADD CONSTRAINT "soroma_orders_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "soroma_tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "soroma_orders" ADD CONSTRAINT "soroma_orders_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "soroma_buyers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "soroma_order_lines" ADD CONSTRAINT "soroma_order_lines_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "soroma_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "soroma_shipments" ADD CONSTRAINT "soroma_shipments_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "soroma_tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "soroma_shipments" ADD CONSTRAINT "soroma_shipments_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "soroma_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "soroma_delivery_stops" ADD CONSTRAINT "soroma_delivery_stops_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "soroma_shipments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "soroma_logistics_exceptions" ADD CONSTRAINT "soroma_logistics_exceptions_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "soroma_shipments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "soroma_passports" ADD CONSTRAINT "soroma_passports_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "soroma_tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "soroma_passports" ADD CONSTRAINT "soroma_passports_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "soroma_production_batches"("id") ON DELETE SET NULL ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "soroma_traceability_events" ADD CONSTRAINT "soroma_traceability_events_passportId_fkey" FOREIGN KEY ("passportId") REFERENCES "soroma_passports"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "soroma_passport_scans" ADD CONSTRAINT "soroma_passport_scans_passportId_fkey" FOREIGN KEY ("passportId") REFERENCES "soroma_passports"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "soroma_passport_documents" ADD CONSTRAINT "soroma_passport_documents_passportId_fkey" FOREIGN KEY ("passportId") REFERENCES "soroma_passports"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "soroma_certifications" ADD CONSTRAINT "soroma_certifications_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "soroma_tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "soroma_audits" ADD CONSTRAINT "soroma_audits_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "soroma_tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "soroma_capas" ADD CONSTRAINT "soroma_capas_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "soroma_tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "soroma_qc_tests" ADD CONSTRAINT "soroma_qc_tests_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "soroma_tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "soroma_tenant_connections" ADD CONSTRAINT "soroma_tenant_connections_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "soroma_tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "soroma_tenant_connections" ADD CONSTRAINT "soroma_tenant_connections_connectorId_fkey" FOREIGN KEY ("connectorId") REFERENCES "soroma_connectors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "soroma_product_mappings" ADD CONSTRAINT "soroma_product_mappings_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "soroma_tenant_connections"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "soroma_sync_jobs" ADD CONSTRAINT "soroma_sync_jobs_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "soroma_tenant_connections"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "soroma_sync_logs" ADD CONSTRAINT "soroma_sync_logs_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "soroma_sync_jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "soroma_program_indicators" ADD CONSTRAINT "soroma_program_indicators_programId_fkey" FOREIGN KEY ("programId") REFERENCES "soroma_programs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "soroma_program_targets" ADD CONSTRAINT "soroma_program_targets_programId_fkey" FOREIGN KEY ("programId") REFERENCES "soroma_programs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "soroma_indicator_values" ADD CONSTRAINT "soroma_indicator_values_indicatorId_fkey" FOREIGN KEY ("indicatorId") REFERENCES "soroma_program_indicators"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "soroma_alerts" ADD CONSTRAINT "soroma_alerts_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "soroma_tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "soroma_finance_records" ADD CONSTRAINT "soroma_finance_records_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "soroma_tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "soroma_invoices" ADD CONSTRAINT "soroma_invoices_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "soroma_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "soroma_audit_logs" ADD CONSTRAINT "soroma_audit_logs_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "soroma_tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;
