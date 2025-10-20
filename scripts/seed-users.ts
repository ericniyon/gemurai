import { prisma } from '../lib/database'
import bcrypt from 'bcryptjs'
import { TEST_CREDENTIALS } from '@/lib/test-credentials'

// Define role-based permissions
const ROLE_PERMISSIONS = {
  DCC: [
    "dashboard.view",
    "products.view", "products.purchase",
    "orders.view", "orders.create",
    "learning.view", "learning.enroll",
    "jobs.view", "jobs.apply",
    "finance.view", "finance.request",
    "profile.view", "profile.edit"
  ],
  EMPLOYER: [
    "dashboard.view",
    "jobs.view", "jobs.post", "jobs.manage",
    "applications.view", "applications.review",
    "users.view",
    "profile.view", "profile.edit"
  ],
  CONSUMER: [
    "products.view", "products.purchase",
    "orders.view", "orders.create",
    "profile.view", "profile.edit"
  ]
}

async function main() {
  console.log('🌱 Seeding test users...')

  // Create test users from TEST_CREDENTIALS
  for (const [key, cred] of Object.entries(TEST_CREDENTIALS)) {
    try {
      // Hash the password
      const hashedPassword = await bcrypt.hash(cred.password, 12)

      // Get role-based permissions
      const permissions = ROLE_PERMISSIONS[cred.role] || []

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: cred.email }
      })

      if (existingUser) {
        console.log(`✅ User ${cred.email} already exists, updating...`)
        
        // Update existing user
        await prisma.user.update({
          where: { email: cred.email },
          data: {
            name: cred.name,
            password: hashedPassword,
            role: cred.role,
            permissions,
            isActive: true,
            updatedAt: new Date()
          }
        })
      } else {
        console.log(`➕ Creating user ${cred.email}...`)
        
        // Create new user
        await prisma.user.create({
          data: {
            email: cred.email,
            name: cred.name,
            password: hashedPassword,
            role: cred.role,
            permissions,
            isActive: true
          }
        })
      }
      
      console.log(`✅ ${cred.role} user seeded: ${cred.email}`)
    } catch (error: any) {
      if (error.code === 'P2002') {
        console.error(`❌ Error seeding user ${cred.email}: Phone number already exists`)
      } else {
        console.error(`❌ Error seeding user ${cred.email}:`, error.message)
      }
    }
  }

  console.log('\n📝 Test Credentials Summary:')
  console.log('=========================')
  
  const roleGroups: Record<string, typeof TEST_CREDENTIALS[keyof typeof TEST_CREDENTIALS][]> = {}
  
  Object.entries(TEST_CREDENTIALS).forEach(([_, cred]) => {
    if (!roleGroups[cred.role]) {
      roleGroups[cred.role] = []
    }
    roleGroups[cred.role].push(cred)
  })

  Object.entries(roleGroups).forEach(([role, users]) => {
    console.log(`\n${role}:`)
    console.log('-'.repeat(50))
    users.forEach(user => {
      console.log(`Email: ${user.email.padEnd(30)} Password: ${user.password}`)
    })
  })

  console.log('\n✨ Database seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 