import { UserRole } from "@prisma/client"
import { prisma } from '../lib/database'
import bcrypt from "bcryptjs"

const TEST_CREDENTIALS = {
  SUPER_ADMIN: {
    email: "super.admin@Gemurai.rw",
    password: "superadmin123!",
    name: "Super Administrator",
    phone: "+250780000001",
    avatar: null,
    role: UserRole.SUPER_ADMIN,
    permissions: [
      "dashboard.view", "dashboard.analytics",
      "users.view", "users.create", "users.edit", "users.delete",
      "products.view", "products.create", "products.edit", "products.delete", "products.manage",
      "orders.view", "orders.create", "orders.manage",
      "learning.view", "learning.enroll", "learning.manage",
      "jobs.view", "jobs.apply", "jobs.post", "jobs.manage",
      "finance.view", "finance.request", "finance.manage",
      "applications.view", "applications.review", "applications.manage",
      "admin.users", "admin.system", "admin.reports", "admin.forms"
    ],
    isActive: true
  },
  ADMIN: {
    email: "admin@Gemurai.rw",
    password: "admin123!",
    name: "Administrator",
    phone: "+250780000002",
    avatar: null,
    role: UserRole.ADMIN,
    permissions: [
      "dashboard.view", "dashboard.analytics",
      "users.view", "users.create", "users.edit",
      "products.view", "products.create", "products.edit", "products.delete", "products.manage",
      "orders.view", "orders.manage",
      "learning.view", "learning.manage",
      "jobs.view", "jobs.manage",
      "finance.view", "finance.manage",
      "applications.view", "applications.review", "applications.manage",
      "admin.users", "admin.system", "admin.reports", "admin.forms"
    ],
    isActive: true
  },
  SENIOR_DCC: {
    email: "senior.dcc@Gemurai.rw",
    password: "seniordcc123!",
    name: "Senior DCC",
    phone: "+250780000003",
    avatar: null,
    role: UserRole.DCC,
    permissions: [
      "dashboard.view", "dashboard.analytics",
      "users.view", "users.edit",
      "products.view", "products.create", "products.edit", "products.delete", "products.manage",
      "orders.view", "orders.manage",
      "learning.view", "learning.manage",
      "jobs.view", "jobs.manage",
      "finance.view",
      "applications.view", "applications.review",
      "stock.create"
    ],
    isActive: true
  },
  DCC: {
    email: "dcc@Gemurai.rw",
    password: "dcc123!",
    name: "Digital Community Champion",
    phone: "+250780000004",
    avatar: null,
    role: UserRole.DCC,
    permissions: [
      "dashboard.view",
      "products.view", "products.purchase",
      "orders.view", "orders.create",
      "learning.view", "learning.enroll",
      "jobs.view", "jobs.apply",
      "finance.view", "finance.request",
      "stock.create"
    ],
    isActive: true
  },
  EMPLOYER: {
    email: "employer@Gemurai.rw",
    password: "employer123!",
    name: "Business Owner",
    phone: "+250780000005",
    avatar: null,
    role: UserRole.EMPLOYER,
    permissions: [
      "dashboard.view",
      "products.view", "products.purchase",
      "orders.view", "orders.create",
      "jobs.view", "jobs.post", "jobs.manage",
      "learning.view", "learning.enroll"
    ],
    isActive: true
  },
  CONSUMER: {
    email: "consumer@Gemurai.rw",
    password: "consumer123!",
    name: "Regular User",
    phone: "+250780000006",
    avatar: null,
    role: UserRole.CONSUMER,
    permissions: [
      "dashboard.view",
      "products.view", "products.purchase",
      "orders.view", "orders.create",
      "jobs.view", "jobs.apply",
      "learning.view", "learning.enroll"
    ],
    isActive: true
  }
}

async function main() {
  try {
    console.log("🌱 Seeding test users...")

    for (const [role, userData] of Object.entries(TEST_CREDENTIALS)) {
      const hashedPassword = await bcrypt.hash(userData.password, 10)
      
      const user = await prisma.user.upsert({
        where: { email: userData.email },
        update: {
          permissions: userData.permissions,
          role: userData.role,
          isActive: userData.isActive
        },
        create: {
          ...userData,
          password: hashedPassword
        }
      })

      console.log(`✅ Created/Updated ${role} user:`, user.email)
    }

    console.log("✅ Test users seeded successfully!")
  } catch (error) {
    console.error("Error seeding test users:", error)
  } finally {
    await prisma.$disconnect()
  }
}

main() 