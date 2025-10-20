const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function updateEmployerPermissions() {
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
    console.log(`   Current permissions: ${employerUser.permissions?.length || 0}`)

    // Define the permissions that EMPLOYER should have
    const employerPermissions = [
      "dashboard.view",
      "jobs.view",
      "jobs.post",
      "jobs.manage",
      "applications.view",
      "applications.review",
      "applications.manage",
      "users.view",
      "products.view",
      "products.create",
      "products.edit",
      "products.delete",
      "products.manage",
      "orders.view",
      "orders.manage",
      "stock.orders.view",
      "stock.orders.manage",
      "stock.view",
      "stock.manage"
    ]

    // Update user permissions
    await prisma.user.update({
      where: { id: employerUser.id },
      data: {
        permissions: employerPermissions
      }
    })

    console.log(`✅ Updated employer permissions`)
    console.log(`   New permissions count: ${employerPermissions.length}`)
    console.log('\n📋 Permissions added:')
    employerPermissions.forEach(permission => {
      console.log(`   • ${permission}`)
    })

  } catch (error) {
    console.error('❌ Error updating employer permissions:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the update
updateEmployerPermissions() 