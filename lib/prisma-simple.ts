import { PrismaClient } from "@prisma/client"

// Simple Prisma client initialization without complex build-time logic
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prismaSimple = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  },
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prismaSimple
}

// Simple connection function
export async function connectDatabase() {
  try {
    console.log("🔌 Connecting to database with simple Prisma client...")
    await prismaSimple.$connect()
    console.log("✅ Database connected successfully")
    return true
  } catch (error) {
    console.error("❌ Database connection failed:", error)
    throw error
  }
}

// Simple disconnect function
export async function disconnectDatabase() {
  try {
    await prismaSimple.$disconnect()
    console.log("✅ Database disconnected successfully")
  } catch (error) {
    console.error("❌ Error disconnecting from database:", error)
  }
}
