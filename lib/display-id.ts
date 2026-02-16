import type { PrismaClient } from "@prisma/client"

const DISPLAY_ID_COUNTRY = "RW"
const DISPLAY_ID_MAX_SEQ = 99_999

/**
 * Generate next user displayId: [COUNTRY]-[YEAR]-[SEQ]
 * e.g. RW-2026-00001
 * Unique, immutable. Sequence resets every year. Max 99,999 per year.
 */
export async function getNextDisplayId(
  db: PrismaClient
): Promise<string> {
  const year = new Date().getFullYear()
  const prefix = `${DISPLAY_ID_COUNTRY}-${year}-`

  const existing = await db.user.findMany({
    where: { displayId: { startsWith: prefix } },
    select: { displayId: true },
  })

  let maxSeq = 0
  for (const u of existing) {
    if (!u.displayId) continue
    const seqPart = u.displayId.slice(prefix.length)
    const num = parseInt(seqPart, 10)
    if (!Number.isNaN(num) && num > maxSeq) maxSeq = num
  }

  const nextSeq = Math.min(maxSeq + 1, DISPLAY_ID_MAX_SEQ)
  return `${prefix}${String(nextSeq).padStart(5, "0")}`
}
