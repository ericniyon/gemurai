import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { v4 as uuidv4 } from "uuid"
import { existsSync } from "fs"

/**
 * Uploads an image file to the server and returns the URL
 * @param file The image file to upload
 * @returns The URL of the uploaded image
 */
export async function uploadImage(file: File): Promise<string> {
  try {
    // Generate a unique filename
    const uniqueId = uuidv4()
    const extension = file.name.split(".").pop()
    const filename = `${uniqueId}.${extension}`

    // Ensure uploads directory exists
    const publicDir = join(process.cwd(), "public")
    const uploadsDir = join(publicDir, "uploads")
    
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // Save file to public/uploads directory
    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(join(uploadsDir, filename), buffer)

    // Return the URL
    return `/uploads/${filename}`
  } catch (error) {
    console.error("Error uploading image:", error)
    throw new Error("Failed to upload image")
  }
}

/**
 * Validates an image file
 * @param file The file to validate
 * @returns True if the file is valid, false otherwise
 */
export function validateImage(file: File): boolean {
  // Check file type
  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"]
  if (!allowedTypes.includes(file.type)) {
    return false
  }

  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024 // 10MB in bytes
  if (file.size > maxSize) {
    return false
  }

  return true
} 