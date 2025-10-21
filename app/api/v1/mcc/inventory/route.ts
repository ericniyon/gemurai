import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuthToken } from "@/lib/api-auth";

// GET /api/v1/mcc/inventory - Get MCC inventory summary
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authToken = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!authToken) {
      return NextResponse.json({ success: false, error: "Authorization token required" }, { status: 401 });
    }

    const user = await verifyAuthToken(authToken);
    if (!user) {
      return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const mccId = searchParams.get('mccId');

    if (!mccId) {
      return NextResponse.json({ 
        success: false, 
        error: "MCC ID is required" 
      }, { status: 400 });
    }

    // Get MCC information
    const mcc = await prisma.mccs.findUnique({
      where: { id: mccId },
      include: {
        mcc_warehouses: true
      }
    });

    if (!mcc) {
      return NextResponse.json({ 
        success: false, 
        error: "MCC not found" 
      }, { status: 404 });
    }

    // Get products from MCC warehouses
    const mccWarehousesWithProducts = await prisma.mcc_warehouses.findMany({
      where: {
        mccId: mccId
      },
      include: {
        products: true
      }
    });

    // Calculate totals - handle empty warehouses gracefully
    const allProducts = mccWarehousesWithProducts.flatMap(wh => wh.products || []);
    const totalProducts = allProducts.length;
    const totalQuantity = allProducts.reduce((sum, product) => sum + (product.quantity || 0), 0);
    const totalValue = allProducts.reduce((sum, product) => {
      const productPrice = product.price || 0;
      const productQuantity = product.quantity || 0;
      return sum + (productQuantity * productPrice);
    }, 0);

    // Group by warehouse - handle empty warehouses gracefully
    const warehouseSummary = mccWarehousesWithProducts.map(warehouse => {
      const products = warehouse.products || [];
      const currentQuantity = products.reduce((sum, product) => sum + (product.quantity || 0), 0);
      const currentValue = products.reduce((sum, product) => {
        const productPrice = product.price || 0;
        const productQuantity = product.quantity || 0;
        return sum + (productQuantity * productPrice);
      }, 0);

      return {
        id: warehouse.id,
        name: warehouse.name,
        type: warehouse.type,
        capacity: warehouse.capacity,
        currentQuantity,
        currentValue,
        products: products.length
      };
    });

    const response = {
      mcc: {
        id: mcc.id,
        name: mcc.name,
        location: mcc.location || 'Unknown',
        warehouses: mccWarehousesWithProducts.map(w => ({
          id: w.id,
          name: w.name,
          type: w.type,
          capacity: w.capacity,
          products: (w.products || []).length
        }))
      },
      inventorySummary: {
        totalProducts,
        totalQuantity,
        totalValue,
        warehouses: warehouseSummary
      }
    };

    return NextResponse.json({
      success: true,
      data: response
    });

  } catch (error) {
    console.error("Error fetching MCC inventory:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to fetch inventory summary"
    }, { status: 500 });
  }
}