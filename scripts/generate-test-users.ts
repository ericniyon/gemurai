#!/usr/bin/env tsx

/**
 * Generate Test Users Script
 * Creates comprehensive test credentials for all user roles and inserts them into the database
 */

import bcrypt from "bcryptjs"
import { prisma } from "@/lib/database-client"
import { UserRole } from "@prisma/client"
import { ROLES } from "@/lib/permissions"

interface TestUser {
  email: string
  password: string
  name: string
  phone: string
  role: UserRole
  permissions: string[]
  isActive: boolean
}

const TEST_USERS: TestUser[] = [
  // Super Admin Users
  {
    email: "superadmin@Gemurai.rw",
    password: "superadmin123",
    name: "Super Administrator",
    phone: "+250788100001",
    role: "SUPER_ADMIN",
    permissions: [],
    isActive: true,
  },
  {
    email: "root@Gemurai.rw",
    password: "root123",
    name: "Root User",
    phone: "+250788100002",
    role: "SUPER_ADMIN",
    permissions: [],
    isActive: true,
  },

  // Admin Users
  {
    email: "admin@Gemurai.rw",
    password: "admin123",
    name: "Admin User",
    phone: "+250788200001",
    role: "ADMIN",
    permissions: [],
    isActive: true,
  },
  {
    email: "system@Gemurai.rw",
    password: "system123",
    name: "System Administrator",
    phone: "+250788200002",
    role: "ADMIN",
    permissions: [],
    isActive: true,
  },
  {
    email: "manager@Gemurai.rw",
    password: "manager123",
    name: "Platform Manager",
    phone: "+250788200003",
    role: "ADMIN",
    permissions: [],
    isActive: true,
  },

  // DCC Users (Digital Community Champions)
  {
    email: "dcc@Gemurai.rw",
    password: "dcc123",
    name: "John Mugisha",
    phone: "+250788300001",
    role: "DCC",
    permissions: [],
    isActive: true,
  },
  {
    email: "dcc1@Gemurai.rw",
    password: "dcc123",
    name: "Mary Uwimana",
    phone: "+250788300002",
    role: "DCC",
    permissions: [],
    isActive: true,
  },
  {
    email: "dcc2@Gemurai.rw",
    password: "dcc123",
    name: "David Nkurunziza",
    phone: "+250788300003",
    role: "DCC",
    permissions: [],
    isActive: true,
  },
  {
    email: "dcc3@Gemurai.rw",
    password: "dcc123",
    name: "Sarah Mukamana",
    phone: "+250788300004",
    role: "DCC",
    permissions: [],
    isActive: true,
  },
  {
    email: "dcc4@Gemurai.rw",
    password: "dcc123",
    name: "Emmanuel Nsengimana",
    phone: "+250788300005",
    role: "DCC",
    permissions: [],
    isActive: true,
  },

  // Employer Users
  {
    email: "employer@Gemurai.rw",
    password: "employer123",
    name: "Tech Solutions Ltd",
    phone: "+250788400001",
    role: "EMPLOYER",
    permissions: [],
    isActive: true,
  },
  {
    email: "company1@Gemurai.rw",
    password: "company123",
    name: "Rwanda IT Company",
    phone: "+250788400002",
    role: "EMPLOYER",
    permissions: [],
    isActive: true,
  },
  {
    email: "startup@Gemurai.rw",
    password: "startup123",
    name: "Innovation Hub Ltd",
    phone: "+250788400003",
    role: "EMPLOYER",
    permissions: [],
    isActive: true,
  },
  {
    email: "enterprise@Gemurai.rw",
    password: "enterprise123",
    name: "Enterprise Solutions Corp",
    phone: "+250788400004",
    role: "EMPLOYER",
    permissions: [],
    isActive: true,
  },

  // Consumer Users
  {
    email: "consumer@Gemurai.rw",
    password: "consumer123",
    name: "Alice Mutesi",
    phone: "+250788500001",
    role: "CONSUMER",
    permissions: [],
    isActive: true,
  },
  {
    email: "user1@Gemurai.rw",
    password: "user123",
    name: "Peter Nzeyimana",
    phone: "+250788500002",
    role: "CONSUMER",
    permissions: [],
    isActive: true,
  },
  {
    email: "user2@Gemurai.rw",
    password: "user123",
    name: "Grace Uwineza",
    phone: "+250788500003",
    role: "CONSUMER",
    permissions: [],
    isActive: true,
  },
  {
    email: "customer@Gemurai.rw",
    password: "customer123",
    name: "Robert Habineza",
    phone: "+250788500004",
    role: "CONSUMER",
    permissions: [],
    isActive: true,
  },
  {
    email: "client@Gemurai.rw",
    password: "client123",
    name: "Jane Nyiramana",
    phone: "+250788500005",
    role: "CONSUMER",
    permissions: [],
    isActive: true,
  },

  // Test Users (for different scenarios)
  {
    email: "test@Gemurai.rw",
    password: "test123",
    name: "Test User",
    phone: "+250788600001",
    role: "CONSUMER",
    permissions: [],
    isActive: true,
  },
  {
    email: "demo@Gemurai.rw",
    password: "demo123",
    name: "Demo User",
    phone: "+250788600002",
    role: "DCC",
    permissions: [],
    isActive: true,
  },
  {
    email: "inactive@Gemurai.rw",
    password: "inactive123",
    name: "Inactive User",
    phone: "+250788600003",
    role: "CONSUMER",
    permissions: [],
    isActive: false, // Intentionally inactive for testing
  },
]

function getRolePermissions(role: UserRole): string[] {
  const roleMap = {
    'SUPER_ADMIN': 'super_admin',
    'ADMIN': 'admin', 
    'DCC': 'dcc',
    'EMPLOYER': 'employer',
    'CONSUMER': 'consumer'
  }

  const roleId = roleMap[role]
  const roleConfig = ROLES.find(r => r.id === roleId)
  return roleConfig?.permissions || []
}

async function generateTestUsers() {
  console.log("🚀 Starting test user generation...")
  
  try {
    // First, check database connection
    console.log("🔍 Checking database connection...")
    await prisma.$connect()
    console.log("✅ Database connected successfully")

    let createdCount = 0
    let updatedCount = 0
    let skippedCount = 0

    for (const testUser of TEST_USERS) {
      try {
        console.log(`\n📝 Processing user: ${testUser.email}`)

        // Get role-based permissions
        const rolePermissions = getRolePermissions(testUser.role)
        
        // Hash the password
        const hashedPassword = await bcrypt.hash(testUser.password, 12)

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
          where: { email: testUser.email }
        })

        if (existingUser) {
          // Update existing user
          await prisma.user.update({
            where: { email: testUser.email },
            data: {
              name: testUser.name,
              phone: testUser.phone,
              password: hashedPassword,
              role: testUser.role,
              permissions: rolePermissions,
              isActive: testUser.isActive,
              updatedAt: new Date(),
            }
          })
          console.log(`   ✅ Updated existing user: ${testUser.email} (${testUser.role})`)
          updatedCount++
        } else {
          // Create new user
          await prisma.user.create({
            data: {
              email: testUser.email,
              name: testUser.name,
              phone: testUser.phone,
              password: hashedPassword,
              role: testUser.role,
              permissions: rolePermissions,
              isActive: testUser.isActive,
            }
          })
          console.log(`   ✅ Created new user: ${testUser.email} (${testUser.role})`)
          createdCount++
        }

      } catch (userError: any) {
        if (userError.code === 'P2002') {
          // Unique constraint violation (probably phone number)
          console.log(`   ⚠️  Skipped ${testUser.email}: Phone number already exists`)
          skippedCount++
        } else {
          console.error(`   ❌ Failed to process user ${testUser.email}:`, userError.message)
          skippedCount++
        }
      }
    }

    console.log(`\n🎉 Test user generation completed!`)
    console.log(`📊 Summary:`)
    console.log(`   📝 Created: ${createdCount} users`)
    console.log(`   🔄 Updated: ${updatedCount} users`)
    console.log(`   ⚠️  Skipped: ${skippedCount} users`)
    console.log(`   📋 Total: ${TEST_USERS.length} users processed`)

    console.log(`\n🔑 Test Credentials Summary:`)
    console.log(`┌─────────────────────────────────────────────────────────────────┐`)
    console.log(`│                       TEST CREDENTIALS                         │`)
    console.log(`├─────────────────────┬───────────────────┬───────────────────────┤`)
    console.log(`│ Role                │ Email             │ Password              │`)
    console.log(`├─────────────────────┼───────────────────┼───────────────────────┤`)
    
    const roleGroups: Record<string, TestUser[]> = {}
    TEST_USERS.forEach(user => {
      if (!roleGroups[user.role]) roleGroups[user.role] = []
      roleGroups[user.role].push(user)
    })

    Object.entries(roleGroups).forEach(([role, users]) => {
      users.forEach((user, index) => {
        const displayRole = index === 0 ? role : ""
        console.log(`│ ${displayRole.padEnd(19)} │ ${user.email.padEnd(17)} │ ${user.password.padEnd(21)} │`)
      })
      console.log(`├─────────────────────┼───────────────────┼───────────────────────┤`)
    })
    
    console.log(`└─────────────────────┴───────────────────┴───────────────────────┘`)

    console.log(`\n💡 Usage Instructions:`)
    console.log(`   1. Navigate to /login page`)
    console.log(`   2. Use any email/password combination above`)
    console.log(`   3. Each role has different permissions and access levels`)
    console.log(`   4. Super Admin has full access to all features`)
    console.log(`   5. Admin can access admin panel and manage users`)
    console.log(`   6. DCC can view dashboard and their applications`)
    console.log(`   7. Employer can post jobs and view applications`)
    console.log(`   8. Consumer has basic marketplace access`)

    console.log(`\n🔗 Direct Login Links:`)
    console.log(`   • Super Admin: superadmin@Gemurai.rw / superadmin123`)
    console.log(`   • Admin Panel: admin@Gemurai.rw / admin123`)
    console.log(`   • DCC Dashboard: dcc@Gemurai.rw / dcc123`)
    console.log(`   • Employer Portal: employer@Gemurai.rw / employer123`)
    console.log(`   • Consumer App: consumer@Gemurai.rw / consumer123`)

  } catch (error) {
    console.error("❌ Error generating test users:", error)
    throw error
  } finally {
    await prisma.$disconnect()
    console.log("🔌 Database connection closed")
  }
}

// Run the script directly when imported
import.meta.url === `file://${process.argv[1]}` && (async () => {
  try {
    await generateTestUsers()
    console.log("✅ Script completed successfully")
    process.exit(0)
  } catch (error) {
    console.error("💥 Script failed:", error)
    process.exit(1)
  }
})()

export { generateTestUsers, TEST_USERS } 