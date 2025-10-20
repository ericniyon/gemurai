import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/database"
import bcrypt from "bcryptjs"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const { email, token, password } = await request.json()

    if (!email || !token || !password) {
      return NextResponse.json({ success: false, message: "Email, token, and password are required" }, { status: 400 })
    }

    // Verify the token
    const resetRecord = await prisma.passwordReset.findFirst({
      where: {
        email,
        token,
        used: false,
        expiresAt: {
          gt: new Date(),
        },
      },
    })

    if (!resetRecord) {
      return NextResponse.json({ success: false, message: "Invalid or expired reset token" }, { status: 400 })
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Update the user's password
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    })

    // Mark the token as used
    await prisma.passwordReset.update({
      where: { id: resetRecord.id },
      data: { used: true },
    })

    return NextResponse.json({
      success: true,
      message: "Password has been reset successfully",
    })
  } catch (error: any) {
    console.error("Error resetting password:", error)
    return NextResponse.json({ success: false, message: `Failed to reset password: ${error.message}` }, { status: 500 })
  }
}
