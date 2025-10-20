import { prisma } from './prisma'
import { AuthUser } from './auth'
import { hasPermission } from './permissions'

interface CreateStockOrderInput {
  productId: string
  quantity: number
  comment?: string
}

export async function createStockOrder(input: CreateStockOrderInput, user: AuthUser) {
  // Check if user has permission to create stock orders
  if (!hasPermission(user.permissions, 'stock.create')) {
    throw new Error('Insufficient permissions to create stock orders')
  }

  // Validate input
  if (input.quantity <= 0) {
    throw new Error('Quantity must be greater than 0')
  }

  // Create stock order
  const stockOrder = await prisma.stockOrder.create({
    data: {
      productId: input.productId,
      quantity: input.quantity,
      comment: input.comment,
      status: 'PENDING',
      createdById: user.id
    },
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  })

  return stockOrder
} 