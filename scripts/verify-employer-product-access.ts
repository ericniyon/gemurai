#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client'
import { ROLES } from '../lib/permissions'
import { canAccessRoute } from '../lib/auth'

const prisma = new PrismaClient()

async function verifyEmployerProductAccess() {
  try {
    console.log('🔍 Verifying EMPLOYER product management access...')
    console.log('================================================')

    // 1. Check role configuration
    console.log('\n📋 1. Role Configuration Check:')
    const employerRole = ROLES.find(role => role.id === 'employer')
    
    if (employerRole) {
      console.log(`✅ EMPLOYER role found: ${employerRole.name}`)
      console.log(`📝 Description: ${employerRole.description}`)
      
      const productPermissions = [
        'products.view',
        'products.create', 
        'products.edit',
        'products.delete',
        'products.manage'
      ]
      
      console.log('\n🛍️ Product Permissions Check:')
      productPermissions.forEach(permission => {
        const hasPermission = employerRole.permissions.includes(permission)
        console.log(`${hasPermission ? '✅' : '❌'} ${permission}`)
      })

      const orderPermissions = ['orders.view', 'orders.manage']
      console.log('\n📦 Order Permissions Check:')
      orderPermissions.forEach(permission => {
        const hasPermission = employerRole.permissions.includes(permission)
        console.log(`${hasPermission ? '✅' : '❌'} ${permission}`)
      })
    } else {
      console.log('❌ EMPLOYER role not found!')
    }

    // 2. Check database users
    console.log('\n👥 2. Database Users Check:')
    const employerUsers = await prisma.user.findMany({
      where: { role: 'EMPLOYER' },
      select: {
        id: true,
        email: true,
        name: true,
        permissions: true
      }
    })

    console.log(`📊 Found ${employerUsers.length} EMPLOYER users`)
    
    employerUsers.forEach((user, index) => {
      console.log(`\n${index + 1}. ${user.name} (${user.email})`)
      
      const productPerms = [
        'products.view', 'products.create', 'products.edit', 
        'products.delete', 'products.manage'
      ]
      
      const hasAllProductPerms = productPerms.every(perm => 
        user.permissions.includes(perm)
      )
      
      console.log(`   🛍️ Product permissions: ${hasAllProductPerms ? '✅ Complete' : '❌ Missing'}`)
      
      if (!hasAllProductPerms) {
        const missing = productPerms.filter(perm => !user.permissions.includes(perm))
        console.log(`   ❌ Missing: ${missing.join(', ')}`)
      }
    })

    // 3. Route access verification
    console.log('\n🛣️ 3. Route Access Check:')
    if (employerUsers.length > 0) {
      const testUser = {
        id: 'test-employer-id',
        name: 'Test Employer',
        email: 'employer@test.com',
        role: 'EMPLOYER' as const,
        permissions: ['products.view', 'products.create'],
        avatar: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const routesToTest = [
        '/dashboard',
        '/dashboard/marketplace',
        '/dashboard/jobs',
        '/dashboard/applications'
      ]

      routesToTest.forEach(route => {
        const canAccess = canAccessRoute(testUser, route)
        console.log(`${canAccess ? '✅' : '❌'} ${route}`)
      })
    }

    // 4. Summary
    console.log('\n📊 4. Summary:')
    const allEmployersHaveProductAccess = employerUsers.every(user => {
      const productPerms = [
        'products.view', 'products.create', 'products.edit',
        'products.delete', 'products.manage', 'orders.view', 'orders.manage'
      ]
      return productPerms.every(perm => user.permissions.includes(perm))
    })

    if (allEmployersHaveProductAccess && employerUsers.length > 0) {
      console.log('🎉 SUCCESS: All EMPLOYER users have complete product management access!')
      console.log('\n📋 EMPLOYER capabilities now include:')
      console.log('• ✅ View product catalog')
      console.log('• ✅ Create new products') 
      console.log('• ✅ Edit product information')
      console.log('• ✅ Delete products')
      console.log('• ✅ Full product management')
      console.log('• ✅ View orders')
      console.log('• ✅ Manage orders')
      console.log('• ✅ Access marketplace dashboard')
    } else if (employerUsers.length === 0) {
      console.log('⚠️ No EMPLOYER users found in database')
    } else {
      console.log('❌ Some EMPLOYER users are missing product management permissions')
    }

  } catch (error) {
    console.error('❌ Verification failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Node.js ESM-compatible entrypoint check
if (process.argv[1] === new URL(import.meta.url).pathname) {
  verifyEmployerProductAccess()
} 