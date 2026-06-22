import { z } from "zod"

export const soromaPaginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional().default(""),
  status: z.string().optional(),
})

export const supplierCreateSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  type: z.string().optional().default("COMPANY"),
  commodity: z.string().trim().optional().nullable(),
  district: z.string().trim().optional().nullable(),
  contactPhone: z.string().trim().optional().nullable(),
  contactEmail: z.string().email().optional().nullable(),
  status: z.string().optional().default("PENDING"),
})

export const purchaseOrderLineSchema = z.object({
  description: z.string().trim().min(1, "Line description is required"),
  quantity: z.coerce.number().min(0),
  unitPrice: z.coerce.number().min(0).optional().default(0),
})

export const purchaseOrderCreateSchema = z.object({
  supplierId: z.string().trim().min(1, "Supplier is required"),
  poNumber: z.string().trim().optional(),
  commodity: z.string().trim().optional().nullable(),
  amount: z.coerce.number().min(0).optional().default(0),
  currency: z.string().trim().optional().default("RWF"),
  status: z.string().trim().optional().default("REQUESTED"),
  deliveryDate: z.string().trim().optional(),
  lines: z.array(purchaseOrderLineSchema).optional().default([]),
})

export const passportCreateSchema = z.object({
  batchId: z.string().trim().min(1, "Batch ID is required"),
  passportNo: z.string().trim().optional(),
})

export const alertPatchSchema = z.object({
  status: z.string().trim().min(1, "Status is required"),
  assignedToId: z.string().trim().optional().nullable(),
})

export const alertActionSchema = z.object({
  action: z.enum([
    "assign",
    "set_sla",
    "escalate",
    "in_progress",
    "resolve",
    "reopen",
  ]),
  assignedToId: z.string().trim().optional(),
  slaHours: z.coerce.number().int().min(1).max(24 * 90).optional(),
  comment: z.string().trim().max(1000).optional(),
})

export const alertCommentSchema = z.object({
  comment: z.string().trim().min(2).max(2000),
})

export const alertEvidenceSchema = z.object({
  label: z.string().trim().min(2).max(120),
  url: z.string().trim().url(),
  note: z.string().trim().max(600).optional(),
})

export const certificationCreateSchema = z.object({
  standard: z.string().trim().min(2),
  certificateNo: z.string().trim().optional(),
  issueDate: z.string().trim().optional(),
  expiryDate: z.string().trim().optional(),
  status: z.string().trim().optional().default("ACTIVE"),
  documentUrl: z.string().trim().optional(),
  supplierId: z.string().trim().optional(),
})

export const auditCreateSchema = z.object({
  auditType: z.string().trim().min(2),
  scheduledAt: z.string().trim().min(1),
  result: z.string().trim().optional(),
  score: z.coerce.number().optional(),
  notes: z.string().trim().optional(),
})

export const qcTestCreateSchema = z.object({
  batchId: z.string().trim().optional(),
  testType: z.string().trim().min(2),
  result: z.string().trim().min(1),
  passed: z.boolean(),
  testedAt: z.string().trim().optional(),
  notes: z.string().trim().optional(),
})

export const capaCreateSchema = z.object({
  title: z.string().trim().min(3),
  ownerId: z.string().trim().optional(),
  dueDate: z.string().trim().optional(),
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional().default("MEDIUM"),
  evidenceUrl: z.string().trim().optional(),
})

export const capaTransitionSchema = z.object({
  action: z.string().trim().min(1),
  comment: z.string().trim().optional(),
})

export const connectorCreateSchema = z.object({
  code: z.string().trim().min(2),
  name: z.string().trim().min(2),
  type: z.string().trim().min(2),
  authMethod: z.string().trim().optional(),
  capabilities: z.record(z.any()).optional(),
  status: z.string().trim().optional().default("PENDING"),
})

export const tenantConnectionCreateSchema = z.object({
  connectorId: z.string().trim().min(1),
  externalAccountId: z.string().trim().optional(),
  apiKey: z.string().trim().optional(),
  apiSecret: z.string().trim().optional(),
  config: z.record(z.any()).optional(),
})

export const syncJobCreateSchema = z.object({
  jobType: z.string().trim().min(2).default("FULL_SYNC"),
  payload: z.record(z.any()).optional(),
})

export const retrySyncJobSchema = z.object({
  reason: z.string().trim().optional(),
})

export const exportRequestSchema = z.object({
  dataset: z.enum(["alerts", "audit_logs", "workflows", "integrations", "orders", "finance"]),
  format: z.enum(["CSV", "XLSX", "PDF"]).default("CSV"),
  async: z.boolean().optional().default(false),
  filters: z
    .object({
      startDate: z.string().trim().optional(),
      endDate: z.string().trim().optional(),
      search: z.string().trim().optional(),
      status: z.string().trim().optional(),
    })
    .optional(),
})

export const reportScheduleCreateSchema = z.object({
  name: z.string().trim().min(2).max(120),
  dataset: z.enum(["alerts", "audit_logs", "workflows", "integrations", "orders", "finance"]),
  format: z.enum(["CSV", "XLSX", "PDF"]).default("CSV"),
  cadence: z.enum(["DAILY", "WEEKLY", "MONTHLY"]),
  filters: z
    .object({
      startDate: z.string().trim().optional(),
      endDate: z.string().trim().optional(),
      search: z.string().trim().optional(),
      status: z.string().trim().optional(),
    })
    .optional(),
})

export const supplierPatchSchema = supplierCreateSchema.partial().extend({
  status: z.enum(["PENDING", "ACTIVE", "SUSPENDED"]).optional(),
})

export const batchCreateSchema = z.object({
  batchNumber: z.string().trim().optional(),
  productName: z.string().trim().min(2),
  lineId: z.string().trim().optional(),
  expectedQty: z.coerce.number().min(0).optional(),
  notes: z.string().trim().optional(),
})

export const downtimeCreateSchema = z.object({
  batchId: z.string().trim().min(1),
  reason: z.string().trim().min(2),
  durationMinutes: z.coerce.number().int().min(1),
  notes: z.string().trim().optional(),
})

export const qcExceptionCreateSchema = z.object({
  batchId: z.string().trim().min(1),
  exceptionType: z.string().trim().min(2),
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"),
  notes: z.string().trim().optional(),
})

export const stockMovementCreateSchema = z.object({
  stockLotId: z.string().trim().min(1),
  movementType: z.enum(["STOCK_IN", "STOCK_OUT", "TRANSFER", "CYCLE_COUNT", "ADJUSTMENT"]),
  quantity: z.coerce.number().min(0),
  reference: z.string().trim().optional(),
  targetWarehouseId: z.string().trim().optional(),
})

export const stockLotCreateSchema = z.object({
  skuCode: z.string().trim().min(1),
  skuName: z.string().trim().min(1),
  category: z.string().trim().optional().default("RAW"),
  quantity: z.coerce.number().min(0),
  warehouseId: z.string().trim().optional(),
  expiryDate: z.string().trim().optional(),
  unit: z.string().trim().optional().default("units"),
})

export const buyerCreateSchema = z.object({
  name: z.string().trim().min(2),
  type: z.string().trim().optional().default("RETAIL"),
  district: z.string().trim().optional(),
  contactPhone: z.string().trim().optional(),
  contactEmail: z.string().email().optional().nullable(),
  contractStatus: z.string().trim().optional(),
})

export const orderLineSchema = z.object({
  skuCode: z.string().trim().min(1),
  skuName: z.string().trim().min(1),
  quantity: z.coerce.number().min(0),
  unitPrice: z.coerce.number().min(0).optional().default(0),
})

export const orderCreateSchema = z.object({
  buyerId: z.string().trim().min(1),
  orderNumber: z.string().trim().optional(),
  amount: z.coerce.number().min(0).optional().default(0),
  currency: z.string().trim().optional().default("RWF"),
  status: z.string().trim().optional().default("DRAFT"),
  lines: z.array(orderLineSchema).optional().default([]),
})

export const orderTransitionSchema = z.object({
  action: z.string().trim().min(1),
  comment: z.string().trim().optional(),
})

export const shipmentCreateSchema = z.object({
  orderId: z.string().trim().optional(),
  shipmentNumber: z.string().trim().optional(),
  routeName: z.string().trim().optional(),
  vehicleId: z.string().trim().optional(),
  driverName: z.string().trim().optional(),
  costAmount: z.coerce.number().min(0).optional(),
})

export const financeRecordCreateSchema = z.object({
  recordType: z.enum(["REVENUE", "COGS", "OPEX", "RECEIVABLE", "PAYMENT"]),
  amount: z.coerce.number().min(0),
  currency: z.string().trim().optional().default("RWF"),
  reference: z.string().trim().optional(),
  batchId: z.string().trim().optional(),
  orderId: z.string().trim().optional(),
  dueDate: z.string().trim().optional(),
})

export const tenantCreateSchema = z.object({
  name: z.string().trim().min(2),
  valueChain: z.string().trim().optional(),
  district: z.string().trim().optional(),
  region: z.string().trim().optional(),
  status: z.enum(["ACTIVE", "ONBOARDING", "SUSPENDED"]).optional().default("ONBOARDING"),
})

export const onboardingPatchSchema = z.object({
  stage: z.enum(["SUBMITTED", "UNDER_REVIEW", "SETUP", "COMPLETED", "REJECTED"]).optional(),
  assignedToId: z.string().trim().optional(),
  notes: z.string().trim().optional(),
})
