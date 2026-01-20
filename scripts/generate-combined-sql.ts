#!/usr/bin/env tsx

/**
 * Script to generate a single SQL file with all migrations combined
 * 
 * Usage:
 *   npm run generate-sql
 *   or
 *   tsx scripts/generate-combined-sql.ts
 */

import { readFileSync, readdirSync, statSync, writeFileSync } from "fs"
import { join } from "path"

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
        // Handle standalone SQL files
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
 * Generate combined SQL file
 */
function generateCombinedSQL() {
  console.log("🔄 Generating combined SQL file...\n")

  const migrations = getAllMigrationFiles()

  if (migrations.length === 0) {
    console.log("⚠️  No migration files found")
    return
  }

  console.log(`📦 Found ${migrations.length} migration file(s)\n`)

  let combinedSQL = `-- ============================================
-- Combined SQL Migrations
-- Generated on: ${new Date().toISOString()}
-- Total migrations: ${migrations.length}
-- ============================================

`

  migrations.forEach((migration, index) => {
    combinedSQL += `-- ============================================
-- Migration ${index + 1}/${migrations.length}: ${migration.name}
-- ============================================

${migration.sql}

-- End of migration: ${migration.name}
-- ============================================

`
  })

  const outputPath = join(process.cwd(), "all-migrations.sql")
  writeFileSync(outputPath, combinedSQL, "utf-8")

  console.log(`✅ Combined SQL file generated: ${outputPath}`)
  console.log(`📊 Total size: ${(combinedSQL.length / 1024).toFixed(2)} KB`)
  console.log(`\n💡 You can now run this file with:`)
  console.log(`   psql $DATABASE_URL -f ${outputPath}`)
  console.log(`   or`)
  console.log(`   npm run apply-sql-migrations`)
}

generateCombinedSQL()
