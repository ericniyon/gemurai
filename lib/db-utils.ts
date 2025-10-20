import { PrismaClient } from "@prisma/client"

// Create a reliable database utility that works in Next.js API routes
export async function withDatabase<T>(
  operation: (prisma: PrismaClient) => Promise<T>
): Promise<T> {
  let prisma: PrismaClient | null = null
  
  try {
    // Create a fresh Prisma client instance
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL
        }
      },
      log: process.env.NODE_ENV === 'development' ? ['error'] : ['error']
    })
    
    // Connect to database
    await prisma.$connect()
    
    // Execute the operation
    return await operation(prisma)
    
  } catch (error) {
    console.error("Database operation failed:", error)
    throw error
  } finally {
    // Clean up
    if (prisma) {
      try {
        await prisma.$disconnect()
      } catch (disconnectError) {
        console.error("Error disconnecting from database:", disconnectError)
      }
    }
  }
}

// Convenience function for common database operations
export async function dbQuery<T>(
  operation: (prisma: PrismaClient) => Promise<T>
): Promise<T> {
  return withDatabase(operation)
}

// Test database connection
export async function testDatabaseConnection(): Promise<{ success: boolean; message: string }> {
  try {
    await withDatabase(async (prisma) => {
      await prisma.$queryRaw`SELECT 1`
    })
    return { success: true, message: "Database connection successful" }
  } catch (error) {
    return { 
      success: false, 
      message: `Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }
  }
}
