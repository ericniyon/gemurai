const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function updateProductOwnership() {
  try {
    console.log('🔍 Finding employer user...')
    
    // Find the employer user
    const employerUser = await prisma.user.findUnique({
      where: { email: "employer@Gemurai.rw" }
    })

    if (!employerUser) {
      console.log('❌ Employer user not found: employer@Gemurai.rw')
      return
    }

    console.log(`✅ Found employer user: ${employerUser.name} (${employerUser.email})`)
    console.log(`   User ID: ${employerUser.id}`)

    // Get all products
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        sellerId: true
      }
    })

    console.log(`📦 Found ${products.length} products to update`)

    // Update each product's sellerId
    let updatedCount = 0
    for (const product of products) {
      if (product.sellerId !== employerUser.id) {
        await prisma.product.update({
          where: { id: product.id },
          data: {
            sellerId: employerUser.id
          }
        })
        
        console.log(`✅ Updated product: ${product.name}`)
        updatedCount++
      } else {
        console.log(`⏭️  Product already owned by employer: ${product.name}`)
      }
    }

    console.log(`\n🎉 Product ownership update completed!`)
    console.log(`   Total products: ${products.length}`)
    console.log(`   Updated: ${updatedCount}`)
    console.log(`   Already owned by employer: ${products.length - updatedCount}`)

  } catch (error) {
    console.error('❌ Error updating product ownership:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the update
updateProductOwnership() 