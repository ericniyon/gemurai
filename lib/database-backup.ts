import { PrismaClient } from "@prisma/client"
import { neon, neonConfig } from "@neondatabase/serverless"
import { Pool } from "@neondatabase/serverless"

// Check if we're running on the server side
const isServer = typeof window === 'undefined' && typeof process !== 'undefined'

// For API routes, always allow database operations
const isAPIRoute = typeof process !== 'undefined' && process.env.NODE_ENV !== 'test'

// Configure Neon for better reliability (only on server)
// Only configure Neon if we're using a Neon database URL and running on server
if (isServer && process.env.DATABASE_URL?.includes('neon.tech')) {
  neonConfig.fetchConnectionCache = true
  neonConfig.wsProxy = (host) => `${host}:5432/v1`
  neonConfig.useSecureWebSocket = true
  neonConfig.pipelineConnect = false
}

// Global instances for connection pooling
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  neonPool: Pool | undefined
}

// Initialize Prisma client (simplified for API routes)
export const prisma = (globalForPrisma.prisma ?? (() => {
  console.log("🔧 Initializing Prisma client...")
  
  // Ensure DATABASE_URL is available
  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL environment variable is not set")
    throw new Error("DATABASE_URL environment variable is required")
  }
  
  const client = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    },
    // Add connection timeout and retry configuration
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    // Global transaction timeout configuration
    __internal: {
      engine: {
        // Increase transaction timeout for production
        interactiveTransactionTimeout: 30000,
        // Increase query timeout
        queryTimeout: 30000,
        // Increase connection timeout
        connectionTimeout: 30000
      }
    }
  })
  
  // Add error handling for Prisma client (only on server)
  if (isServer) {
    client.$on('error', (e) => {
      console.error('Prisma client error:', e)
    })
  }
  
  console.log("✅ Prisma client initialized successfully")
  console.log("🔍 DATABASE_URL:", process.env.DATABASE_URL ? "Set" : "Not set")
  return client
})())

// Initialize Neon pool for direct SQL queries (only on server and Neon databases)
export const neonPool = (!isServer || !process.env.DATABASE_URL?.includes('neon.tech'))
  ? null
  : (globalForPrisma.neonPool ?? new Pool({ 
      connectionString: process.env.DATABASE_URL
    }))

// Initialize database connection
async function initializeDatabase() {
  if (!isServer) {
    console.log("🏗️ Not on server: Skipping database initialization")
    return
  }

  try {
    console.log("🔌 Initializing database connection...")
    
    // Check if Prisma client is properly initialized
    if (!prisma || typeof (prisma as PrismaClient).$connect !== 'function') {
      console.error("❌ Prisma client is not properly initialized")
      throw new Error("Prisma client is not properly initialized")
    }

    // Connect to database
    await (prisma as PrismaClient).$connect()
    console.log("✅ Database connected successfully")
    
    // Verify connection with a test query
    try {
      await (prisma as PrismaClient).$queryRaw`SELECT 1 as test`
      console.log("✅ Database connection verified")
    } catch (verifyError) {
      console.error("❌ Database connection verification failed:", verifyError)
      throw verifyError
    }
  } catch (error) {
    console.error("❌ Failed to connect to database:", error)
    throw error
  }
}

// Auto-connect in development and production (server-side only)
if (isServer) {
  // Initialize database connection on startup
  initializeDatabase().catch((error) => {
    console.error("❌ Failed to initialize database on startup:", error)
    // Don't throw here to prevent app crash, but log the error
  })
}

// Create a wrapper for Prisma operations that ensures connection
export const db = {
  user: {
    findFirst: async (args: any) => {
      try {
        await ensureDatabaseConnected()
        return await (prisma as PrismaClient).user.findFirst(args)
      } catch (error) {
        console.error("Database user.findFirst error:", error)
        throw error
      }
    },
    findUnique: async (args: any) => {
      try {
        await ensureDatabaseConnected()
        return await (prisma as PrismaClient).user.findUnique(args)
      } catch (error) {
        console.error("Database user.findUnique error:", error)
        throw error
      }
    },
    findMany: async (args: any) => {
      try {
        await ensureDatabaseConnected()
        return await (prisma as PrismaClient).user.findMany(args)
      } catch (error) {
        console.error("Database user.findMany error:", error)
        throw error
      }
    },
    create: async (args: any) => {
      try {
        await ensureDatabaseConnected()
        return await (prisma as PrismaClient).user.create(args)
      } catch (error) {
        console.error("Database user.create error:", error)
        throw error
      }
    },
    update: async (args: any) => {
      try {
        await ensureDatabaseConnected()
        return await (prisma as PrismaClient).user.update(args)
      } catch (error) {
        console.error("Database user.update error:", error)
        throw error
      }
    },
    delete: async (args: any) => {
      try {
        await ensureDatabaseConnected()
        return await (prisma as PrismaClient).user.delete(args)
      } catch (error) {
        console.error("Database user.delete error:", error)
        throw error
      }
    }
  },
  $queryRaw: async (query: any) => {
    try {
      await ensureDatabaseConnected()
      return await (prisma as PrismaClient).$queryRaw(query)
    } catch (error) {
      console.error("Database $queryRaw error:", error)
      throw error
    }
  },
  $connect: async () => {
    return ensureDatabaseConnected()
  }
}

// Save instances in development (skip during build and browser)
if (process.env.NODE_ENV !== "production" && isServer) {
  globalForPrisma.prisma = prisma as PrismaClient
  if (neonPool) {
    globalForPrisma.neonPool = neonPool
  }
}

// Create SQL executor with retries (build-safe and browser-safe)
export const sql = async (strings: TemplateStringsArray, ...values: any[]) => {
  if (!isServer) {
    console.log("🏗️ Build time or browser: Skipping SQL execution")
    return []
  }

  // Only use Neon for Neon databases
  if (!process.env.DATABASE_URL?.includes('neon.tech')) {
    throw new Error("Direct SQL queries are only supported for Neon databases")
  }

  const maxRetries = 3
  let lastError

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Use the neon function directly with retries
      const result = await neon(process.env.DATABASE_URL!)(strings, ...values)
      return result
    } catch (error: any) {
      console.error(`Database query attempt ${attempt} failed:`, error)
      lastError = error

      // Wait before retrying (exponential backoff)
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 500 * Math.pow(2, attempt - 1)))
      }
    }
  }

  throw lastError
}

// Ensure database is connected before operations
export async function ensureDatabaseConnected() {
  if (!isServer) {
    return
  }

  const maxRetries = 3
  let lastError

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔌 Database connection attempt ${attempt}/${maxRetries}`)
      
      // Check if Prisma client is properly initialized
      if (!prisma || typeof prisma.$connect !== 'function') {
        console.error("❌ Prisma client is not properly initialized")
        console.error("❌ Prisma client type:", typeof prisma)
        console.error("❌ Prisma client:", prisma)
        throw new Error("Prisma client is not properly initialized")
      }

      // Check if DATABASE_URL is available
      if (!process.env.DATABASE_URL) {
        console.error("❌ DATABASE_URL environment variable is not set")
        throw new Error("DATABASE_URL environment variable is required")
      }

      // Check if already connected by trying a simple query
      try {
        await prisma.$queryRaw`SELECT 1`
        console.log("✅ Database connection verified")
        return
      } catch (queryError) {
        console.log(`🔄 Database not connected (attempt ${attempt}), attempting to connect...`)
        console.log(`🔄 Query error:`, queryError)
      }

      // Connect to database
      console.log("🔌 Attempting to connect to database...")
      await prisma.$connect()
      console.log("✅ Database connected successfully")
      
      // Verify connection with a test query
      console.log("🔍 Verifying database connection...")
      await prisma.$queryRaw`SELECT 1`
      console.log("✅ Database connection verified after connect")
      return
      
    } catch (error) {
      console.error(`❌ Database connection attempt ${attempt} failed:`, error)
      console.error(`❌ Error details:`, {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace'
      })
      lastError = error

      // Wait before retrying (exponential backoff)
      if (attempt < maxRetries) {
        const delay = 1000 * Math.pow(2, attempt - 1) // 1s, 2s, 4s
        console.log(`⏳ Waiting ${delay}ms before retry...`)
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }

  console.error("❌ All database connection attempts failed")
  throw lastError
}

// Database connection test (server-safe)
export async function testDatabaseConnection() {
  if (!isServer) {
    console.log("🏗️ Not on server: Skipping database connection test")
    return true
  }

  try {
    // Try with Prisma first
    await (prisma as PrismaClient).$connect()
    console.log("✅ Database connected successfully via Prisma")
    return true
  } catch (prismaError) {
    console.error("❌ Prisma connection failed:", prismaError)

    // Fall back to direct Neon connection
    try {
      const result = await sql`SELECT 1 as test`
      if (result && result.length > 0) {
        console.log("✅ Database connected successfully via Neon direct")
        return true
      }
      return false
    } catch (neonError) {
      console.error("❌ Neon direct connection failed:", neonError)
      return false
    }
  }
}

// Graceful shutdown
export async function disconnectDatabase() {
  if (!isServer) {
    console.log("🏗️ Build time or browser: Skipping database disconnect")
    return
  }

  try {
    await (prisma as PrismaClient).$disconnect()
    if (neonPool) {
      await neonPool.end()
    }
  } catch (error) {
    console.error("Error disconnecting from database:", error)
  }
}

// Raw query function for testing (build-safe and browser-safe)
export async function executeRawQuery(query: string) {
  if (!isServer) {
    console.log("🏗️ Build time or browser: Skipping raw query execution")
    return []
  }

  try {
    const result = await (prisma as PrismaClient).$queryRawUnsafe(query)
    return result
  } catch (prismaError) {
    console.error("Prisma raw query failed:", prismaError)

    // Fall back to direct Neon connection
    try {
      const result = await sql`${query}`
      return result
    } catch (neonError) {
      console.error("Neon direct query failed:", neonError)
      throw neonError
    }
  }
}

// Database health check (build-safe and browser-safe)
export async function getDatabaseHealth() {
  if (!isServer) {
    return {
      success: true,
      data: [{ current_time: new Date().toISOString(), version: "Build Time Mock" }],
      timestamp: new Date().toISOString(),
      method: "build-safe-mock",
    }
  }

  try {
    console.log("🔍 Starting database health check...")
    
    // Ensure database is connected first
    await ensureDatabaseConnected()
    
    // Try with Prisma first
    console.log("🔍 Testing Prisma query...")
    const result = await (prisma as PrismaClient).$queryRaw`SELECT NOW() as current_time, version() as version`
    console.log("✅ Prisma health check successful")
    
    return {
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
      method: "prisma",
    }
  } catch (prismaError) {
    console.error("❌ Prisma health check failed:", prismaError)

    // Only fall back to Neon for Neon databases
    if (process.env.DATABASE_URL?.includes('neon.tech')) {
      try {
        console.log("🔄 Falling back to direct Neon connection...")
        const result = await sql`SELECT NOW() as current_time, version() as version`
        console.log("✅ Neon direct health check successful")
        
        return {
          success: true,
          data: result,
          timestamp: new Date().toISOString(),
          method: "neon-direct",
        }
      } catch (neonError) {
        console.error("❌ Neon health check failed:", neonError)
        return {
          success: false,
          error: (typeof neonError === "object" && neonError && "message" in neonError && typeof (neonError as any).message === "string")
            ? (neonError as any).message
            : "Database connection failed",
          timestamp: new Date().toISOString(),
        }
      }
    } else {
      // For non-Neon databases, return the Prisma error
      return {
        success: false,
        error: (typeof prismaError === "object" && prismaError && "message" in prismaError && typeof (prismaError as any).message === "string")
          ? (prismaError as any).message
          : "Database connection failed",
        timestamp: new Date().toISOString(),
      }
    }
  }
}
