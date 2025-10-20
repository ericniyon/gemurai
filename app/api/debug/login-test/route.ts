import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { compare } from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    console.log("DEBUG: Login test for email:", email)

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    // Simple user lookup without complex role system
    let user;
    try {
      user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          name: true,
          password: true,
          role: true, // Basic role field
          avatar: true,
        },
      })
    } catch (userQueryError) {
      console.error("DEBUG: User query failed:", userQueryError)
      return NextResponse.json(
        { error: "User lookup failed", details: userQueryError.message },
        { status: 500 }
      )
    }

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 401 }
      )
    }

    // Simple password check
    let isValidPassword;
    try {
      isValidPassword = await compare(password, user.password)
    } catch (passwordError) {
      console.error("DEBUG: Password comparison failed:", passwordError)
      return NextResponse.json(
        { error: "Password validation failed", details: passwordError.message },
        { status: 500 }
      )
    }

    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid password" },
        { status: 401 }
      )
    }

    // Return success without complex token generation
    return NextResponse.json({
      success: true,
      message: "Login test successful",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar
      }
    })

  } catch (error) {
    console.error("DEBUG: Login test error:", error)
    return NextResponse.json(
      { 
        error: "Internal server error", 
        details: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
} 