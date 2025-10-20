import { prisma } from '../lib/database'

async function main() {
  try {
    console.log('🔍 Checking DCC permissions in database...\n')

    // Get all DCC users
    const dccUsers = await prisma.user.findMany({
      where: { role: 'DCC' },
      select: {
        id: true,
        email: true,
        name: true,
        permissions: true
      }
    })

    console.log(`Found ${dccUsers.length} DCC users`)
    
    // Check each user's permissions
    for (const user of dccUsers) {
      console.log(`\n👤 User: ${user.name} (${user.email})`)
      console.log('📋 Permissions:')
      
      // Required DCC permissions for products
      const requiredPermissions = [
        'products.view',
        'products.purchase',
        'stock.create'
      ]

      requiredPermissions.forEach(permission => {
        const hasPermission = user.permissions?.includes(permission)
        console.log(`${hasPermission ? '✅' : '❌'} ${permission}`)
      })

      // Show all permissions
      console.log('\n📜 All permissions:')
      user.permissions?.forEach(permission => {
        console.log(`  - ${permission}`)
      })
    }

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main() 