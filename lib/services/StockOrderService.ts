import { prisma } from "@/lib/database"
import { AuthUser } from "@/lib/auth"

export class StockOrderService {
  static async createStockOrder(data: {
    productId: string
    quantity: number
    comment?: string
  }, user: AuthUser) {
    try {
      // Verify user has permission to create stock orders
      if (user.role !== "DCC" || !user.permissions?.includes("stock.create")) {
        throw new Error("Unauthorized: Missing stock.create permission or not a DCC")
      }

      // Validate quantity
      if (!Number.isInteger(data.quantity)) {
        throw new Error("Invalid quantity: Must be an integer")
      }
      if (data.quantity <= 0) {
        throw new Error("Invalid quantity: Must be greater than 0")
      }

      // Verify product exists
      const product = await prisma.product.findUnique({
        where: { id: data.productId }
      })

      if (!product) {
        throw new Error("Invalid product: Product not found")
      }

      // Create the stock order
      const stockOrder = await prisma.stockOrder.create({
        data: {
          productId: data.productId,
          quantity: data.quantity,
          comment: data.comment,
          status: "pending",
          requestedById: user.id,
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sellerId: true,
            },
          },
          requestedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      })

      return stockOrder
    } catch (error) {
      console.error("Error in StockOrderService.createStockOrder:", error)
      throw error
    }
  }

  static async getStockOrders(user: AuthUser) {
    try {
      const filter: any = {}
      
      // If user is DCC, only show their stock orders
      if (user.role === "DCC") {
        filter.requestedById = user.id
      }

      const stockOrders = await prisma.stockOrder.findMany({
        where: filter,
        orderBy: { createdAt: "desc" },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sellerId: true,
            },
          },
          requestedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      })

      return stockOrders
    } catch (error) {
      console.error("Error in StockOrderService.getStockOrders:", error)
      throw error
    }
  }

  static async getStockOrderById(id: string, user: AuthUser) {
    try {
      const filter: any = { id }
      
      // If user is DCC, only allow viewing their stock orders
      if (user.role === "DCC") {
        filter.requestedById = user.id
      }

      const stockOrder = await prisma.stockOrder.findFirst({
        where: filter,
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sellerId: true,
            },
          },
          requestedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      })

      return stockOrder
    } catch (error) {
      console.error("Error in StockOrderService.getStockOrderById:", error)
      throw error
    }
  }
} 