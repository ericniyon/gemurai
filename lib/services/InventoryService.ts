import { prisma } from "@/lib/database"
import { AuthUser } from "@/lib/auth"

export interface CreateWarehouseInput {
  name: string
  code: string
  description?: string
  address?: string
  city?: string
  country?: string
  isMain?: boolean
}

export interface CreateLocationInput {
  name: string
  code: string
  description?: string
  warehouseId: string
  parentId?: string
  locationType: 'STORAGE' | 'PICKING' | 'RECEIVING' | 'SHIPPING' | 'PRODUCTION' | 'SCRAP' | 'TRANSIT'
  maxCapacity?: number
  barcode?: string
}

export interface CreateStockMoveInput {
  productId: string
  warehouseId?: string
  locationId?: string
  destinationLocationId?: string
  quantity: number
  unitPrice?: number
  moveType: 'INCOMING' | 'OUTGOING' | 'INTERNAL' | 'RETURN' | 'ADJUSTMENT' | 'PRODUCTION' | 'SCRAP'
  origin?: string
  reference?: string
  notes?: string
  scheduledDate?: Date
}

export interface CreateInventoryAdjustmentInput {
  productId: string
  warehouseId?: string
  locationId?: string
  quantity: number
  adjustmentType: 'INCREASE' | 'DECREASE' | 'SET'
  reason: string
  notes?: string
}

export interface CreateCycleCountInput {
  name: string
  warehouseId?: string
  locationId?: string
  productId?: string
  scheduledDate?: Date
  notes?: string
}

export class InventoryService {
  // Warehouse Management
  static async createWarehouse(input: CreateWarehouseInput, user: AuthUser) {
    if (!user.permissions?.includes('*') && !user.permissions?.includes('inventory.warehouse.create')) {
      throw new Error('Unauthorized: Missing inventory.warehouse.create permission')
    }

    const warehouse = await prisma.warehouse.create({
      data: {
        ...input,
        isMain: input.isMain || false
      }
    })

    return warehouse
  }

  static async getWarehouses(user: AuthUser) {
    const warehouses = await prisma.warehouse.findMany({
      where: { isActive: true },
      include: {
        locations: {
          where: { isActive: true },
          orderBy: { code: 'asc' }
        },
        _count: {
          select: {
            locations: true,
            stockMoves: true
          }
        }
      },
      orderBy: { name: 'asc' }
    })

    return warehouses
  }

  static async getWarehouse(id: string, user: AuthUser) {
    const warehouse = await prisma.warehouse.findUnique({
      where: { id },
      include: {
        locations: {
          where: { isActive: true },
          include: {
            children: true,
            _count: {
              select: {
                stockQuantities: true,
                stockMoves: true
              }
            }
          },
          orderBy: { code: 'asc' }
        },
        stockMoves: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            product: {
              select: { id: true, name: true, image: true }
            }
          }
        }
      }
    })

    return warehouse
  }

  // Location Management
  static async createLocation(input: CreateLocationInput, user: AuthUser) {
    if (!user.permissions?.includes('*') && !user.permissions?.includes('inventory.location.create')) {
      throw new Error('Unauthorized: Missing inventory.location.create permission')
    }

    const location = await prisma.location.create({
      data: {
        ...input,
        currentCapacity: 0
      },
      include: {
        warehouse: true,
        parent: true
      }
    })

    return location
  }

  static async getLocations(warehouseId?: string, user: AuthUser) {
    const locations = await prisma.location.findMany({
      where: {
        isActive: true,
        ...(warehouseId && { warehouseId })
      },
      include: {
        warehouse: true,
        parent: true,
        children: true,
        _count: {
          select: {
            stockQuantities: true,
            stockMoves: true
          }
        }
      },
      orderBy: [{ warehouse: { name: 'asc' } }, { code: 'asc' }]
    })

    return locations
  }

  // Stock Move Management
  static async createStockMove(input: CreateStockMoveInput, user: AuthUser) {
    if (!user.permissions?.includes('*') && !user.permissions?.includes('inventory.move.create')) {
      throw new Error('Unauthorized: Missing inventory.move.create permission')
    }

    // Validate that the product exists
    const product = await prisma.product.findUnique({
      where: { id: input.productId }
    })
    if (!product) {
      throw new Error('Product not found')
    }

    // Validate that the warehouse exists if provided
    if (input.warehouseId) {
      const warehouse = await prisma.warehouse.findUnique({
        where: { id: input.warehouseId }
      })
      if (!warehouse) {
        throw new Error('Warehouse not found')
      }
    } else if (input.moveType === 'INTERNAL' || input.moveType === 'INCOMING' || input.moveType === 'OUTGOING') {
      // For these move types, warehouse is required
      throw new Error('Warehouse is required for this move type')
    }

    // Validate that the location exists if provided
    if (input.locationId) {
      const location = await prisma.location.findUnique({
        where: { id: input.locationId }
      })
      if (!location) {
        throw new Error('Location not found')
      }
    }

    // Validate that the destination location exists if provided
    if (input.destinationLocationId) {
      const destinationLocation = await prisma.location.findUnique({
        where: { id: input.destinationLocationId }
      })
      if (!destinationLocation) {
        throw new Error('Destination location not found')
      }
    }

    // Generate auto reference if not provided
    const reference = input.reference || await this.generateStockMoveReference(input.moveType)

    const stockMove = await prisma.stockMove.create({
      data: {
        ...input,
        reference,
        createdBy: user.id,
        state: 'DRAFT'
      },
      include: {
        product: {
          select: { id: true, name: true, image: true }
        },
        warehouse: true,
        location: true,
        destinationLocation: true
      }
    })

    return stockMove
  }

  // Generate unique reference number for stock moves
  private static async generateStockMoveReference(moveType: string): Promise<string> {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    
    // Get the count of stock moves for today
    const startOfDay = new Date(year, today.getMonth(), today.getDate())
    const endOfDay = new Date(year, today.getMonth(), today.getDate() + 1)
    
    const todayCount = await prisma.stockMove.count({
      where: {
        createdAt: {
          gte: startOfDay,
          lt: endOfDay
        }
      }
    })
    
    const sequenceNumber = String(todayCount + 1).padStart(4, '0')
    const moveTypePrefix = moveType.substring(0, 3).toUpperCase()
    
    return `${moveTypePrefix}-${year}${month}${day}-${sequenceNumber}`
  }

  static async confirmStockMove(id: string, user: AuthUser) {
    try {
      console.log("Starting confirmStockMove for ID:", id)
      
      if (!user.permissions?.includes('*') && !user.permissions?.includes('inventory.move.confirm')) {
        throw new Error('Unauthorized: Missing inventory.move.confirm permission')
      }

      console.log("User permissions checked, fetching stock move...")

      // Use a transaction to ensure data consistency
      const result = await prisma.$transaction(async (tx) => {
        const stockMove = await tx.stockMove.findUnique({
          where: { id },
          include: {
            product: true,
            warehouse: true,
            location: true,
            destinationLocation: true
          }
        })

        if (!stockMove) {
          throw new Error('Stock move not found')
        }

        console.log("Stock move found:", {
          id: stockMove.id,
          state: stockMove.state,
          moveType: stockMove.moveType,
          quantity: stockMove.quantity
        })

        if (stockMove.state !== 'DRAFT') {
          throw new Error(`Stock move is not in draft state (current: ${stockMove.state})`)
        }

        // Step 1: Confirm the stock move (DRAFT → CONFIRMED)
        console.log("Step 1: Confirming stock move...")
        const confirmedMove = await tx.stockMove.update({
          where: { id },
          data: {
            state: 'CONFIRMED',
            processedBy: user.id,
            processedAt: new Date()
          },
          include: {
            product: true,
            warehouse: true,
            location: true,
            destinationLocation: true
          }
        })

        // Step 2: Check availability and assign (CONFIRMED → ASSIGNED)
        console.log("Step 2: Checking availability and assigning...")
        const availabilityCheck = await InventoryService.checkStockAvailability(confirmedMove, tx)
        
        if (!availabilityCheck.isAvailable) {
          throw new Error(`Insufficient stock: ${availabilityCheck.message}`)
        }

        // Reserve the stock quantities
        await InventoryService.reserveStockQuantities(confirmedMove, tx)

        const assignedMove = await tx.stockMove.update({
          where: { id },
          data: {
            state: 'ASSIGNED'
          },
          include: {
            product: true,
            warehouse: true,
            location: true,
            destinationLocation: true
          }
        })

        // Step 3: Execute the physical move (ASSIGNED → DONE)
        console.log("Step 3: Executing physical move...")
        await InventoryService.executeStockMove(assignedMove, tx)

        const finalMove = await tx.stockMove.update({
          where: { id },
          data: {
            state: 'DONE',
            processedAt: new Date()
          },
          include: {
            product: {
              select: { id: true, name: true, image: true }
            },
            warehouse: true,
            location: true,
            destinationLocation: true
          }
        })

        console.log("Stock move completed successfully:", finalMove.id)
        return finalMove
      }, {
        maxWait: 10000, // 10 seconds max wait
        timeout: 30000  // 30 seconds timeout
      })

      return result
    } catch (error) {
      console.error("Error in confirmStockMove:", error)
      
      // Handle specific Prisma errors
      if (error.code === 'P2002') {
        throw new Error('Duplicate stock move operation')
      }
      if (error.code === 'P2025') {
        throw new Error('Stock move not found')
      }
      if (error.code === 'P2034') {
        throw new Error('Transaction failed due to concurrent modification')
      }
      
      throw error
    }
  }

  static async cancelStockMove(id: string, user: AuthUser) {
    if (!user.permissions?.includes('*') && !user.permissions?.includes('inventory.move.cancel')) {
      throw new Error('Unauthorized: Missing inventory.move.cancel permission')
    }

    const stockMove = await prisma.stockMove.findUnique({
      where: { id },
      include: {
        product: {
          select: { id: true, name: true, image: true }
        },
        warehouse: true,
        location: true,
        destinationLocation: true
      }
    })

    if (!stockMove) {
      throw new Error('Stock move not found')
    }

    if (!['DRAFT', 'CONFIRMED'].includes(stockMove.state)) {
      throw new Error('Stock move cannot be cancelled in its current state')
    }

    const updatedMove = await prisma.stockMove.update({
      where: { id },
      data: {
        state: 'CANCELLED',
        processedBy: user.id,
        processedAt: new Date()
      },
      include: {
        product: {
          select: { id: true, name: true, image: true }
        },
        warehouse: true,
        location: true,
        destinationLocation: true
      }
    })

    return updatedMove
  }

  static async getStockMoves(filters?: {
    productId?: string
    warehouseId?: string
    locationId?: string
    moveType?: string
    state?: string
    dateFrom?: Date
    dateTo?: Date
  }, user: AuthUser) {
    const stockMoves = await prisma.stockMove.findMany({
      where: {
        ...(filters?.productId && { productId: filters.productId }),
        ...(filters?.warehouseId && { warehouseId: filters.warehouseId }),
        ...(filters?.locationId && { locationId: filters.locationId }),
        ...(filters?.moveType && { moveType: filters.moveType as any }),
        ...(filters?.state && { state: filters.state as any }),
        ...(filters?.dateFrom && { date: { gte: filters.dateFrom } }),
        ...(filters?.dateTo && { date: { lte: filters.dateTo } })
      },
      include: {
        product: {
          select: { id: true, name: true, image: true }
        },
        warehouse: true,
        location: true,
        destinationLocation: true,
        createdByUser: {
          select: { id: true, name: true }
        }
      },
      orderBy: { date: 'desc' }
    })

    return stockMoves
  }

  // Inventory Adjustments
  static async createInventoryAdjustment(input: CreateInventoryAdjustmentInput, user: AuthUser) {
    if (!user.permissions?.includes('*') && !user.permissions?.includes('inventory.adjustment.create')) {
      throw new Error('Unauthorized: Missing inventory.adjustment.create permission')
    }

    const adjustment = await prisma.inventoryAdjustment.create({
      data: {
        ...input,
        createdBy: user.id,
        state: 'DRAFT'
      },
      include: {
        product: {
          select: { id: true, name: true, image: true }
        },
        warehouse: true,
        location: true
      }
    })

    return adjustment
  }

  static async approveInventoryAdjustment(id: string, user: AuthUser) {
    if (!user.permissions?.includes('*') && !user.permissions?.includes('inventory.adjustment.approve')) {
      throw new Error('Unauthorized: Missing inventory.adjustment.approve permission')
    }

    const adjustment = await prisma.inventoryAdjustment.findUnique({
      where: { id },
      include: {
        product: true,
        warehouse: true,
        location: true
      }
    })

    if (!adjustment) {
      throw new Error('Inventory adjustment not found')
    }

    if (adjustment.state !== 'DRAFT') {
      throw new Error('Adjustment is not in draft state')
    }

    // Apply the adjustment
    await InventoryService.applyInventoryAdjustment(adjustment)

    const updatedAdjustment = await prisma.inventoryAdjustment.update({
      where: { id },
      data: {
        state: 'APPROVED',
        approvedBy: user.id,
        approvedAt: new Date()
      },
      include: {
        product: {
          select: { id: true, name: true, image: true }
        },
        warehouse: true,
        location: true
      }
    })

    return updatedAdjustment
  }

  static async getInventoryAdjustments(filters?: {
    productId?: string
    warehouseId?: string
    state?: string
  }, user: AuthUser) {
    const adjustments = await prisma.inventoryAdjustment.findMany({
      where: {
        ...(filters?.productId && { productId: filters.productId }),
        ...(filters?.warehouseId && { warehouseId: filters.warehouseId }),
        ...(filters?.state && { state: filters.state as any })
      },
      include: {
        product: {
          select: { id: true, name: true, image: true }
        },
        warehouse: true,
        location: true,
        createdByUser: {
          select: { id: true, name: true }
        },
        approvedByUser: {
          select: { id: true, name: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return adjustments
  }

  // Cycle Counts
  static async createCycleCount(input: CreateCycleCountInput, user: AuthUser) {
    if (!user.permissions?.includes('*') && !user.permissions?.includes('inventory.cyclecount.create')) {
      throw new Error('Unauthorized: Missing inventory.cyclecount.create permission')
    }

    const cycleCount = await prisma.cycleCount.create({
      data: {
        ...input,
        createdBy: user.id,
        state: 'DRAFT'
      },
      include: {
        warehouse: true,
        location: true,
        product: true
      }
    })

    return cycleCount
  }

  static async getCycleCounts(user: AuthUser) {
    const cycleCounts = await prisma.cycleCount.findMany({
      include: {
        warehouse: true,
        location: true,
        product: true,
        createdByUser: {
          select: { id: true, name: true }
        },
        completedByUser: {
          select: { id: true, name: true }
        },
        items: {
          include: {
            product: {
              select: { id: true, name: true, image: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return cycleCounts
  }

  // Stock Quantities
  static async getStockQuantities(filters?: {
    productId?: string
    warehouseId?: string
    locationId?: string
  }) {
    const quantities = await prisma.stockQuantity.findMany({
      where: {
        ...(filters?.productId && { productId: filters.productId }),
        ...(filters?.warehouseId && { warehouseId: filters.warehouseId }),
        ...(filters?.locationId && { locationId: filters.locationId })
      },
      include: {
        product: {
          select: { 
            id: true, 
            name: true, 
            image: true, 
            category: true,
            price: true,
            commission: true,
            costPrice: true
          }
        },
        warehouse: true,
        location: true
      },
      orderBy: [
        { warehouse: { name: 'asc' } },
        { location: { code: 'asc' } }
      ]
    })

    return quantities
  }

  // Private helper methods
  private static async updateStockQuantitiesInTransaction(stockMove: any, tx: any) {
    try {
      const { productId, warehouseId, locationId, destinationLocationId, quantity, moveType } = stockMove
      
      console.log("updateStockQuantitiesInTransaction called with:", {
        productId,
        warehouseId,
        locationId,
        destinationLocationId,
        quantity,
        moveType
      })

      switch (moveType) {
        case 'INCOMING':
          // For incoming moves, only add to destination location
          if (destinationLocationId) {
            console.log("Processing INCOMING move - adding to destination")
            await InventoryService.updateQuantityInTransaction(productId, warehouseId, destinationLocationId, quantity, tx)
          } else {
            console.log("INCOMING move: No destination location specified, skipping")
          }
          break
          
        case 'OUTGOING':
          // For outgoing moves, only subtract from source location
          if (locationId) {
            console.log("Processing OUTGOING move - subtracting from source")
            await InventoryService.updateQuantityInTransaction(productId, warehouseId, locationId, -quantity, tx)
          } else {
            console.log("OUTGOING move: No source location specified, skipping")
          }
          break
          
        case 'INTERNAL':
          // For internal moves, subtract from source and add to destination
          if (locationId) {
            console.log("Processing INTERNAL move - subtracting from source")
            await InventoryService.updateQuantityInTransaction(productId, warehouseId, locationId, -quantity, tx)
          } else {
            console.log("INTERNAL move: No source location specified, skipping source deduction")
          }
          if (destinationLocationId) {
            console.log("Processing INTERNAL move - adding to destination")
            await InventoryService.updateQuantityInTransaction(productId, warehouseId, destinationLocationId, quantity, tx)
          } else {
            console.log("INTERNAL move: No destination location specified, skipping destination addition")
          }
          break
          
        default:
          // For other move types, use the original logic
          if (locationId) {
            console.log("Processing default move - subtracting from source")
            await InventoryService.updateQuantityInTransaction(productId, warehouseId, locationId, -quantity, tx)
          } else {
            console.log("Default move: No source location specified, skipping source deduction")
          }
          if (destinationLocationId) {
            console.log("Processing default move - adding to destination")
            await InventoryService.updateQuantityInTransaction(productId, warehouseId, destinationLocationId, quantity, tx)
          } else {
            console.log("Default move: No destination location specified, skipping destination addition")
          }
          break
      }
    } catch (error) {
      console.error("Error in updateStockQuantitiesInTransaction:", error)
      throw error
    }
  }

  private static async updateQuantityInTransaction(productId: string, warehouseId: string | null, locationId: string | null, quantityChange: number, tx: any) {
    try {
      console.log("updateQuantityInTransaction called with:", {
        productId,
        warehouseId,
        locationId,
        quantityChange
      })

      const existingQuantity = await tx.stockQuantity.findUnique({
        where: {
          productId_warehouseId_locationId: {
            productId,
            warehouseId: warehouseId || null,
            locationId: locationId || null
          }
        }
      })

      console.log("Existing quantity found:", existingQuantity ? "Yes" : "No")

      if (existingQuantity) {
        console.log("Updating existing quantity:", {
          currentQuantity: existingQuantity.quantity,
          newQuantity: existingQuantity.quantity + quantityChange
        })
        
        await tx.stockQuantity.update({
          where: { id: existingQuantity.id },
          data: {
            quantity: existingQuantity.quantity + quantityChange,
            availableQuantity: existingQuantity.availableQuantity + quantityChange,
            lastUpdated: new Date()
          }
        })
        console.log("Quantity updated successfully")
      } else if (quantityChange > 0) {
        console.log("Creating new quantity record with:", quantityChange)
        
        await tx.stockQuantity.create({
          data: {
            productId,
            warehouseId: warehouseId || null,
            locationId: locationId || null,
            quantity: quantityChange,
            availableQuantity: quantityChange
          }
        })
        console.log("New quantity record created successfully")
      } else {
        console.log("No action taken - quantityChange <= 0 and no existing record")
      }
    } catch (error) {
      console.error("Error in updateQuantityInTransaction:", error)
      throw error
    }
  }

  private static async updateStockQuantities(stockMove: any) {
    try {
      const { productId, warehouseId, locationId, destinationLocationId, quantity, moveType } = stockMove
      
      console.log("updateStockQuantities called with:", {
        productId,
        warehouseId,
        locationId,
        destinationLocationId,
        quantity,
        moveType
      })

      switch (moveType) {
              case 'INCOMING':
        // For incoming moves, only add to destination location
        if (destinationLocationId) {
          console.log("Processing INCOMING move - adding to destination")
          await InventoryService.updateQuantity(productId, warehouseId, destinationLocationId, quantity)
        } else {
          console.log("INCOMING move: No destination location specified, skipping")
        }
        break
        
              case 'OUTGOING':
        // For outgoing moves, only subtract from source location
        if (locationId) {
          console.log("Processing OUTGOING move - subtracting from source")
          await InventoryService.updateQuantity(productId, warehouseId, locationId, -quantity)
        } else {
          console.log("OUTGOING move: No source location specified, skipping")
        }
        break
        
              case 'INTERNAL':
        // For internal moves, subtract from source and add to destination
        if (locationId) {
          console.log("Processing INTERNAL move - subtracting from source")
          await InventoryService.updateQuantity(productId, warehouseId, locationId, -quantity)
        } else {
          console.log("INTERNAL move: No source location specified, skipping source deduction")
        }
        if (destinationLocationId) {
          console.log("Processing INTERNAL move - adding to destination")
          await InventoryService.updateQuantity(productId, warehouseId, destinationLocationId, quantity)
        } else {
          console.log("INTERNAL move: No destination location specified, skipping destination addition")
        }
        break
        
              default:
        // For other move types, use the original logic
        if (locationId) {
          console.log("Processing default move - subtracting from source")
          await InventoryService.updateQuantity(productId, warehouseId, locationId, -quantity)
        } else {
          console.log("Default move: No source location specified, skipping source deduction")
        }
        if (destinationLocationId) {
          console.log("Processing default move - adding to destination")
          await InventoryService.updateQuantity(productId, warehouseId, destinationLocationId, quantity)
        } else {
          console.log("Default move: No destination location specified, skipping destination addition")
        }
        break
      }
    } catch (error) {
      console.error("Error in updateStockQuantities:", error)
      throw error
    }
  }

  private static async updateQuantity(productId: string, warehouseId: string | null, locationId: string | null, quantityChange: number) {
    try {
      console.log("updateQuantity called with:", {
        productId,
        warehouseId,
        locationId,
        quantityChange
      })

      const existingQuantity = await prisma.stockQuantity.findUnique({
        where: {
          productId_warehouseId_locationId: {
            productId,
            warehouseId: warehouseId || null,
            locationId: locationId || null
          }
        }
      })

      console.log("Existing quantity found:", existingQuantity ? "Yes" : "No")

      if (existingQuantity) {
        console.log("Updating existing quantity:", {
          currentQuantity: existingQuantity.quantity,
          newQuantity: existingQuantity.quantity + quantityChange
        })
        
        await prisma.stockQuantity.update({
          where: { id: existingQuantity.id },
          data: {
            quantity: existingQuantity.quantity + quantityChange,
            availableQuantity: existingQuantity.availableQuantity + quantityChange,
            lastUpdated: new Date()
          }
        })
        console.log("Quantity updated successfully")
      } else if (quantityChange > 0) {
        console.log("Creating new quantity record with:", quantityChange)
        
        await prisma.stockQuantity.create({
          data: {
            productId,
            warehouseId: warehouseId || null,
            locationId: locationId || null,
            quantity: quantityChange,
            availableQuantity: quantityChange
          }
        })
        console.log("New quantity record created successfully")
      } else {
        console.log("No action taken - quantityChange <= 0 and no existing record")
      }
    } catch (error) {
      console.error("Error in updateQuantity:", error)
      throw error
    }
  }

  private static async applyInventoryAdjustment(adjustment: any) {
    const { productId, warehouseId, locationId, quantity, adjustmentType } = adjustment

    const existingQuantity = await prisma.stockQuantity.findUnique({
      where: {
        productId_warehouseId_locationId: {
          productId,
          warehouseId: warehouseId || null,
          locationId: locationId || null
        }
      }
    })

    let newQuantity = 0
    switch (adjustmentType) {
      case 'INCREASE':
        newQuantity = (existingQuantity?.quantity || 0) + quantity
        break
      case 'DECREASE':
        newQuantity = Math.max(0, (existingQuantity?.quantity || 0) - quantity)
        break
      case 'SET':
        newQuantity = quantity
        break
    }

    if (existingQuantity) {
      await prisma.stockQuantity.update({
        where: { id: existingQuantity.id },
        data: {
          quantity: newQuantity,
          availableQuantity: newQuantity,
          lastUpdated: new Date()
        }
      })
    } else {
      await prisma.stockQuantity.create({
        data: {
          productId,
          warehouseId: warehouseId || null,
          locationId: locationId || null,
          quantity: newQuantity,
          availableQuantity: newQuantity
        }
      })
    }
  }

  // Odoo-style inventory management methods
  private static async checkStockAvailability(stockMove: any, tx: any): Promise<{isAvailable: boolean, message: string}> {
    const { productId, warehouseId, locationId, quantity, moveType } = stockMove
    
    // For incoming moves, we don't need to check availability
    if (moveType === 'INCOMING') {
      return { isAvailable: true, message: 'Incoming move - no availability check needed' }
    }
    
    // For outgoing and internal moves, check if we have enough stock
    if (moveType === 'OUTGOING' || moveType === 'INTERNAL') {
      if (!locationId) {
        return { isAvailable: false, message: 'Source location is required for this move type' }
      }
      
      const stockQuantity = await tx.stockQuantity.findUnique({
        where: {
          productId_warehouseId_locationId: {
            productId,
            warehouseId: warehouseId || null,
            locationId: locationId || null
          }
        }
      })
      
      const availableQuantity = stockQuantity?.availableQuantity || 0
      
      // For INTERNAL moves, if there's no stock record, allow the move (for initial setup)
      if (moveType === 'INTERNAL' && !stockQuantity) {
        console.log(`No stock record found for INTERNAL move, allowing for initial setup`)
        return { isAvailable: true, message: 'No stock record found - allowing for initial setup' }
      }
      
      if (availableQuantity < quantity) {
        return { 
          isAvailable: false, 
          message: `Not enough stock available. Required: ${quantity}, Available: ${availableQuantity}` 
        }
      }
    }
    
    return { isAvailable: true, message: 'Stock available' }
  }

  private static async reserveStockQuantities(stockMove: any, tx: any) {
    const { productId, warehouseId, locationId, quantity, moveType } = stockMove
    
    // Only reserve stock for outgoing and internal moves
    if (moveType === 'OUTGOING' || moveType === 'INTERNAL') {
      if (locationId) {
        console.log(`Reserving ${quantity} units from location ${locationId}`)
        
        const stockQuantity = await tx.stockQuantity.findUnique({
          where: {
            productId_warehouseId_locationId: {
              productId,
              warehouseId: warehouseId || null,
              locationId: locationId || null
            }
          }
        })
        
        if (stockQuantity) {
          await tx.stockQuantity.update({
            where: { id: stockQuantity.id },
            data: {
              reservedQuantity: stockQuantity.reservedQuantity + quantity,
              availableQuantity: stockQuantity.availableQuantity - quantity,
              lastUpdated: new Date()
            }
          })
        } else if (moveType === 'INTERNAL') {
          // For INTERNAL moves with no existing stock, create a stock record with 0 quantity
          console.log(`Creating stock record for INTERNAL move with no existing stock`)
          await tx.stockQuantity.create({
            data: {
              productId,
              warehouseId: warehouseId || null,
              locationId: locationId || null,
              quantity: 0,
              availableQuantity: 0,
              reservedQuantity: 0
            }
          })
        }
      }
    }
  }

  private static async executeStockMove(stockMove: any, tx: any) {
    const { productId, warehouseId, locationId, destinationLocationId, quantity, moveType } = stockMove
    
    console.log(`Executing ${moveType} move of ${quantity} units`)
    
    switch (moveType) {
      case 'INCOMING':
        // Add stock to destination location
        if (destinationLocationId) {
          await InventoryService.updateQuantityInTransaction(
            productId, 
            warehouseId, 
            destinationLocationId, 
            quantity, 
            tx
          )
        }
        break
        
      case 'OUTGOING':
        // Remove stock from source location and unreserve
        if (locationId) {
          await InventoryService.finalizeOutgoingMove(
            productId, 
            warehouseId, 
            locationId, 
            quantity, 
            tx
          )
        }
        break
        
      case 'INTERNAL':
        // Move stock from source to destination
        if (locationId && destinationLocationId) {
          // Remove from source (and unreserve)
          await InventoryService.finalizeOutgoingMove(
            productId, 
            warehouseId, 
            locationId, 
            quantity, 
            tx
          )
          
          // Add to destination
          await InventoryService.updateQuantityInTransaction(
            productId, 
            warehouseId, 
            destinationLocationId, 
            quantity, 
            tx
          )
        }
        break
        
      case 'ADJUSTMENT':
        // Handle inventory adjustments
        if (quantity > 0 && destinationLocationId) {
          await InventoryService.updateQuantityInTransaction(
            productId, 
            warehouseId, 
            destinationLocationId, 
            quantity, 
            tx
          )
        } else if (quantity < 0 && locationId) {
          await InventoryService.updateQuantityInTransaction(
            productId, 
            warehouseId, 
            locationId, 
            quantity, 
            tx
          )
        }
        break
        
      default:
        console.log(`Move type ${moveType} not specifically handled, using default logic`)
        // Use the existing logic for other move types
        await InventoryService.updateStockQuantitiesInTransaction(stockMove, tx)
        break
    }
  }

  private static async finalizeOutgoingMove(productId: string, warehouseId: string | null, locationId: string, quantity: number, tx: any) {
    const stockQuantity = await tx.stockQuantity.findUnique({
      where: {
        productId_warehouseId_locationId: {
          productId,
          warehouseId: warehouseId || null,
          locationId: locationId || null
        }
      }
    })
    
    if (stockQuantity) {
      await tx.stockQuantity.update({
        where: { id: stockQuantity.id },
        data: {
          quantity: stockQuantity.quantity - quantity,
          reservedQuantity: Math.max(0, stockQuantity.reservedQuantity - quantity),
          lastUpdated: new Date()
        }
      })
    } else {
      // For INTERNAL moves with no existing stock, create a stock record with negative quantity
      console.log(`Creating stock record for INTERNAL move with no existing stock in finalizeOutgoingMove`)
      await tx.stockQuantity.create({
        data: {
          productId,
          warehouseId: warehouseId || null,
          locationId: locationId || null,
          quantity: -quantity,
          availableQuantity: 0,
          reservedQuantity: 0
        }
      })
    }
  }
} 