import { type NextRequest, NextResponse } from "next/server"

// Add this export to prevent the route from being executed during build time
export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    console.log("🔄 Resetting Prisma client and database connection...")

    // Import database modules only at runtime
    const { sql, prisma } = await import("@/lib/database")

    // Force disconnect any existing connections
    try {
      await prisma.$disconnect()
      console.log("✅ Disconnected existing Prisma client")
    } catch (e) {
      console.log("ℹ️ No existing Prisma client to disconnect")
    }

    // Clear the global Prisma instance
    const globalForPrisma = globalThis as unknown as {
      prisma: any | undefined
    }
    globalForPrisma.prisma = undefined

    // Test direct SQL connection
    console.log("🧪 Testing direct SQL connection...")
    const testResult = await sql`SELECT 'Database connection working' as message, NOW() as timestamp`
    console.log("✅ Direct SQL working:", testResult[0])

    // Check if applications table exists
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'applications'
      ) as exists
    `

    const applicationsExists = tableCheck[0]?.exists

    if (!applicationsExists) {
      console.log("🏗️ Applications table missing, creating it...")

      // Create the applications table
      await sql`
        CREATE TABLE applications (
          id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
          user_id TEXT,
          phone TEXT NOT NULL,
          email TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'SUBMITTED',
          form_data JSONB NOT NULL,
          current_step INTEGER DEFAULT 1,
          notes TEXT,
          dcc_created BOOLEAN DEFAULT false,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `

      // Create indexes
      await sql`CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status)`
      await sql`CREATE INDEX IF NOT EXISTS idx_applications_email ON applications(email)`

      console.log("✅ Applications table created")
    }

    // Now test with a fresh Prisma import
    console.log("🧪 Testing fresh Prisma connection...")

    // Dynamic import to get a fresh instance
    const { PrismaClient } = await import("@prisma/client")
    const freshPrisma = new PrismaClient()

    try {
      await freshPrisma.$connect()
      const count = await freshPrisma.application.count()
      console.log("✅ Fresh Prisma connection successful, count:", count)

      await freshPrisma.$disconnect()

      return NextResponse.json({
        success: true,
        message: "Prisma client reset successfully",
        applicationsCount: count,
        applicationsTableExists: applicationsExists,
      })
    } catch (prismaError: any) {
      console.error("❌ Fresh Prisma still failing:", prismaError.message)
      await freshPrisma.$disconnect()

      return NextResponse.json({
        success: false,
        error: "Prisma client still failing after reset",
        details: prismaError.message,
        applicationsTableExists: applicationsExists,
        suggestion:
          "The Prisma schema might need to be regenerated. Try running 'npx prisma db push' or 'npx prisma generate'",
      })
    }
  } catch (error: any) {
    console.error("❌ Reset failed:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stack: error.stack,
      },
      { status: 500 },
    )
  }
}
