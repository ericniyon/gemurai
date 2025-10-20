/**
 * Build-safe database wrapper
 * Prevents database connections during static generation while allowing normal operation at runtime
 */

import { PrismaClient } from "@prisma/client"

// Check if we're in a build environment
const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build' || 
                   process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL

// Create a mock Prisma client for build time
const mockPrisma = {
  $connect: () => Promise.resolve(),
  $disconnect: () => Promise.resolve(),
  $queryRaw: () => Promise.resolve([]),
  $queryRawUnsafe: () => Promise.resolve([]),
  application: {
    findMany: () => Promise.resolve([]),
    count: () => Promise.resolve(0),
    findFirst: () => Promise.resolve(null),
    create: () => Promise.resolve(null),
    update: () => Promise.resolve(null),
    delete: () => Promise.resolve(null),
  },
  user: {
    findMany: () => Promise.resolve([]),
    count: () => Promise.resolve(0),
    findFirst: () => Promise.resolve(null),
    findUnique: () => Promise.resolve(null),
    create: () => Promise.resolve(null),
    update: () => Promise.resolve(null),
    delete: () => Promise.resolve(null),
  },
  dCCProfile: {
    findMany: () => Promise.resolve([]),
    count: () => Promise.resolve(0),
    findFirst: () => Promise.resolve(null),
    create: () => Promise.resolve(null),
  },
  emailLog: {
    findMany: () => Promise.resolve([]),
    create: () => Promise.resolve(null),
  },
  sMSLog: {
    findMany: () => Promise.resolve([]),
    create: () => Promise.resolve(null),
  },
} as any

// Global instance for connection pooling
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Export the appropriate client based on environment
export const prisma = isBuildTime 
  ? mockPrisma 
  : (globalForPrisma.prisma ?? new PrismaClient())

// Save the real instance in development (only if not build time)
if (process.env.NODE_ENV !== "production" && !isBuildTime) {
  globalForPrisma.prisma = prisma as PrismaClient
}

// Build-safe database connection test
export async function testDatabaseConnection() {
  if (isBuildTime) {
    console.log("🏗️ Build time: Skipping database connection test")
    return true
  }
  
  try {
    await (prisma as PrismaClient).$connect()
    console.log("✅ Database connected successfully")
    return true
  } catch (error) {
    console.error("❌ Database connection failed:", error)
    return false
  }
}

// Build-safe database health check
export async function getDatabaseHealth() {
  if (isBuildTime) {
    return {
      success: true,
      data: [{ current_time: new Date().toISOString(), version: "Build Time Mock" }],
      timestamp: new Date().toISOString(),
      method: "build-safe-mock",
    }
  }
  
  try {
    const result = await (prisma as PrismaClient).$queryRaw`SELECT NOW() as current_time, version() as version`
    return {
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
      method: "prisma",
    }
  } catch (error: any) {
    console.error("Database health check failed:", error)
    return {
      success: false,
      error: error.message || "Database connection failed",
      timestamp: new Date().toISOString(),
    }
  }
}

export default prisma 