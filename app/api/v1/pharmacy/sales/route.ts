import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuth } from "@/lib/api-auth"

// POST /api/v1/pharmacy/sales - Record a medicine sale
export async function POST(request: NextRequest) {
  try {
    console.log("Recording medicine sale...")
    
    // Verify authentication
    const authResult = await verifyAuth(request);
    console.log("Auth result:", authResult);
    
    if (!authResult.success) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    console.log("Sale data received:", body);

    // Validate required fields
    const { 
      date, 
      customerName, 
      productId, 
      quantitySold, 
      pricePerUnit, 
      totalPrice, 
      discount, 
      paymentMethod, 
      customerLocation, 
      phoneNumber, 
      isCooperativeMember 
    } = body;

    if (!date || !customerName || !productId || !quantitySold || !pricePerUnit || !totalPrice || !paymentMethod || !customerLocation || !phoneNumber) {
      return NextResponse.json({ 
        success: false, 
        error: "Missing required fields: date, customerName, productId, quantitySold, pricePerUnit, totalPrice, paymentMethod, customerLocation, phoneNumber" 
      }, { status: 400 });
    }

    // Validate numeric fields
    const quantity = parseFloat(quantitySold);
    const unitPrice = parseFloat(pricePerUnit);
    const total = parseFloat(totalPrice);
    const discountPercent = parseFloat(discount || "0");

    if (isNaN(quantity) || isNaN(unitPrice) || isNaN(total) || isNaN(discountPercent)) {
      return NextResponse.json({ 
        success: false, 
        error: "Invalid numeric values for quantity, price, total, or discount" 
      }, { status: 400 });
    }

    // Check if product exists
    const product = await prisma.products.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return NextResponse.json({ 
        success: false, 
        error: "Product not found" 
      }, { status: 404 });
    }

    // Check if there's enough stock
    const stockQuantities = await prisma.stockQuantity.findMany({
      where: { productId },
      include: { warehouse: true, location: true }
    });

    const totalStock = stockQuantities.reduce((sum, sq) => sum + sq.quantity, 0);
    
    if (totalStock < quantity) {
      return NextResponse.json({ 
        success: false, 
        error: `Insufficient stock. Available: ${totalStock}, Requested: ${quantity}` 
      }, { status: 400 });
    }

    // Find a system user for the sale
    let recordedByUserId = authResult.userId;
    console.log("Initial recordedByUserId:", recordedByUserId);
    
    // If no valid user ID from auth, find or create a system user
    if (!recordedByUserId) {
      let systemUser = await prisma.user.findFirst({
        where: { email: 'system@pharmacy.local' }
      });
      
      if (!systemUser) {
        systemUser = await prisma.user.create({
          data: {
            email: 'system@pharmacy.local',
            name: 'Pharmacy System',
            password: 'system_password_hash' // This should be hashed in production
          }
        });
      }
      
      recordedByUserId = systemUser.id;
    } else {
      // Verify the user exists
      const userExists = await prisma.user.findUnique({
        where: { id: recordedByUserId }
      });
      
      if (!userExists) {
        // Fallback to system user
        const systemUser = await prisma.user.findFirst({
          where: { email: 'system@pharmacy.local' }
        });
        
        if (systemUser) {
          recordedByUserId = systemUser.id;
        } else {
          return NextResponse.json({ 
            success: false, 
            error: "No valid user found for sale recording" 
          }, { status: 400 });
        }
      }
    }
    
    console.log("Final recordedByUserId:", recordedByUserId);
    
    // Create stock move (OUTGOING)
    const stockMove = await prisma.stockMove.create({
      data: {
        productId: productId,
        warehouseId: null, // We'll handle this in stock quantity updates
        locationId: null,
        quantity: -quantity, // Negative quantity for outgoing
        unitPrice: unitPrice,
        moveType: "OUTGOING",
        state: "DONE",
        createdBy: recordedByUserId,
        processedAt: new Date(date)
      }
    });

    // Update stock quantities (reduce stock)
    // Find the default pharmacy warehouse
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

    // Find the default location
    let defaultLocation = await prisma.location.findFirst({
      where: { 
        name: "Main Storage",
        warehouseId: defaultWarehouse.id
      }
    });
    
    if (!defaultLocation) {
      defaultLocation = await prisma.location.create({
        data: {
          name: "Main Storage",
          code: "MAIN_STORAGE",
          warehouseId: defaultWarehouse.id
        }
      });
    }

    // Update stock quantity
    const existingQuantity = await prisma.stockQuantity.findUnique({
      where: {
        productId_warehouseId_locationId: {
          productId: productId,
          warehouseId: defaultWarehouse.id,
          locationId: defaultLocation.id
        }
      }
    });

    if (existingQuantity) {
      await prisma.stockQuantity.update({
        where: { id: existingQuantity.id },
        data: {
          quantity: existingQuantity.quantity - quantity,
          availableQuantity: existingQuantity.availableQuantity - quantity,
          lastUpdated: new Date()
        }
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: "No stock found for this product" 
      }, { status: 400 });
    }

    // Create sale record (we can extend this later with a dedicated sales table)
    // For now, we'll use the stock move as the sale record
    
    console.log("Sale recorded successfully:", stockMove.id);

    return NextResponse.json({
      success: true,
      message: "Sale recorded successfully",
      data: {
        stockMoveId: stockMove.id,
        saleId: stockMove.id, // Using stock move ID as sale ID for now
        customerName,
        productName: product.name,
        quantitySold: quantity,
        totalPrice: total,
        discountApplied: discountPercent,
        isCooperativeMember
      }
    });

  } catch (error) {
    console.error("Error recording sale:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to record sale",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

// GET /api/v1/pharmacy/sales - List medicine sales
export async function GET(request: NextRequest) {
  try {
    console.log("Fetching medicine sales...")
    
    // Verify authentication
    const authResult = await verifyAuth(request);
    console.log("Auth result:", authResult);
    
    if (!authResult.success) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // Fetch OUTGOING stock moves (sales) with related data
    const sales = await prisma.stockMove.findMany({
      where: {
        moveType: "OUTGOING",
        state: "DONE"
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            description: true,
            price: true
          }
        },
        warehouse: {
          select: {
            id: true,
            name: true,
            city: true,
            country: true
          }
        },
        location: {
          select: {
            id: true,
            name: true,
            code: true
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
        processedAt: 'desc'
      }
    });

    console.log(`Found ${sales.length} sales records`);

    // Transform the data to match frontend expectations
    const transformedSales = sales.map(sale => ({
      id: sale.id,
      date: sale.processedAt?.toISOString().slice(0, 10) || sale.date.toISOString().slice(0, 10),
      productName: sale.product.name,
      productId: sale.productId,
      quantitySold: Math.abs(sale.quantity), // Convert negative quantity to positive
      unitPrice: sale.unitPrice || sale.product.price,
      totalPrice: (sale.unitPrice || sale.product.price) * Math.abs(sale.quantity),
      warehouse: sale.warehouse?.name || 'Main Warehouse',
      location: sale.location?.name || 'Main Storage',
      recordedBy: sale.createdByUser.name,
      recordedByEmail: sale.createdByUser.email,
      createdAt: sale.createdAt
    }));

    return NextResponse.json({ 
      success: true, 
      data: transformedSales,
      count: transformedSales.length
    });

  } catch (error) {
    console.error("Error fetching sales:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to fetch sales", 
      details: error.message 
    }, { status: 500 });
  }
}
