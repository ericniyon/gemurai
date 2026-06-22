/**
 * Create all SOROMA platform + tenant role users with memberships.
 * Run: npx tsx scripts/seed-soroma-users.ts
 *
 * Default password for every account: Soroma2026!
 */
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import type { PlatformRole, TenantRole } from "../lib/soroma/constants"

const prisma = new PrismaClient()

const DEFAULT_PASSWORD = process.env.SOROMA_USER_PASSWORD ?? "Soroma2026!"

const PLATFORM_USERS: {
  email: string
  name: string
  role: PlatformRole
  phone: string
}[] = [
  {
    email: "platform.superadmin@soroma.rw",
    name: "SOROMA Platform Super Admin",
    role: "PLATFORM_SUPER_ADMIN",
    phone: "+250788100001",
  },
  {
    email: "platform.operator@soroma.rw",
    name: "SOROMA Platform Operator",
    role: "PLATFORM_OPERATOR",
    phone: "+250788100002",
  },
  {
    email: "platform.compliance@soroma.rw",
    name: "SOROMA Compliance Officer",
    role: "PLATFORM_COMPLIANCE_OFFICER",
    phone: "+250788100003",
  },
  {
    email: "platform.integrations@soroma.rw",
    name: "SOROMA Integration Manager",
    role: "INTEGRATION_MANAGER",
    phone: "+250788100004",
  },
  {
    email: "platform.me@soroma.rw",
    name: "SOROMA M&E Officer",
    role: "ME_OFFICER",
    phone: "+250788100005",
  },
  {
    email: "platform.support@soroma.rw",
    name: "SOROMA Support Agent",
    role: "SUPPORT_AGENT",
    phone: "+250788100006",
  },
]

const TENANT_USERS: {
  email: string
  name: string
  role: TenantRole
  phone: string
}[] = [
  {
    email: "greenfoods.admin@soroma.rw",
    name: "GreenFoods Tenant Admin",
    role: "TENANT_ADMIN",
    phone: "+250788200001",
  },
  {
    email: "greenfoods.suppliers@soroma.rw",
    name: "GreenFoods Supplier Manager",
    role: "SUPPLIER_MANAGER",
    phone: "+250788200002",
  },
  {
    email: "greenfoods.procurement@soroma.rw",
    name: "GreenFoods Procurement Officer",
    role: "PROCUREMENT_OFFICER",
    phone: "+250788200003",
  },
  {
    email: "greenfoods.production@soroma.rw",
    name: "GreenFoods Production Lead",
    role: "PRODUCTION_LEAD",
    phone: "+250788200004",
  },
  {
    email: "greenfoods.warehouse@soroma.rw",
    name: "GreenFoods Warehouse Manager",
    role: "WAREHOUSE_MANAGER",
    phone: "+250788200005",
  },
  {
    email: "greenfoods.sales@soroma.rw",
    name: "GreenFoods Sales & Orders",
    role: "SALES_ORDERS_OFFICER",
    phone: "+250788200006",
  },
  {
    email: "greenfoods.logistics@soroma.rw",
    name: "GreenFoods Logistics Coordinator",
    role: "LOGISTICS_COORDINATOR",
    phone: "+250788200007",
  },
  {
    email: "greenfoods.finance@soroma.rw",
    name: "GreenFoods Finance Manager",
    role: "FINANCE_MANAGER",
    phone: "+250788200008",
  },
  {
    email: "greenfoods.qa@soroma.rw",
    name: "GreenFoods QA & Compliance",
    role: "QA_COMPLIANCE_OFFICER",
    phone: "+250788200009",
  },
  {
    email: "greenfoods.reports@soroma.rw",
    name: "GreenFoods Reports Viewer",
    role: "REPORTS_VIEWER",
    phone: "+250788200010",
  },
]

async function ensureHarvestPlusRole(userId: string, roleName: string) {
  const role = await prisma.role.findUnique({ where: { name: roleName } })
  if (!role) {
    console.warn(`   ⚠️  Role ${roleName} not found — skipping UserRoleAssignment`)
    return
  }
  await prisma.userRoleAssignment.upsert({
    where: { userId },
    update: { roleId: role.id, isActive: true },
    create: { userId, roleId: role.id, isActive: true },
  })
}

async function upsertPlatformUser(
  email: string,
  name: string,
  role: PlatformRole,
  phone: string,
  passwordHash: string
) {
  const user = await prisma.user.upsert({
    where: { email: email.toLowerCase() },
    update: { name, phone, password: passwordHash, isActive: true },
    create: {
      email: email.toLowerCase(),
      name,
      phone,
      password: passwordHash,
      isActive: true,
      country: "RW",
    },
  })

  await prisma.soromaPlatformMembership.upsert({
    where: { userId: user.id },
    update: { role, isActive: true },
    create: { userId: user.id, role, isActive: true },
  })

  await ensureHarvestPlusRole(user.id, "ADMIN")
  return user
}

async function upsertTenantUser(
  email: string,
  name: string,
  role: TenantRole,
  phone: string,
  tenantId: string,
  passwordHash: string
) {
  const user = await prisma.user.upsert({
    where: { email: email.toLowerCase() },
    update: { name, phone, password: passwordHash, isActive: true },
    create: {
      email: email.toLowerCase(),
      name,
      phone,
      password: passwordHash,
      isActive: true,
      country: "RW",
    },
  })

  await prisma.soromaTenantMembership.upsert({
    where: { userId_tenantId: { userId: user.id, tenantId } },
    update: { role, isActive: true },
    create: { userId: user.id, tenantId, role, isActive: true },
  })

  await ensureHarvestPlusRole(user.id, "ADMIN")
  return user
}

async function main() {
  console.log("👥 Creating SOROMA FOODS users...\n")

  const tenant = await prisma.soromaTenant.findUnique({
    where: { slug: "greenfoods-ltd" },
  })
  if (!tenant) {
    console.error("❌ GreenFoods tenant not found. Run: npx tsx scripts/seed-soroma.ts first")
    process.exit(1)
  }

  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 12)

  console.log("── Platform users (/soroma/platform) ──")
  for (const u of PLATFORM_USERS) {
    await upsertPlatformUser(u.email, u.name, u.role, u.phone, passwordHash)
    console.log(`   ✅ ${u.email} → ${u.role}`)
  }

  console.log("\n── Tenant users (GreenFoods Ltd) ──")
  for (const u of TENANT_USERS) {
    await upsertTenantUser(
      u.email,
      u.name,
      u.role,
      u.phone,
      tenant.id,
      passwordHash
    )
    console.log(`   ✅ ${u.email} → ${u.role}`)
  }

  console.log("\n══════════════════════════════════════════════════════════")
  console.log("  SOROMA accounts — password for all new users below:")
  console.log(`  ${DEFAULT_PASSWORD}`)
  console.log("  Login: /soroma/login")
  console.log("══════════════════════════════════════════════════════════\n")

  console.log("PLATFORM (workspace: Platform Admin)")
  console.log("┌────────────────────────────────────────┬─────────────────────────────┐")
  console.log("│ Email                                  │ Role                        │")
  console.log("├────────────────────────────────────────┼─────────────────────────────┤")
  for (const u of PLATFORM_USERS) {
    console.log(`│ ${u.email.padEnd(38)} │ ${u.role.padEnd(27)} │`)
  }
  console.log("└────────────────────────────────────────┴─────────────────────────────┘")

  console.log("\nTENANT — GreenFoods Ltd (workspace: Tenant)")
  console.log("┌────────────────────────────────────────┬─────────────────────────────┐")
  console.log("│ Email                                  │ Role                        │")
  console.log("├────────────────────────────────────────┼─────────────────────────────┤")
  for (const u of TENANT_USERS) {
    console.log(`│ ${u.email.padEnd(38)} │ ${u.role.padEnd(27)} │`)
  }
  console.log("└────────────────────────────────────────┴─────────────────────────────┘")

  console.log("\nAlso configured (from earlier seed):")
  console.log("   superadmin@DJYH.rw → PLATFORM_SUPER_ADMIN + TENANT_ADMIN")
  console.log("   (uses existing HarvestPlus password, not Soroma2026!)")
  console.log(`\n   Tenant URL: /soroma/tenant/${tenant.id}/overview\n`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
