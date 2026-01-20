#!/usr/bin/env tsx

/**
 * Script to apply all SQL migrations from prisma/migrations directory
 * 
 * Usage:
 *   npm run apply-sql-migrations
 *   or
 *   tsx scripts/apply-all-sql-migrations.ts
 */

import { PrismaClient } from "@prisma/client"
import { readFileSync, readdirSync, statSync } from "fs"
import { join } from "path"

// Override DATABASE_URL with SSL parameters if needed
const originalUrl = process.env.DATABASE_URL || ""
let databaseUrl = originalUrl

// Add SSL mode if not present (for Railway/Neon databases)
if (databaseUrl && !databaseUrl.includes("sslmode=")) {
  databaseUrl = `${databaseUrl}?sslmode=no-verify`
}

// Create Prisma client
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
})

interface MigrationFile {
  path: string
  name: string
  sql: string
}

/**
 * Get all migration SQL files sorted by name (timestamp)
 */
function getAllMigrationFiles(): MigrationFile[] {
  const migrationsDir = join(process.cwd(), "prisma/migrations")
  const migrations: MigrationFile[] = []

  try {
    const entries = readdirSync(migrationsDir, { withFileTypes: true })

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const migrationPath = join(migrationsDir, entry.name)
        const sqlFile = join(migrationPath, "migration.sql")

        if (statSync(sqlFile).isFile()) {
          try {
            const sql = readFileSync(sqlFile, "utf-8")
            migrations.push({
              path: sqlFile,
              name: entry.name,
              sql,
            })
          } catch (error) {
            console.warn(`⚠️  Could not read ${sqlFile}:`, error)
          }
        }
      } else if (entry.isFile() && entry.name.endsWith(".sql")) {
        // Handle standalone SQL files (like manual_update_product_type_enum.sql)
        const sqlFile = join(migrationsDir, entry.name)
        try {
          const sql = readFileSync(sqlFile, "utf-8")
          migrations.push({
            path: sqlFile,
            name: entry.name.replace(".sql", ""),
            sql,
          })
        } catch (error) {
          console.warn(`⚠️  Could not read ${sqlFile}:`, error)
        }
      }
    }

    // Sort by name (which includes timestamp)
    return migrations.sort((a, b) => a.name.localeCompare(b.name))
  } catch (error) {
    console.error("❌ Error reading migrations directory:", error)
    return []
  }
}

/**
 * Split SQL into individual statements
 */
function splitSQLStatements(sql: string): string[] {
  // Remove comments and split by semicolons
  const statements = sql
    .split(";")
    .map((s) => s.trim())
    .filter((s) => {
      // Remove empty statements and comments
      if (!s || s.length === 0) return false
      // Remove single-line comments
      if (s.startsWith("--")) return false
      // Remove multi-line comment blocks
      if (s.startsWith("/*") && s.endsWith("*/")) return false
      return true
    })
    .map((s) => {
      // Remove inline comments (-- comment)
      const lines = s.split("\n")
      return lines
        .map((line) => {
          const commentIndex = line.indexOf("--")
          return commentIndex >= 0 ? line.substring(0, commentIndex).trim() : line.trim()
        })
        .filter((line) => line.length > 0)
        .join("\n")
    })
    .filter((s) => s.length > 0)

  return statements
}

/**
 * Execute a single SQL statement
 */
async function executeStatement(statement: string, migrationName: string): Promise<boolean> {
  if (!statement.trim()) return true

  try {
    await prisma.$executeRawUnsafe(statement)
    return true
  } catch (error: any) {
    // Ignore "already exists" errors for IF NOT EXISTS statements
    const errorMessage = error.message?.toLowerCase() || ""
    if (
      errorMessage.includes("already exists") ||
      errorMessage.includes("duplicate") ||
      errorMessage.includes("relation") && errorMessage.includes("already exists")
    ) {
      console.log(`  ⊘ Skipped (already exists)`)
      return true
    }

    // Ignore "does not exist" errors for DROP IF EXISTS
    if (
      errorMessage.includes("does not exist") ||
      errorMessage.includes("cannot drop")
    ) {
      console.log(`  ⊘ Skipped (does not exist)`)
      return true
    }

    console.error(`  ❌ Error: ${error.message}`)
    console.error(`  Statement: ${statement.substring(0, 200)}...`)
    return false
  }
}

/**
 * Execute all migrations
 */
async function applyAllMigrations() {
  console.log("🔄 Starting SQL migration process...\n")

  try {
    // Connect to database
    await prisma.$connect()
    console.log("✅ Connected to database\n")

    // Get all migration files
    const migrations = getAllMigrationFiles()

    if (migrations.length === 0) {
      console.log("⚠️  No migration files found in prisma/migrations/")
      return
    }

    console.log(`📦 Found ${migrations.length} migration file(s)\n`)

    let successCount = 0
    let errorCount = 0

    // Execute each migration
    for (let i = 0; i < migrations.length; i++) {
      const migration = migrations[i]
      console.log(`[${i + 1}/${migrations.length}] Processing: ${migration.name}`)

      const statements = splitSQLStatements(migration.sql)
      console.log(`  📝 Found ${statements.length} SQL statement(s)`)

      let migrationSuccess = true

      for (let j = 0; j < statements.length; j++) {
        const statement = statements[j]
        const success = await executeStatement(statement, migration.name)

        if (!success) {
          migrationSuccess = false
          errorCount++
          console.error(`  ❌ Failed at statement ${j + 1}/${statements.length}`)
          // Continue with next statement instead of breaking
        }
      }

      if (migrationSuccess) {
        successCount++
        console.log(`  ✅ Migration completed successfully\n`)
      } else {
        console.log(`  ⚠️  Migration completed with errors\n`)
      }
    }

    // Summary
    console.log("=" .repeat(60))
    console.log("📊 Migration Summary:")
    console.log(`  ✅ Successful: ${successCount}/${migrations.length}`)
    if (errorCount > 0) {
      console.log(`  ❌ Errors: ${errorCount} statement(s)`)
    }
    console.log("=" .repeat(60))

    if (errorCount === 0) {
      console.log("\n🎉 All migrations applied successfully!")
    } else {
      console.log("\n⚠️  Some migrations had errors. Please review the output above.")
    }

  } catch (error) {
    console.error("❌ Fatal error:", error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
    console.log("\n🔌 Disconnected from database")
  }
}

// Run the script
applyAllMigrations().catch((error) => {
  console.error("❌ Unhandled error:", error)
  process.exit(1)
})
