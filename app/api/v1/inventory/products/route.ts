import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/database"

// GET /api/v1/inventory/products - List pharmacy products
export async function GET(_request: NextRequest) {
  try {
    console.log("Fetching pharmacy products...")
    
    const products = await prisma.products.findMany({
      where: { inventoryType: 'PHARMACY' },
      include: {
        pharmacyWarehouse: {
          select: { name: true, location: true }
        },
        users: {
          select: { name: true, email: true }
        },
        stockQuantities: {
          include: {
            location: {
              select: { id: true, name: true, code: true }
            },
            warehouse: {
              select: { id: true, name: true }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    })
    
    console.log(`Found ${products.length} pharmacy products`)
    return NextResponse.json({ success: true, data: products })
  } catch (error) {
    console.error("List products error:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Failed to list products",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}

// POST /api/v1/inventory/products - Create pharmacy product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("Received product data:", body)
    
    const {
      name,
      description,
      pharmacyWarehouseId,
      locationId,
      pricePerUnit,
      coopDiscountPercent,
      category,
      dosageForm,
      strength,
      activeIngredient,
      requiresPrescription,
      controlledSubstance
    } = body

    if (!name) {
      return NextResponse.json({ success: false, error: "Name is required" }, { status: 400 })
    }

    const price = isNaN(parseFloat(pricePerUnit)) ? 0 : parseFloat(pricePerUnit)
    const discount = isNaN(parseFloat(coopDiscountPercent)) ? 0 : parseFloat(coopDiscountPercent)

    // Map frontend category values to enum values
    const categoryMapping: { [key: string]: string } = {
      'ANTIBIOTIC': 'ANTIBIOTICS',
      'ANALGESIC': 'ANALGESICS',
      'PAINKILLER': 'ANALGESICS', // Map PAINKILLER to ANALGESICS
      'ANTIPARASITIC': 'OTHER', // Using OTHER as fallback
      'VITAMIN': 'VITAMINS', // Use correct enum value
      'SUPPLEMENT': 'OTHER', // Map supplements to OTHER
      'OTHER': 'OTHER'
    }

    const mappedCategory = categoryMapping[category] || 'OTHER'

    // Find or create a system user for pharmacy products
    let systemUserId = 'system'
    try {
      // Try to find an existing system user
      const existingUser = await prisma.user.findFirst({
        where: { email: 'system@pharmacy.local' }
      })
      
      if (existingUser) {
        systemUserId = existingUser.id
      } else {
        // Create a system user for pharmacy products
        const systemUser = await prisma.user.create({
          data: {
            email: 'system@pharmacy.local',
            name: 'Pharmacy System',
            password: 'system_password_hash', // This should be hashed in production
            isActive: true
          }
        })
        systemUserId = systemUser.id
        console.log('Created system user:', systemUserId)
      }
    } catch (userError) {
      console.warn('Could not create/find system user, using fallback:', userError)
      // Try to find any existing user as fallback
      const anyUser = await prisma.user.findFirst()
      if (anyUser) {
        systemUserId = anyUser.id
        console.log('Using existing user as seller:', systemUserId)
      }
    }

    // Handle warehouse assignment
    let finalPharmacyWarehouseId = null
    if (pharmacyWarehouseId) {
      // Find or create a PharmacyWarehouse for the selected regular warehouse
      try {
        const regularWarehouse = await prisma.warehouse.findUnique({
          where: { id: pharmacyWarehouseId }
        })
        
        if (regularWarehouse) {
          // Find an existing pharmacy to use
          const existingPharmacy = await prisma.pharmacy.findFirst()
          if (!existingPharmacy) {
            console.error('No pharmacy found in database')
            return NextResponse.json({ 
              success: false, 
              error: "No pharmacy found in database" 
            }, { status: 400 })
          }
          
          // Find or create a pharmacy warehouse for this regular warehouse
          let pharmacyWarehouse = await prisma.pharmacyWarehouse.findFirst({
            where: { 
              name: regularWarehouse.name,
              location: regularWarehouse.location || regularWarehouse.address || 'Unknown'
            }
          })
          
          if (!pharmacyWarehouse) {
            // Create a new pharmacy warehouse
            pharmacyWarehouse = await prisma.pharmacyWarehouse.create({
              data: {
                pharmacyId: existingPharmacy.id,
                name: regularWarehouse.name,
                type: 'MAIN_PHARMACY',
                location: regularWarehouse.location || regularWarehouse.address || 'Unknown',
                capacity: 1000 // Default capacity
              }
            })
            console.log('Created pharmacy warehouse:', pharmacyWarehouse.id)
          }
          
          finalPharmacyWarehouseId = pharmacyWarehouse.id
        }
      } catch (error) {
        console.error('Error handling warehouse assignment:', error)
        // Continue without warehouse assignment
      }
    }

    console.log("Creating product with data:", {
      name,
      description,
      price,
      originalCategory: category,
      mappedCategory,
      dosageForm,
      strength,
      activeIngredient,
      requiresPrescription: !!requiresPrescription,
      controlledSubstance: !!controlledSubstance,
      pharmacyWarehouseId: finalPharmacyWarehouseId,
      inventoryType: 'PHARMACY',
      pharmacyProductType: 'OTC_MEDICATION',
      sellerId: systemUserId
    })

    const product = await prisma.products.create({
      data: {
        id: `pharmacy_product_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        name,
        description: description || '',
        price,
        category: category || 'OTHER',
        inventoryType: 'PHARMACY',
        pharmacyProductType: 'OTC_MEDICATION',
        drugCategory: mappedCategory,
        dosageForm: dosageForm || null,
        strength: strength || null,
        activeIngredient: activeIngredient || null,
        requiresPrescription: !!requiresPrescription,
        controlledSubstance: !!controlledSubstance,
        pharmacyWarehouseId: finalPharmacyWarehouseId,
        sellerId: systemUserId,
        status: 'active',
        isActive: true,
        updatedAt: new Date()
      }
    })

    console.log("Product created successfully:", product.id)

    // Optionally tie to a zone by creating an empty stock quantity record
    if (locationId) {
      try {
        console.log("Creating stock quantity for location:", locationId)
        // Use the original regular warehouse ID for stock quantity, not the pharmacy warehouse ID
        const regularWarehouseId = pharmacyWarehouseId // This is the original regular warehouse ID
        
        // Ensure a stock quantity row exists for this location
        const existing = await prisma.stockQuantity.findUnique({
          where: {
            productId_warehouseId_locationId: {
              productId: product.id,
              warehouseId: regularWarehouseId || null,
              locationId
            }
          }
        })
        if (!existing) {
          await prisma.stockQuantity.create({
            data: {
              productId: product.id,
              warehouseId: regularWarehouseId || null,
              locationId,
              quantity: 0,
              availableQuantity: 0
            }
          })
          console.log("Stock quantity created successfully for zone:", locationId)
        }
      } catch (e) {
        // Non-fatal; log and continue
        console.warn('Optional zone link failed:', e)
      }
    }

    return NextResponse.json({ success: true, data: product })
  } catch (error) {
    console.error("Create product error:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Failed to create product",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}


