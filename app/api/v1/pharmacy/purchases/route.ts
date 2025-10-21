import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/v1/pharmacy/purchases - Fetch purchase records
export async function GET(request: NextRequest) {
  try {
    const purchases = await prisma.stockMove.findMany({
      where: {
        moveType: "INCOMING"
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true
          }
        },
        warehouse: {
          select: {
            id: true,
            name: true
          }
        },
        createdByUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ 
      success: true, 
      data: purchases 
    });
  } catch (error) {
    console.error("Error fetching purchases:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to fetch purchases" 
    }, { status: 500 });
  }
}

// POST /api/v1/pharmacy/purchases - Record a medicine purchase
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Basic shape validation
    const required = [
      "date",
      "productId",
      "quantityReceived",
      "expiryDate",
      "pricePerUnit",
      "totalPrice",
      "recordedBy",
      "paymentMethod"
    ];
    for (const key of required) {
      if (!(key in body)) {
        return NextResponse.json({ success: false, error: `Missing field: ${key}` }, { status: 400 });
      }
    }

    const quantity = parseFloat(body.quantityReceived);
    const unitPrice = parseFloat(body.pricePerUnit);
    if (Number.isNaN(quantity) || Number.isNaN(unitPrice)) {
      return NextResponse.json({ success: false, error: "Invalid quantity or unit price" }, { status: 400 });
    }

    // Handle recordedBy - ensure it's a valid user ID
    let recordedByUserId = body.recordedBy;
    
    if (!recordedByUserId || typeof recordedByUserId !== 'string') {
      // Find a system user or any existing user as fallback
      const systemUser = await prisma.user.findFirst({
        where: { email: 'system@pharmacy.local' }
      });
      
      if (systemUser) {
        recordedByUserId = systemUser.id;
      } else {
        // Fallback to any existing user
        const anyUser = await prisma.user.findFirst();
        if (anyUser) {
          recordedByUserId = anyUser.id;
        } else {
          return NextResponse.json({ success: false, error: "No users found in database" }, { status: 400 });
        }
      }
    } else {
      // Check if the provided recordedBy is a valid user ID
      const userExists = await prisma.user.findUnique({
        where: { id: recordedByUserId }
      });
      
      if (!userExists) {
        // Use fallback user
        const anyUser = await prisma.user.findFirst();
        if (anyUser) {
          recordedByUserId = anyUser.id;
        } else {
          return NextResponse.json({ success: false, error: "No users found in database" }, { status: 400 });
        }
      }
    }

    // Create stock move (INCOMING)
    const stockMove = await prisma.stockMove.create({
      data: {
        productId: body.productId,
        warehouseId: body.warehouseId || null,
        locationId: null,
        quantity,
        unitPrice: unitPrice, // Store the unit price
        moveType: "INCOMING",
        state: "DONE",
        createdBy: recordedByUserId,
        processedAt: new Date(body.date)
      }
    });

    // Update stock quantities (handle both warehouse-specific and general inventory)
    let warehouseId = body.warehouseId;
    let locationId = null;
    
    // If no warehouse specified, find or create a default pharmacy warehouse
    if (!warehouseId) {
      let defaultWarehouse = await prisma.warehouse.findFirst({
        where: { name: "Pharmacy Main Warehouse" }
      });
      
      if (!defaultWarehouse) {
        defaultWarehouse = await prisma.warehouse.create({
          data: {
            name: "Pharmacy Main Warehouse",
            code: "PHARMACY_MAIN",
            address: "Pharmacy Building",
            city: "Kigali",
            country: "Rwanda"
          }
        });
      }
      
      warehouseId = defaultWarehouse.id;
      
      // Create a default location for the pharmacy warehouse
      let defaultLocation = await prisma.location.findFirst({
        where: { 
          name: "Main Storage",
          warehouseId: warehouseId
        }
      });
      
      if (!defaultLocation) {
        defaultLocation = await prisma.location.create({
          data: {
            name: "Main Storage",
            code: "MAIN_STORAGE",
            warehouseId: warehouseId
          }
        });
      }
      
      locationId = defaultLocation.id;
    }
    
    const existingQuantity = await prisma.stockQuantity.findUnique({
      where: {
        productId_warehouseId_locationId: {
          productId: body.productId,
          warehouseId: warehouseId,
          locationId: locationId
        }
      }
    });

    if (existingQuantity) {
      await prisma.stockQuantity.update({
        where: { id: existingQuantity.id },
        data: {
          quantity: existingQuantity.quantity + quantity,
          availableQuantity: existingQuantity.availableQuantity + quantity,
          lastUpdated: new Date()
        }
      });
    } else {
      await prisma.stockQuantity.create({
        data: {
          productId: body.productId,
          warehouseId: warehouseId,
          locationId: locationId,
          quantity,
          availableQuantity: quantity
        }
      });
    }

    // Optional: update product expiry/batch if provided
    if (body.expiryDate || body.batchNumber) {
      const updateData: any = {}
      if (body.expiryDate) updateData.expiryDate = new Date(body.expiryDate)
      if (body.batchNumber) updateData.batchNumber = body.batchNumber
      // Only update pharmacyWarehouseId if warehouseId is provided
      if (body.warehouseId) updateData.pharmacyWarehouseId = body.warehouseId
      
      await prisma.products.update({
        where: { id: body.productId },
        data: updateData
      });
    }

    return NextResponse.json({ success: true, message: "Purchase recorded", data: { stockMoveId: stockMove.id } });
  } catch (error) {
    console.error("Purchase save error:", error);
    console.error("Error details:", error instanceof Error ? error.message : error);
    console.error("Error stack:", error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json({ 
      success: false, 
      error: "Failed to save purchase",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}


