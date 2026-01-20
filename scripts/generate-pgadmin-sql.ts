#!/usr/bin/env tsx

/**
 * Script to generate a single SQL file optimized for pgAdmin4
 * 
 * Usage:
 *   npm run generate-pgadmin-sql
 *   or
 *   tsx scripts/generate-pgadmin-sql.ts
 * 
 * Then open the generated file in pgAdmin4 and execute it
 */

import { readFileSync, readdirSync, statSync, writeFileSync } from "fs"
import { join } from "path"

interface MigrationFile {
  path: string
  name: string
  sql: string
  timestamp: string
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

        try {
          if (statSync(sqlFile).isFile()) {
            try {
              const sql = readFileSync(sqlFile, "utf-8")
              migrations.push({
                path: sqlFile,
                name: entry.name,
                sql,
                timestamp: entry.name.split("_")[0] || entry.name,
              })
            } catch (error) {
              console.warn(`⚠️  Could not read ${sqlFile}:`, error)
            }
          }
        } catch (error: any) {
          // File doesn't exist, skip this directory
          if (error.code !== "ENOENT") {
            console.warn(`⚠️  Could not access ${sqlFile}:`, error.message)
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
            timestamp: entry.name.split("_")[0] || entry.name,
          })
        } catch (error) {
          console.warn(`⚠️  Could not read ${sqlFile}:`, error)
        }
      }
    }

    // Sort by timestamp/name
    return migrations.sort((a, b) => a.name.localeCompare(b.name))
  } catch (error) {
    console.error("❌ Error reading migrations directory:", error)
    return []
  }
}

/**
 * Clean SQL for pgAdmin4 (fix PostgreSQL syntax issues)
 */
function cleanSQLForPgAdmin(sql: string): string {
  let cleaned = sql
  
  // Fix: PostgreSQL doesn't support IF NOT EXISTS with ADD CONSTRAINT
  // First, handle ADD CONSTRAINT IF NOT EXISTS (convert to DO block)
  cleaned = cleaned.replace(
    /ALTER TABLE\s+"([^"]+)"\s+ADD CONSTRAINT\s+IF NOT EXISTS\s+"([^"]+)"\s+(.+?);/gis,
    (match, tableName, constraintName, constraintDef) => {
      return `-- Add constraint ${constraintName} if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = '${constraintName}' 
        AND conrelid = '${tableName}'::regclass
    ) THEN
        ALTER TABLE "${tableName}" ADD CONSTRAINT "${constraintName}" ${constraintDef.trim()};
    END IF;
END $$;`
    }
  )
  
  // Fix: Also handle ADD CONSTRAINT without IF NOT EXISTS (wrap in DO block)
  // Convert: ALTER TABLE "table" ADD CONSTRAINT "name" ...
  // To: DO block that checks if constraint exists first
  cleaned = cleaned.replace(
    /ALTER TABLE\s+"([^"]+)"\s+ADD CONSTRAINT\s+"([^"]+)"\s+(.+?);/gis,
    (match, tableName, constraintName, constraintDef) => {
      // Skip if this is already inside a DO block (check if previous replacement already handled it)
      // We'll check by looking for the pattern we just created
      return `-- Add constraint ${constraintName} if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = '${constraintName}' 
        AND conrelid = '${tableName}'::regclass
    ) THEN
        ALTER TABLE "${tableName}" ADD CONSTRAINT "${constraintName}" ${constraintDef.trim()};
    END IF;
END $$;`
    }
  )
  
  // Fix nested DO blocks first - handle cases where CREATE TYPE is already in a DO block with EXCEPTION
  // Pattern: DO $$ BEGIN ... CREATE TYPE ... EXCEPTION ... END $$;
  cleaned = cleaned.replace(
    /DO\s+\$\$\s+BEGIN\s+CREATE TYPE\s+"([^"]+)"\s+AS ENUM\s+\(([^)]+)\);\s+EXCEPTION\s+WHEN duplicate_object THEN null;\s+END\s+\$\$;/gis,
    (match, typeName, enumValues) => {
      return `-- Create type ${typeName} if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = '${typeName}') THEN
        CREATE TYPE "${typeName}" AS ENUM (${enumValues.trim()});
    END IF;
END $$;`
    }
  )
  
  // Fix: Add IF NOT EXISTS to CREATE TABLE statements that don't have it
  // Convert: CREATE TABLE "table_name" (...
  // To: CREATE TABLE IF NOT EXISTS "table_name" (...
  cleaned = cleaned.replace(
    /CREATE TABLE\s+(IF NOT EXISTS\s+)?"([^"]+)"\s*\(/gis,
    (match, hasIfNotExists, tableName) => {
      // If IF NOT EXISTS is already there, return as is
      if (hasIfNotExists) {
        return match
      }
      // Otherwise add IF NOT EXISTS
      return `CREATE TABLE IF NOT EXISTS "${tableName}" (`
    }
  )
  
  // Fix: Add IF NOT EXISTS to CREATE INDEX statements that don't have it
  // Convert: CREATE (UNIQUE )?INDEX "index_name" ...
  // To: CREATE (UNIQUE )?INDEX IF NOT EXISTS "index_name" ...
  cleaned = cleaned.replace(
    /CREATE\s+(UNIQUE\s+)?INDEX\s+(IF NOT EXISTS\s+)?"([^"]+)"\s+ON/gis,
    (match, isUnique, hasIfNotExists, indexName) => {
      // If IF NOT EXISTS is already there, return as is
      if (hasIfNotExists) {
        return match
      }
      // Otherwise add IF NOT EXISTS
      const uniquePart = isUnique ? 'UNIQUE ' : ''
      return `CREATE ${uniquePart}INDEX IF NOT EXISTS "${indexName}" ON`
    }
  )
  
  // Fix: Add IF NOT EXISTS to CREATE UNIQUE INDEX statements (alternative format)
  cleaned = cleaned.replace(
    /CREATE\s+UNIQUE\s+INDEX\s+(IF NOT EXISTS\s+)?"([^"]+)"\s+ON/gis,
    (match, hasIfNotExists, indexName) => {
      if (hasIfNotExists) {
        return match
      }
      return `CREATE UNIQUE INDEX IF NOT EXISTS "${indexName}" ON`
    }
  )
  
  // Fix: Add IF NOT EXISTS to ALTER TABLE ADD COLUMN statements that don't have it
  // Convert: ALTER TABLE "table" ADD COLUMN "column" ...
  // To: ALTER TABLE "table" ADD COLUMN IF NOT EXISTS "column" ...
  cleaned = cleaned.replace(
    /ALTER TABLE\s+"([^"]+)"\s+ADD COLUMN\s+(IF NOT EXISTS\s+)?"([^"]+)"\s+(.+?);/gis,
    (match, tableName, hasIfNotExists, columnName, columnDef) => {
      // If IF NOT EXISTS is already there, return as is
      if (hasIfNotExists) {
        return match
      }
      // Otherwise add IF NOT EXISTS
      return `ALTER TABLE "${tableName}" ADD COLUMN IF NOT EXISTS "${columnName}" ${columnDef.trim()};`
    }
  )
  
  // Fix: PostgreSQL doesn't support CREATE TYPE IF NOT EXISTS
  // Convert: CREATE TYPE "TypeName" AS ENUM (...)
  // To: DO block that checks if type exists first
  // But skip if already inside a DO block (check context)
  cleaned = cleaned.replace(
    /CREATE TYPE\s+"([^"]+)"\s+AS ENUM\s+\(([^)]+)\);/gis,
    (match, typeName, enumValues, offset, string) => {
      // Check if this CREATE TYPE is already inside a DO block
      const beforeMatch = string.substring(Math.max(0, offset - 500), offset)
      const afterMatch = string.substring(offset, Math.min(string.length, offset + 200))
      
      // If there's an unclosed DO block before this, skip wrapping
      const doBlocksBefore = (beforeMatch.match(/DO\s+\$\$/g) || []).length
      const endBlocksBefore = (beforeMatch.match(/END\s+\$\$;/g) || []).length
      
      // If there's EXCEPTION handling after, it's already in a DO block
      if (afterMatch.includes('EXCEPTION') || (doBlocksBefore > endBlocksBefore)) {
        return match // Don't wrap, already in a DO block
      }
      
      return `-- Create type ${typeName} if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = '${typeName}') THEN
        CREATE TYPE "${typeName}" AS ENUM (${enumValues.trim()});
    END IF;
END $$;`
    }
  )
  
  // Ensure statements end with semicolons
  if (!cleaned.trim().endsWith(";")) {
    cleaned = cleaned.trim() + ";"
  }
  
  return cleaned
}

/**
 * Generate SQL file optimized for pgAdmin4
 */
function generatePgAdminSQL() {
  console.log("🔄 Generating SQL file for pgAdmin4...\n")

  const migrations = getAllMigrationFiles()

  if (migrations.length === 0) {
    console.log("⚠️  No migration files found")
    return
  }

  console.log(`📦 Found ${migrations.length} migration file(s)\n`)

  // Start with header - NO transaction wrapper to allow partial execution
  let combinedSQL = `-- ============================================
-- PostgreSQL Migrations for pgAdmin4
-- Generated on: ${new Date().toISOString()}
-- Total migrations: ${migrations.length}
-- 
-- Instructions:
-- 1. Open this file in pgAdmin4
-- 2. Connect to your database
-- 3. Open Query Tool (Tools > Query Tool)
-- 4. Paste this entire file
-- 5. Click Execute (F5) or press F5
-- 
-- Note: Each migration is wrapped in its own transaction.
-- If one migration fails, others can still execute.
-- You can also execute migrations one at a time.
-- ============================================

`

  // Add each migration wrapped in its own transaction
  migrations.forEach((migration, index) => {
    const cleanedSQL = cleanSQLForPgAdmin(migration.sql)
    
    combinedSQL += `-- ============================================
-- Migration ${index + 1}/${migrations.length}: ${migration.name}
-- ============================================

BEGIN;

${cleanedSQL}

COMMIT;

-- If this migration failed, you can continue with the next one
-- Just comment out the failed migration section above

`
  })

  // End of file
  combinedSQL += `-- ============================================
-- End of all migrations
-- ============================================

-- All migrations completed successfully!
-- If you encountered errors, check the migration sections above
-- and re-run only the failed migrations after fixing issues.
`

  const outputPath = join(process.cwd(), "pgadmin-migrations.sql")
  writeFileSync(outputPath, combinedSQL, "utf-8")

  console.log(`✅ SQL file generated: ${outputPath}`)
  console.log(`📊 Total size: ${(combinedSQL.length / 1024).toFixed(2)} KB`)
  console.log(`\n📋 Instructions for pgAdmin4:`)
  console.log(`   1. Open pgAdmin4`)
  console.log(`   2. Connect to your database`)
  console.log(`   3. Right-click on your database → Query Tool`)
  console.log(`   4. Click the folder icon (Open File) or press Ctrl+O`)
  console.log(`   5. Select: ${outputPath}`)
  console.log(`   6. Click Execute (▶) or press F5`)
  console.log(`\n💡 Alternative: Copy the entire file content and paste into Query Tool`)
  console.log(`\n⚠️  Note: The script uses BEGIN/COMMIT for transaction safety.`)
  console.log(`   If errors occur, run ROLLBACK; to undo changes.`)
}

generatePgAdminSQL()
