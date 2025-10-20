import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const dccId = searchParams.get('dccId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build where clause for filtering
    const whereClause: any = {};

    if (dccId) {
      whereClause.dccId = dccId;
    }

    if (startDate || endDate) {
      whereClause.saleDate = {};
      if (startDate) {
        whereClause.saleDate.gte = new Date(startDate);
      }
      if (endDate) {
        whereClause.saleDate.lte = new Date(endDate);
      }
    }

    // Fetch DCC sales with pagination and filtering
    const [sales, totalCount] = await Promise.all([
      prisma.sale.findMany({
        where: whereClause,
        include: {
          dcc: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              image: true,
            },
          },
        },
        orderBy: {
          saleDate: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.sale.count({
        where: whereClause,
      }),
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    // Calculate total revenue
    const totalRevenue = sales.reduce((sum, sale) => sum + (sale.totalRevenue || 0), 0);

    const response = {
      success: true,
      data: {
        sales,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          hasNextPage,
          hasPreviousPage,
          limit,
        },
        summary: {
          totalRevenue,
          totalSales: sales.length,
        },
      },
      message: 'DCC sales retrieved successfully',
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error fetching DCC sales:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch DCC sales',
        message: 'An error occurred while retrieving DCC sales data',
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const { dccId, productId, quantity, salePrice, customerName, customerPhone, notes } = body;
    
    if (!dccId || !productId || !quantity || !salePrice) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          message: 'dccId, productId, quantity, and salePrice are required',
        },
        { status: 400 }
      );
    }

    // Get product cost price for profit calculation
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { costPrice: true }
    });

    const costPrice = product?.costPrice || 0;
    const totalRevenue = quantity * salePrice;
    const totalCost = quantity * costPrice;
    const profit = totalRevenue - totalCost;

    // Create the DCC sale
    const sale = await prisma.sale.create({
      data: {
        dccId,
        productId,
        quantity,
        salePrice,
        totalRevenue,
        costPrice,
        totalCost,
        profit,
        customerName,
        customerPhone,
        notes,
      },
      include: {
        dcc: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            price: true,
          },
        },
      },
    });

    const response = {
      success: true,
      data: sale,
      message: 'DCC sale created successfully',
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error creating DCC sale:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create DCC sale',
        message: 'An error occurred while creating the DCC sale',
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
