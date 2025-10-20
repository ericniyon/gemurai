import { PrismaClient } from "@prisma/client"

// Global instances for connection pooling
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Simple, reliable Prisma client initialization
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  },
  log: process.env.NODE_ENV === 'development' ? ['error'] : ['error']
})

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}

// Simple connection function that works reliably
export async function ensureDatabaseConnected() {
  try {
    // Check if DATABASE_URL is available
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is required")
    }

    // Try to connect
    await prisma.$connect()
    
    // Verify connection with a test query
    await prisma.$queryRaw`SELECT 1`
    
  } catch (error) {
    console.error("Database connection failed:", error)
    throw error
  }
}

// Simple disconnect function
export async function disconnectDatabase() {
  try {
    await prisma.$disconnect()
  } catch (error) {
    console.error("Error disconnecting from database:", error)
  }
}

// Database connection test
export async function testDatabaseConnection() {
  try {
    await ensureDatabaseConnected()
    return { success: true, message: "Database connection successful" }
  } catch (error) {
    return { 
      success: false, 
      message: `Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }
  }
}

// Database health check
export async function getDatabaseHealth() {
  try {
    await ensureDatabaseConnected()
    const result = await prisma.$queryRaw`SELECT NOW() as current_time, version() as version`
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

// Create a wrapper for Prisma operations that ensures connection
export const db = {
  user: {
    findFirst: async (args: any) => {
      await ensureDatabaseConnected()
      return await prisma.user.findFirst(args)
    },
    findUnique: async (args: any) => {
      await ensureDatabaseConnected()
      return await prisma.user.findUnique(args)
    },
    findMany: async (args: any) => {
      await ensureDatabaseConnected()
      return await prisma.user.findMany(args)
    },
    create: async (args: any) => {
      await ensureDatabaseConnected()
      return await prisma.user.create(args)
    },
    update: async (args: any) => {
      await ensureDatabaseConnected()
      return await prisma.user.update(args)
    },
    delete: async (args: any) => {
      await ensureDatabaseConnected()
      return await prisma.user.delete(args)
    },
    count: async (args: any) => {
      await ensureDatabaseConnected()
      return await prisma.user.count(args)
    }
  },
  application: {
    findFirst: async (args: any) => {
      await ensureDatabaseConnected()
      return await prisma.application.findFirst(args)
    },
    findUnique: async (args: any) => {
      await ensureDatabaseConnected()
      return await prisma.application.findUnique(args)
    },
    findMany: async (args: any) => {
      await ensureDatabaseConnected()
      return await prisma.application.findMany(args)
    },
    create: async (args: any) => {
      await ensureDatabaseConnected()
      return await prisma.application.create(args)
    },
    update: async (args: any) => {
      await ensureDatabaseConnected()
      return await prisma.application.update(args)
    },
    delete: async (args: any) => {
      await ensureDatabaseConnected()
      return await prisma.application.delete(args)
    },
    count: async (args: any) => {
      await ensureDatabaseConnected()
      return await prisma.application.count(args)
    }
  },
  applicationInterview: {
    findFirst: async (args: any) => {
      await ensureDatabaseConnected()
      return await prisma.applicationInterview.findFirst(args)
    },
    findUnique: async (args: any) => {
      await ensureDatabaseConnected()
      return await prisma.applicationInterview.findUnique(args)
    },
    findMany: async (args: any) => {
      await ensureDatabaseConnected()
      return await prisma.applicationInterview.findMany(args)
    },
    create: async (args: any) => {
      await ensureDatabaseConnected()
      return await prisma.applicationInterview.create(args)
    },
    update: async (args: any) => {
      await ensureDatabaseConnected()
      return await prisma.applicationInterview.update(args)
    },
    delete: async (args: any) => {
      await ensureDatabaseConnected()
      return await prisma.applicationInterview.delete(args)
    },
    count: async (args: any) => {
      await ensureDatabaseConnected()
      return await prisma.applicationInterview.count(args)
    }
  }
}
