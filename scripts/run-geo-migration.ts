import { PrismaClient } from "@prisma/client"
import { readFileSync } from "fs"
import { join } from "path"

// Override DATABASE_URL with SSL parameters if not present
const originalUrl = process.env.DATABASE_URL || ""
let databaseUrl = originalUrl

// Add SSL mode if not present
if (databaseUrl && !databaseUrl.includes("sslmode=")) {
  // Use no-verify for Railway databases with certificate issues
  databaseUrl = `${databaseUrl}?sslmode=no-verify`
}

// Create Prisma client with modified connection string
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
})

async function runMigration() {
  try {
    console.log("Reading migration SQL file...")
    const migrationPath = join(
      process.cwd(),
      "prisma/migrations/20250123000000_add_geo_location_system/migration.sql"
    )
    const sql = readFileSync(migrationPath, "utf-8")

    console.log("Executing migration SQL...")
    // Split by semicolons and execute each statement
    const statements = sql
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith("--"))

    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await prisma.$executeRawUnsafe(statement)
          console.log(`✓ Executed: ${statement.substring(0, 50)}...`)
        } catch (error: any) {
          // Ignore "already exists" errors for IF NOT EXISTS statements
          if (
            error.message?.includes("already exists") ||
            error.message?.includes("duplicate")
          ) {
            console.log(`⊘ Skipped (already exists): ${statement.substring(0, 50)}...`)
          } else {
            console.error(`✗ Error executing statement:`, error.message)
            console.error(`Statement: ${statement.substring(0, 100)}...`)
            throw error
          }
        }
      }
    }

    console.log("\n✅ Migration completed successfully!")
  } catch (error) {
    console.error("❌ Migration failed:", error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

runMigration()
