import { NextRequest, NextResponse } from "next/server"
import { verifyAuthToken } from "@/lib/token"
import { ProductService } from "@/app/lib/services/ProductService"
import { cookies } from "next/headers"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Get token and verify authentication
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

    // Check if user has permission to view products
    if (!user.permissions.includes("products.view")) {
      return NextResponse.json(
        { error: "Permission denied" },
        { status: 403 }
      )
    }

    const product = await ProductService.getProductById(id, user)
    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error("Error fetching product:", error)
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Get token from multiple sources
    let token: string | undefined

    // 1. Try Authorization header first
    const authHeader = req.headers.get("Authorization")
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1]
    }

    // 2. Try cookies if no Authorization header
    if (!token) {
      const cookies = req.headers.get("cookie")
      // Try NextAuth session token
      token = cookies?.match(/next-auth.session-token=([^;]+)/)?.[1]
      
      // Try development token if no session token
      if (!token) {
        token = cookies?.match(/Gemurai_token=([^;]+)/)?.[1]
      }
    }

    if (!token) {
      return NextResponse.json({ 
        error: "Unauthorized - No token found",
        message: "Please log in to continue"
      }, { status: 401 })
    }

    const user = await verifyAuthToken(token)
    if (!user) {
      return NextResponse.json({ 
        error: "Unauthorized - Invalid token",
        message: "Your session has expired. Please log in again."
      }, { status: 401 })
    }

    // Get the product data from the request
    const data = await req.json()

    // Update the product
    const product = await ProductService.updateProduct(id, data, user)

    return NextResponse.json({
      success: true,
      message: "Product updated successfully",
      product
    })
  } catch (error) {
    console.error("Error updating product:", error)
    return NextResponse.json({ 
      error: "Failed to update product",
      message: error instanceof Error ? error.message : "Unknown error"
    }, { status: error instanceof Error && error.message.includes("Unauthorized") ? 403 : 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Get token and verify authentication
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

    // Check if user has permission to delete products
    if (!user.permissions.includes("products.delete")) {
      return NextResponse.json(
        { error: "Permission denied" },
        { status: 403 }
      )
    }

    await ProductService.deleteProduct(id, user)

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully"
    })
  } catch (error) {
    console.error("Error deleting product:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete product" },
      { status: 500 }
    )
  }
} 