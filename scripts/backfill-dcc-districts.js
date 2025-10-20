const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

function parseDistrictFromLocation(location) {
  if (!location || typeof location !== 'string') return ''
  const parts = location.split(',').map(s => s.trim()).filter(Boolean)
  if (parts.length >= 2) return parts[1]
  if (parts.length >= 1) return parts[0]
  return ''
}

function extractDistrictFromFormData(formData) {
  try {
    if (!formData || typeof formData !== 'object') return ''
    const stack = [formData]
    while (stack.length) {
      const cur = stack.pop()
      if (!cur || typeof cur !== 'object') continue
      for (const k of Object.keys(cur)) {
        const v = cur[k]
        if (k.toLowerCase().includes('district')) {
          if (typeof v === 'string' && v.trim()) return v.trim()
          if (v && typeof v === 'object') {
            const nameLike = v.name || v.label || v.value
            if (typeof nameLike === 'string' && nameLike.trim()) return nameLike.trim()
          }
        }
        if (v && typeof v === 'object') stack.push(v)
      }
    }
  } catch {}
  return ''
}

async function main() {
  let updated = 0
  try {
    // Check if users.role column exists (legacy schema)
    const colCheck = await prisma.$queryRawUnsafe(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema='public' AND table_name='users' AND column_name='role'
      ) AS exists
    `)

    let rows = []
    if (colCheck?.[0]?.exists) {
      rows = await prisma.$queryRawUnsafe(`
        SELECT u.id, u."district" as district
        FROM "users" u
        WHERE u.role = 'DCC'
        UNION
        SELECT u2.id, u2."district" as district
        FROM "users" u2
        JOIN "user_role_assignments" ura ON ura."userId" = u2.id AND ura."isActive" = true
        JOIN "roles" r ON r.id = ura."roleId" AND r.name = 'DCC'
      `)
    } else {
      rows = await prisma.$queryRawUnsafe(`
        SELECT u2.id, u2."district" as district
        FROM "users" u2
        JOIN "user_role_assignments" ura ON ura."userId" = u2.id AND ura."isActive" = true
        JOIN "roles" r ON r.id = ura."roleId" AND r.name = 'DCC'
      `)
    }

    const dccUsers = []
    for (const row of rows) {
      const user = await prisma.user.findUnique({
        where: { id: row.id },
        select: { id: true, district: true, dccProfile: { select: { location: true, applicationId: true } } }
      })
      if (user) dccUsers.push(user)
    }

    for (const u of dccUsers) {
      if (u.district && u.district.trim()) continue

      // Try via dccProfile.applicationId
      let derived = ''
      if (u.dccProfile?.applicationId) {
        const app = await prisma.application.findUnique({
          where: { id: u.dccProfile.applicationId },
          select: { formData: true }
        })
        derived = extractDistrictFromFormData(app?.formData)
      }

      // Try latest app by userId
      if (!derived) {
        const latest = await prisma.application.findFirst({
          where: { userId: u.id },
          orderBy: { createdAt: 'desc' },
          select: { formData: true }
        })
        derived = extractDistrictFromFormData(latest?.formData)
      }

      // Parse from profile location
      if (!derived) derived = parseDistrictFromLocation(u.dccProfile?.location)

      if (derived) {
        await prisma.user.update({ where: { id: u.id }, data: { district: derived } })
        updated++
        console.log(`Updated ${u.id} -> ${derived}`)
      }
    }

    console.log(`Done. Users updated: ${updated}`)
  } catch (e) {
    console.error('Backfill failed:', e)
    process.exitCode = 1
  } finally {
    await prisma.$disconnect()
  }
}

main()


