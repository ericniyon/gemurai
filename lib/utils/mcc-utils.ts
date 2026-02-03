import { prisma } from "@/lib/prisma"

/**
 * Auto-generates the next MCC code in the format MCC001, MCC002, etc.
 */
export async function generateMCCCode(): Promise<string> {
  try {
    const lastMcc = await prisma.mccs.findFirst({
      where: {
        code: {
          startsWith: "MCC",
        },
      },
      orderBy: {
        code: "desc",
      },
      select: { code: true },
    })

    if (!lastMcc?.code) {
      return "MCC001"
    }

    const match = lastMcc.code.match(/MCC(\d+)$/i)
    const lastNumber = match ? parseInt(match[1], 10) : 0
    const nextNumber = lastNumber + 1
    const formattedNumber = nextNumber.toString().padStart(3, "0")

    return `MCC${formattedNumber}`
  } catch (error) {
    console.error("Error generating MCC code:", error)
    const timestamp = Date.now()
    const randomSuffix = Math.floor(Math.random() * 100)
    return `MCC${timestamp.toString().slice(-3)}${randomSuffix.toString().padStart(2, "0")}`
  }
}
