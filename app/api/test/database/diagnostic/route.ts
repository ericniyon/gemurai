import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/database"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get("type")

  try {
    switch (type) {
      case "connection":
        return await testConnection()
      case "envVars":
        return await checkEnvironmentVariables()
      case "tables":
        return await checkTables()
      case "users":
        return await checkUsers()
      case "applications":
        return await checkApplications()
      default:
        return NextResponse.json({
          success: false,
          message: "Invalid diagnostic type",
        })
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Diagnostic failed",
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}

async function testConnection() {
  try {
    await prisma.$connect()
    await prisma.$queryRaw`SELECT 1`

    return NextResponse.json({
      success: true,
      message: "Database connection successful",
      data: {
        timestamp: new Date().toISOString(),
        status: "connected",
      },
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Database connection failed",
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}

async function checkEnvironmentVariables() {
  const envVars = {
    DATABASE_URL: process.env.DATABASE_URL ? "✓ Set" : "✗ Missing",
    DIRECT_URL: process.env.DIRECT_URL ? "✓ Set" : "✗ Missing",
    NODE_ENV: process.env.NODE_ENV || "not set",
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "✓ Set" : "✗ Missing",
    JWT_SECRET: process.env.JWT_SECRET ? "✓ Set" : "✗ Missing",
  }

  const hasRequiredVars = process.env.DATABASE_URL && process.env.DIRECT_URL

  return NextResponse.json({
    success: hasRequiredVars,
    message: hasRequiredVars ? "All required environment variables are set" : "Missing required environment variables",
    data: envVars,
  })
}

async function checkTables() {
  try {
    // Check if tables exist and get row counts
    const tables = await Promise.all([
      prisma.user
        .count()
        .then((count: number) => ({ name: "users", count }))
        .catch(() => ({ name: "users", count: "error" })),
      prisma.application
        .count()
        .then((count: number) => ({ name: "applications", count }))
        .catch(() => ({ name: "applications", count: "error" })),
      prisma.dCCProfile
        .count()
        .then((count: number) => ({ name: "dcc_profiles", count }))
        .catch(() => ({ name: "dcc_profiles", count: "error" })),
      prisma.emailLog
        .count()
        .then((count: number) => ({ name: "email_logs", count }))
        .catch(() => ({ name: "email_logs", count: "error" })),
      prisma.sMSLog
        .count()
        .then((count: number) => ({ name: "sms_logs", count }))
        .catch(() => ({ name: "sms_logs", count: "error" })),
      prisma.passwordReset
        .count()
        .then((count: number) => ({ name: "password_resets", count }))
        .catch(() => ({ name: "password_resets", count: "error" })),
    ])

    const hasErrors = tables.some((table) => table.count === "error")

    return NextResponse.json({
      success: !hasErrors,
      message: hasErrors ? "Some tables are missing or inaccessible" : `Found ${tables.length} tables`,
      data: { tables },
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Failed to check tables",
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}

async function checkUsers() {
  try {
    const count = await prisma.user.count()
    const users = await prisma.user.findMany({
      take: 5,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    })

    return NextResponse.json({
      success: true,
      message: `Found ${count} users in database`,
      data: { count, users },
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Failed to fetch users",
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}

async function checkApplications() {
  try {
    const count = await prisma.application.count()
    const applications = await prisma.application.findMany({
      take: 5,
      select: {
        id: true,
        email: true,
        phone: true,
        status: true,
        createdAt: true,
      },
    })

    return NextResponse.json({
      success: true,
      message: `Found ${count} applications in database`,
      data: { count, applications },
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Failed to fetch applications",
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
