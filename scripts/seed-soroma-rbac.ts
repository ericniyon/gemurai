/**
 * Seed SOROMA RBAC tables from code catalog (Phase 2.1).
 * Run: npx tsx scripts/seed-soroma-rbac.ts
 */
import { seedSoromaRbacFromCode } from "../lib/soroma/rbac-resolver"

async function main() {
  console.log("Seeding SOROMA permissions, roles, and role_permissions...")
  await seedSoromaRbacFromCode()
  console.log("Done.")
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
