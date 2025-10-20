import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/database"
import { verifyAuth } from "@/lib/api-auth"

// PUT /api/v1/inventory/products/[id] - Update product
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const authResult = await verifyAuth(request)
    if (!authResult.success) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { user } = authResult
    if (user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
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

    console.log("Updating product:", id, body)

    // Validate required fields
    if (!name?.trim()) {
      return NextResponse.json({ success: false, error: "Product name is required" }, { status: 400 })
    }

    if (!pricePerUnit || pricePerUnit === '' || isNaN(Number(pricePerUnit)) || Number(pricePerUnit) < 0) {
      return NextResponse.json({ success: false, error: "Valid price per unit is required" }, { status: 400 })
    }

    // Category mapping
    const categoryMapping: { [key: string]: string } = {
      'ANTIBIOTIC': 'ANTIBIOTICS',
      'PAINKILLER': 'ANALGESICS', // Fixed: PAINKILLERS is not a valid enum value
      'VITAMIN': 'VITAMINS',
      'SUPPLEMENT': 'OTHER', // Fixed: SUPPLEMENTS is not a valid enum value
      'OTHER': 'OTHER'
    }

    const drugCategory = categoryMapping[category] || 'OTHER'

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

    // Update product
    const updatedProduct = await prisma.products.update({
      where: { id },
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        price: Number(pricePerUnit), // Use 'price' instead of 'pricePerUnit'
        pharmacyWarehouseId: finalPharmacyWarehouseId, // Include warehouse assignment
        drugCategory: drugCategory as any,
        dosageForm: dosageForm?.trim() || null,
        strength: strength?.trim() || null,
        activeIngredient: activeIngredient?.trim() || null,
        requiresPrescription: Boolean(requiresPrescription),
        controlledSubstance: Boolean(controlledSubstance),
        updatedAt: new Date()
      },
      include: {
        pharmacyWarehouse: {
          select: { name: true, location: true }
        },
        users: {
          select: { name: true, email: true }
        }
      }
    })

    console.log("Product updated successfully:", updatedProduct.id)

    // Handle zone assignment - update stock quantity if locationId is provided
    if (locationId) {
      try {
        console.log("Updating stock quantity for location:", locationId)
        // Use the original regular warehouse ID for stock quantity
        const regularWarehouseId = pharmacyWarehouseId // This is the original regular warehouse ID
        
        // Check if stock quantity exists for this product/warehouse/location combination
        const existingStock = await prisma.stockQuantity.findUnique({
          where: {
            productId_warehouseId_locationId: {
              productId: id,
              warehouseId: regularWarehouseId || null,
              locationId
            }
          }
        })
        
        if (!existingStock) {
          // Create new stock quantity record
          await prisma.stockQuantity.create({
            data: {
              productId: id,
              warehouseId: regularWarehouseId || null,
              locationId,
              quantity: 0,
              availableQuantity: 0
            }
          })
          console.log("Stock quantity created successfully for zone:", locationId)
        } else {
          console.log("Stock quantity already exists for zone:", locationId)
        }
      } catch (e) {
        // Non-fatal; log and continue
        console.warn('Optional zone link failed:', e)
      }
    }

    return NextResponse.json({ success: true, data: updatedProduct })

  } catch (error) {
    console.error("Update product error:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Failed to update product",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}

// DELETE /api/v1/inventory/products/[id] - Delete product
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    console.log("Delete request received for product:", id)
    console.log("Request headers:", Object.fromEntries(request.headers.entries()))
    
    const authResult = await verifyAuth(request)
    console.log("Auth result:", authResult)
    
    if (!authResult.success) {
      console.log("Authentication failed:", authResult.error)
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { user } = authResult
    console.log("Authenticated user:", user.email, "Role:", user.role)
    
    if (user.role !== 'SUPER_ADMIN') {
      console.log("User role not authorized:", user.role)
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })
    }

    console.log("Deleting product:", id)

    // Check if product exists first
    const existingProduct = await prisma.products.findUnique({
      where: { id }
    })
    
    if (!existingProduct) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 })
    }

    console.log("Product found:", existingProduct.name)

    // Use transaction to delete related records first
    await prisma.$transaction(async (tx) => {
      console.log("Starting transaction for product deletion")
      
      // Delete related prescription items first
      const deletedPrescriptionItems = await tx.prescriptionItem.deleteMany({
        where: { productId: id }
      })
      console.log("Deleted prescription items:", deletedPrescriptionItems.count)
      
      // Delete related stock quantities
      const deletedQuantities = await tx.stockQuantity.deleteMany({
        where: { productId: id }
      })
      console.log("Deleted stock quantities:", deletedQuantities.count)

      // Delete related stock moves
      const deletedMoves = await tx.stockMove.deleteMany({
        where: { productId: id }
      })
      console.log("Deleted stock moves:", deletedMoves.count)

      // Delete the product
      await tx.products.delete({
        where: { id }
      })
      console.log("Product deleted successfully")
    })

    console.log("Product and all related data deleted successfully:", id)
    return NextResponse.json({ success: true, message: "Product and all related data deleted successfully" })

  } catch (error) {
    console.error("Delete product error:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Failed to delete product",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
