#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkEmployerPermissions() {
  try {
    console.log('🔍 Checking EMPLOYER user permissions...')
    
    const employerUser = await prisma.user.findUnique({
      where: { email: 'employer@Gemurai.rw' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        permissions: true
      }
    })

    if (employerUser) {
      console.log('✅ Found EMPLOYER user:')
      console.log('📧 Email:', employerUser.email)
      console.log('👤 Name:', employerUser.name) 
      console.log('🎯 Role:', employerUser.role)
      console.log('🔑 Permissions Count:', employerUser.permissions.length)
      console.log('\n📋 Permissions List:')
      employerUser.permissions.forEach(permission => {
        console.log(`  • ${permission}`)
      })

      const productPermissions = [
        'products.view',
        'products.create', 
        'products.edit',
        'products.delete',
        'products.manage'
      ]

      console.log('\n🛍️ Product Management Check:')
      productPermissions.forEach(permission => {
        const hasPermission = employerUser.permissions.includes(permission)
        console.log(`${hasPermission ? '✅' : '❌'} ${permission}`)
      })

      const hasMarketplaceAccess = employerUser.permissions.includes('products.view')
      console.log(`\n🏪 Marketplace Access: ${hasMarketplaceAccess ? '✅ YES' : '❌ NO'}`)

    } else {
      console.log('❌ EMPLOYER user not found! Creating one...')
      
      const bcrypt = await import('bcryptjs')
      const employerPassword = await bcrypt.hash("employer123", 10)
      
      const newEmployer = await prisma.user.create({
        data: {
          email: "employer@Gemurai.rw",
          name: "Test Employer",
          password: employerPassword,
          role: "EMPLOYER",
          permissions: [
            "dashboard.view",
            "jobs.view",
            "jobs.post", 
            "jobs.manage",
            "users.view",
            "applications.view",
            "applications.review",
            "applications.manage",
            "products.view",
            "products.create",
            "products.edit",
            "products.delete",
            "products.manage",
            "orders.view",
            "orders.manage"
          ],
        },
      })

      console.log('✅ Created new EMPLOYER user:', newEmployer.email)
      console.log('🔑 Password: employer123')
    }

  } catch (error) {
    console.error('❌ Error checking EMPLOYER permissions:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Node.js ESM-compatible entrypoint check
if (process.argv[1] === new URL(import.meta.url).pathname) {
  checkEmployerPermissions()
} 