import { PrismaClient } from '@prisma/client'
import { generateAuthToken } from '@/lib/token'
import { TEST_CREDENTIALS } from '@/lib/test-credentials'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  try {
    // Create test users
    for (const [role, credentials] of Object.entries(TEST_CREDENTIALS)) {
      console.log(`\nCreating ${role} user...`)

      // Check if user exists
      let user = await prisma.user.findUnique({
        where: { email: credentials.email }
      })

      if (user) {
        console.log('✅ User already exists')
      } else {
        // Hash password
        const hashedPassword = await bcrypt.hash(credentials.password, 10)

        // Create user
        user = await prisma.user.create({
          data: {
            email: credentials.email,
            name: credentials.name,
            password: hashedPassword,
            role: role as 'DCC' | 'EMPLOYER' | 'CONSUMER',
            permissions: credentials.permissions,
            avatar: null
          }
        })
        console.log('✅ Created user:', user.email)
      }

      // Generate token
      const token = await generateAuthToken({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role as 'DCC' | 'EMPLOYER' | 'CONSUMER',
        permissions: user.permissions,
        avatar: user.avatar
      })
      console.log('✅ Generated token:', token.slice(0, 50) + '...')
    }
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main() 