const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function addStockOrderPermissions() {
  try {
    console.log('🔍 Finding EMPLOYER role...')
    
    // Find the EMPLOYER role
    const employerRole = await prisma.role.findUnique({
      where: { name: "EMPLOYER" }
    })

    if (!employerRole) {
      console.log('❌ EMPLOYER role not found')
      return
    }

    console.log(`✅ Found EMPLOYER role: ${employerRole.name}`)

    // Stock order permissions to add
    const stockOrderPermissions = [
      "stockorder.read",
      "stockorder.list",
      "stockorder.approve",
      "stockorder.reject"
    ]

    console.log('📋 Adding stock order permissions...')

    for (const permissionName of stockOrderPermissions) {
      // Find the permission
      const permission = await prisma.permission.findUnique({
        where: { name: permissionName }
      })

      if (!permission) {
        console.log(`❌ Permission not found: ${permissionName}`)
        continue
      }

      // Check if role already has this permission
      const existingRolePermission = await prisma.rolePermission.findUnique({
        where: {
          roleId_permissionId: {
            roleId: employerRole.id,
            permissionId: permission.id
          }
        }
      })

      if (existingRolePermission) {
        console.log(`⏭️  Permission already exists: ${permissionName}`)
        continue
      }

      // Add permission to role
      await prisma.rolePermission.create({
        data: {
          roleId: employerRole.id,
          permissionId: permission.id
        }
      })

      console.log(`✅ Added permission: ${permissionName}`)
    }

    console.log('🎉 Stock order permissions added successfully!')

  } catch (error) {
    console.error('❌ Error adding stock order permissions:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the update
addStockOrderPermissions() 