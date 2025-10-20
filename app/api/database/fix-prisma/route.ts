import { type NextRequest, NextResponse } from "next/server"
import { prisma, testDatabaseConnection, getDatabaseHealth } from "@/lib/database"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

type StepResult = { step: string; success: boolean; message: string }

export async function GET() {
  try {
    console.log("🔧 Starting Prisma fix process...")

    const results = {
      steps: [] as StepResult[],
      success: false,
      message: "",
      timestamp: new Date().toISOString(),
    }

    // Step 1: Disconnect existing connections
    try {
      await prisma.$disconnect()
      results.steps.push({ step: "disconnect", success: true, message: "Disconnected existing Prisma connections" })
    } catch (error: any) {
      results.steps.push({ step: "disconnect", success: false, message: `Disconnect failed: ${error.message}` })
    }

    // Step 2: Reconnect to database
    try {
      await prisma.$connect()
      results.steps.push({ step: "connect", success: true, message: "Reconnected to database" })
    } catch (error: any) {
      results.steps.push({ step: "connect", success: false, message: `Reconnect failed: ${error.message}` })
    }

    // Step 3: Test basic query
    try {
      await prisma.$queryRaw`SELECT 1 as test`
      results.steps.push({ step: "query_test", success: true, message: "Basic query test passed" })
    } catch (error: any) {
      results.steps.push({ step: "query_test", success: false, message: `Query test failed: ${error.message}` })
    }

    // Step 4: Check database health
    try {
      const health = await getDatabaseHealth()
      if (health.success) {
        results.steps.push({ step: "health_check", success: true, message: "Database health check passed" })
      } else {
        results.steps.push({ step: "health_check", success: false, message: `Health check failed: ${health.error}` })
      }
    } catch (error: any) {
      results.steps.push({ step: "health_check", success: false, message: `Health check error: ${error.message}` })
    }

    // Step 5: Test connection function
    try {
      const connectionTest = await testDatabaseConnection()
      if (connectionTest) {
        results.steps.push({ step: "connection_test", success: true, message: "Connection test passed" })
      } else {
        results.steps.push({ step: "connection_test", success: false, message: "Connection test failed" })
      }
    } catch (error: any) {
      results.steps.push({
        step: "connection_test",
        success: false,
        message: `Connection test error: ${error.message}`,
      })
    }

    // Determine overall success
    const failedSteps = results.steps.filter((step) => !step.success)
    results.success = failedSteps.length === 0

    if (results.success) {
      results.message = "✅ Prisma fix completed successfully - all checks passed"
    } else {
      results.message = `❌ Prisma fix completed with ${failedSteps.length} failed steps`
    }

    console.log("🔧 Prisma fix results:", results)

    return NextResponse.json(results, {
      status: results.success ? 200 : 500,
    })
  } catch (error: any) {
    console.error("❌ Prisma fix process failed:", error)

    return NextResponse.json(
      {
        success: false,
        message: "Prisma fix process failed",
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    console.log(`🔧 Prisma fix POST action: ${action}`)

    switch (action) {
      case "reset":
        try {
          await prisma.$disconnect()
          await prisma.$connect()

          return NextResponse.json({
            success: true,
            message: "Prisma connection reset successfully",
            timestamp: new Date().toISOString(),
          })
        } catch (error: any) {
          return NextResponse.json(
            {
              success: false,
              message: "Failed to reset Prisma connection",
              error: error.message,
              timestamp: new Date().toISOString(),
            },
            { status: 500 },
          )
        }

      case "test":
        try {
          const result = await testDatabaseConnection()

          return NextResponse.json({
            success: result,
            message: result ? "Database connection test passed" : "Database connection test failed",
            timestamp: new Date().toISOString(),
          })
        } catch (error: any) {
          return NextResponse.json(
            {
              success: false,
              message: "Database connection test error",
              error: error.message,
              timestamp: new Date().toISOString(),
            },
            { status: 500 },
          )
        }

      default:
        return NextResponse.json(
          {
            success: false,
            message: "Invalid action. Supported actions: reset, test",
            timestamp: new Date().toISOString(),
          },
          { status: 400 },
        )
    }
  } catch (error: any) {
    console.error("❌ Prisma fix POST failed:", error)

    return NextResponse.json(
      {
        success: false,
        message: "Prisma fix POST request failed",
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
