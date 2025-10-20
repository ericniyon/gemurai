const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function generateInventoryData() {
  console.log('🏭 Generating Inventory Data...\n');

  try {
    // Get a user to use as seller
    const seller = await prisma.user.findFirst();
    if (!seller) {
      console.error('❌ No users found in database. Please create a user first.');
      return;
    }

    // 1. Check and Create Warehouses
    console.log('📦 Checking/Creating Warehouses...');
    
    // Check if warehouses already exist
    const existingWarehouses = await prisma.warehouse.findMany();
    let warehouses = existingWarehouses;
    
    if (existingWarehouses.length === 0) {
      warehouses = await Promise.all([
        prisma.warehouse.create({
          data: {
            name: "Main Distribution Center",
            code: "MDC-001",
            description: "Primary warehouse for all product distribution",
            address: "123 Industrial Blvd",
            city: "Kigali",
            country: "Rwanda",
            isActive: true,
            isMain: true,
          }
        }),
        prisma.warehouse.create({
          data: {
            name: "Northern Regional Warehouse",
            code: "NRW-002",
            description: "Regional warehouse serving northern provinces",
            address: "456 Business Park",
            city: "Musanze",
            country: "Rwanda",
            isActive: true,
            isMain: false,
          }
        }),
        prisma.warehouse.create({
          data: {
            name: "Southern Distribution Hub",
            code: "SDH-003",
            description: "Distribution hub for southern regions",
            address: "789 Commerce Street",
            city: "Huye",
            country: "Rwanda",
            isActive: true,
            isMain: false,
          }
        })
      ]);
      console.log(`✅ Created ${warehouses.length} warehouses`);
    } else {
      console.log(`✅ Found ${warehouses.length} existing warehouses`);
    }

    // 2. Check and Create Zones for each warehouse
    console.log('\n🗺️ Checking/Creating Zones...');
    const existingZones = await prisma.location.findMany();
    let zones = existingZones;
    
    if (existingZones.length === 0) {
      zones = [];
      for (const warehouse of warehouses) {
        const warehouseZones = await Promise.all([
          prisma.location.create({
            data: {
              name: "Zone A - Fast Moving",
              code: `${warehouse.code}-ZA`,
              description: "High-demand products zone",
              warehouseId: warehouse.id,
              locationType: "STORAGE",
              isActive: true,
              maxCapacity: 1000,
              currentCapacity: 0,
            }
          }),
          prisma.location.create({
            data: {
              name: "Zone B - Medium Moving",
              code: `${warehouse.code}-ZB`,
              description: "Medium-demand products zone",
              warehouseId: warehouse.id,
              locationType: "STORAGE",
              isActive: true,
              maxCapacity: 800,
              currentCapacity: 0,
            }
          }),
          prisma.location.create({
            data: {
              name: "Zone C - Slow Moving",
              code: `${warehouse.code}-ZC`,
              description: "Low-demand products zone",
              warehouseId: warehouse.id,
              locationType: "STORAGE",
              isActive: true,
              maxCapacity: 600,
              currentCapacity: 0,
            }
          }),
          prisma.location.create({
            data: {
              name: "Zone D - Bulk Storage",
              code: `${warehouse.code}-ZD`,
              description: "Bulk storage for large quantities",
              warehouseId: warehouse.id,
              locationType: "STORAGE",
              isActive: true,
              maxCapacity: 2000,
              currentCapacity: 0,
            }
          })
        ]);
        zones.push(...warehouseZones);
      }
      console.log(`✅ Created ${zones.length} zones`);
    } else {
      console.log(`✅ Found ${zones.length} existing zones`);
    }

    // 3. Check and Create Products
    console.log('\n🛍️ Checking/Creating Products...');
    const existingProducts = await prisma.product.findMany();
    let products = existingProducts;
    
    if (existingProducts.length === 0) {
      products = await Promise.all([
        prisma.product.create({
          data: {
            name: "Condom - Premium",
            description: "Premium quality condoms",
            category: "Health & Wellness",
            price: 2500,
            sellerId: seller.id,
            isActive: true,
          }
        }),
        prisma.product.create({
          data: {
            name: "OMO Detergent Powder",
            description: "Laundry detergent powder",
            category: "Household",
            price: 3500,
            sellerId: seller.id,
            isActive: true,
          }
        }),
        prisma.product.create({
          data: {
            name: "Soap Bar - Antibacterial",
            description: "Antibacterial soap bars",
            category: "Personal Care",
            price: 1200,
            sellerId: seller.id,
            isActive: true,
          }
        }),
        prisma.product.create({
          data: {
            name: "Toothpaste - Fresh Mint",
            description: "Fresh mint toothpaste",
            category: "Personal Care",
            price: 1800,
            sellerId: seller.id,
            isActive: true,
          }
        }),
        prisma.product.create({
          data: {
            name: "Rice - Premium Quality",
            description: "Premium quality rice",
            category: "Food & Beverages",
            price: 2800,
            sellerId: seller.id,
            isActive: true,
          }
        }),
        prisma.product.create({
          data: {
            name: "Cooking Oil - Vegetable",
            description: "Pure vegetable cooking oil",
            category: "Food & Beverages",
            price: 2200,
            sellerId: seller.id,
            isActive: true,
          }
        }),
        prisma.product.create({
          data: {
            name: "Sugar - White Refined",
            description: "White refined sugar",
            category: "Food & Beverages",
            price: 1500,
            sellerId: seller.id,
            isActive: true,
          }
        }),
        prisma.product.create({
          data: {
            name: "Salt - Iodized",
            description: "Iodized table salt",
            category: "Food & Beverages",
            price: 800,
            sellerId: seller.id,
            isActive: true,
          }
        }),
        prisma.product.create({
          data: {
            name: "Bleach - Household",
            description: "Household bleach for cleaning",
            category: "Household",
            price: 1800,
            sellerId: seller.id,
            isActive: true,
          }
        }),
        prisma.product.create({
          data: {
            name: "Toilet Paper - Soft",
            description: "Soft toilet paper rolls",
            category: "Household",
            price: 500,
            sellerId: seller.id,
            isActive: true,
          }
        })
      ]);
      console.log(`✅ Created ${products.length} products`);
    } else {
      console.log(`✅ Found ${products.length} existing products`);
    }

    // 4. Check and Create Stock Quantities and Movements
    console.log('\n📊 Checking/Creating Stock Quantities and Movements...');
    const existingStockQuantities = await prisma.stockQuantity.findMany();
    
    if (existingStockQuantities.length === 0) {
      for (const product of products) {
        for (const warehouse of warehouses) {
          // Get zones for this warehouse
          const warehouseZones = zones.filter(zone => zone.warehouseId === warehouse.id);
          
          // Create stock quantities for each zone
          for (const zone of warehouseZones) {
            const quantity = Math.floor(Math.random() * 500) + 100; // Random quantity between 100-600
            
            // Create stock quantity
            await prisma.stockQuantity.create({
              data: {
                productId: product.id,
                warehouseId: warehouse.id,
                locationId: zone.id,
                quantity: quantity,
              }
            });

            // Create stock movement (IN) for initial stock
            await prisma.stockMove.create({
              data: {
                productId: product.id,
                warehouseId: warehouse.id,
                locationId: zone.id,
                destinationLocationId: zone.id,
                quantity: quantity,
                unitPrice: product.price,
                moveType: "INCOMING",
                state: "DONE",
                priority: "NORMAL",
                date: new Date(),
                origin: "INITIAL_STOCK",
                reference: `INIT-${product.id}-${zone.code}`,
                notes: "Initial stock setup",
                createdBy: seller.id,
                processedBy: seller.id,
                processedAt: new Date(),
              }
            });
          }
        }
      }
      console.log('✅ Created stock quantities and movements');
    } else {
      console.log(`✅ Found ${existingStockQuantities.length} existing stock quantities`);
    }

    // 5. Create some additional stock movements (always add these)
    console.log('\n🔄 Creating Additional Stock Movements...');
    
    const movementTypes = ["INCOMING", "OUTGOING", "INTERNAL"];
    const priorities = ["LOW", "NORMAL", "HIGH", "URGENT"];
    const states = ["DRAFT", "CONFIRMED", "ASSIGNED", "DONE", "CANCELLED"];
    
    for (let i = 0; i < 20; i++) {
      const randomProduct = products[Math.floor(Math.random() * products.length)];
      const randomWarehouse = warehouses[Math.floor(Math.random() * warehouses.length)];
      const warehouseZones = zones.filter(zone => zone.warehouseId === randomWarehouse.id);
      const randomZone = warehouseZones[Math.floor(Math.random() * warehouseZones.length)];
      const randomDestinationZone = warehouseZones[Math.floor(Math.random() * warehouseZones.length)];
      
      const moveType = movementTypes[Math.floor(Math.random() * movementTypes.length)];
      const priority = priorities[Math.floor(Math.random() * priorities.length)];
      const state = states[Math.floor(Math.random() * states.length)];
      const quantity = Math.floor(Math.random() * 200) + 10;
      
      await prisma.stockMove.create({
        data: {
          productId: randomProduct.id,
          warehouseId: randomWarehouse.id,
          locationId: randomZone.id,
          destinationLocationId: moveType === "INTERNAL" ? randomDestinationZone.id : randomZone.id,
          quantity: quantity,
          unitPrice: randomProduct.price,
          moveType: moveType,
          state: state,
          priority: priority,
          date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within last 30 days
          origin: "MANUAL",
          reference: `${moveType}-${randomProduct.id}-${Date.now()}-${i}`,
          notes: `${moveType} movement for ${randomProduct.name}`,
          createdBy: seller.id,
          processedBy: state === "DONE" ? seller.id : null,
          processedAt: state === "DONE" ? new Date() : null,
        }
      });
    }

    console.log('✅ Created additional stock movements');

    // 6. Summary
    console.log('\n📋 Inventory Data Generation Summary:');
    console.log(`🏭 Warehouses: ${warehouses.length}`);
    console.log(`🗺️ Zones: ${zones.length}`);
    console.log(`🛍️ Products: ${products.length}`);
    console.log(`📊 Stock Movements: ${20 + (products.length * warehouses.length * 4)}`);
    
    console.log('\n🎯 Generated Products:');
    products.forEach(product => {
      console.log(`  - ${product.name} - ${product.price} RWF`);
    });
    
    console.log('\n🏭 Generated Warehouses:');
    warehouses.forEach(warehouse => {
      console.log(`  - ${warehouse.name} (${warehouse.code}) - ${warehouse.city}`);
    });

    console.log('\n✅ Inventory data generation completed successfully!');

  } catch (error) {
    console.error('❌ Error generating inventory data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
generateInventoryData().catch(console.error); 