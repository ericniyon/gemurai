import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updateEmployerStockPermissions() {
  try {
    console.log('🔄 Updating EMPLOYER users with stock management permissions...')

    // New permissions to add
    const stockPermissions = [
      'orders.view',
      'orders.manage',
      'products.view',
      'products.create',
      'products.edit',
      'products.delete',
      'products.manage',
      'stock.view',
      'stock.manage'
    ]

    // Find all EMPLOYER users
    const employerUsers = await prisma.user.findMany({
      where: {
        role: 'EMPLOYER'
      }
    })

    console.log(`📊 Found ${employerUsers.length} EMPLOYER users`)

    // Update each EMPLOYER user
    for (const user of employerUsers) {
      // Get current permissions and add new ones without duplicates
      const currentPermissions = user.permissions || []
      const updatedPermissions = Array.from(new Set([...currentPermissions, ...stockPermissions]))

      await prisma.user.update({
        where: { id: user.id },
        data: {
          permissions: updatedPermissions
        }
      })

      console.log(`✅ Updated permissions for: ${user.email}`)
    }

    console.log('🎉 Successfully updated all EMPLOYER users with stock management permissions!')
    console.log('\nNew permissions added:')
    stockPermissions.forEach(permission => {
      console.log(`• ${permission}`)
    })

  } catch (error) {
    console.error('❌ Error updating EMPLOYER permissions:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

updateEmployerStockPermissions() 