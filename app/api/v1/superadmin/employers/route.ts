import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { z } from "zod"

const employerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  location: z.string().optional(),
  description: z.string().optional(),
})

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    const employers = await prisma.employer.findMany({
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ success: true, employers })
  } catch (error) {
    console.error("Error fetching employers:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch employers" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = employerSchema.parse(body)

    const employer = await prisma.employer.create({
      data: {
        ...validatedData,
        status: "active",
      },
    })

    return NextResponse.json({ success: true, employer })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error("Error creating employer:", error)
    return NextResponse.json(
      { success: false, message: "Failed to create employer" },
      { status: 500 }
    )
  }
} 