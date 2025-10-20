import { prisma } from "@/lib/prisma"

export async function generateLocationCode(warehouseId: string): Promise<string> {
  console.log("🔍 generateLocationCode called with warehouseId:", warehouseId)
  
  try {
    // Get the warehouse to include its code in the location code
    console.log("🏭 Fetching warehouse...")
    const warehouse = await prisma.warehouse.findUnique({
      where: { id: warehouseId },
      select: { code: true }
    })

    console.log("🏭 Warehouse found:", warehouse)

    if (!warehouse) {
      throw new Error("Warehouse not found")
    }

    // Get the last location for this warehouse
    console.log("📍 Fetching last location for warehouse...")
    const lastLocation = await prisma.location.findFirst({
      where: { warehouseId },
      orderBy: { code: 'desc' },
      select: { code: true }
    })

    console.log("📍 Last location found:", lastLocation)

    let nextNumber = 1

    if (lastLocation) {
      // Extract the number from the last location code
      // Expected format: WH001-LOC001, WH001-LOC002, etc.
      const match = lastLocation.code.match(/-LOC(\d+)$/)
      if (match) {
        nextNumber = parseInt(match[1]) + 1
      }
    }

    // Format: WH001-LOC001, WH001-LOC002, etc.
    const locationCode = `${warehouse.code}-LOC${nextNumber.toString().padStart(3, '0')}`
    console.log("✅ Generated location code:", locationCode)

    return locationCode
  } catch (error) {
    console.error("❌ Error generating location code:", error)
    throw new Error("Failed to generate location code")
  }
}

export async function validateLocationCode(code: string, warehouseId: string, excludeId?: string): Promise<boolean> {
  try {
    const existingLocation = await prisma.location.findFirst({
      where: {
        code,
        warehouseId,
        id: { not: excludeId }
      }
    })

    return !existingLocation
  } catch (error) {
    console.error("Error validating location code:", error)
    return false
  }
} 