import { NextRequest, NextResponse } from "next/server"
import { verifyAuthToken } from "@/lib/token"
import { prisma } from "@/lib/database"

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
    const { productId, rating, comment, title } = body

    console.log('Review submission data:', { productId, rating, comment, title })

    if (!productId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Product ID and valid rating (1-5) are required" },
        { status: 400 }
      )
    }

    // Check if user has already reviewed this product
    const existingReview = await prisma.productReview.findFirst({
      where: {
        productId,
        userId: user.id
      }
    })

    if (existingReview) {
      return NextResponse.json(
        { error: "You have already reviewed this product" },
        { status: 400 }
      )
    }

    // Create the review
    const newReview = await prisma.productReview.create({
      data: {
        productId,
        userId: user.id,
        rating,
        comment: comment || "",
        title: title || ""
      }
    })

    console.log('Created review:', newReview)

    return NextResponse.json({
      success: true,
      review: newReview,
      message: "Review submitted successfully"
    })

  } catch (error) {
    console.error("Error creating product review:", error)
    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const productId = searchParams.get("productId")

    console.log('Fetching reviews for product ID:', productId)

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      )
    }

    // Get reviews for the product
    const reviews = await prisma.productReview.findMany({
      where: {
        productId
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    // Calculate average rating
    const averageRating = reviews.length > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
      : 0

    console.log('Found reviews:', reviews.length, 'Average rating:', averageRating)

    return NextResponse.json({
      success: true,
      reviews,
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews: reviews.length
    })

  } catch (error) {
    console.error("Error fetching product reviews:", error)
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    )
  }
} 