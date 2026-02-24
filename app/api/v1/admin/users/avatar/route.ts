import { NextRequest, NextResponse } from "next/server"
import { verifyAuthToken } from "@/lib/token"
import { prisma } from "@/lib/prisma"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"
import { uploadAvatarToCloudinary } from "@/lib/cloudinary"

const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization")
    let token = null

    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1]
    }

    if (!token) {
      return NextResponse.json(
        { success: false, message: "No authentication token provided" },
        { status: 401 }
      )
    }

    const adminUser = await verifyAuthToken(token)
    if (!adminUser) {
      return NextResponse.json(
        { success: false, message: "Invalid authentication token" },
        { status: 401 }
      )
    }

    if (adminUser.role !== "SUPER_ADMIN" && adminUser.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Access denied. Admin privileges required." },
        { status: 403 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('avatar') as File
    const userId = formData.get('userId') as string

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No file provided" },
        { status: 400 }
      )
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID is required" },
        { status: 400 }
      )
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true }
    })

    if (!targetUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      )
    }

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: "Invalid file type. Only JPG, PNG, GIF, and WebP are allowed" },
        { status: 400 }
      )
    }

    const maxSize = 2 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, message: "File size must be less than 2MB" },
        { status: 400 }
      )
    }

    let avatarUrl: string

    if (isProduction) {
      const timestamp = Date.now()
      const fileExtension = file.name.split('.').pop()
      const fileName = `avatar_${userId}_${timestamp}.${fileExtension}`
      
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      
      try {
        const result = await uploadAvatarToCloudinary(buffer, fileName)
        avatarUrl = result.secure_url
      } catch (error) {
        console.error('Cloudinary avatar upload failed:', error)
        return NextResponse.json(
          { success: false, message: "Failed to upload avatar to cloud storage" },
          { status: 500 }
        )
      }
    } else {
      const uploadsDir = join(process.cwd(), 'public', 'uploads', 'avatars')
      
      if (!existsSync(uploadsDir)) {
        await mkdir(uploadsDir, { recursive: true })
      }

      const timestamp = Date.now()
      const fileExtension = file.name.split('.').pop()
      const fileName = `avatar_${userId}_${timestamp}.${fileExtension}`
      const filePath = join(uploadsDir, fileName)

      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      
      await writeFile(filePath, buffer)
      avatarUrl = `/uploads/avatars/${fileName}`
    }
    
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { avatar: avatarUrl },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true
      }
    })

    return NextResponse.json({
      success: true,
      message: "Avatar uploaded successfully",
      data: {
        avatar: updatedUser.avatar
      }
    })
  } catch (error) {
    console.error("Error uploading avatar:", error)
    return NextResponse.json(
      { success: false, message: `Failed to upload avatar: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}
