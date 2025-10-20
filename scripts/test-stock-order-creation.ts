import { PrismaClient } from '@prisma/client'
import { createStockOrder } from '../lib/stock'
import { AuthUser } from '@/lib/auth'

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('🔄 Testing stock order creation...')

    // Create a test DCC user
    const dccUser = await prisma.user.create({
      data: {
        email: 'test-dcc@example.com',
        name: 'Test DCC',
        password: 'test123!',
        role: 'DCC',
        permissions: [
          'dashboard.view',
          'products.view',
          'products.create',
          'products.edit',
          'products.delete',
          'products.manage',
          'stock.create',
          'stock.view'
        ]
      }
    })

    // Create a test stock order
    const stockOrder = await createStockOrder({
      productId: 'test-product-id',
      quantity: 10,
      comment: 'Regular stock order'
    }, {
      id: dccUser.id,
      email: dccUser.email,
      name: dccUser.name,
      role: dccUser.role as 'DCC',
      permissions: dccUser.permissions,
      avatar: dccUser.avatar
    })

    console.log('✅ Success: Created stock order:', {
      id: stockOrder.id,
      quantity: stockOrder.quantity,
      status: stockOrder.status,
      createdBy: stockOrder.createdBy
    })
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main() 