import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updatePermissions() {
  try {
    console.log('🚀 Starting permissions update...')

    // Get all users that need file upload permissions
    const users = await prisma.user.findMany({
      where: {
        role: {
          in: ['ADMIN', 'EMPLOYER']
        }
      },
      select: {
        id: true,
        email: true,
        role: true,
        permissions: true
      }
    })

    console.log(`📋 Found ${users.length} users to update`)

    // Update each user
    for (const user of users) {
      const currentPermissions = user.permissions || []
      if (!currentPermissions.includes('files.upload')) {
        const updatedPermissions = [...currentPermissions, 'files.upload']
        
        await prisma.user.update({
          where: { id: user.id },
          data: {
            permissions: updatedPermissions
          }
        })

        console.log(`✅ Added files.upload permission for user: ${user.email}`)
      } else {
        console.log(`ℹ️ User ${user.email} already has files.upload permission`)
      }
    }

    console.log('✨ Permissions update completed')
  } catch (error) {
    console.error('❌ Error updating permissions:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updatePermissions() 