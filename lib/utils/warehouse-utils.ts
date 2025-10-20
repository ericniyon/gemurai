import { prisma } from "@/lib/prisma"

export const RWANDA_DISTRICTS = [
  "Musanze",
  "Nyagatare",
  "Kigali",
  "Huye",
  "Rubavu",
  "Karongi",
  "Rusizi",
  "Nyamasheke",
  "Ruhango",
  "Muhanga",
  "Kamonyi",
  "Rulindo",
  "Gakenke",
  "Burera",
  "Gicumbi",
  "Rwamagana",
  "Kayonza",
  "Ngoma",
  "Kirehe",
  "Bugesera",
  "Gasabo",
  "Kicukiro",
  "Nyarugenge"
] as const

export type RwandaDistrict = typeof RWANDA_DISTRICTS[number]

/**
 * Auto-generates the next warehouse code in the format WH001, WH002, etc.
 */
export async function generateWarehouseCode(): Promise<string> {
  try {
    // Get the highest existing warehouse code
    const lastWarehouse = await prisma.warehouse.findFirst({
      where: {
        code: {
          startsWith: "WH"
        }
      },
      orderBy: {
        code: 'desc'
      }
    })

    if (!lastWarehouse) {
      // If no warehouses exist, start with WH001
      return "WH001"
    }

    // Extract the number from the last code (e.g., "WH001" -> "001")
    const lastNumber = parseInt(lastWarehouse.code.replace("WH", ""))
    
    // Generate the next number and format it with leading zeros
    const nextNumber = lastNumber + 1
    const formattedNumber = nextNumber.toString().padStart(3, "0")
    
    return `WH${formattedNumber}`
  } catch (error) {
    console.error("Error generating warehouse code:", error)
    // Fallback: generate based on timestamp
    const timestamp = Date.now()
    const randomSuffix = Math.floor(Math.random() * 100)
    return `WH${timestamp.toString().slice(-3)}${randomSuffix.toString().padStart(2, "0")}`
  }
}

/**
 * Validates if a warehouse code is unique
 */
export async function isWarehouseCodeUnique(code: string): Promise<boolean> {
  try {
    const existingWarehouse = await prisma.warehouse.findUnique({
      where: { code }
    })
    return !existingWarehouse
  } catch (error) {
    console.error("Error checking warehouse code uniqueness:", error)
    return false
  }
} 