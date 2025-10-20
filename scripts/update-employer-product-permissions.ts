#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updateEmployerPermissions() {
  try {
    console.log('🔄 Updating EMPLOYER users with product management permissions...')

    // New permissions for EMPLOYER role
    const newEmployerPermissions = [
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
      await prisma.user.update({
        where: { id: user.id },
        data: {
          permissions: newEmployerPermissions
        }
      })

      console.log(`✅ Updated permissions for: ${user.email}`)
    }

    console.log('🎉 Successfully updated all EMPLOYER users with product management permissions!')
    console.log('\nNew permissions added:')
    console.log('• products.view - View product catalog')
    console.log('• products.create - Add new products')
    console.log('• products.edit - Modify product information')  
    console.log('• products.delete - Remove products')
    console.log('• products.manage - Full product management')
    console.log('• orders.view - View orders')
    console.log('• orders.manage - Manage orders')

  } catch (error) {
    console.error('❌ Error updating EMPLOYER permissions:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Node.js ESM-compatible entrypoint check
if (process.argv[1] === new URL(import.meta.url).pathname) {
  updateEmployerPermissions()
} 