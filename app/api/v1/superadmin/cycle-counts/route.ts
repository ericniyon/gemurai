import { NextRequest, NextResponse } from "next/server"
import { verifyAuthToken } from "@/lib/api-auth"
import { prisma } from "@/lib/prisma"

async function getAuthenticatedUser(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  if (!authHeader?.startsWith("Bearer ")) {
    return null
  }

  const token = authHeader.substring(7)
  const user = await verifyAuthToken(token)
  if (!user) {
    return null
  }

  // Allow SUPER_ADMIN and BRANCH_MANAGER roles
  if (user.role !== "SUPER_ADMIN" && user.role !== "BRANCH_MANAGER") {
    return null
  }

  return user
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get("page") || "1")
    const limit = parseInt(url.searchParams.get("limit") || "10")
    const search = url.searchParams.get("search") || ""
    const state = url.searchParams.get("state")
    const warehouseId = url.searchParams.get("warehouseId")
    const locationId = url.searchParams.get("locationId")
    const dateFrom = url.searchParams.get("dateFrom")
    const dateTo = url.searchParams.get("dateTo")

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    if (state) {
      where.state = state
    }
    if (warehouseId) {
      where.warehouseId = warehouseId
    }
    if (locationId) {
      where.locationId = locationId
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { notes: { contains: search, mode: 'insensitive' } }
      ]
    }
    if (dateFrom || dateTo) {
      where.createdAt = {}
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom)
      }
      if (dateTo) {
        where.createdAt.lte = new Date(dateTo)
      }
    }

    const [cycleCounts, total] = await Promise.all([
      prisma.cycleCount.findMany({
        where,
        include: {
          warehouse: {
            select: {
              id: true,
              name: true,
              code: true
            }
          },
          location: {
            select: {
              id: true,
              name: true,
              code: true,
              locationType: true
            }
          },
          product: {
            select: {
              id: true,
              name: true,
              internalReference: true,
              image: true
            }
          },
          createdByUser: {
            select: {
              id: true,
              name: true
            }
          },
          completedByUser: {
            select: {
              id: true,
              name: true
            }
          },
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  internalReference: true,
                  image: true
                }
              }
            }
          },
          _count: {
            select: {
              items: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.cycleCount.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: cycleCounts,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error("Error fetching cycle counts:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch cycle counts" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      name,
      warehouseId,
      locationId,
      productId,
      scheduledDate,
      notes,
      items = []
    } = body

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { success: false, message: "Name is required" },
        { status: 400 }
      )
    }

    // Verify warehouse exists if provided
    if (warehouseId) {
      const warehouse = await prisma.warehouse.findUnique({
        where: { id: warehouseId }
      })
      if (!warehouse) {
        return NextResponse.json(
          { success: false, message: "Warehouse not found" },
          { status: 404 }
        )
      }
    }

    // Verify location exists if provided
    if (locationId) {
      const location = await prisma.location.findUnique({
        where: { id: locationId }
      })
      if (!location) {
        return NextResponse.json(
          { success: false, message: "Location not found" },
          { status: 404 }
        )
      }
    }

    // Verify product exists if provided
    if (productId) {
      const product = await prisma.product.findUnique({
        where: { id: productId }
      })
      if (!product) {
        return NextResponse.json(
          { success: false, message: "Product not found" },
          { status: 404 }
        )
      }
    }

    // Create cycle count
    const cycleCount = await prisma.cycleCount.create({
      data: {
        name,
        warehouseId,
        locationId,
        productId,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
        notes,
        createdBy: user.id,
        state: 'DRAFT'
      },
      include: {
        warehouse: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        location: {
          select: {
            id: true,
            name: true,
            code: true,
            locationType: true
          }
        },
        product: {
          select: {
            id: true,
            name: true,
            internalReference: true,
            image: true
          }
        },
        createdByUser: {
          select: {
            id: true,
            name: true
          }
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                internalReference: true,
                image: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: cycleCount,
      message: "Cycle count created successfully"
    }, { status: 201 })
  } catch (error) {
    console.error("Error creating cycle count:", error)
    return NextResponse.json(
      { success: false, message: "Failed to create cycle count" },
      { status: 500 }
    )
  }
} 