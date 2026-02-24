import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { verifyAuthToken } from "@/lib/token"
import { cookies } from "next/headers"
import { safeTransaction, longTransaction } from "@/lib/transaction"
import { StockOrderNotifications } from "@/lib/notifications/stock-order-notifications"

export async function GET(req: Request) {
  try {
    console.log("[STOCK_ORDERS_GET] Starting request...")
    let user = null;
    
    // Try token auth first (for DCC users)
    const authHeader = req.headers.get("Authorization")
    let token = null

    // Check Authorization header
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1]
    }
    
    // Try cookie if no Authorization header
    if (!token) {
      const cookieStore = await cookies()
      token = cookieStore.get("Gemurai_token")?.value || cookieStore.get("token")?.value
    }

    if (token) {
      const verifiedUser = await verifyAuthToken(token)
      if (verifiedUser) {
        user = verifiedUser
      }
    }

    // If no token auth, try NextAuth session
    if (!user) {
      const session = await getServerSession(authOptions)
      if (session?.user?.id) {
        user = session.user
      }
    }

    if (!user?.id) {
      console.log("[STOCK_ORDERS_GET] No user found, token verification failed");
      console.log("[STOCK_ORDERS_GET] Headers:", Object.fromEntries(req.headers.entries()));
      return NextResponse.json({ 
        success: false, 
        message: "Unauthorized. Please log in." 
      }, { status: 401 })
    }
    
    console.log("[STOCK_ORDERS_GET] User authenticated:", user.id, user.email);

    // Get user with role and permissions
    let dbUser;
    let userRole;
    
    try {
      dbUser = await prisma.user.findUnique({
        where: { 
          id: user.id,
          isActive: true
        },
        include: {
          userRole: {
            include: {
              role: true
            }
          }
        }
      })

      if (!dbUser) {
        return NextResponse.json({ 
          success: false, 
          message: "User not found or inactive" 
        }, { status: 404 })
      }

      // Get user's role from the new role system; fallback to session/token role when no assignment
      userRole = dbUser.userRole?.role?.name ?? (user as { role?: string }).role;
      console.log("[STOCK_ORDERS_GET] User role:", userRole);

      // Allow EMPLOYER, DCC, BRANCH_MANAGER, and MCC_MANAGER roles
      if (userRole !== "EMPLOYER" && userRole !== "DCC" && userRole !== "BRANCH_MANAGER" && userRole !== "MCC_MANAGER") {
        console.log("[STOCK_ORDERS_GET] Access denied for role:", userRole);
        return NextResponse.json({ 
          success: false, 
          message: "Access denied. Only employers, DCCs, branch managers, and MCC managers can view these orders." 
        }, { status: 403 })
      }
    } catch (dbError) {
      console.error("[STOCK_ORDERS_GET] Database error:", dbError);
      // If database is down, assume DCC role for token-based auth
      if (dbError.message?.includes("Can't reach database server")) {
        console.log("[STOCK_ORDERS_GET] Database down, assuming DCC role for token auth");
        userRole = "DCC";
      } else {
        throw dbError;
      }
    }

    // Auto-close overdue unpaid orders (created >24h ago, status pending, payment pending)
    try {
      const threshold = new Date(Date.now() - 24 * 60 * 60 * 1000)
      const overdueOrders = await prisma.stockOrder.findMany({
        where: {
          status: "pending",
          createdAt: { lt: threshold },
          payment: { is: { status: "PENDING" } }
        },
        select: { id: true }
      })

      if (overdueOrders.length > 0) {
        const ids = overdueOrders.map(o => o.id)
        await prisma.stockOrder.updateMany({
          where: { id: { in: ids } },
          data: { status: "cancelled", updatedAt: new Date() }
        })
        console.log(`[AUTO_CLOSE] Cancelled ${ids.length} overdue unpaid stock orders (>24h).`)
      }
    } catch (autoCloseError) {
      console.warn("[AUTO_CLOSE] Failed to auto-close overdue orders:", autoCloseError)
    }

    // Get stock orders based on role
    let stockOrders = [];
    
    try {
      if (userRole === "EMPLOYER") {
        // Employers see orders for their products only
        stockOrders = await prisma.stockOrder.findMany({
          where: {
            products: {
              some: {
                product: {
                  sellerId: user.id
                }
              }
            }
          },
          include: {
            dcc: {
              select: {
                id: true,
                name: true,
                email: true,
                district: true,
                dccProfile: {
                  select: {
                    location: true,
                    application: {
                      select: { formData: true }
                    }
                  }
                }
              }
            },
            products: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    price: true,
                    commission: true,
                    costPrice: true,
                    sellerId: true
                  }
                }
              }
            },
            payment: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        })
      } else if (userRole === "BRANCH_MANAGER") {
        // Branch Managers see ALL stock orders from the database
        stockOrders = await prisma.stockOrder.findMany({
          include: {
            dcc: {
              select: {
                id: true,
                name: true,
                email: true,
                district: true,
                dccProfile: {
                  select: {
                    location: true,
                    application: {
                      select: { formData: true }
                    }
                  }
                }
              }
            },
            products: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    price: true,
                    commission: true,
                    costPrice: true,
                    sellerId: true
                  }
                }
              }
            },
            payment: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        })
      } else if (userRole === "MCC_MANAGER") {
        // MCC managers get empty list (stock orders are DCC/employer-scoped; layout uses this for notification count)
        stockOrders = []
      } else {
        // DCCs see their own orders
        stockOrders = await prisma.stockOrder.findMany({
          where: {
            dccId: user.id
          },
          include: {
            products: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    price: true,
                    commission: true,
                    costPrice: true,
                    sellerId: true
                  }
                }
              }
            },
            payment: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        })
      }
    } catch (dbError) {
      console.error("[STOCK_ORDERS_GET] Database error fetching orders:", dbError);
      // If database is down, return empty array
      if (dbError.message?.includes("Can't reach database server")) {
        console.log("[STOCK_ORDERS_GET] Database down, returning empty orders array");
        stockOrders = [];
      } else {
        throw dbError;
      }
    }

    // Transform stock orders to include three-tier pricing information and DCC sector
    const transformedStockOrders = stockOrders.map(order => {
      // Derive DCC sector from multiple sources
      const dccLocation = (order as any)?.dcc?.dccProfile?.location as string | undefined
      let dccFormData = (order as any)?.dcc?.dccProfile?.application?.formData as any | undefined

      // Parse stringified JSON formData if needed
      if (typeof dccFormData === 'string') {
        try {
          dccFormData = JSON.parse(dccFormData)
        } catch {
          // leave as string
        }
      }

      const getParsedSectorFromLocation = (loc?: string) => {
        if (!loc) return undefined
        // Try labeled sector first
        const labeled = /sector\s*[:\-]?\s*([A-Za-z\s]+)/i.exec(loc)
        if (labeled?.[1]?.trim()) return labeled[1].trim()
        // Otherwise split and take third or last part
        const parts = loc.split(/[\,\|\/-]+/).map(p => p.trim()).filter(Boolean)
        if (parts.length >= 3) return parts[2]
        if (parts.length >= 1) return parts[parts.length - 1]
        return undefined
      }

      const getSectorFromFormData = (formData?: any): string | undefined => {
        if (!formData) return undefined
        if (typeof formData === 'string') {
          const match = /sector\s*[:\-]?\s*([A-Za-z\s]+)/i.exec(formData)
          if (match?.[1]?.trim()) return match[1].trim()
          return undefined
        }
        const directCandidates = [
          formData.sector,
          formData.Sector,
          formData.SECTOR,
          formData.q13,
          formData.q_sector,
        ]
        for (const c of directCandidates) {
          if (typeof c === 'string' && c.trim()) return c.trim()
        }
        const nested = [
          formData.address?.sector,
          formData.address?.Sector,
          formData.address?.SECTOR,
          formData.location?.sector,
          formData.location?.Sector,
          formData.q11?.sector,
        ]
        for (const c of nested) {
          if (typeof c === 'string' && c.trim()) return c.trim()
        }
        // Recursive search for any key containing 'sector'
        const stack: any[] = [formData]
        while (stack.length) {
          const current = stack.pop()
          if (current && typeof current === 'object') {
            for (const [key, value] of Object.entries(current)) {
              if (typeof value === 'string') {
                if (/sector/i.test(key) && value.trim()) return value.trim()
              } else if (value && typeof value === 'object') {
                stack.push(value)
              }
            }
          }
        }
        return undefined
      }

      const dccSector = getSectorFromFormData(dccFormData)
        || getParsedSectorFromLocation(dccLocation)

      const transformedProducts = order.products.map(orderProduct => {
        const salesPrice = orderProduct.product.price
        const purchasePrice = orderProduct.product.costPrice || 0
        const commission = salesPrice - purchasePrice
        
        return {
          ...orderProduct,
          product: {
            ...orderProduct.product,
            purchasePrice,
            salesPrice,
            commission
          }
        }
      })

      return {
        ...order,
        products: transformedProducts,
        dccSector
      }
    })

    console.log("[STOCK_ORDERS_GET] Successfully fetched orders:", transformedStockOrders.length)
    return NextResponse.json({
      success: true,
      data: transformedStockOrders
    })
  } catch (error) {
    console.error("[STOCK_ORDERS_GET] Error details:", error)
    console.error("[STOCK_ORDERS_GET] Error stack:", error.stack)
    
    // Check if it's a database connection error
    if (error.message?.includes("Can't reach database server")) {
      console.log("[STOCK_ORDERS_GET] Database connection error, returning empty array")
      return NextResponse.json({ 
        success: true,
        data: []
      })
    }
    
    // Return empty array instead of error for DCC users with no orders
    if (user?.role === "DCC") {
      console.log("[STOCK_ORDERS_GET] DCC user with no orders, returning empty array")
      return NextResponse.json({ 
        success: true,
        data: []
      })
    }
    
    return NextResponse.json({ 
      success: false,
      data: [],
      message: "Internal server error: " + error.message 
    }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    let user = null;
    
    // Try token auth first (for DCC users)
    const authHeader = req.headers.get("Authorization")
    let token = null

    // Check Authorization header
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1]
    }
    
    // Try cookie if no Authorization header
    if (!token) {
      const cookieStore = await cookies()
      token = cookieStore.get("Gemurai_token")?.value || cookieStore.get("token")?.value
    }

    if (token) {
      const verifiedUser = await verifyAuthToken(token)
      if (verifiedUser) {
        user = verifiedUser
      }
    }

    // If no token auth, try NextAuth session
    if (!user) {
      const session = await getServerSession(authOptions)
      if (session?.user?.id) {
        user = session.user
      }
    }

    if (!user?.id) {
      return NextResponse.json({ 
        success: false, 
        message: "Unauthorized. Please log in." 
      }, { status: 401 })
    }

    const body = await req.json()
    const { orderId, status } = body

    if (!orderId || !status) {
      return NextResponse.json({
        success: false,
        message: "Order ID and status are required"
      }, { status: 400 })
    }

    // Get user with role and permissions
    const dbUser = await prisma.user.findUnique({
      where: { 
        id: user.id,
        isActive: true
      },
      include: {
        userRole: {
          include: {
            role: true
          }
        }
      }
    })

    if (!dbUser) {
      return NextResponse.json({ 
        success: false, 
        message: "User not found or inactive" 
      }, { status: 404 })
    }

    // Get user's role from the new role system
    const userRole = dbUser.userRole?.role?.name;

    // Get the stock order with its products
    const stockOrder = await prisma.stockOrder.findUnique({
      where: { id: orderId },
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
      return NextResponse.json({
        success: false,
        message: "Stock order not found"
      }, { status: 404 })
    }

    // Special case: Allow DCC to mark delivered orders as received
    if (status === "cancelled") {
      // Allow DCC to cancel their own pending orders
      if (userRole !== "DCC") {
        return NextResponse.json({
          success: false,
          message: "Only DCC users can cancel their orders"
        }, { status: 403 })
      }

      if (stockOrder.dccId !== user.id) {
        return NextResponse.json({
          success: false,
          message: "You can only cancel your own orders"
        }, { status: 403 })
      }

      if ((stockOrder.status || "").toLowerCase() !== "pending") {
        return NextResponse.json({
          success: false,
          message: "Only pending orders can be cancelled"
        }, { status: 400 })
      }

      // Use transaction to ensure both order and payment are updated atomically
      await prisma.$transaction(async (tx) => {
        // Update stock order status
        await tx.stockOrder.update({
          where: { id: orderId },
          data: {
            status: "cancelled",
            updatedAt: new Date()
          }
        })

        // Cancel associated payment if it exists and isn't already cancelled
        await tx.payment.updateMany({
          where: { 
            stockOrderId: orderId,
            status: { not: "CANCELLED" } // Only update payments that aren't already cancelled
          },
          data: {
            status: "CANCELLED",
            updatedAt: new Date()
          }
        })
      })

      return NextResponse.json({
        success: true,
        message: "Stock order cancelled successfully"
      })
    }

    if (status === "received") {
      if (userRole !== "DCC") {
        return NextResponse.json({
          success: false,
          message: "Only DCC users can mark orders as received"
        }, { status: 403 })
      }

      if (stockOrder.dccId !== user.id) {
        return NextResponse.json({
          success: false,
          message: "You can only mark your own orders as received"
        }, { status: 403 })
      }

      if (stockOrder.status !== "delivered") {
        return NextResponse.json({
          success: false,
          message: "Order must be in delivered status to be marked as received"
        }, { status: 400 })
      }

      // Credit DCC inventory upon receipt
      await safeTransaction(async (tx) => {
        // Update order status first
        await tx.stockOrder.update({
          where: { id: orderId },
          data: {
            status: "received"
          }
        })

        // Get order with products
        const orderWithProducts = await tx.stockOrder.findUnique({
          where: { id: orderId },
          include: {
            products: true
          }
        })

        if (!orderWithProducts) {
          throw new Error("Stock order not found when crediting DCC inventory")
        }

        // Credit each product to DCC stock
        for (const orderProduct of orderWithProducts.products) {
          await tx.dCCStock.upsert({
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
            }
          })
        }
      })

      return NextResponse.json({
        success: true,
        message: "Stock order received successfully and stock credited to DCC"
      })
    }

    // For other transitions, only EMPLOYER and BRANCH_MANAGER can proceed beyond this point
    if (userRole !== "EMPLOYER" && userRole !== "BRANCH_MANAGER") {
      return NextResponse.json({ 
        success: false, 
        message: "Only employers and branch managers can approve or reject orders" 
      }, { status: 403 })
    }

    // Verify the employer owns the products in the order
    const hasUnauthorizedProducts = stockOrder.products.some(
      orderProduct => orderProduct.product.sellerId !== user.id
    )

    if (hasUnauthorizedProducts) {
      return NextResponse.json({
        success: false,
        message: "You can only approve orders for your own products"
      }, { status: 403 })
    }

    if (status === "payment_confirmed") {
      // Start a transaction to ensure all operations succeed or fail together - increased timeout for production
      await safeTransaction(async (tx) => {
        // 1. Update payment confirmation status
        await tx.stockOrder.update({
          where: { id: orderId },
          data: {
            status,
            paymentConfirmedBy: user.id,
            paymentConfirmedAt: new Date()
          }
        })

        // 2. Update payment status to CONFIRMED if payment exists
        const updatedStockOrder = await tx.stockOrder.findUnique({
          where: { id: orderId },
          include: { payment: true }
        })

        if (updatedStockOrder?.payment) {
          await tx.payment.update({
            where: { stockOrderId: orderId },
            data: {
              status: "CONFIRMED",
              paidAt: new Date()
            }
          })
        }

        // 3. DEDUCT STOCK: Now deduct stock from ADMIN inventory since payment is confirmed
        console.log("[PAYMENT_CONFIRMED] Order payment confirmed. Starting stock deduction from ADMIN inventory...")
        
        // Get the stock order with its products to deduct stock
        const stockOrderForDeduction = await tx.stockOrder.findUnique({
          where: { id: orderId },
          include: {
            products: {
              include: {
                product: true
              }
            }
          }
        })

        if (!stockOrderForDeduction) {
          throw new Error("Stock order not found for stock deduction")
        }

        // Deduct stock from ADMIN inventory for each product
        for (const orderProduct of stockOrderForDeduction.products) {
          // Check if there's enough stock available
          const currentProduct = await tx.product.findUnique({
            where: { id: orderProduct.productId }
          })

          if (!currentProduct) {
            throw new Error(`Product ${orderProduct.productId} not found during stock deduction`)
          }

          if (currentProduct.stock < orderProduct.quantity) {
            throw new Error(`Insufficient stock for product ${orderProduct.product.name}. Available: ${currentProduct.stock}, Requested: ${orderProduct.quantity}`)
          }

          // Deduct stock from ADMIN inventory
          await tx.product.update({
            where: { id: orderProduct.productId },
            data: {
              stock: {
                decrement: orderProduct.quantity
              }
            }
          })

          console.log(`[STOCK_DEDUCTION] Deducted ${orderProduct.quantity} units of ${orderProduct.product.name} from ADMIN inventory. New stock: ${currentProduct.stock - orderProduct.quantity}`)

          // Send stock deduction notification
          try {
            await StockOrderNotifications.notifyStockDeducted(
              orderProduct.productId,
              orderId,
              orderProduct.quantity,
              currentProduct.stock - orderProduct.quantity
            )
          } catch (notificationError) {
            console.error('Error sending stock deduction notification:', notificationError)
          }
        }

        // 4. Get or create employer's wallet for payment
        let employerWallet = await tx.wallet.findUnique({
          where: { userId: user.id }
        })

        if (!employerWallet) {
          employerWallet = await tx.wallet.create({
            data: {
              userId: user.id,
              balance: 0,
              minimumBalance: 1000,
              status: "ACTIVE"
            }
          })
        }

        // 5. Create transaction record for employer (receiving payment)
        await tx.transaction.create({
          data: {
            walletId: employerWallet.id,
            type: "DEPOSIT",
            amount: stockOrder.totalAmount,
            status: "COMPLETED",
            description: `Payment confirmed for stock order #${stockOrder.id} from DCC ${stockOrder.dcc.email}`
          }
        })

        // 6. Update employer's wallet balance
        await tx.wallet.update({
          where: { id: employerWallet.id },
          data: {
            balance: {
              increment: stockOrder.totalAmount
            }
          }
        })

        console.log(`[PAYMENT_CONFIRMED] Order ${orderId} payment confirmed. Payment processed.`)
      }, "Payment Confirmation")

      // Send notification for payment confirmation
      try {
        await StockOrderNotifications.notifyPaymentConfirmed(
          stockOrder.dccId,
          orderId,
          "VOUCHER", // Since this is voucher payment
          stockOrder.totalAmount
        )
      } catch (notificationError) {
        console.error('Error sending payment confirmed notification:', notificationError)
      }
    } else if (status === "approved") {
      // Start a transaction to ensure all operations succeed or fail together - using safe transaction utility
      await safeTransaction(async (tx) => {
        // Do NOT add to DCC stock on approved; DCC stock will be credited on received

        // Get or create employer's wallet
        let employerWallet = await tx.wallet.findUnique({
          where: { userId: user.id }
        })

        if (!employerWallet) {
          employerWallet = await tx.wallet.create({
            data: {
              userId: user.id,
              balance: 0,
              minimumBalance: 1000,
              status: "ACTIVE"
            }
          })
        }

        // Create transaction record for employer (receiving payment)
        await tx.transaction.create({
          data: {
            walletId: employerWallet.id,
            type: "DEPOSIT",
            amount: stockOrder.totalAmount,
            status: "COMPLETED",
            description: `Payment received for stock order #${stockOrder.id}`
          }
        })

        // Update employer's wallet balance
        await tx.wallet.update({
          where: { id: employerWallet.id },
          data: {
            balance: {
              increment: stockOrder.totalAmount
            }
          }
        })

        // Update stock order status
        await tx.stockOrder.update({
          where: { id: orderId },
          data: {
            status,
            approvedBy: user.id,
            approvedAt: new Date()
          }
        })

        console.log(`[ORDER_APPROVED] Order ${orderId} approved. Payment processed. DCC stock will be added on received.`)
      }, "Order Approval")

      // Send notification for order approval
      try {
        await StockOrderNotifications.notifyOrderApproved(
          stockOrder.dccId,
          orderId,
          user.id,
          stockOrder.totalAmount
        )
      } catch (notificationError) {
        console.error('Error sending order approved notification:', notificationError)
      }
    } else if (status === "rejected") {
      // Start a transaction to ensure all operations succeed or fail together
      await safeTransaction(async (tx) => {
        // Get the stock order with its products to restore stock
        const stockOrderToReject = await tx.stockOrder.findUnique({
          where: { id: orderId },
          include: {
            products: {
              include: {
                product: true
              }
            }
          }
        })

        if (!stockOrderToReject) {
          throw new Error("Stock order not found")
        }

        // RESTORE STOCK: Only restore stock if order was already payment_confirmed (stock was deducted)
        if (stockOrderToReject.status === "payment_confirmed") {
          console.log("[STOCK_RESTORATION] Order was payment_confirmed, restoring stock to ADMIN inventory...")
          for (const orderProduct of stockOrderToReject.products) {
            // Check if the product still exists
            const currentProduct = await tx.product.findUnique({
              where: { id: orderProduct.productId }
            })

            if (!currentProduct) {
              console.warn(`[STOCK_RESTORATION] Product ${orderProduct.productId} not found, skipping stock restoration`)
              continue
            }

            // Restore stock to ADMIN inventory
            await tx.product.update({
              where: { id: orderProduct.productId },
              data: {
                stock: {
                  increment: orderProduct.quantity
                }
              }
            })

            console.log(`[STOCK_RESTORATION] Restored ${orderProduct.quantity} units of ${orderProduct.product.name} to ADMIN inventory. New stock: ${currentProduct.stock + orderProduct.quantity}`)
          }
        } else {
          console.log(`[STOCK_RESTORATION] Order status was ${stockOrderToReject.status}, no stock to restore (stock was not deducted yet)`)
        }

        // Update the order status
        await tx.stockOrder.update({
        where: { id: orderId },
        data: {
          status,
          rejectedBy: user.id,
          rejectedAt: new Date()
        }
      })

        console.log(`[ORDER_REJECTED] Order ${orderId} rejected and stock restored to ADMIN inventory`)
      }, "Order Rejection with Stock Restoration")

      // Send notification for order rejection
      try {
        await StockOrderNotifications.notifyOrderRejected(
          stockOrder.dccId,
          orderId,
          user.id,
          "Order rejected by employer"
        )
      } catch (notificationError) {
        console.error('Error sending order rejected notification:', notificationError)
      }
    } else if (status === "completed") {
      // Do NOT add to DCC stock on completed; DCC stock will be credited on received
      const stockOrder = await prisma.stockOrder.findUnique({
        where: { id: orderId },
        include: {
          products: {
            include: {
              product: true
            }
          }
        }
      })

      if (!stockOrder) {
        return NextResponse.json({
          success: false,
          message: "Stock order not found"
        }, { status: 404 })
      }

      // Update the status for completed orders
      await prisma.stockOrder.update({
        where: { id: orderId },
        data: {
          status,
          completedBy: user.id,
          completedAt: new Date()
        }
      })
    } else if (status === "delivered") {
      // Start a transaction to ensure all operations succeed or fail together
      await safeTransaction(async (tx) => {
        // 1. Update the status for delivered orders
        await tx.stockOrder.update({
          where: { id: orderId },
          data: {
            status,
            completedBy: user.id,
            completedAt: new Date()
          }
        })
        // No DCC stock credit on delivered; DCC will mark as received to credit
        console.log(`[DELIVERED] Order ${orderId} delivered. Awaiting DCC receipt to credit stock.`)
      }, "Order Delivery with DCC Stock Addition")
    } else if (status === "confirmed") {
      // Update the status for confirmed orders
      await prisma.stockOrder.update({
        where: { id: orderId },
        data: {
          status,
          approvedBy: user.id,
          approvedAt: new Date()
        }
      })
    } else {
      return NextResponse.json({
        success: false,
        message: "Invalid status. Only 'payment_confirmed', 'approved', 'rejected', 'completed', 'delivered', 'confirmed' or 'received' are allowed"
      }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: `Stock order ${status} successfully`
    })
  } catch (error) {
    console.error("[STOCK_ORDER_PATCH]", error)
    return NextResponse.json({ 
      success: false, 
      message: error instanceof Error ? error.message : "Failed to update stock order" 
    }, { status: 500 })
  }
}

// POST /api/v1/stock-orders - Create a new stock order (DCC only)
export async function POST(req: Request) {
  try {
    console.log("[STOCK_ORDERS_POST] Starting request...")
    let user = null;
    
    // Try token auth first (for DCC users)
    const authHeader = req.headers.get("Authorization")
    let token = null

    // Check Authorization header
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1]
    }
    
    // Try cookie if no Authorization header
    if (!token) {
      const cookieStore = await cookies()
      token = cookieStore.get("Gemurai_token")?.value || cookieStore.get("token")?.value
    }

    if (token) {
      const verifiedUser = await verifyAuthToken(token)
      if (verifiedUser) {
        user = verifiedUser
      }
    }

    // If no token auth, try NextAuth session
    if (!user) {
      const session = await getServerSession(authOptions)
      if (session?.user?.id) {
        user = session.user
      }
    }

    if (!user?.id) {
      return NextResponse.json({ 
        success: false, 
        message: "Unauthorized. Please log in." 
      }, { status: 401 })
    }

    // Get user with role and permissions
    const dbUser = await prisma.user.findUnique({
      where: { 
        id: user.id,
        isActive: true
      },
      include: {
        userRole: {
          include: {
            role: true
          }
        }
      }
    })

    if (!dbUser) {
      return NextResponse.json({ 
        success: false, 
        message: "User not found or inactive" 
      }, { status: 404 })
    }

    // Get user's role from the new role system
    const userRole = dbUser.userRole?.role?.name;
    console.log("[STOCK_ORDERS_POST] User role:", userRole);

    // Only allow DCC to create stock orders
    if (userRole !== "DCC") {
      console.log("[STOCK_ORDERS_POST] Access denied for role:", userRole);
      return NextResponse.json(
        { success: false, message: "Only DCC users can create stock orders" },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { products, comment, voucherCode } = body

    if (!products || !Array.isArray(products) || products.length === 0) {
      return NextResponse.json(
        { success: false, message: "Products array is required and must not be empty" },
        { status: 400 }
      )
    }

    // Validate each product in the array
    for (const productItem of products) {
      if (!productItem.productId || !productItem.quantity || productItem.quantity <= 0) {
        return NextResponse.json(
          { success: false, message: "Each product must have a valid productId and quantity > 0" },
          { status: 400 }
        )
      }
    }

    // Validate all products exist and get their details
    const productIds = products.map(p => p.productId)
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds } }
    })

    if (dbProducts.length !== productIds.length) {
      return NextResponse.json(
        { success: false, message: "One or more products not found" },
        { status: 404 }
      )
    }

    // Create a map for quick lookup
    const productMap = new Map(dbProducts.map(p => [p.id, p]))

    // Calculate total amount and total requested quantity
    let totalAmount = 0
    let totalRequestedQuantity = 0
    const validatedProducts = []

    for (const productItem of products) {
      const product = productMap.get(productItem.productId)
      if (!product) {
        return NextResponse.json(
          { success: false, message: `Product ${productItem.productId} not found` },
          { status: 404 }
        )
      }

      // Check minimum order quantity
      if (product.minOrderQuantity && productItem.quantity < product.minOrderQuantity) {
        return NextResponse.json(
          { 
            success: false, 
            message: `Minimum order quantity for "${product.name}" is ${product.minOrderQuantity} units. You requested ${productItem.quantity} units.` 
          },
          { status: 400 }
        )
      }

      // Use three-tier pricing system: Purchase Price, Sales Price, Commission
      const purchasePrice = product.costPrice || 0 // Purchase price from database costPrice
      const salesPrice = product.price // Sales price from database
      const commission = salesPrice - purchasePrice // Commission = Sales price - Purchase price
      
      // Calculate product total using purchase price
      const productTotal = purchasePrice * productItem.quantity
      totalAmount += productTotal
      totalRequestedQuantity += productItem.quantity

      validatedProducts.push({
        ...productItem,
        product,
        purchasePrice,
        salesPrice,
        commission,
        productTotal
      })
    }

    // Voucher validation and processing (optional)
    let voucher = null
    let voucherAmountUsed = 0
    let paymentMethod = "BANK_TRANSFER" // default if no voucher provided

    if (voucherCode) {
      // Support environments where the Prisma Client hasn't regenerated yet
      const hasVoucherModel = Boolean((prisma as any).voucher)

      if (hasVoucherModel) {
        voucher = await (prisma as any).voucher.findUnique({
          where: { code: voucherCode }
        })
      } else {
        // Fallback to raw SQL query
        const voucherRaw: any[] = await (prisma as any).$queryRawUnsafe(
          `SELECT v.id, v.code, v.value, v."remainingBalance", v.status, v."dccId", v."expiresAt"
           FROM "vouchers" v
           WHERE v.code = $1`,
          voucherCode
        )
        
        if (voucherRaw.length > 0) {
          const v = voucherRaw[0]
          voucher = {
            id: v.id,
            code: v.code,
            value: v.value,
            remainingBalance: v.remainingBalance,
            status: v.status,
            dccId: v.dccId,
            expiresAt: v.expiresAt
          }
        }
      }

      if (!voucher) {
        return NextResponse.json({
          success: false,
          message: "Invalid voucher code. Please provide a valid voucher code to place your stock order."
        }, { status: 400 })
      }

      // Check if voucher belongs to the requesting DCC
      if (voucher.dccId !== user.id) {
        return NextResponse.json({
          success: false,
          message: "This voucher does not belong to you"
        }, { status: 403 })
      }

      // Check voucher status
      if (voucher.status === "USED") {
        return NextResponse.json({
          success: false,
          message: "This voucher has already been fully used"
        }, { status: 400 })
      }

      if (voucher.status === "EXPIRED" || voucher.status === "INACTIVE") {
        return NextResponse.json({
          success: false,
          message: `This voucher is ${voucher.status.toLowerCase()}`
        }, { status: 400 })
      }

      // Check expiration date
      if (voucher.expiresAt && new Date() > voucher.expiresAt) {
        // Update voucher status to expired
        if (hasVoucherModel) {
          await (prisma as any).voucher.update({
            where: { id: voucher.id },
            data: { status: "EXPIRED" }
          })
        } else {
                  // Fallback to raw SQL update
        await (prisma as any).$queryRawUnsafe(
          `UPDATE "vouchers" SET status = 'EXPIRED'::"VoucherStatus" WHERE id = $1`,
          voucher.id
        )
        }

        return NextResponse.json({
          success: false,
          message: "This voucher has expired"
        }, { status: 400 })
      }

      // Check if voucher has sufficient balance
      if (voucher.remainingBalance < totalAmount) {
        return NextResponse.json({
          success: false,
          message: `Insufficient voucher balance. Available: ${voucher.remainingBalance} RWF, Required: ${totalAmount} RWF`
        }, { status: 400 })
      }

      voucherAmountUsed = totalAmount
      paymentMethod = "VOUCHER"
    }

    // Create stock order with pending status - using long transaction utility for production
    const result = await longTransaction(async (tx) => {
      // Check if Prisma models are available
      const hasPrismaModels = Boolean((tx as any).stockOrder?.create && 
        typeof (tx as any).stockOrder.create === 'function');

      let stockOrder;
      
              if (hasPrismaModels) {
          // Use Prisma models if available
        let voucherFieldsSupported = true;
          try {
            stockOrder = await tx.stockOrder.create({
              data: {
                dccId: user.id,
                totalAmount,
                totalRequestedQuantity,
                status: "pending",
                priority: "medium",
                notes: comment,
                voucherId: voucher?.id || null,
                voucherAmountUsed: voucherAmountUsed || null
              }
            });
          } catch (error) {
            // If voucher fields fail, switch to raw SQL for everything
          console.log("[STOCK_ORDER] Voucher fields not supported, switching to raw SQL for all operations");
          voucherFieldsSupported = false;
            
            // Create stock order with raw SQL
          const stockOrderId = `so_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const stockOrderResult: any[] = await (tx as any).$queryRawUnsafe(
              `INSERT INTO "StockOrder" ("id", "dccId", "totalAmount", "totalRequestedQuantity", status, priority, notes, "createdAt", "updatedAt")
               VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
               RETURNING *`,
              stockOrderId, user.id, totalAmount, totalRequestedQuantity, "pending", "medium", comment
            );
          stockOrder = stockOrderResult[0];

            // Create stock order products with raw SQL
            for (const validatedProduct of validatedProducts) {
            const stockOrderProductId = `sop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
              await (tx as any).$queryRawUnsafe(
                `INSERT INTO "StockOrderProduct" ("id", "stockOrderId", "productId", quantity, "currentStock", "requestedStock", price, "createdAt", "updatedAt")
                 VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`,
                stockOrderProductId, stockOrder.id, validatedProduct.productId, validatedProduct.quantity, 
                validatedProduct.product.stock, validatedProduct.quantity, validatedProduct.salesPrice
            );
            }

            // Create payment record with raw SQL
          const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            await (tx as any).$queryRawUnsafe(
              `INSERT INTO "Payment" ("id", "stockOrderId", status, amount, method, "paidAt", "createdAt", "updatedAt")
               VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
              paymentId, stockOrder.id, voucher ? "COMPLETED" : "PENDING", totalAmount, paymentMethod, voucher ? new Date() : null
          );
          }

          // Only use Prisma ORM if voucher fields were supported
          if (voucherFieldsSupported) {
            // Create stock order products using Prisma
            for (const validatedProduct of validatedProducts) {
              await tx.stockOrderProduct.create({
                data: {
                  stockOrderId: stockOrder.id,
                  productId: validatedProduct.productId,
                  quantity: validatedProduct.quantity,
                  currentStock: validatedProduct.product.stock,
                  requestedStock: validatedProduct.quantity,
                  price: validatedProduct.salesPrice
                }
            });
            }

            // Create payment record using Prisma
            await tx.payment.create({
              data: {
                stockOrderId: stockOrder.id,
                status: voucher ? "COMPLETED" : "PENDING",
                amount: totalAmount,
                method: paymentMethod,
                paidAt: voucher ? new Date() : null
              }
          });
        }
      } else {
        // Use raw SQL for everything if Prisma models not available
        console.log("[STOCK_ORDER] Using raw SQL for all operations");
        
        // Create stock order with raw SQL
        const stockOrderIdAllRaw = `so_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const stockOrderResult: any[] = await (tx as any).$queryRawUnsafe(
          `INSERT INTO "StockOrder" ("id", "dccId", "totalAmount", "totalRequestedQuantity", status, priority, notes, "voucherId", "voucherAmountUsed", "createdAt", "updatedAt")
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
           RETURNING *`,
          stockOrderIdAllRaw, user.id, totalAmount, totalRequestedQuantity, "pending", "medium", comment, voucher?.id || null, voucherAmountUsed || null
        );
        stockOrder = stockOrderResult[0];

        // Create stock order products with raw SQL
        for (const validatedProduct of validatedProducts) {
          const stockOrderProductIdAllRaw = `sop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          await (tx as any).$queryRawUnsafe(
            `INSERT INTO "StockOrderProduct" ("id", "stockOrderId", "productId", quantity, "currentStock", "requestedStock", price, "createdAt", "updatedAt")
             VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`,
            stockOrderProductIdAllRaw, stockOrder.id, validatedProduct.productId, validatedProduct.quantity, 
            validatedProduct.product.stock, validatedProduct.quantity, validatedProduct.salesPrice
          );
        }

        // Create payment record with raw SQL
        const paymentIdAllRaw = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await (tx as any).$queryRawUnsafe(
          `INSERT INTO "Payment" ("id", "stockOrderId", status, amount, method, "paidAt", "createdAt", "updatedAt")
           VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
          paymentIdAllRaw, stockOrder.id, voucher ? "COMPLETED" : "PENDING", totalAmount, paymentMethod, voucher ? new Date() : null
        );
      }

              // Process voucher if used
        if (voucher && voucherAmountUsed > 0) {
          // Update voucher balance and status
        const newBalance = voucher.remainingBalance - voucherAmountUsed;
        const newStatus = newBalance === 0 ? "USED" : "PARTIALLY_USED";

          // Use raw SQL for voucher processing since we're already in raw SQL mode
        console.log("[VOUCHER] Using raw SQL for voucher operations");
          await (tx as any).$queryRawUnsafe(
            `UPDATE "vouchers" SET "remainingBalance" = $1, status = $2::"VoucherStatus" WHERE id = $3`,
            newBalance, newStatus, voucher.id
        );

          // Generate a simple ID for the voucher transaction
        const voucherTransactionId = `vt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          
          await (tx as any).$queryRawUnsafe(
            `INSERT INTO "voucher_transactions" (id, "voucherId", type, amount, "remainingBalance", description, "stockOrderId", "createdAt")
             VALUES ($1, $2, $3::"VoucherTransactionType", $4, $5, $6, $7, NOW())`,
            voucherTransactionId, voucher.id, "USED", voucherAmountUsed, newBalance, `Used for stock order #${stockOrder.id}`, stockOrder.id
        );
        }

        // If payment is by voucher, set status to payment_confirmed for automatic confirmation
        if (paymentMethod === "VOUCHER") {
          // Use raw SQL for voucher completion since we're in raw SQL mode
          await (tx as any).$queryRawUnsafe(
            `UPDATE "StockOrder" SET status = $1, "paymentConfirmedAt" = $2, "paymentConfirmedBy" = $3 WHERE id = $4`,
            "payment_confirmed", new Date(), user.id, stockOrder.id
        );

          // Note: Products will be added to DCC inventory when employer approves the order
        console.log("[VOUCHER_ORDER] Order status set to payment_confirmed for automatic voucher confirmation");
      }

      // Note: Stock deduction and DCC stock increase will happen when payment is confirmed
      console.log("[ORDER_CREATED] Order created successfully. Stock will be deducted when payment is confirmed.");

      return stockOrder;
    }, "Stock Order Creation");

    // Send notifications after successful order creation
    try {
      await StockOrderNotifications.notifyOrderCreated(
        user.id,
        result.id,
        totalAmount,
        voucherCode
      )

      // If voucher was used, send payment confirmed notification
      if (voucher && voucherCode) {
        await StockOrderNotifications.notifyPaymentConfirmed(
          user.id,
          result.id,
          voucherCode,
          totalAmount
        )

        await StockOrderNotifications.notifyVoucherUsed(
          user.id,
          voucherCode,
          result.id,
          totalAmount
        )
      }
    } catch (notificationError) {
      console.error('Error sending notifications:', notificationError)
      // Don't fail the order creation if notifications fail
    }

    return NextResponse.json({
      success: true,
      data: {
        stockOrder: result,
        totalAmount: totalAmount,
        totalRequestedQuantity: totalRequestedQuantity,
        voucherUsed: voucher ? {
          code: voucher.code,
          amountUsed: voucherAmountUsed,
          remainingBalance: voucher.remainingBalance - voucherAmountUsed,
          status: voucher.remainingBalance - voucherAmountUsed === 0 ? "USED" : "PARTIALLY_USED"
        } : null,
        paymentMethod: paymentMethod,
        products: validatedProducts.map(vp => ({
          productId: vp.productId,
          productName: vp.product.name,
          quantity: vp.quantity,
          purchasePrice: vp.purchasePrice,
          salesPrice: vp.salesPrice,
          commission: vp.commission,
          productTotal: vp.productTotal
        }))
      }
    });
  } catch (error) {
    console.error("Error creating stock order:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create stock order" },
      { status: 500 }
    );
  }
}
