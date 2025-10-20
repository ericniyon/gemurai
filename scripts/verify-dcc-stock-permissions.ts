import { prisma } from '../lib/database'
import { StockOrderService } from '../app/lib/services/StockOrderService'

async function main() {
  try {
    console.log('🔄 Testing DCC stock permissions...')

    // Find test DCC user
    const dccUser = await prisma.user.findUnique({
      where: { email: 'dcc@Gemurai.rw' }
    })

    if (!dccUser) {
      throw new Error('Test DCC user not found')
    }

    console.log('✅ Found test DCC user:', dccUser.email)

    // Verify DCC has stock.create permission
    if (!dccUser.permissions.includes('stock.create')) {
      console.log('❌ DCC user missing stock.create permission')
      console.log('🔄 Adding stock.create permission...')
      
      await prisma.user.update({
        where: { id: dccUser.id },
        data: {
          permissions: [...dccUser.permissions, 'stock.create']
        }
      })
      
      console.log('✅ Added stock.create permission')
    } else {
      console.log('✅ DCC user has stock.create permission')
    }

    // Find a test product
    const testProduct = await prisma.product.findFirst()
    if (!testProduct) {
      throw new Error('No test product found')
    }

    console.log('✅ Found test product:', testProduct.name)

    // Test creating a stock order
    const stockOrder = await StockOrderService.createStockOrder({
      productId: testProduct.id,
      quantity: 5,
      comment: 'Test stock order'
    }, dccUser)

    console.log('✅ Successfully created stock order:', {
      id: stockOrder.id,
      productId: stockOrder.productId,
      quantity: stockOrder.quantity,
      status: stockOrder.status
    })

    // Test fetching stock orders
    const stockOrders = await StockOrderService.getStockOrders(dccUser)
    console.log(`✅ Successfully fetched ${stockOrders.length} stock orders`)

    // Test fetching specific stock order
    const fetchedOrder = await StockOrderService.getStockOrderById(stockOrder.id, dccUser)
    console.log('✅ Successfully fetched specific stock order:', fetchedOrder.id)

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main() 