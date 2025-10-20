import { prisma } from '../lib/database'
import bcrypt from "bcryptjs"

async function main() {
  console.log("🌱 Starting database seeding...")

  // Create admin user with password
  const adminPassword = await bcrypt.hash("admin123", 10)
  const admin = await prisma.user.upsert({
    where: { email: "admin@Gemurai.rw" },
    update: {},
    create: {
      email: "admin@Gemurai.rw",
      name: "System Administrator",
      password: adminPassword,
      role: "SUPER_ADMIN",
      permissions: [
        "dashboard.view",
        "dashboard.analytics",
        "users.view",
        "users.create",
        "users.edit",
        "users.delete",
        "products.view",
        "products.create",
        "products.edit",
        "products.delete",
        "products.manage",
        "products.purchase",
        "orders.view",
        "orders.create",
        "orders.manage",
        "learning.view",
        "learning.enroll",
        "learning.manage",
        "jobs.view",
        "jobs.apply",
        "jobs.post",
        "jobs.manage",
        "finance.view",
        "finance.request",
        "finance.manage",
        "applications.view",
        "applications.review",
        "applications.manage",
        "admin.users",
        "admin.system",
        "admin.reports",
        "admin.forms",
      ],
    },
  })

  // Create test employer with password
  const employerPassword = await bcrypt.hash("employer123", 10)
  const employer = await prisma.user.upsert({
    where: { email: "employer@Gemurai.rw" },
    update: {
      permissions: [
        "dashboard.view",
        "jobs.view",
        "jobs.post",
        "jobs.manage",
        "applications.view",
        "applications.review",
        "applications.manage",
        "users.view",
        "products.view",
        "products.create",
        "products.edit",
        "products.delete",
        "products.manage",
        "orders.view",
        "orders.manage",
      ],
    },
    create: {
      email: "employer@Gemurai.rw",
      name: "Test Employer",
      password: employerPassword,
      role: "EMPLOYER",
      permissions: [
        "dashboard.view",
        "jobs.view",
        "jobs.post",
        "jobs.manage",
        "applications.view",
        "applications.review",
        "applications.manage",
        "users.view",
        "products.view",
        "products.create",
        "products.edit",
        "products.delete",
        "products.manage",
        "orders.view",
        "orders.manage",
      ],
    },
  })

  // Create test DCC user with password
  const dccPassword = await bcrypt.hash("dcc123", 10)
  const dccUser = await prisma.user.upsert({
    where: { email: "dcc@Gemurai.rw" },
    update: {},
    create: {
      email: "dcc@Gemurai.rw",
      name: "Test DCC",
      phone: "+250788123456",
      password: dccPassword,
      role: "DCC",
      permissions: [
        "dashboard.view",
        "products.view",
        "products.purchase",
        "orders.view",
        "orders.create",
        "learning.view",
        "learning.enroll",
        "jobs.view",
        "jobs.apply",
        "finance.view",
        "finance.request",
        "stock.create"
      ],
    },
  })

  // Create sample applications
  const sampleApplication = await prisma.application.create({
    data: {
      userId: dccUser.id,
      email: dccUser.email,
      phone: dccUser.phone!,
      status: "SUBMITTED",
      formData: {
        personalInfo: {
          name: dccUser.name,
          email: dccUser.email,
          phone: dccUser.phone,
        },
        businessInfo: {
          businessName: "Sample DCC Business",
          location: "Kigali, Gasabo",
        },
      },
      currentStep: 5,
    },
  })

  console.log("✅ Database seeded successfully!")
  console.log("👤 Admin user:", admin.email, "password: admin123")
  console.log("🏢 Employer user:", employer.email, "password: employer123")
  console.log("🎯 DCC user:", dccUser.email, "password: dcc123")
  console.log("📄 Sample application created:", sampleApplication.id)
}

main().catch(console.error)
