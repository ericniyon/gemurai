import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        userRole: {
          include: {
            role: true
          }
        }
      }
    })

    const isAdmin = currentUser?.userRole?.role?.name === 'ADMIN' || 
                   currentUser?.userRole?.role?.name === 'SUPER_ADMIN'

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { email, name, phone, password } = body

    // Validate required fields
    if (!email || !name || !password) {
      return NextResponse.json(
        { error: 'Email, name, and password are required' },
        { status: 400 }
      )
    }

    // Set default values if not provided
    const userEmail = email || 'dcc@djyh.rw'
    const userName = name || 'DCC User'
    const userPassword = password || 'Login@123'
    const userPhone = phone || '+250700000100'

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: userEmail }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Check if phone number is already taken
    if (userPhone) {
      const existingPhoneUser = await prisma.user.findUnique({
        where: { phone: userPhone }
      })
      
      if (existingPhoneUser) {
        return NextResponse.json(
          { error: 'User with this phone number already exists' },
          { status: 409 }
        )
      }
    }

    // Get or create DCC role
    let dccRole = await prisma.role.findUnique({
      where: { name: 'DCC' }
    })

    if (!dccRole) {
      dccRole = await prisma.role.create({
        data: {
          name: 'DCC',
          description: 'Digital Community Champion',
          isSystem: true,
          isActive: true
        }
      })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userPassword, 12)

    // Create DCC user
    const dccUser = await prisma.user.create({
      data: {
        email: userEmail,
        name: userName,
        password: hashedPassword,
        phone: userPhone,
        isActive: true
      }
    })

    // Assign DCC role
    await prisma.userRoleAssignment.create({
      data: {
        userId: dccUser.id,
        roleId: dccRole.id,
        assignedBy: session.user.id,
        isActive: true
      }
    })

    // Create wallet for DCC user
    const wallet = await prisma.wallet.create({
      data: {
        userId: dccUser.id,
        balance: 0,
        minimumBalance: 1000,
        status: 'ACTIVE'
      }
    })

    // Auto-create initial voucher for this DCC (SUPER_ADMIN/ADMIN initiated)
    const voucherValue = 30000 // Default initial voucher value (RWF)
    const code = `VCHR-${Date.now().toString(36)}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`

    const voucher = await prisma.voucher.create({
      data: {
        code,
        value: voucherValue,
        remainingBalance: voucherValue,
        status: 'ACTIVE',
        dccId: dccUser.id,
        createdBy: session.user.id,
        expiresAt: null
      }
    })

    // Record voucher creation transaction
    await prisma.voucherTransaction.create({
      data: {
        voucherId: voucher.id,
        type: 'CREATED',
        amount: voucherValue,
        remainingBalance: voucherValue,
        description: `Voucher auto-created for DCC ${dccUser.email}`
      }
    })

    return NextResponse.json({
      success: true,
      message: 'DCC user created successfully',
      user: {
        id: dccUser.id,
        email: dccUser.email,
        name: dccUser.name,
        phone: dccUser.phone,
        walletId: wallet.id,
        initialVoucher: {
          code: voucher.code,
          value: voucher.value,
          remainingBalance: voucher.remainingBalance,
          status: voucher.status
        }
      }
    })

  } catch (error) {
    console.error('Error creating DCC user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 