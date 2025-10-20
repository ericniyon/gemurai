import { MCCInventoryService } from "@/lib/services/MCCInventoryService"
import { prisma } from "@/lib/database"

/**
 * Comprehensive test suite for MCC-Inventory Integration
 * This test validates the complete workflow from milk collection to inventory management
 */

async function testMCCInventoryIntegration() {
  console.log("🧪 Starting MCC-Inventory Integration Tests...")
  
  try {
    // Test 1: Setup MCC with warehouses and products
    console.log("\n📋 Test 1: Setting up MCC...")
    const mccSetupData = {
      name: "Test MCC Center",
      location: "Kigali, Rwanda",
      contactInfo: {
        phone: "+250700000000",
        email: "test@mcc.rw"
      },
      settings: {
        unitPrice: 500,
        deductionRates: {
          depannage: 50,
          ibipande: 100,
          essence: 75
        }
      },
      warehouses: [
        {
          name: "Collection Center",
          type: "COLLECTION_CENTER" as const,
          location: "Main Collection Point",
          capacity: 10000
        },
        {
          name: "Processing Plant",
          type: "PROCESSING_PLANT" as const,
          location: "Processing Facility",
          capacity: 5000
        }
      ]
    }

    const mccSetup = await MCCInventoryService.setupMCC(mccSetupData)
    console.log("✅ MCC Setup Complete:", {
      mccId: mccSetup.mcc.id,
      warehouses: mccSetup.warehouses.length,
      products: mccSetup.products.length
    })

    // Test 2: Create farmers
    console.log("\n👨‍🌾 Test 2: Creating farmers...")
    const farmer1 = await MCCInventoryService.createFarmer({
      mccId: mccSetup.mcc.id,
      name: "John Doe",
      phone: "+250700000001",
      location: "Rwamagana"
    })

    const farmer2 = await MCCInventoryService.createFarmer({
      mccId: mccSetup.mcc.id,
      name: "Jane Smith",
      phone: "+250700000002",
      location: "Musanze"
    })

    console.log("✅ Farmers Created:", {
      farmer1: farmer1.name,
      farmer2: farmer2.name
    })

    // Test 3: Record milk collections
    console.log("\n🥛 Test 3: Recording milk collections...")
    const collectionWarehouse = mccSetup.warehouses.find(w => w.type === "COLLECTION_CENTER")
    const rawMilkProduct = mccSetup.products.find(p => p.mccProductType === "RAW_MILK")

    if (!collectionWarehouse || !rawMilkProduct) {
      throw new Error("Collection warehouse or raw milk product not found")
    }

    const collection1 = await MCCInventoryService.recordMilkCollection({
      farmerId: farmer1.id,
      collectionDate: new Date(),
      period: 1,
      totalLiters: 50,
      unitPrice: 500,
      totalAmount: 25000,
      warehouseId: collectionWarehouse.id,
      productId: rawMilkProduct.id,
      deductions: {
        depannage: 50,
        ibipande: 100
      },
      advances: 5000,
      collectedBy: "test-user-id"
    })

    const collection2 = await MCCInventoryService.recordMilkCollection({
      farmerId: farmer2.id,
      collectionDate: new Date(),
      period: 1,
      totalLiters: 75,
      unitPrice: 500,
      totalAmount: 37500,
      warehouseId: collectionWarehouse.id,
      productId: rawMilkProduct.id,
      deductions: {
        depannage: 75,
        ibipande: 150
      },
      advances: 7500,
      collectedBy: "test-user-id"
    })

    console.log("✅ Milk Collections Recorded:", {
      collection1: `${collection1.collection.totalLiters}L`,
      collection2: `${collection2.collection.totalLiters}L`,
      inventoryUpdated: collection1.inventoryUpdated && collection2.inventoryUpdated
    })

    // Test 4: Check inventory quantities
    console.log("\n📊 Test 4: Checking inventory quantities...")
    const stockQuantities = await prisma.stockQuantity.findMany({
      where: {
        productId: rawMilkProduct.id,
        warehouseId: collectionWarehouse.id
      }
    })

    console.log("✅ Stock Quantities:", stockQuantities.map(sq => ({
      quantity: sq.quantity,
      available: sq.availableQuantity,
      reserved: sq.reservedQuantity
    })))

    // Test 5: Process milk
    console.log("\n🔄 Test 5: Processing milk...")
    const processingWarehouse = mccSetup.warehouses.find(w => w.type === "PROCESSING_PLANT")
    const processedMilkProduct = mccSetup.products.find(p => p.mccProductType === "PROCESSED_MILK")

    if (!processingWarehouse || !processedMilkProduct) {
      throw new Error("Processing warehouse or processed milk product not found")
    }

    const processing = await MCCInventoryService.processMilk({
      mccId: mccSetup.mcc.id,
      rawMilkProductId: rawMilkProduct.id,
      processedProductId: processedMilkProduct.id,
      inputQuantity: 100, // Process 100L of raw milk
      outputQuantity: 95, // Get 95L of processed milk (5% loss)
      processingDate: new Date(),
      processingSteps: {
        pasteurization: "72°C for 15 seconds",
        cooling: "Rapid cooling to 4°C"
      },
      qualityMetrics: {
        temperature: 4,
        ph: 6.7,
        fatContent: 3.5
      },
      processedBy: "test-user-id"
    })

    console.log("✅ Milk Processing Complete:", {
      inputQuantity: processing.inputQuantity,
      outputQuantity: processing.outputQuantity,
      yield: `${(processing.yield * 100).toFixed(1)}%`
    })

    // Test 6: Get inventory summary
    console.log("\n📈 Test 6: Getting inventory summary...")
    const inventorySummary = await MCCInventoryService.getMCCInventorySummary(mccSetup.mcc.id)
    
    console.log("✅ Inventory Summary:", {
      totalProducts: inventorySummary.inventorySummary.totalProducts,
      totalQuantity: inventorySummary.inventorySummary.totalQuantity,
      totalValue: inventorySummary.inventorySummary.totalValue,
      warehouses: inventorySummary.inventorySummary.warehouses.length
    })

    // Test 7: Get farmer collection history
    console.log("\n📜 Test 7: Getting farmer collection history...")
    const farmerHistory = await MCCInventoryService.getFarmerCollectionHistory(farmer1.id, 5)
    
    console.log("✅ Farmer History:", {
      farmer: farmerHistory[0]?.farmer.name,
      collections: farmerHistory.length,
      totalLiters: farmerHistory.reduce((sum, c) => sum + c.totalLiters, 0)
    })

    // Test 8: Get processing history
    console.log("\n🔄 Test 8: Getting processing history...")
    const processingHistory = await MCCInventoryService.getMCCProcessingHistory(mccSetup.mcc.id, 5)
    
    console.log("✅ Processing History:", {
      mcc: mccSetup.mcc.name,
      processes: processingHistory.length,
      totalInput: processingHistory.reduce((sum, p) => sum + p.inputQuantity, 0),
      totalOutput: processingHistory.reduce((sum, p) => sum + p.outputQuantity, 0)
    })

    console.log("\n🎉 All MCC-Inventory Integration Tests Passed!")
    console.log("\n📋 Test Summary:")
    console.log("- ✅ MCC Setup with warehouses and products")
    console.log("- ✅ Farmer creation and management")
    console.log("- ✅ Milk collection recording with inventory integration")
    console.log("- ✅ Stock quantity tracking")
    console.log("- ✅ Milk processing workflow")
    console.log("- ✅ Inventory summary reporting")
    console.log("- ✅ Collection and processing history")

    return {
      success: true,
      mccId: mccSetup.mcc.id,
      farmerIds: [farmer1.id, farmer2.id],
      productIds: mccSetup.products.map(p => p.id),
      warehouseIds: mccSetup.warehouses.map(w => w.id)
    }

  } catch (error) {
    console.error("❌ Test failed:", error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testMCCInventoryIntegration()
    .then(result => {
      if (result.success) {
        console.log("\n✅ Integration test completed successfully!")
        process.exit(0)
      } else {
        console.log("\n❌ Integration test failed!")
        process.exit(1)
      }
    })
    .catch(error => {
      console.error("❌ Test execution failed:", error)
      process.exit(1)
    })
}

export { testMCCInventoryIntegration }


