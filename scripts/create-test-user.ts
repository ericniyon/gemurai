import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('test123!', 10)
  
  const testUser = await prisma.user.create({
    data: {
      id: "test-evaluator",
      email: "test.evaluator@example.com",
      phone: "+250780000001",
      name: "Test Evaluator",
      password: hashedPassword,
      role: "EMPLOYER",
      permissions: ["applications.evaluate", "applications.review"],
      isActive: true
    }
  })
  
  console.log('Created test user:', testUser)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 