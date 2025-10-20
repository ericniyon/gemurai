import { NextRequest, NextResponse } from "next/server"
import { verifyAuthToken } from "@/lib/token"
import { writeFile } from "fs/promises"
import { join } from "path"
import { randomUUID } from "crypto"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"
import { uploadToCloudinary } from "@/lib/cloudinary"

// Configure allowed file types and max size
const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf"
]
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

// Check if we're in production (read-only filesystem)
const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production'

export async function POST(req: NextRequest) {
  try {
    // Get token from multiple sources
    let token: string | undefined

    // 1. Try Authorization header first
    const authHeader = req.headers.get("Authorization")
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1]
    }

    // 2. Try cookies if no Authorization header
    if (!token) {
      const cookies = req.headers.get("cookie")
      // Try NextAuth session token
      token = cookies?.match(/next-auth.session-token=([^;]+)/)?.[1]
      
      // Try development token if no session token
      if (!token) {
        token = cookies?.match(/Gemurai_token=([^;]+)/)?.[1]
      }
    }

    if (!token) {
      return NextResponse.json({ 
        error: "Unauthorized - No token found",
        message: "Please log in to continue"
      }, { status: 401 })
    }

    const user = await verifyAuthToken(token)
    if (!user) {
      return NextResponse.json({ 
        error: "Unauthorized - Invalid token",
        message: "Your session has expired. Please log in again."
      }, { status: 401 })
    }

    // Verify user exists in database and has correct role
    const dbUser = await prisma.user.findUnique({
      where: { 
        id: user.id,
        isActive: true
      }
    })

    if (!dbUser) {
      return NextResponse.json({ 
        error: "Unauthorized - User not found",
        message: "User account not found or inactive"
      }, { status: 403 })
    }

    // Get the file from form data
    const formData = await req.formData()
    // Accept generic field name "file" or legacy "image"
    const file = (formData.get("file") || formData.get("image")) as File | null

    if (!file) {
      return NextResponse.json({
        error: "Bad Request",
        message: "No file provided"
      }, { status: 400 })
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return NextResponse.json({
        error: "Bad Request",
        message: "Invalid file type. Allowed types: JPEG, PNG, WebP, GIF"
      }, { status: 400 })
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({
        error: "Bad Request",
        message: "File size too large. Maximum size: 5MB"
      }, { status: 400 })
    }

    let imageUrl: string

    if (isProduction) {
      // In production, use Cloudinary
      console.log('🌐 Production environment detected - using Cloudinary')
      
      // Generate a unique filename
      const ext = file.type.split("/")[1]
      const filename = `${randomUUID()}.${ext}`
      
      // Convert file to buffer
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      
      try {
        // Upload to Cloudinary
        const result = await uploadToCloudinary(buffer, filename, 'djyh-uploads', file.type.startsWith('image/') ? 'image' : 'auto')
        imageUrl = result.secure_url
        console.log('📤 Cloudinary upload successful:', imageUrl)
      } catch (error) {
        console.error('❌ Cloudinary upload failed:', error)
        
        // Fallback to placeholder if Cloudinary fails
        imageUrl = `https://via.placeholder.com/400x400/cccccc/666666?text=${encodeURIComponent(filename)}`
        console.log('🔄 Using fallback placeholder:', imageUrl)
      }
    } else {
      // In development, use local file storage
      console.log('💻 Development environment - using local file storage')
      
      // Generate unique filename
      const ext = file.type.split("/")[1]
      const filename = `${randomUUID()}.${ext}`
      
      // Create uploads directory if it doesn't exist
      const uploadDir = join(process.cwd(), "public", "uploads")
      try {
        await writeFile(join(uploadDir, ".keep"), "")
      } catch (error) {
        // Directory already exists, ignore error
      }

      // Save file
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      
      await writeFile(join(uploadDir, filename), buffer)

      imageUrl = `/uploads/${filename}`
      console.log('💾 Local file saved:', imageUrl)
    }

    console.log('File uploaded successfully:', {
      filename: file.name,
      imageUrl,
      fileSize: file.size,
      fileType: file.type,
      environment: isProduction ? 'Production' : 'Development'
    })

    // Return the URL
    return NextResponse.json({
      success: true,
      message: "File uploaded successfully",
      url: imageUrl
    })
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json({
      error: "Internal Server Error",
      message: error instanceof Error ? error.message : "Failed to upload file"
    }, { status: 500 })
  }
} 