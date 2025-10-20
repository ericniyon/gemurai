import { NextRequest, NextResponse } from "next/server"
import { writeFile } from "fs/promises"
import { join } from "path"
import { randomUUID } from "crypto"
import { uploadToCloudinary } from "@/lib/cloudinary"

// Allowed types and size identical to authenticated upload
const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf"
]
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = (formData.get("file") || formData.get("image")) as File | null

    if (!file) {
      return NextResponse.json({ error: "Bad Request", message: "No file provided" }, { status: 400 })
    }

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Bad Request", message: "Invalid file type. Allowed: JPEG, PNG, WebP, GIF, PDF" }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "Bad Request", message: "File size too large. Max 5MB" }, { status: 400 })
    }

    let url: string

    if (isProduction) {
      const ext = file.type.split("/")[1]
      const filename = `${randomUUID()}.${ext}`
      const buffer = Buffer.from(await file.arrayBuffer())
      try {
        const result = await uploadToCloudinary(buffer, filename, 'djyh-uploads', file.type.startsWith('image/') ? 'image' : 'auto')
        url = result.secure_url
      } catch (e) {
        console.error('Cloudinary upload failed:', e)
        url = `https://via.placeholder.com/400x400/cccccc/666666?text=${encodeURIComponent(filename)}`
      }
    } else {
      const ext = file.type.split("/")[1]
      const filename = `${randomUUID()}.${ext}`
      const uploadDir = join(process.cwd(), "public", "uploads")
      try {
        await writeFile(join(uploadDir, ".keep"), "")
      } catch {}
      const buffer = Buffer.from(await file.arrayBuffer())
      await writeFile(join(uploadDir, filename), buffer)
      url = `/uploads/${filename}`
    }

    return NextResponse.json({ success: true, url })
  } catch (error) {
    console.error("Public upload error:", error)
    return NextResponse.json({ error: "Internal Server Error", message: "Failed to upload file" }, { status: 500 })
  }
}


