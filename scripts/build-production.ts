#!/usr/bin/env tsx

/**
 * Production Build Script
 * Handles Prisma client generation for Docker/production environments
 */

import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

async function buildForProduction() {
  console.log('🏗️  Starting production build...')
  
  try {
    // Step 1: Generate Prisma Client
    console.log('📦 Generating Prisma client...')
    await execAsync('prisma generate', {
      env: {
        ...process.env,
        // Ensure Prisma doesn't try to connect to DB during generation
        DATABASE_URL: process.env.DATABASE_URL || 'postgresql://dummy:dummy@localhost:5432/dummy',
        DIRECT_URL: process.env.DIRECT_URL || process.env.DATABASE_URL || 'postgresql://dummy:dummy@localhost:5432/dummy'
      }
    })
    console.log('✅ Prisma client generated successfully')

    // Step 2: Next.js Build with prerendering disabled
    console.log('🚀 Building Next.js application...')
    const { stdout: buildOutput, stderr: buildError } = await execAsync('NEXT_SKIP_PRERENDER=true NODE_ENV=production next build', {
      env: {
        ...process.env,
        NEXT_SKIP_PRERENDER: 'true',
        NODE_ENV: 'production',
        // Disable static optimization
        NEXT_DISABLE_STATIC_OPTIMIZATION: 'true',
        // Disable static exports
        NEXT_DISABLE_STATIC_EXPORTS: 'true',
        // Disable prerendering for all pages
        NEXT_DISABLE_PRERENDER: 'true',
      }
    })
    
    if (buildError && !buildError.includes('Warning')) {
      throw new Error(`Build failed: ${buildError}`)
    }
    
    console.log('✅ Next.js build completed successfully')
    if (buildOutput) {
      console.log(buildOutput)
    }
    
  } catch (error) {
    console.error('❌ Production build failed:', error)
    process.exit(1)
  }
}

// Run the build
buildForProduction() 