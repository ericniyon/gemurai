import { prisma } from "@/lib/database"

/**
 * Simple test to verify MCC-Inventory integration setup
 * This test checks if the basic database structure is ready
 */

async function testMCCIntegrationSetup() {
  console.log("🧪 Testing MCC-Inventory Integration Setup...")
  
  try {
    // Test 1: Check if we can connect to database
    console.log("\n📋 Test 1: Database connection...")
    await prisma.$connect()
    console.log("✅ Database connected successfully")

    // Test 2: Check existing tables
    console.log("\n📋 Test 2: Checking existing tables...")
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE '%mcc%' OR table_name LIKE '%milk%' OR table_name LIKE '%farmer%'
    `
    console.log("✅ MCC-related tables found:", tables)

    // Test 3: Check if we can query existing inventory tables
    console.log("\n📋 Test 3: Checking inventory tables...")
    const inventoryTables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND (table_name LIKE '%stock%' OR table_name LIKE '%product%' OR table_name LIKE '%warehouse%')
    `
    console.log("✅ Inventory tables found:", inventoryTables)

    // Test 4: Check existing products
    console.log("\n📋 Test 4: Checking existing products...")
    const productCount = await prisma.products.count()
    console.log("✅ Products in database:", productCount)

    // Test 5: Check existing warehouses
    console.log("\n📋 Test 5: Checking existing warehouses...")
    const warehouseCount = await prisma.warehouse.count()
    console.log("✅ Warehouses in database:", warehouseCount)

    // Test 6: Check existing stock quantities
    console.log("\n📋 Test 6: Checking existing stock quantities...")
    const stockQuantityCount = await prisma.stockQuantity.count()
    console.log("✅ Stock quantities in database:", stockQuantityCount)

    console.log("\n🎉 MCC-Inventory Integration Setup Test Complete!")
    console.log("\n📋 Setup Status:")
    console.log("- ✅ Database connection working")
    console.log("- ✅ Inventory tables available")
    console.log("- ✅ Products table ready")
    console.log("- ✅ Warehouses table ready")
    console.log("- ✅ Stock quantities table ready")
    
    console.log("\n📝 Next Steps:")
    console.log("1. Apply the MCC migration to create MCC-specific tables")
    console.log("2. Test the MCCInventoryService with real data")
    console.log("3. Integrate with the existing MCC dashboard")

    return {
      success: true,
      productCount,
      warehouseCount,
      stockQuantityCount
    }

  } catch (error) {
    console.error("❌ Setup test failed:", error)
    return {
      success: false,
      error: error.message
    }
  } finally {
    await prisma.$disconnect()
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testMCCIntegrationSetup()
    .then(result => {
      if (result.success) {
        console.log("\n✅ Setup test completed successfully!")
        process.exit(0)
      } else {
        console.log("\n❌ Setup test failed!")
        process.exit(1)
      }
    })
    .catch(error => {
      console.error("❌ Test execution failed:", error)
      process.exit(1)
    })
}

export { testMCCIntegrationSetup }
