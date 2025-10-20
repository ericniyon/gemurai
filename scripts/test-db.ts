import { prisma } from "@/lib/database"

async function testDatabaseConnection() {
  try {
    console.log("🔌 Testing database connection...")
    
    // Test connection
    await prisma.$connect()
    console.log("✅ Database connection successful")
    
    // Test query
    const result = await prisma.$queryRaw`SELECT NOW() as now`
    console.log("✅ Query successful:", result)
    
    // Test application table
    const appCount = await prisma.application.count()
    console.log("✅ Applications table accessible, count:", appCount)
    
  } catch (error) {
    console.error("❌ Database error:", error)
  } finally {
    await prisma.$disconnect()
  }
}

testDatabaseConnection() 