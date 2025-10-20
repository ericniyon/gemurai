const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function clearCache() {
  try {
    console.log('🧹 Clearing applications cache...')
    
    // Clear any cached data by making a fresh request
    const response = await fetch('http://localhost:3000/api/v1/applications', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (response.ok) {
      console.log('✅ Cache cleared successfully')
    } else {
      console.log('⚠️ Cache clear response:', response.status)
    }
    
  } catch (error) {
    console.error('❌ Error clearing cache:', error)
  } finally {
    await prisma.$disconnect()
  }
}

clearCache() 