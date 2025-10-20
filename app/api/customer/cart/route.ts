import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuthToken } from '@/lib/token'
import { cookies } from 'next/headers'

// GET /api/customer/cart - Get customer's shopping cart
export async function GET(req: NextRequest) {
  try {
    // Get token from multiple sources
    let token = req.headers.get("Authorization")?.replace("Bearer ", "")
    if (!token) {
      token = req.cookies.get("token")?.value
    }
    if (!token) {
      token = req.cookies.get("Gemurai_token")?.value
    }

    if (!token) {
      return NextResponse.json(
        { error: "No authentication token found" },
        { status: 401 }
      )
    }

    const user = await verifyAuthToken(token)
    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      )
    }

    // Get cart items with product details
    const cartItems = await prisma.shoppingCart.findMany({
      where: {
        customerId: user.id
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            image: true,
            stock: true,
            category: true,
            description: true
          }
        },
        dcc: {
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
    })

    // Calculate totals
    const subtotal = cartItems.reduce((sum, item) => {
      return sum + (item.product.price * item.quantity)
    }, 0)

    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)

    return NextResponse.json({
      success: true,
      cart: {
        items: cartItems,
        subtotal,
        totalItems,
        itemCount: cartItems.length
      }
    })

  } catch (error) {
    console.error('Cart GET error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch cart items'
    }, { status: 500 })
  }
}

// POST /api/customer/cart - Add item to cart
export async function POST(req: NextRequest) {
  try {
    // Get token from multiple sources
    let token = req.headers.get("Authorization")?.replace("Bearer ", "")
    if (!token) {
      token = req.cookies.get("token")?.value
    }
    if (!token) {
      token = req.cookies.get("Gemurai_token")?.value
    }

    if (!token) {
      return NextResponse.json(
        { error: "No authentication token found" },
        { status: 401 }
      )
    }

    const user = await verifyAuthToken(token)
    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { productId, dccId = null, quantity = 1 } = body

    if (!productId) {
      return NextResponse.json({
        success: false,
        error: 'Product ID is required'
      }, { status: 400 })
    }

    if (quantity <= 0) {
      return NextResponse.json({
        success: false,
        error: 'Quantity must be greater than 0'
      }, { status: 400 })
    }

    // Verify product exists
    const product = await prisma.product.findUnique({
      where: {
        id: productId
      }
    })

    if (!product) {
      return NextResponse.json({
        success: false,
        error: 'Product not found'
      }, { status: 404 })
    }

    // Check if product is active (if isActive field exists)
    if (product.isActive === false) {
      return NextResponse.json({
        success: false,
        error: 'Product is not active'
      }, { status: 400 })
    }

    // Check stock availability
    if (product.stock < quantity) {
      return NextResponse.json({
        success: false,
        error: `Insufficient stock. Available: ${product.stock}, Requested: ${quantity}`
      }, { status: 400 })
    }

    // Check if item already exists in cart
    let existingItem = null
    if (dccId) {
      existingItem = await prisma.shoppingCart.findUnique({
        where: {
          customerId_productId_dccId: {
            customerId: user.id,
            productId,
            dccId: dccId
          }
        }
      })
    } else {
      // For items without dccId, we need to find by customerId and productId where dccId is null
      existingItem = await prisma.shoppingCart.findFirst({
        where: {
          customerId: user.id,
          productId: productId,
          dccId: null
        }
      })
    }

    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + quantity
      
      // Check if new quantity exceeds stock
      if (product.stock < newQuantity) {
        return NextResponse.json({
          success: false,
          error: `Insufficient stock. Available: ${product.stock}, Requested: ${newQuantity}`
        }, { status: 400 })
      }

      const updatedItem = await prisma.shoppingCart.update({
        where: {
          id: existingItem.id
        },
        data: {
          quantity: newQuantity,
          updatedAt: new Date()
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              image: true,
              stock: true,
              category: true
            }
          },
          dcc: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Cart item updated successfully',
        item: updatedItem
      })
    } else {
      // Add new item to cart
      const newItem = await prisma.shoppingCart.create({
        data: {
          customerId: user.id,
          productId,
          dccId: dccId || null,
          quantity
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              image: true,
              stock: true,
              category: true
            }
          },
          dcc: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Item added to cart successfully',
        item: newItem
      })
    }

  } catch (error) {
    console.error('Cart POST error:', error)
    
    // Provide more specific error messages
    if (error instanceof Error) {
      return NextResponse.json({
        success: false,
        error: `Failed to add item to cart: ${error.message}`
      }, { status: 500 })
    }
    
    return NextResponse.json({
      success: false,
      error: 'Failed to add item to cart'
    }, { status: 500 })
  }
}

// PUT /api/customer/cart - Update cart item quantity
export async function PUT(req: NextRequest) {
  try {
    // Get token from multiple sources
    let token = req.headers.get("Authorization")?.replace("Bearer ", "")
    if (!token) {
      token = req.cookies.get("token")?.value
    }
    if (!token) {
      token = req.cookies.get("Gemurai_token")?.value
    }

    if (!token) {
      return NextResponse.json(
        { error: "No authentication token found" },
        { status: 401 }
      )
    }

    const user = await verifyAuthToken(token)
    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { cartItemId, quantity } = body

    if (!cartItemId) {
      return NextResponse.json({
        success: false,
        error: 'Cart item ID is required'
      }, { status: 400 })
    }

    if (quantity <= 0) {
      return NextResponse.json({
        success: false,
        error: 'Quantity must be greater than 0'
      }, { status: 400 })
    }

    // Get cart item
    const cartItem = await prisma.shoppingCart.findFirst({
      where: {
        id: cartItemId,
        customerId: user.id
      },
      include: {
        product: true
      }
    })

    if (!cartItem) {
      return NextResponse.json({
        success: false,
        error: 'Cart item not found'
      }, { status: 404 })
    }

    // Check stock availability
    if (cartItem.product.stock < quantity) {
      return NextResponse.json({
        success: false,
        error: `Insufficient stock. Available: ${cartItem.product.stock}, Requested: ${quantity}`
      }, { status: 400 })
    }

    // Update quantity
    const updatedItem = await prisma.shoppingCart.update({
      where: {
        id: cartItemId
      },
      data: {
        quantity,
        updatedAt: new Date()
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            image: true,
            stock: true,
            category: true
          }
        },
        dcc: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Cart item updated successfully',
      item: updatedItem
    })

  } catch (error) {
    console.error('Cart PUT error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to update cart item'
    }, { status: 500 })
  }
}

// DELETE /api/customer/cart - Remove item from cart
export async function DELETE(req: NextRequest) {
  try {
    // Get token from multiple sources
    let token = req.headers.get("Authorization")?.replace("Bearer ", "")
    if (!token) {
      token = req.cookies.get("token")?.value
    }
    if (!token) {
      token = req.cookies.get("Gemurai_token")?.value
    }

    if (!token) {
      return NextResponse.json(
        { error: "No authentication token found" },
        { status: 401 }
      )
    }

    const user = await verifyAuthToken(token)
    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const cartItemId = searchParams.get('cartItemId')

    if (!cartItemId) {
      return NextResponse.json({
        success: false,
        error: 'Cart item ID is required'
      }, { status: 400 })
    }

    // Verify cart item belongs to user
    const cartItem = await prisma.shoppingCart.findFirst({
      where: {
        id: cartItemId,
        customerId: user.id
      }
    })

    if (!cartItem) {
      return NextResponse.json({
        success: false,
        error: 'Cart item not found'
      }, { status: 404 })
    }

    // Delete cart item
    await prisma.shoppingCart.delete({
      where: {
        id: cartItemId
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Item removed from cart successfully'
    })

  } catch (error) {
    console.error('Cart DELETE error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to remove item from cart'
    }, { status: 500 })
  }
}
