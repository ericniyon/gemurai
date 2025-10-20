import { PrismaClient } from "@prisma/client"

// Global instances for connection pooling
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Simple Prisma client initialization
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  },
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}

// Simple connection function
export async function ensureDatabaseConnected() {
  try {
    console.log("🔌 Ensuring database connection...")
    
    // Check if DATABASE_URL is available
    if (!process.env.DATABASE_URL) {
      console.error("❌ DATABASE_URL environment variable is not set")
      throw new Error("DATABASE_URL environment variable is required")
    }

    // Try to connect
    await prisma.$connect()
    console.log("✅ Database connected successfully")
    
    // Verify connection with a test query
    await prisma.$queryRaw`SELECT 1`
    console.log("✅ Database connection verified")
    
  } catch (error) {
    console.error("❌ Database connection failed:", error)
    throw error
  }
}

// Simple disconnect function
export async function disconnectDatabase() {
  try {
    await prisma.$disconnect()
    console.log("✅ Database disconnected successfully")
  } catch (error) {
    console.error("❌ Error disconnecting from database:", error)
  }
}

// Simple database test
export async function testDatabaseConnection() {
  try {
    await ensureDatabaseConnected()
    return { success: true, message: "Database connection successful" }
  } catch (error) {
    return { 
      success: false, 
      message: "Database connection failed", 
      error: error instanceof Error ? error.message : "Unknown error" 
    }
  }
}
