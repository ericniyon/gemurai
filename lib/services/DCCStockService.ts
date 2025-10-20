import { prisma } from "@/lib/prisma"

export class DCCStockService {
  /**
   * Update DCC stock when an order is completed
   */
  static async updateStockFromOrder(stockOrderId: string) {
    try {
      console.log(`[DCCStockService] Updating stock for order: ${stockOrderId}`)

      // Get the stock order with products
      const stockOrder = await prisma.stockOrder.findUnique({
        where: { id: stockOrderId },
        include: {
          products: {
            include: {
              product: true
            }
          }
        }
      })

      if (!stockOrder) {
        throw new Error(`Stock order not found: ${stockOrderId}`)
      }

      if (stockOrder.status !== 'payment_confirmed') {
        console.log(`[DCCStockService] Order ${stockOrderId} is not payment confirmed, skipping stock update`)
        return
      }

      // Update stock for each product in the order
      const stockUpdates = []
      for (const orderProduct of stockOrder.products) {
        const stockUpdate = await this.addStockToDCC(
          stockOrder.dccId,
          orderProduct.productId,
          orderProduct.quantity
        )
        stockUpdates.push(stockUpdate)
      }

      console.log(`[DCCStockService] Successfully updated stock for ${stockUpdates.length} products`)
      return stockUpdates

    } catch (error) {
      console.error(`[DCCStockService] Error updating stock from order:`, error)
      throw error
    }
  }

  /**
   * Process stock transfer when EMPLOYER confirms payment
   * This method handles the complete workflow:
   * 1. Deduct from EMPLOYER's product stock
   * 2. Add to DCC's stock
   * 3. Process payment
   */
  static async processPaymentConfirmedOrder(stockOrderId: string, employerId: string) {
    try {
      console.log(`[DCCStockService] Processing payment confirmed order: ${stockOrderId} by employer: ${employerId}`)

      // Get the stock order with products
      const stockOrder = await prisma.stockOrder.findUnique({
        where: { id: stockOrderId },
        include: {
          products: {
            include: {
              product: true
            }
          },
          dcc: true
        }
      })

      if (!stockOrder) {
        throw new Error(`Stock order not found: ${stockOrderId}`)
      }

      if (stockOrder.status !== 'payment_confirmed') {
        throw new Error(`Order ${stockOrderId} is not in payment_confirmed status`)
      }

      // Process the stock transfer in a transaction
      const result = await prisma.$transaction(async (tx) => {
        const stockTransfers = []

        // Process each product in the order
        for (const orderProduct of stockOrder.products) {
          // Check if there's enough stock in EMPLOYER's inventory
          const product = await tx.product.findUnique({
            where: { id: orderProduct.productId }
          })

          if (!product || product.stock < orderProduct.quantity) {
            throw new Error(`Insufficient stock for product ${orderProduct.product.name}. Available: ${product?.stock || 0}, Requested: ${orderProduct.quantity}`)
          }

          // Deduct from EMPLOYER's product stock
          const updatedProduct = await tx.product.update({
            where: { id: orderProduct.productId },
            data: {
              stock: {
                decrement: orderProduct.quantity
              }
            }
          })

          // Add to DCC's stock
          const dccStock = await tx.dCCStock.upsert({
            where: {
              dccId_productId: {
                dccId: stockOrder.dccId,
                productId: orderProduct.productId
              }
            },
            create: {
              dccId: stockOrder.dccId,
              productId: orderProduct.productId,
              quantity: orderProduct.quantity
            },
            update: {
              quantity: {
                increment: orderProduct.quantity
              }
            },
            include: {
              product: true
            }
          })

          stockTransfers.push({
            productId: orderProduct.productId,
            productName: orderProduct.product.name,
            quantity: orderProduct.quantity,
            employerStockBefore: product.stock,
            employerStockAfter: updatedProduct.stock,
            dccStockAfter: dccStock.quantity
          })

          console.log(`[STOCK_TRANSFER] Transferred ${orderProduct.quantity} units of ${orderProduct.product.name} from EMPLOYER to DCC ${stockOrder.dcc.email}`)
        }

        // Process payment to EMPLOYER's wallet
        let employerWallet = await tx.wallet.findUnique({
          where: { userId: employerId }
        })

        if (!employerWallet) {
          employerWallet = await tx.wallet.create({
            data: {
              userId: employerId,
              balance: 0,
              minimumBalance: 1000,
              status: "ACTIVE"
            }
          })
        }

        // Create transaction record for employer (receiving payment)
        const transaction = await tx.transaction.create({
          data: {
            walletId: employerWallet.id,
            type: "DEPOSIT",
            amount: stockOrder.totalAmount,
            status: "COMPLETED",
            description: `Payment confirmed for stock order #${stockOrder.id} from DCC ${stockOrder.dcc.email}`
          }
        })

        // Update employer's wallet balance
        const updatedWallet = await tx.wallet.update({
          where: { id: employerWallet.id },
          data: {
            balance: {
              increment: stockOrder.totalAmount
            }
          }
        })

        return {
          stockTransfers,
          payment: {
            transactionId: transaction.id,
            amount: stockOrder.totalAmount,
            employerWalletBalance: updatedWallet.balance
          },
          orderId: stockOrder.id,
          dccEmail: stockOrder.dcc.email
        }
      })

      console.log(`[DCCStockService] Successfully processed payment confirmed order: ${stockOrderId}`)
      return result

    } catch (error) {
      console.error(`[DCCStockService] Error processing payment confirmed order:`, error)
      throw error
    }
  }

  /**
   * Add stock to DCC inventory
   */
  static async addStockToDCC(dccId: string, productId: string, quantity: number) {
    try {
      console.log(`[DCCStockService] Adding ${quantity} units of product ${productId} to DCC ${dccId}`)

      // Check if stock entry already exists
      const existingStock = await prisma.dCCStock.findUnique({
        where: {
          dccId_productId: {
            dccId,
            productId
          }
        }
      })

      let updatedStock
      if (existingStock) {
        // Update existing stock
        updatedStock = await prisma.dCCStock.update({
          where: { id: existingStock.id },
          data: { quantity: existingStock.quantity + quantity },
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                commission: true
              }
            }
          }
        })
      } else {
        // Create new stock entry
        updatedStock = await prisma.dCCStock.create({
          data: {
            dccId,
            productId,
            quantity
          },
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                commission: true
              }
            }
          }
        })
      }

      console.log(`[DCCStockService] Stock updated successfully: ${updatedStock.quantity} units`)
      return updatedStock

    } catch (error) {
      console.error(`[DCCStockService] Error adding stock to DCC:`, error)
      throw error
    }
  }

  /**
   * Remove stock from DCC inventory (when products are sold)
   */
  static async removeStockFromDCC(dccId: string, productId: string, quantity: number) {
    try {
      console.log(`[DCCStockService] Removing ${quantity} units of product ${productId} from DCC ${dccId}`)

      const existingStock = await prisma.dCCStock.findUnique({
        where: {
          dccId_productId: {
            dccId,
            productId
          }
        }
      })

      if (!existingStock) {
        throw new Error(`No stock found for product ${productId} and DCC ${dccId}`)
      }

      if (existingStock.quantity < quantity) {
        throw new Error(`Insufficient stock. Available: ${existingStock.quantity}, Requested: ${quantity}`)
      }

      const newQuantity = existingStock.quantity - quantity
      const updatedStock = await prisma.dCCStock.update({
        where: { id: existingStock.id },
        data: { quantity: newQuantity },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              commission: true
            }
          }
        }
      })

      console.log(`[DCCStockService] Stock removed successfully: ${updatedStock.quantity} units remaining`)
      return updatedStock

    } catch (error) {
      console.error(`[DCCStockService] Error removing stock from DCC:`, error)
      throw error
    }
  }

  /**
   * Get DCC stock summary
   */
  static async getDCCStockSummary(dccId: string) {
    try {
      const stockItems = await prisma.dCCStock.findMany({
        where: { dccId },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              commission: true
            }
          }
        }
      })

      const summary = {
        totalProducts: stockItems.length,
        totalQuantity: stockItems.reduce((sum, item) => sum + item.quantity, 0),
        totalValue: stockItems.reduce((sum, item) => {
          const priceAfterCommission = item.product.price - (item.product.price * (item.product.commission || 0) / 100)
          return sum + (priceAfterCommission * item.quantity)
        }, 0),
        averagePrice: stockItems.length > 0 
          ? stockItems.reduce((sum, item) => {
              const priceAfterCommission = item.product.price - (item.product.price * (item.product.commission || 0) / 100)
              return sum + priceAfterCommission
            }, 0) / stockItems.length 
          : 0
      }

      return summary

    } catch (error) {
      console.error(`[DCCStockService] Error getting DCC stock summary:`, error)
      throw error
    }
  }

  /**
   * Get low stock items (below threshold)
   */
  static async getLowStockItems(dccId: string, threshold: number = 5) {
    try {
      const lowStockItems = await prisma.dCCStock.findMany({
        where: {
          dccId,
          quantity: {
            lt: threshold
          }
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              commission: true
            }
          }
        },
        orderBy: {
          quantity: 'asc'
        }
      })

      return lowStockItems

    } catch (error) {
      console.error(`[DCCStockService] Error getting low stock items:`, error)
      throw error
    }
  }
} 