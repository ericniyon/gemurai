import { PrismaClient } from "@prisma/client"
import { prisma } from "@/lib/prisma"

// Types for MCC-Inventory Integration
export interface MilkCollectionData {
  farmerId: string
  mccPeriodId?: string
  collectionDate: Date
  period: number
  totalLiters: number
  unitPrice: number
  totalAmount: number
  warehouseId?: string
  locationId?: string
  productId?: string
  deductions?: {
    products?: Array<{
      id: string
      productId: string
      productName: string
      quantity: number
      unitPrice: number
      totalPrice: number
    }>
    others?: {
      depannage?: number
      essence?: number
      umugabane?: number
      ejoHeza?: number
      inguzanyo?: number
    }
  }
  advances?: number
}

export interface MilkProcessingData {
  mccId: string
  rawMilkProductId: string
  processedProductId: string
  inputQuantity: number
  outputQuantity: number
  processingDate: Date
  processingSteps?: Record<string, any>
  qualityMetrics?: Record<string, any>
  processedBy: string
}

export interface MCCSetupData {
  name: string
  location: string
  contactInfo: Record<string, any>
  settings: Record<string, any>
  warehouses: Array<{
    name: string
    type: 'COLLECTION_CENTER' | 'PROCESSING_PLANT' | 'COLD_STORAGE' | 'DISTRIBUTION_CENTER'
    location: string
    capacity: number
  }>
}

export interface FarmerData {
  mccId: string
  name: string
  phone: string
  location: string
  gender?: string
  email?: string
  nationalId?: string
  nfcId?: string
  district?: string
  sector?: string
  cell?: string
  village?: string
  address?: string
  herdSize?: number
  isCooperativeMember?: boolean
  cooperativeName?: string
  emergencyContact?: string
  emergencyPhone?: string
  paymentMethod?: "cash" | "mobile_money" | "bank_transfer" | "ikofi"
  bankAccountNumber?: string
  bankName?: string
  notes?: string
  gpsLatitude?: number | null
  gpsLongitude?: number | null
  geoConsent?: boolean
  /** Default collection center (MCC) for this farmer */
  defaultCollectionCenterId?: string
  /** Agent IDs to assign to this farmer */
  assignedAgentIds?: string[]
}

export class MCCInventoryService {
  /**
   * Setup MCC with warehouses and initial products
   */
  static async setupMCC(data: MCCSetupData) {
    return await prisma.$transaction(async (tx) => {
      // Create MCC
      const mcc = await tx.mCC.create({
        data: {
          name: data.name,
          location: data.location,
          contactInfo: data.contactInfo,
          settings: data.settings
        }
      })

      // Create warehouses
      const warehouses = []
      for (const warehouseData of data.warehouses) {
        const warehouse = await tx.mCCWarehouse.create({
          data: {
            mccId: mcc.id,
            name: warehouseData.name,
            type: warehouseData.type,
            location: warehouseData.location,
            capacity: warehouseData.capacity
          }
        })
        warehouses.push(warehouse)
      }

      // Create initial MCC products
      const products = await this.createInitialMCCProducts(tx, mcc.id, warehouses)

      return {
        mcc,
        warehouses,
        products
      }
    })
  }

  /**
   * Create initial MCC products (Raw Milk, Processed Milk, etc.)
   */
  private static async createInitialMCCProducts(tx: PrismaClient, mccId: string, warehouses: any[]) {
    const collectionWarehouse = warehouses.find(w => w.type === 'COLLECTION_CENTER')
    const processingWarehouse = warehouses.find(w => w.type === 'PROCESSING_PLANT')

    const products = []

    // Raw Milk Product
    if (collectionWarehouse) {
      const rawMilk = await tx.product.create({
        data: {
          name: "Raw Milk",
          description: "Fresh milk collected from farmers",
          price: 500, // Base price per liter
          category: "Dairy",
          subcategory: "Raw Milk",
          sellerId: mccId, // MCC as seller
          mccProductType: "RAW_MILK",
          mccWarehouseId: collectionWarehouse.id,
          unitOfMeasure: "Liters",
          tracking: "LOT",
          shelfLife: 2, // 2 days shelf life
          temperatureRange: { min: 2, max: 8 }, // Cold storage
          processingSteps: {
            collection: "Direct from farmers",
            storage: "Cold storage at 4°C",
            quality: "Fresh milk quality check"
          }
        }
      })
      products.push(rawMilk)
    }

    // Processed Milk Product
    if (processingWarehouse) {
      const processedMilk = await tx.product.create({
        data: {
          name: "Pasteurized Milk",
          description: "Heat-treated milk for extended shelf life",
          price: 600, // Higher price for processed milk
          category: "Dairy",
          subcategory: "Processed Milk",
          sellerId: mccId,
          mccProductType: "PROCESSED_MILK",
          mccWarehouseId: processingWarehouse.id,
          unitOfMeasure: "Liters",
          tracking: "LOT",
          shelfLife: 7, // 7 days shelf life
          temperatureRange: { min: 2, max: 8 },
          processingSteps: {
            pasteurization: "Heat treatment at 72°C for 15 seconds",
            cooling: "Rapid cooling to 4°C",
            packaging: "Aseptic packaging"
          }
        }
      })
      products.push(processedMilk)
    }

    return products
  }

  /**
   * Record milk collection and create inventory stock move
   */
  static async recordMilkCollection(data: MilkCollectionData) {
    console.log('MCCInventoryService.recordMilkCollection called with:', data)
    
    try {
      // Calculate deductions and net payment
      const deductions = data.deductions || {}
      
      // Calculate product deductions total
      const productDeductionsTotal = deductions.products ? 
        deductions.products.reduce((sum: number, product: any) => sum + (product.totalPrice || 0), 0) : 0
      
      // Calculate others deductions total
      const othersTotal = deductions.others ? 
        Object.values(deductions.others).reduce((sum: number, amount: any) => sum + (amount || 0), 0) : 0
      
      const totalDeductions = productDeductionsTotal + othersTotal
      const advances = data.advances || 0
      const netPayment = data.totalAmount - totalDeductions - advances

      console.log('Creating milk collection with data:', {
        farmerId: data.farmerId,
        mccPeriodId: data.mccPeriodId,
        collectionDate: data.collectionDate,
        period: data.period,
        totalLiters: data.totalLiters,
        unitPrice: data.unitPrice,
        totalAmount: data.totalAmount,
        warehouseId: data.warehouseId,
        locationId: data.locationId,
        productId: data.productId,
        deductions: deductions,
        advances: advances,
        totalDeductions: totalDeductions,
        netPayment: netPayment,
        status: "PENDING"
      })

      // Create milk collection record
      const collection = await prisma.milk_collections.create({
        data: {
          farmerId: data.farmerId,
          mccPeriodId: data.mccPeriodId,
          collectionDate: data.collectionDate,
          period: data.period,
          totalLiters: data.totalLiters,
          unitPrice: data.unitPrice,
          totalAmount: data.totalAmount,
          warehouseId: data.warehouseId,
          locationId: data.locationId,
          productId: data.productId,
          deductions: deductions,
          advances: advances,
          totalDeductions: totalDeductions,
          netPayment: netPayment,
          status: "PENDING"
        }
      })

      console.log('Milk collection created successfully:', collection.id)

      // Skip stock move creation for now - just return the collection
      console.log('Skipping stock move creation for now')
      
      return {
        collection,
        stockMove: null,
        inventoryUpdated: false
      }
    } catch (error) {
      console.error('Error in MCCInventoryService.recordMilkCollection:', error)
      throw error
    }
  }

  /**
   * Process milk from raw to processed products
   */
  static async processMilk(data: MilkProcessingData) {
    return await prisma.$transaction(async (tx) => {
      // Create milk processing record
      const processing = await tx.milkProcessing.create({
        data: {
          mccId: data.mccId,
          rawMilkProductId: data.rawMilkProductId,
          processedProductId: data.processedProductId,
          inputQuantity: data.inputQuantity,
          outputQuantity: data.outputQuantity,
          processingDate: data.processingDate,
          processingSteps: data.processingSteps || {},
          qualityMetrics: data.qualityMetrics || {},
          status: "PENDING"
        }
      })

      // Get raw milk product info
      const rawMilkProduct = await tx.product.findUnique({
        where: { id: data.rawMilkProductId },
        include: { mccWarehouse: true }
      })

      // Get processed milk product info
      const processedMilkProduct = await tx.product.findUnique({
        where: { id: data.processedProductId },
        include: { mccWarehouse: true }
      })

      if (!rawMilkProduct || !processedMilkProduct) {
        throw new Error("Raw milk or processed milk product not found")
      }

      // Create outgoing stock move (raw milk consumption)
      const outgoingMove = await tx.stockMove.create({
        data: {
          productId: data.rawMilkProductId,
          warehouseId: rawMilkProduct.mccWarehouseId,
          quantity: data.inputQuantity,
          moveType: "OUTGOING",
          state: "DRAFT",
          createdBy: data.processedBy,
          origin: "MCC_PROCESSING",
          reference: `MP-${processing.id}`,
          notes: `Raw milk consumed for processing`
        }
      })

      // Create incoming stock move (processed milk production)
      const incomingMove = await tx.stockMove.create({
        data: {
          productId: data.processedProductId,
          warehouseId: processedMilkProduct.mccWarehouseId,
          quantity: data.outputQuantity,
          moveType: "INCOMING",
          state: "DRAFT",
          createdBy: data.processedBy,
          origin: "MCC_PROCESSING",
          reference: `MP-${processing.id}`,
          notes: `Processed milk produced from raw milk`
        }
      })

      // Confirm both stock moves
      await this.confirmStockMove(tx, outgoingMove.id)
      await this.confirmStockMove(tx, incomingMove.id)

      // Update processing status
      await tx.milkProcessing.update({
        where: { id: processing.id },
        data: { status: "COMPLETED" }
      })

      return {
        processing,
        outgoingMove,
        incomingMove,
        yield: data.outputQuantity / data.inputQuantity
      }
    })
  }

  /**
   * Confirm stock move and update inventory quantities
   */
  private static async confirmStockMove(tx: PrismaClient, stockMoveId: string) {
    const stockMove = await tx.stockMove.findUnique({
      where: { id: stockMoveId },
      include: { product: true }
    })

    if (!stockMove) {
      throw new Error("Stock move not found")
    }

    // Update stock move state
    await tx.stockMove.update({
      where: { id: stockMoveId },
      data: {
        state: "CONFIRMED",
        processedAt: new Date()
      }
    })

    // Update stock quantities
    await this.updateStockQuantities(tx, stockMove)
  }

  /**
   * Update stock quantities based on stock move
   */
  private static async updateStockQuantities(tx: PrismaClient, stockMove: any) {
    const { productId, warehouseId, locationId, quantity, moveType } = stockMove

    // Find existing stock quantity record
    const existingQuantity = await tx.stockQuantity.findUnique({
      where: {
        productId_warehouseId_locationId: {
          productId,
          warehouseId: warehouseId || null,
          locationId: locationId || null
        }
      }
    })

    let quantityChange = 0
    switch (moveType) {
      case "INCOMING":
        quantityChange = quantity
        break
      case "OUTGOING":
        quantityChange = -quantity
        break
      case "INTERNAL":
        // Handle internal moves separately
        return
      default:
        return
    }

    if (existingQuantity) {
      // Update existing quantity
      await tx.stockQuantity.update({
        where: { id: existingQuantity.id },
        data: {
          quantity: existingQuantity.quantity + quantityChange,
          availableQuantity: existingQuantity.availableQuantity + quantityChange,
          lastUpdated: new Date()
        }
      })
    } else if (quantityChange > 0) {
      // Create new quantity record
      await tx.stockQuantity.create({
        data: {
          productId,
          warehouseId: warehouseId || null,
          locationId: locationId || null,
          quantity: quantityChange,
          availableQuantity: quantityChange,
          reservedQuantity: 0
        }
      })
    }
  }

  /**
   * Get MCC inventory summary
   */
  static async getMCCInventorySummary(mccId: string) {
    const mcc = await prisma.mCC.findUnique({
      where: { id: mccId },
      include: {
        warehouses: {
          include: {
            products: {
              include: {
                stockQuantities: true
              }
            }
          }
        }
      }
    })

    if (!mcc) {
      throw new Error("MCC not found")
    }

    // Calculate inventory summary
    const inventorySummary = {
      totalProducts: 0,
      totalQuantity: 0,
      totalValue: 0,
      warehouses: mcc.warehouses.map(warehouse => {
        const warehouseProducts = warehouse.products.filter(p => p.mccProductType)
        const warehouseQuantity = warehouseProducts.reduce((sum, product) => {
          return sum + product.stockQuantities.reduce((qSum, sq) => qSum + sq.quantity, 0)
        }, 0)
        const warehouseValue = warehouseProducts.reduce((sum, product) => {
          const productQuantity = product.stockQuantities.reduce((qSum, sq) => qSum + sq.quantity, 0)
          return sum + (productQuantity * product.price)
        }, 0)

        return {
          id: warehouse.id,
          name: warehouse.name,
          type: warehouse.type,
          capacity: warehouse.capacity,
          currentQuantity: warehouseQuantity,
          currentValue: warehouseValue,
          products: warehouseProducts.length
        }
      })
    }

    inventorySummary.totalProducts = inventorySummary.warehouses.reduce((sum, w) => sum + w.products, 0)
    inventorySummary.totalQuantity = inventorySummary.warehouses.reduce((sum, w) => sum + w.currentQuantity, 0)
    inventorySummary.totalValue = inventorySummary.warehouses.reduce((sum, w) => sum + w.currentValue, 0)

    return {
      mcc,
      inventorySummary
    }
  }

  /**
   * Get farmer collection history
   */
  static async getFarmerCollectionHistory(farmerId: string, limit: number = 10) {
    return await prisma.milk_collections.findMany({
      where: { farmerId },
      include: {
        farmers: true,
        products: true,
        warehouses: true,
        locations: true,
        stock_moves: true
      },
      orderBy: { collectionDate: 'desc' },
      take: limit
    })
  }

  /**
   * Get MCC processing history
   */
  static async getMCCProcessingHistory(mccId: string, limit: number = 10) {
    return await prisma.milkProcessing.findMany({
      where: { mccId },
      include: {
        rawMilkProduct: true,
        processedProduct: true
      },
      orderBy: { processingDate: 'desc' },
      take: limit
    })
  }

  /**
   * Create farmer
   */
  static async createFarmer(data: FarmerData) {
    console.log("MCCInventoryService.createFarmer called with data:", data)
    
    try {
      // Create a comprehensive location string from available data
      const locationParts = []
      if (data.district) locationParts.push(data.district)
      if (data.sector) locationParts.push(data.sector)
      if (data.cell) locationParts.push(data.cell)
      if (data.village) locationParts.push(data.village)
      
      const fullLocation = locationParts.length > 0 ? locationParts.join(', ') : data.location
      console.log("Full location:", fullLocation)

      // Store additional information as JSON in a structured way
      const additionalInfo = {
        gender: data.gender,
        email: data.email,
        nationalId: data.nationalId,
        district: data.district,
        sector: data.sector,
        cell: data.cell,
        village: data.village,
        isCooperativeMember: data.isCooperativeMember,
        cooperativeName: data.cooperativeName,
        emergencyContact: data.emergencyContact,
        emergencyPhone: data.emergencyPhone,
        bankAccount: data.bankAccount,
        bankName: data.bankName,
        notes: data.notes
      }

      // Validate National ID is provided (HarvestPlus requirement)
      if (!data.nationalId || !data.nationalId.trim()) {
        throw new Error("National ID is required for farmer registration (HarvestPlus requirement)")
      }

      const farmerData: any = {
        mccId: data.mccId,
        name: data.name,
        phone: data.phone,
        location: fullLocation,
        village: data.village ?? undefined,
        isActive: true,
        email: data.email,
        nationalId: data.nationalId,
        nfcId: data.nfcId || undefined,
        address: data.address || fullLocation,
        district: data.district,
        sector: data.sector,
        cell: data.cell || undefined,
        herdSize: data.herdSize ?? undefined,
        emergencyContact: data.emergencyContact || data.emergencyPhone || undefined,
        paymentMethod: data.paymentMethod || undefined,
        bankAccountNumber: data.bankAccountNumber || undefined,
        bankName: data.bankName || undefined,
        defaultCollectionCenterId: data.defaultCollectionCenterId || data.mccId,
        gpsLatitude: data.gpsLatitude ?? null,
        gpsLongitude: data.gpsLongitude ?? null,
        geoConsent: data.geoConsent ?? (data.gpsLatitude != null && data.gpsLongitude != null),
        geoConsentAt: (data.gpsLatitude != null && data.gpsLongitude != null) ? new Date() : null,
        geoCreatedAt: (data.gpsLatitude != null && data.gpsLongitude != null) ? new Date() : null,
      }
      
      console.log("Creating farmer with data:", farmerData)
      
      const farmer = await prisma.farmers.create({
        data: farmerData
      })

      if (data.assignedAgentIds && data.assignedAgentIds.length > 0) {
        await prisma.farmer_agent_assignments.createMany({
          data: data.assignedAgentIds.map((agentId) => ({
            farmerId: farmer.id,
            agentId,
            assignedBy: undefined,
            isActive: true,
          })),
        })
      }
      
      console.log("Farmer created successfully:", farmer)
      return farmer
    } catch (error) {
      console.error("Error in MCCInventoryService.createFarmer:", error)
      throw error
    }
  }

  /**
   * Get all farmers (for admin purposes)
   */
  static async getAllFarmers() {
    return await prisma.farmers.findMany({
      orderBy: { name: 'asc' }
    })
  }

  /**
   * Get MCC farmers
   */
  static async getMCCFarmers(mccId: string) {
    return await prisma.farmers.findMany({
      where: { mccId },
      orderBy: { name: 'asc' }
    })
  }

  /**
   * Get a single farmer by id
   */
  static async getFarmerById(id: string) {
    return await prisma.farmers.findUnique({
      where: { id }
    })
  }

  /**
   * Update farmer basic details
   */
  static async updateFarmer(id: string, data: Partial<Pick<FarmerData, 'name' | 'phone' | 'location'>> & { isActive?: boolean }) {
    return await prisma.farmers.update({
      where: { id },
      data: {
        name: data.name,
        phone: data.phone,
        location: data.location,
        isActive: typeof data.isActive === 'boolean' ? data.isActive : undefined
      }
    })
  }

  /**
   * Delete farmer by id
   */
  static async deleteFarmer(id: string) {
    return await prisma.farmers.delete({
      where: { id }
    })
  }
}


