import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Define the required DCC permissions with full product access
const DCC_PERMISSIONS = [
  "dashboard.view",
  // Full product permissions
  "products.view",
  "products.create",
  "products.edit",
  "products.delete",
  "products.purchase",
  "products.manage",
  // Stock management
  "stock.create",
  // Other existing permissions
  "orders.view",
  "orders.create",
  "learning.view",
  "learning.enroll",
  "jobs.view",
  "jobs.apply",
  "finance.view",
  "finance.request"
]

async function main() {
  try {
    console.log('🔄 Updating DCC permissions with full product access...\n')

    // Get all DCC users
    const dccUsers = await prisma.user.findMany({
      where: { role: 'DCC' }
    })

    console.log(`Found ${dccUsers.length} DCC users to update`)

    // Update each user's permissions
    for (const user of dccUsers) {
      console.log(`\n👤 Updating permissions for: ${user.name} (${user.email})`)
      
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          permissions: DCC_PERMISSIONS
        }
      })

      console.log('✅ Permissions updated successfully')
      console.log('📋 New product permissions:')
      const productPermissions = updatedUser.permissions.filter(p => p.startsWith('products.'))
      productPermissions.forEach(p => console.log(`  - ${p}`))
    }

    console.log('\n🎉 All DCC permissions have been updated with full product access!')

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main() 