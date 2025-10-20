import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { z } from "zod"

const statusSchema = z.object({
  status: z.enum(["active", "inactive"]),
})

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { status } = statusSchema.parse(body)

    const employer = await prisma.employer.update({
      where: { id: params.id },
      data: { status },
    })

    return NextResponse.json({ success: true, employer })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error("Error updating employer status:", error)
    return NextResponse.json(
      { success: false, message: "Failed to update employer status" },
      { status: 500 }
    )
  }
} 