import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const user = await prisma.user.findUnique({
    where: { id: 'test-evaluator' }
  })
  
  if (!user) {
    throw new Error('Test user not found')
  }
  
  const token = jwt.sign(
    { 
      id: user.id,
      email: user.email,
      role: user.role,
      permissions: user.permissions
    },
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn: '1h' }
  )
  
  console.log('JWT Token:', token)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 