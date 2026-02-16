import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'
import { verifyAuthToken } from '@/lib/token'
import { getNextDisplayId } from '@/lib/display-id'

/**
 * API Route: GET /api/v1/users/all
 * Simple endpoint to fetch all users for role assignment
 */
export async function GET(request: NextRequest) {
  try {
    // Get token from multiple sources
    let token = request.headers.get("Authorization")?.replace("Bearer ", "")
    if (!token) {
      token = request.cookies.get("Gemurai_token")?.value
    }

    // For role assignment, we need some authentication but not necessarily SUPER_ADMIN
    if (token) {
      const user = await verifyAuthToken(token)
      if (!user) {
        return NextResponse.json(
          { success: false, message: "Invalid token" },
          { status: 401 }
        )
      }
    } else {
      // For now, allow public access for testing
      console.log("Users API called without authentication - allowing for testing")
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const search = (searchParams.get('search') || '').trim()
    const limit = Math.min(parseInt(searchParams.get('limit') || '100', 10) || 100, 500)

    // Ensure users without displayId get one (generate on first list load)
    try {
      const withoutDisplayId = await prisma.user.findMany({
        where: { isActive: true, displayId: null },
        select: { id: true },
        take: 50,
      })
      for (const u of withoutDisplayId) {
        try {
          const displayId = await getNextDisplayId(prisma)
          await prisma.user.update({
            where: { id: u.id },
            data: { displayId },
          })
        } catch (_) {
          // skip on conflict or error
        }
      }
    } catch (_) {
      // displayId column may not exist yet
    }

    // Build where clause (scalars only to avoid relation issues)
    const whereClause: Record<string, unknown> = { isActive: true }
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
      ]
    }

    // Fetch users (include displayId when available)
    type UserRow = {
      id: string
      displayId?: string | null
      name: string
      email: string
      phone: string | null
      isActive: boolean
      createdAt: Date
    }
    let users: UserRow[]
    try {
      users = await prisma.user.findMany({
        where: whereClause,
        select: {
          id: true,
          displayId: true,
          name: true,
          email: true,
          phone: true,
          isActive: true,
          createdAt: true,
        },
        orderBy: { name: 'asc' },
        take: limit,
      })
    } catch (selectErr) {
      const msg = String(selectErr ?? '')
      if (msg.includes('displayId') || msg.includes('Unknown field')) {
        users = await prisma.user.findMany({
          where: whereClause,
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            isActive: true,
            createdAt: true,
          },
          orderBy: { name: 'asc' },
          take: limit,
        }) as UserRow[]
      } else {
        throw selectErr
      }
    }

    // Fetch role assignments for these users (separate query to avoid nested relation errors)
    const userIds = users.map((u) => u.id)
    let roleByUserId: Record<string, string> = {}
    try {
      const assignments = await prisma.userRoleAssignment.findMany({
        where: { userId: { in: userIds }, isActive: true },
        select: { userId: true, role: { select: { name: true } } },
      })
      assignments.forEach((a) => {
        roleByUserId[a.userId] = a.role?.name ?? 'No Role'
      })
    } catch (roleErr) {
      console.warn('Could not fetch role assignments:', roleErr)
    }

    return NextResponse.json({
      success: true,
      users: users.map((user) => ({
        id: user.id,
        displayId: user.displayId ?? undefined,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isActive: user.isActive,
        createdAt: user.createdAt,
        currentRole: roleByUserId[user.id] || 'No Role',
      })),
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    const stack = error instanceof Error ? error.stack : undefined
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { error: message, stack }),
      },
      { status: 500 }
    )
  }
}





