import { NextResponse } from "next/server"
import { prisma } from "@/lib/database"

export const runtime = "nodejs"

export async function GET() {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    environment: {
      node_env: process.env.NODE_ENV,
      database_url: process.env.DATABASE_URL ? "✅ Set" : "❌ Not set",
      postgres_url: process.env.POSTGRES_URL ? "✅ Set" : "❌ Not set",
      direct_url: process.env.DIRECT_URL ? "✅ Set" : "❌ Not set",
    },
    tests: [] as any[],
  }

  // Test 1: Basic connection
  try {
    await prisma.$connect()
    diagnostics.tests.push({
      name: "Database Connection",
      status: "✅ PASS",
      message: "Successfully connected to database",
    })
  } catch (error: any) {
    diagnostics.tests.push({
      name: "Database Connection",
      status: "❌ FAIL",
      message: error.message,
      error: error,
    })
    return NextResponse.json(diagnostics, { status: 500 })
  }

  // Test 2: Raw query
  try {
    const result = await prisma.$queryRaw`SELECT NOW() as current_time, version() as db_version`
    diagnostics.tests.push({
      name: "Raw Query Test",
      status: "✅ PASS",
      message: "Successfully executed raw query",
      data: result,
    })
  } catch (error: any) {
    diagnostics.tests.push({
      name: "Raw Query Test",
      status: "❌ FAIL",
      message: error.message,
    })
  }

  // Test 3: Check if tables exist
  try {
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `
    diagnostics.tests.push({
      name: "Tables Check",
      status: "✅ PASS",
      message: `Found ${Array.isArray(tables) ? tables.length : 0} tables`,
      data: tables,
    })
  } catch (error: any) {
    diagnostics.tests.push({
      name: "Tables Check",
      status: "❌ FAIL",
      message: error.message,
    })
  }

  // Test 4: Check users table
  try {
    const userCount = await prisma.user.count()
    diagnostics.tests.push({
      name: "Users Table",
      status: "✅ PASS",
      message: `Found ${userCount} users in database`,
    })
  } catch (error: any) {
    diagnostics.tests.push({
      name: "Users Table",
      status: "❌ FAIL",
      message: error.message,
    })
  }

  // Test 5: Check applications table
  try {
    const appCount = await prisma.application.count()
    diagnostics.tests.push({
      name: "Applications Table",
      status: "✅ PASS",
      message: `Found ${appCount} applications in database`,
    })
  } catch (error: any) {
    diagnostics.tests.push({
      name: "Applications Table",
      status: "❌ FAIL",
      message: error.message,
    })
  }

  return NextResponse.json(diagnostics)
}
