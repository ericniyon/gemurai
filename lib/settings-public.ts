import { prisma } from "@/lib/prisma"

const GENERAL_SETTINGS_KEY = "general"

export type PublicSettings = {
  platformName: string
  platformDescription: string
  supportEmail: string
  supportPhone: string
}

const defaultPublic: PublicSettings = {
  platformName: "HarvestPlus by YDEN",
  platformDescription: "Multi-Commodity Aggregation & Settlement Platform",
  supportEmail: "support@harvestplus.rw",
  supportPhone: "+250 788 123 456",
}

export async function getPublicSettings(): Promise<PublicSettings> {
  try {
    let row: { value: unknown } | null = null
    if (prisma.systemSetting?.findUnique) {
      const r = await prisma.systemSetting.findUnique({
        where: { key: GENERAL_SETTINGS_KEY },
      })
      row = r
    }
    if (!row) {
      const rows = await prisma.$queryRaw<Array<{ value: unknown }>>`
        SELECT value FROM system_settings WHERE key = ${GENERAL_SETTINGS_KEY} LIMIT 1
      `
      row = rows[0] ?? null
    }
    if (!row || typeof row.value !== "object" || row.value === null) {
      return defaultPublic
    }
    const v = row.value as Record<string, unknown>
    return {
      platformName: (v.platformName as string) ?? defaultPublic.platformName,
      platformDescription: (v.platformDescription as string) ?? defaultPublic.platformDescription,
      supportEmail: (v.supportEmail as string) ?? defaultPublic.supportEmail,
      supportPhone: (v.supportPhone as string) ?? defaultPublic.supportPhone,
    }
  } catch {
    return defaultPublic
  }
}
