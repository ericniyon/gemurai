import { NextRequest, NextResponse } from "next/server"
import { verifyAuthToken } from "@/lib/token"
import { prisma } from "@/lib/prisma"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"
import { uploadAvatarToCloudinary } from "@/lib/cloudinary"

// Check if we're in production (read-only filesystem)
const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production'

export async function POST(request: NextRequest) {
  try {
    console.log("Avatar upload request received")
    
    // Get token from Authorization header
    const authHeader = request.headers.get("Authorization")
    let token = null

    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1]
    }

    if (!token) {
      console.log("No authentication token provided")
      return NextResponse.json(
        { success: false, message: "No authentication token provided" },
        { status: 401 }
      )
    }

    // Verify token and get user data
    const user = await verifyAuthToken(token)
    if (!user) {
      console.log("Invalid authentication token")
      return NextResponse.json(
        { success: false, message: "Invalid authentication token" },
        { status: 401 }
      )
    }

    console.log("User authenticated:", user.id)

    const formData = await request.formData()
    const file = formData.get('avatar') as File

    console.log("FormData received, file:", {
      name: file?.name,
      size: file?.size,
      type: file?.type
    })

    if (!file) {
      console.log("No file provided in request")
      return NextResponse.json({ success: false, message: "No file provided" }, { status: 400 })
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
    if (!validTypes.includes(file.type)) {
      console.log("Invalid file type:", file.type)
      return NextResponse.json({ success: false, message: "Invalid file type. Only JPG, PNG, and GIF are allowed" }, { status: 400 })
    }

    // Validate file size (2MB max)
    const maxSize = 2 * 1024 * 1024 // 2MB
    if (file.size > maxSize) {
      console.log("File too large:", file.size, "bytes")
      return NextResponse.json({ success: false, message: "File size must be less than 2MB" }, { status: 400 })
    }

    console.log("File validation passed")

    let avatarUrl: string

    if (isProduction) {
      // In production, use Cloudinary
      console.log('🌐 Production environment detected - using Cloudinary for avatar upload')
      
      // Generate unique filename
      const timestamp = Date.now()
      const fileExtension = file.name.split('.').pop()
      const fileName = `avatar_${user.id}_${timestamp}.${fileExtension}`
      
      // Convert file to buffer
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      console.log('📤 Uploading avatar to Cloudinary...')
      
      try {
        const result = await uploadAvatarToCloudinary(buffer, fileName)
        avatarUrl = result.secure_url
        console.log('✅ Cloudinary avatar upload successful:', avatarUrl)
      } catch (error) {
        console.error('❌ Cloudinary avatar upload failed:', error)
        return NextResponse.json(
          { success: false, message: "Failed to upload avatar to cloud storage" },
          { status: 500 }
        )
      }
    } else {
      // In development, use local file storage
      console.log('💻 Development environment - using local file storage for avatar')
      
      // Create uploads directory if it doesn't exist
      const uploadsDir = join(process.cwd(), 'public', 'uploads', 'avatars')
      console.log("Uploads directory:", uploadsDir)
      
      if (!existsSync(uploadsDir)) {
        console.log("Creating uploads directory...")
        await mkdir(uploadsDir, { recursive: true })
        console.log("Uploads directory created")
      }

      // Generate unique filename
      const timestamp = Date.now()
      const fileExtension = file.name.split('.').pop()
      const fileName = `avatar_${user.id}_${timestamp}.${fileExtension}`
      const filePath = join(uploadsDir, fileName)
      
      console.log("File path:", filePath)

      // Convert file to buffer and save
      console.log("Converting file to buffer...")
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      console.log("Buffer created, size:", buffer.length, "bytes")
      
      console.log("Writing file to disk...")
      await writeFile(filePath, buffer)
      console.log("File written successfully")

      avatarUrl = `/uploads/avatars/${fileName}`
    }
    
    console.log("Avatar URL:", avatarUrl)
    
    console.log("Updating user in database...")
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { avatar: avatarUrl },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true
      }
    })
    console.log("User updated in database:", updatedUser.id)

    console.log("Avatar upload completed successfully")
    return NextResponse.json({
      success: true,
      message: "Avatar uploaded successfully",
      data: {
        avatar: updatedUser.avatar
      }
    })
  } catch (error) {
    console.error("Error uploading avatar:", error)
    console.error("Error details:", {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    })
    return NextResponse.json(
      { success: false, message: `Failed to upload avatar: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Get token from Authorization header
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

    // Verify token and get user data
    const user = await verifyAuthToken(token)
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Invalid authentication token" },
        { status: 401 }
      )
    }

    // Update user's avatar to null in database
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { avatar: null },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true
      }
    })

    return NextResponse.json({
      success: true,
      message: "Avatar removed successfully",
      data: {
        avatar: updatedUser.avatar
      }
    })
  } catch (error) {
    console.error("Error removing avatar:", error)
    return NextResponse.json(
      { success: false, message: "Failed to remove avatar" },
      { status: 500 }
    )
  }
}
