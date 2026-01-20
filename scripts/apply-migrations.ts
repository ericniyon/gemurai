#!/usr/bin/env tsx

/**
 * Script to apply all Prisma migrations
 * 
 * Usage:
 *   npm run apply-migrations
 *   or
 *   tsx scripts/apply-migrations.ts
 */

import { execSync } from 'child_process'
import { existsSync } from 'fs'
import { join } from 'path'

console.log('🔄 Starting migration process...\n')

try {
  // Check if .env file exists
  const envPath = join(process.cwd(), '.env')
  if (!existsSync(envPath)) {
    console.warn('⚠️  Warning: .env file not found. Make sure DATABASE_URL is set.\n')
  }

  // Step 1: Generate Prisma Client
  console.log('📦 Step 1: Generating Prisma Client...')
  try {
    execSync('npx prisma generate', { 
      stdio: 'inherit',
      cwd: process.cwd()
    })
    console.log('✅ Prisma Client generated successfully\n')
  } catch (error) {
    console.error('❌ Error generating Prisma Client:', error)
    process.exit(1)
  }

  // Step 2: Apply all migrations
  console.log('🚀 Step 2: Applying all migrations...')
  try {
    // Use migrate deploy for production/CI environments (applies pending migrations)
    // Use migrate dev for development (applies and creates new migrations if schema changed)
    const command = process.env.NODE_ENV === 'production' 
      ? 'npx prisma migrate deploy'
      : 'npx prisma migrate dev'
    
    execSync(command, { 
      stdio: 'inherit',
      cwd: process.cwd()
    })
    console.log('✅ All migrations applied successfully\n')
  } catch (error) {
    console.error('❌ Error applying migrations:', error)
    console.log('\n💡 Tip: If you see migration conflicts, try:')
    console.log('   - npx prisma migrate reset (WARNING: This will delete all data)')
    console.log('   - npx prisma db push (Alternative: pushes schema without migrations)')
    process.exit(1)
  }

  // Step 3: Verify database connection
  console.log('🔍 Step 3: Verifying database connection...')
  try {
    execSync('npx prisma db execute --stdin <<< "SELECT 1"', { 
      stdio: 'pipe',
      cwd: process.cwd()
    })
    console.log('✅ Database connection verified\n')
  } catch (error) {
    console.warn('⚠️  Could not verify database connection (this is okay if database requires authentication)\n')
  }

  console.log('🎉 Migration process completed successfully!')
  console.log('\n📊 Next steps:')
  console.log('   - Run: npm run db:studio (to view your database)')
  console.log('   - Run: npm run db:seed (to seed initial data if available)')
  
} catch (error) {
  console.error('❌ Fatal error:', error)
  process.exit(1)
}
