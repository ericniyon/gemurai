import { NextResponse } from "next/server"
import { prisma } from "@/lib/database"

export const runtime = "nodejs"

export async function GET() {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    tests: [] as any[],
    summary: {
      total: 0,
      passed: 0,
      failed: 0,
    },
  }

  // Test 1: Environment Variables
  try {
    const envTest = {
      name: "Environment Variables",
      status: "running",
      details: {},
    }

    const requiredEnvVars = ["DATABASE_URL", "POSTGRES_URL", "POSTGRES_PRISMA_URL"]

    const envStatus: { [key: string]: string } = {}
    for (const envVar of requiredEnvVars) {
      envStatus[envVar] = process.env[envVar] ? "✅ Set" : "❌ Missing"
    }

    envTest.details = envStatus
    envTest.status = Object.values(envStatus).every((status) => status.includes("✅")) ? "passed" : "failed"
    diagnostics.tests.push(envTest)
  } catch (error: any) {
    diagnostics.tests.push({
      name: "Environment Variables",
      status: "failed",
      error: error.message,
    })
  }

  // Test 2: Prisma Connection
  try {
    const prismaTest = {
      name: "Prisma Connection",
      status: "running",
      details: {},
    }

    await prisma.$connect()
    const result = await prisma.$queryRaw`SELECT NOW() as current_time, version() as version`

    prismaTest.details = {
      connection: "✅ Connected",
      result: result[0],
    }
    prismaTest.status = "passed"
    diagnostics.tests.push(prismaTest)
  } catch (error: any) {
    diagnostics.tests.push({
      name: "Prisma Connection",
      status: "failed",
      error: error.message,
      details: {
        connection: "❌ Failed",
      },
    })
  }

  // Test 3: Database Tables
  try {
    const tablesTest = {
      name: "Database Tables",
      status: "running",
      details: {},
    }

    // Check if applications table exists
    const tableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'Application'
      ) as exists
    `

    const applicationCount = await prisma.application.count()

    tablesTest.details = {
      applicationTableExists: tableExists[0].exists ? "✅ Exists" : "❌ Missing",
      applicationCount: `${applicationCount} records`,
    }
    tablesTest.status = tableExists[0].exists ? "passed" : "failed"
    diagnostics.tests.push(tablesTest)
  } catch (error: any) {
    diagnostics.tests.push({
      name: "Database Tables",
      status: "failed",
      error: error.message,
    })
  }

  // Test 4: CRUD Operations
  try {
    const crudTest = {
      name: "CRUD Operations",
      status: "running",
      details: {},
    }

    const testId = `diagnostic_${Date.now()}`

    // Create
    const created = await prisma.application.create({
      data: {
        id: testId,
        phone: "0788000000",
        email: "diagnostic@test.com",
        status: "TEMPORARY",
        formData: { test: true },
        currentStep: 1,
      },
    })

    // Read
    const read = await prisma.application.findUnique({
      where: { id: testId },
    })

    // Update
    const updated = await prisma.application.update({
      where: { id: testId },
      data: { status: "SUBMITTED" },
    })

    // Delete
    await prisma.application.delete({
      where: { id: testId },
    })

    crudTest.details = {
      create: created ? "✅ Success" : "❌ Failed",
      read: read ? "✅ Success" : "❌ Failed",
      update: updated.status === "SUBMITTED" ? "✅ Success" : "❌ Failed",
      delete: "✅ Success",
    }
    crudTest.status = "passed"
    diagnostics.tests.push(crudTest)
  } catch (error: any) {
    diagnostics.tests.push({
      name: "CRUD Operations",
      status: "failed",
      error: error.message,
    })
  }

  // Calculate summary
  diagnostics.summary.total = diagnostics.tests.length
  diagnostics.summary.passed = diagnostics.tests.filter((t) => t.status === "passed").length
  diagnostics.summary.failed = diagnostics.tests.filter((t) => t.status === "failed").length

  // Disconnect Prisma
  await prisma.$disconnect()

  return NextResponse.json(diagnostics)
}
