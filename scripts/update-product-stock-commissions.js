const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// Product stock and commission updates
const productUpdates = [
  {
    name: "Condom - Premium",
    stock: 150,
    commission: 15.0
  },
  {
    name: "Toilet Paper - Soft",
    stock: 200,
    commission: 12.0
  },
  {
    name: "Soap Bar - Antibacterial",
    stock: 180,
    commission: 18.0
  },
  {
    name: "OMO Detergent Powder",
    stock: 120,
    commission: 20.0
  },
  {
    name: "Rice - Premium Quality",
    stock: 300,
    commission: 10.0
  },
  {
    name: "Salt - Iodized",
    stock: 250,
    commission: 8.0
  },
  {
    name: "Bleach - Household",
    stock: 100,
    commission: 15.0
  },
  {
    name: "Sugar - White Refined",
    stock: 220,
    commission: 12.0
  },
  {
    name: "Toothpaste - Fresh Mint",
    stock: 160,
    commission: 18.0
  },
  {
    name: "Cooking Oil - Vegetable",
    stock: 140,
    commission: 16.0
  }
]

async function updateProductStockAndCommissions() {
  try {
    console.log('Starting product stock and commission updates...')
    
    for (const update of productUpdates) {
      const product = await prisma.product.findFirst({
        where: { name: update.name }
      })
      
      if (product) {
        // Update the main product record
        await prisma.product.update({
          where: { id: product.id },
          data: {
            stock: update.stock,
            commission: update.commission
          }
        })
        
        // Update or create stock quantity record
        const existingStockQuantity = await prisma.stockQuantity.findFirst({
          where: { productId: product.id }
        })
        
        if (existingStockQuantity) {
          await prisma.stockQuantity.update({
            where: { id: existingStockQuantity.id },
            data: {
              quantity: update.stock,
              availableQuantity: update.stock,
              lastUpdated: new Date()
            }
          })
        } else {
          // Create new stock quantity record
          await prisma.stockQuantity.create({
            data: {
              productId: product.id,
              quantity: update.stock,
              availableQuantity: update.stock,
              reservedQuantity: 0,
              lastUpdated: new Date()
            }
          })
        }
        
        console.log(`✅ Updated ${update.name}: Stock=${update.stock}, Commission=${update.commission}%`)
      } else {
        console.log(`❌ Product not found: ${update.name}`)
      }
    }
    
    console.log('✅ All product updates completed successfully!')
  } catch (error) {
    console.error('❌ Error updating products:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the update
updateProductStockAndCommissions() 