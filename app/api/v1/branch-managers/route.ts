import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/database"
import bcrypt from "bcryptjs"
import { verifyAuth } from "@/lib/api-auth"

export async function GET(request: NextRequest) {
  const auth = await verifyAuth(request)
  if (!auth.success) return NextResponse.json({ success: false, message: auth.message }, { status: auth.status })
  if (auth.user.role !== "EMPLOYER" && auth.user.role !== "ADMIN" && auth.user.role !== "SUPER_ADMIN" && auth.user.role !== "BRANCH_MANAGER") {
    return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 })
  }

  try {
    const branchRole = await prisma.role.findUnique({ where: { name: "BRANCH_MANAGER" } })
    if (!branchRole) {
      return NextResponse.json({ success: true, data: [] })
    }

    const users = await prisma.user.findMany({
      where: { userRole: { role: { name: "BRANCH_MANAGER" } } },
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, email: true, phone: true, createdAt: true }
    })
    return NextResponse.json({ success: true, data: users })
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message || "Failed to fetch" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const auth = await verifyAuth(request)
  if (!auth.success) return NextResponse.json({ success: false, message: auth.message }, { status: auth.status })
  if (auth.user.role !== "EMPLOYER" && auth.user.role !== "ADMIN" && auth.user.role !== "SUPER_ADMIN" && auth.user.role !== "BRANCH_MANAGER") {
    return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { 
      name, email, phone,
      national_id, gender, district, avatar
    } = body || {}
    if (!name || !email) {
      return NextResponse.json({ success: false, message: "Name and email are required" }, { status: 400 })
    }

    let branchRole = await prisma.role.findUnique({ where: { name: "BRANCH_MANAGER" } })
    if (!branchRole) {
      branchRole = await prisma.role.create({ data: { name: "BRANCH_MANAGER", description: "Branch Manager" } })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ success: false, message: "User with this email already exists" }, { status: 409 })
    }
    const normalizedPhone = (phone || "").trim() || undefined
    if (normalizedPhone) {
      const phoneOwner = await prisma.user.findFirst({ where: { phone: normalizedPhone } })
      if (phoneOwner) {
        return NextResponse.json({ success: false, message: "User with this phone already exists" }, { status: 409 })
      }
    }

    const tempPassword = "Gemurai@123"
    const hashed = await bcrypt.hash(tempPassword, 10)

    const user = await prisma.user.create({
      data: {
        email,
        name,
        phone: normalizedPhone,
        password: hashed,
        isActive: true,
        national_id: national_id || undefined,
        gender: gender || undefined,
        district: district || undefined,
        avatar: avatar || undefined,
        // Minimal permissions, can be expanded later via role permissions table
      }
    })

    await prisma.userRoleAssignment.create({
      data: {
        userId: user.id,
        roleId: branchRole.id,
        assignedBy: auth.user.id,
      }
    })

    return NextResponse.json({ success: true, data: { id: user.id, email: user.email, name: user.name }, tempPassword })
  } catch (error: any) {
    // Handle Prisma unique constraint gracefully
    if (error?.code === 'P2002') {
      const target = Array.isArray(error?.meta?.target) ? error.meta.target.join(', ') : (error?.meta?.target || 'unique field')
      return NextResponse.json({ success: false, message: `Duplicate value for ${target}` }, { status: 409 })
    }
    return NextResponse.json({ success: false, message: error?.message || "Failed to create" }, { status: 500 })
  }
}

function generateTemporaryPassword(): string {
  const length = 10
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
  let password = ""
  for (let i = 0; i < length; i++) password += charset[Math.floor(Math.random() * charset.length)]
  return password
}


