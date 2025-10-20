import { NextResponse } from "next/server"
import { prisma } from "@/lib/database"
import bcrypt from "bcryptjs"

export const runtime = "nodejs"

export async function POST() {
  try {
    console.log("🌱 Starting database seeding via API...")

    // Check if users already exist
    const existingUsers = await prisma.user.count()
    if (existingUsers > 0) {
      return NextResponse.json({
        success: true,
        message: `Database already has ${existingUsers} users. Skipping seed.`,
        data: { existingUsers },
      })
    }

    // Create admin user with password
    const adminPassword = await bcrypt.hash("admin123", 10)
    const admin = await prisma.user.create({
      data: {
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
          "admin.users",
          "admin.system",
          "admin.reports",
          "admin.forms",
        ],
      },
    })

    // Create test employer with password
    const employerPassword = await bcrypt.hash("employer123", 10)
    const employer = await prisma.user.create({
      data: {
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
          "orders.manage"
        ],
      },
    })

    // Create test DCC user with password
    const dccPassword = await bcrypt.hash("dcc123", 10)
    const dccUser = await prisma.user.create({
      data: {
        email: "dcc@Gemurai.rw",
        name: "Test DCC",
        phone: "+250788123456",
        password: dccPassword,
        role: "DCC",
        permissions: ["dashboard.view", "products.view", "learning.view"],
      },
    })

    // Create sample application
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

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully!",
      data: {
        users: [
          { email: admin.email, role: admin.role, password: "admin123" },
          { email: employer.email, role: employer.role, password: "employer123" },
          { email: dccUser.email, role: dccUser.role, password: "dcc123" },
        ],
        applications: [sampleApplication.id],
      },
    })
  } catch (error) {
    console.error("❌ Seeding failed:", error)
    return NextResponse.json({
      success: false,
      message: "Database seeding failed",
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
