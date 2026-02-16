/**
 * Backfill displayId for all users that don't have one.
 * Run: pnpm tsx scripts/backfill-display-ids.ts
 */
import { prisma } from "@/lib/prisma"
import { getNextDisplayId } from "@/lib/display-id"

async function main() {
  const usersWithoutDisplayId = await prisma.user.findMany({
    where: { displayId: null },
    select: { id: true, email: true, name: true },
    orderBy: { createdAt: "asc" },
  })

  if (usersWithoutDisplayId.length === 0) {
    console.log("No users without displayId. Nothing to do.")
    return
  }

  console.log(`Found ${usersWithoutDisplayId.length} user(s) without displayId. Assigning IDs...`)

  let updated = 0
  for (const user of usersWithoutDisplayId) {
    try {
      const displayId = await getNextDisplayId(prisma)
      await prisma.user.update({
        where: { id: user.id },
        data: { displayId },
      })
      updated++
      console.log(`  ${user.email} -> ${displayId}`)
    } catch (e) {
      console.error(`  Failed for ${user.email}:`, e)
    }
  }

  console.log(`Done. Updated ${updated} user(s).`)
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
