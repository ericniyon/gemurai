/**
 * Seed SOROMA FOODS demo data: tenants, connectors, sample ops data.
 * Run: npx tsx scripts/seed-soroma.ts
 */
import { PrismaClient } from "@prisma/client"
import { SOROMA_CONNECTORS } from "../lib/soroma/constants"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Seeding SOROMA FOODS...")

  for (const c of SOROMA_CONNECTORS) {
    await prisma.soromaConnector.upsert({
      where: { code: c.code },
      create: {
        code: c.code,
        name: c.name,
        type: c.type,
        authMethod: "oauth2",
        status: "CONNECTED",
        capabilities: { sync: ["products", "inventory", "orders"] },
      },
      update: { name: c.name, type: c.type },
    })
  }
  console.log("✅ Connectors")

  const tenant = await prisma.soromaTenant.upsert({
    where: { slug: "greenfoods-ltd" },
    create: {
      name: "GreenFoods Ltd",
      slug: "greenfoods-ltd",
      country: "RW",
      currency: "RWF",
      timezone: "Africa/Kigali",
      valueChain: "Processed Foods",
      status: "ACTIVE",
      onboardingStage: "COMPLETED",
      complianceScore: 87,
      district: "Kigali",
      region: "City of Kigali",
      contactEmail: "ops@greenfoods.rw",
    },
    update: { status: "ACTIVE", complianceScore: 87 },
  })
  console.log(`✅ Tenant: ${tenant.name}`)

  const program = await prisma.soromaProgram.upsert({
    where: { code: "SOROMA-2026" },
    create: {
      name: "SOROMA Agroprocessor Program 2026",
      code: "SOROMA-2026",
      year: 2026,
      description: "Ecosystem development program",
    },
    update: {},
  })

  await prisma.soromaProgramIndicator.upsert({
    where: { programId_code: { programId: program.id, code: "PROCESSORS_ONBOARDED" } },
    create: {
      programId: program.id,
      name: "Processors Onboarded",
      code: "PROCESSORS_ONBOARDED",
      unit: "count",
      targetValue: 50,
    },
    update: {},
  })

  const existingTarget = await prisma.soromaProgramTarget.findFirst({
    where: { programId: program.id, period: "Q1", year: 2026 },
  })
  if (!existingTarget) {
    await prisma.soromaProgramTarget.create({
      data: {
        programId: program.id,
        period: "Q1",
        year: 2026,
        targetValue: 12,
        actualValue: 8,
        status: "ON_TRACK",
      },
    })
  }

  const adminUser = await prisma.user.findFirst({
    where: { email: { contains: "admin" } },
    orderBy: { createdAt: "asc" },
  })

  if (adminUser) {
    await prisma.soromaPlatformMembership.upsert({
      where: { userId: adminUser.id },
      create: { userId: adminUser.id, role: "PLATFORM_SUPER_ADMIN" },
      update: { role: "PLATFORM_SUPER_ADMIN", isActive: true },
    })
    await prisma.soromaTenantMembership.upsert({
      where: {
        userId_tenantId: { userId: adminUser.id, tenantId: tenant.id },
      },
      create: {
        userId: adminUser.id,
        tenantId: tenant.id,
        role: "TENANT_ADMIN",
      },
      update: { role: "TENANT_ADMIN", isActive: true },
    })
    console.log(`✅ Linked user ${adminUser.email} (platform + tenant admin)`)
  } else {
    console.log("⚠️  No admin user found — assign memberships manually")
  }

  let supplier = await prisma.soromaSupplier.findFirst({
    where: { tenantId: tenant.id, name: "Kirehe Cooperative" },
  })
  if (!supplier) {
    supplier = await prisma.soromaSupplier.create({
      data: {
        tenantId: tenant.id,
        name: "Kirehe Cooperative",
        type: "COOPERATIVE",
        commodity: "Maize",
        district: "Kirehe",
        qualityScore: 92,
        complianceStatus: "COMPLIANT",
        status: "ACTIVE",
      },
    })
  }

  await prisma.soromaPurchaseOrder.upsert({
    where: { tenantId_poNumber: { tenantId: tenant.id, poNumber: "PO-2026-001" } },
    create: {
      tenantId: tenant.id,
      supplierId: supplier.id,
      poNumber: "PO-2026-001",
      commodity: "Maize",
      amount: 4500000,
      currency: "RWF",
      status: "APPROVED",
      deliveryDate: new Date(Date.now() + 7 * 86400000),
    },
    update: {},
  })

  let line = await prisma.soromaProductionLine.findFirst({
    where: { tenantId: tenant.id, name: "Line A — Milling" },
  })
  if (!line) {
    line = await prisma.soromaProductionLine.create({
      data: { tenantId: tenant.id, name: "Line A — Milling" },
    })
  }

  await prisma.soromaProductionBatch.upsert({
    where: { tenantId_batchNumber: { tenantId: tenant.id, batchNumber: "BATCH-2026-042" } },
    create: {
      tenantId: tenant.id,
      batchNumber: "BATCH-2026-042",
      productName: "Maize Flour 1kg",
      lineId: line.id,
      status: "IN_PROGRESS",
      startedAt: new Date(),
      expectedQty: 5000,
      outputQty: 3200,
      yieldPct: 91.2,
    },
    update: {},
  })

  const warehouse = await prisma.soromaWarehouse.create({
    data: { tenantId: tenant.id, name: "Main Warehouse Kigali", utilizationPct: 72 },
  }).catch(async () =>
    prisma.soromaWarehouse.findFirst({ where: { tenantId: tenant.id } })
  )

  if (warehouse) {
    await prisma.soromaStockLot.create({
      data: {
        tenantId: tenant.id,
        warehouseId: warehouse.id,
        skuCode: "MF-1KG",
        skuName: "Maize Flour 1kg",
        category: "FINISHED",
        quantity: 12000,
        availableQty: 9500,
        committedQty: 2500,
        unit: "bags",
      },
    })
  }

  const buyer = await prisma.soromaBuyer.create({
    data: {
      tenantId: tenant.id,
      name: "Rwanda School Feeding Program",
      segment: "INSTITUTIONAL",
      district: "Nationwide",
      status: "ACTIVE",
    },
  })

  await prisma.soromaOrder.upsert({
    where: { tenantId_orderNumber: { tenantId: tenant.id, orderNumber: "ORD-2026-100" } },
    create: {
      tenantId: tenant.id,
      buyerId: buyer.id,
      orderNumber: "ORD-2026-100",
      amount: 12500000,
      currency: "RWF",
      status: "CONFIRMED",
      fulfillmentStatus: "IN_PROGRESS",
    },
    update: {},
  })

  const connectors = await prisma.soromaConnector.findMany({ take: 3 })
  for (const conn of connectors) {
    await prisma.soromaTenantConnection.upsert({
      where: { tenantId_connectorId: { tenantId: tenant.id, connectorId: conn.id } },
      create: {
        tenantId: tenant.id,
        connectorId: conn.id,
        status: "CONNECTED",
        lastSyncAt: new Date(),
        successRate: 98.5,
      },
      update: { lastSyncAt: new Date() },
    })
  }

  await prisma.soromaPassport.upsert({
    where: { tenantId_passportNo: { tenantId: tenant.id, passportNo: "PP-RW-2026-0001" } },
    create: {
      tenantId: tenant.id,
      passportNo: "PP-RW-2026-0001",
      status: "ISSUED",
      issuedAt: new Date(),
      qrCode: "https://soroma.local/verify/PP-RW-2026-0001",
      version: 1,
    },
    update: {},
  })

  await prisma.soromaCertification.create({
    data: {
      tenantId: tenant.id,
      standard: "HACCP",
      certificateNo: "HACCP-RW-2024-88",
      issueDate: new Date("2024-06-01"),
      expiryDate: new Date(Date.now() + 180 * 86400000),
      status: "ACTIVE",
    },
  })

  await prisma.soromaFinanceRecord.createMany({
    data: [
      { tenantId: tenant.id, recordType: "REVENUE", amount: 45000000, reference: "Q1 Sales" },
      { tenantId: tenant.id, recordType: "COGS", amount: 28000000 },
      { tenantId: tenant.id, recordType: "RECEIVABLE", amount: 3200000, dueDate: new Date(Date.now() + 14 * 86400000) },
    ],
    skipDuplicates: true,
  })

  await prisma.soromaAlert.createMany({
    data: [
      {
        scope: "TENANT",
        tenantId: tenant.id,
        severity: "MEDIUM",
        type: "LOW_STOCK",
        title: "Low stock: Maize Flour 1kg",
        status: "OPEN",
      },
      {
        scope: "PLATFORM",
        severity: "HIGH",
        type: "ONBOARDING_SLA",
        title: "Onboarding SLA exceeded for applicant",
        status: "OPEN",
      },
    ],
  })

  await prisma.soromaOnboardingApplication.create({
    data: {
      orgName: "Lake Kivu Processors",
      contactName: "Marie Uwase",
      contactEmail: "marie@lkp.rw",
      valueChain: "Coffee Processing",
      district: "Rubavu",
      stage: "UNDER_REVIEW",
    },
  })

  console.log("\n✨ SOROMA seed complete!")
  console.log(`   Tenant workspace: /soroma/tenant/${tenant.id}/overview`)
  console.log(`   Platform: /soroma/platform/overview`)
  console.log(`   Login: /soroma/login`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
