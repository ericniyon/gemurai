#!/usr/bin/env tsx

import { execSync } from 'child_process'

console.log('🔧 Fixing pnpm lockfile issues...')

try {
  // Check if pnpm is installed
  execSync('pnpm --version', { stdio: 'pipe' })
  console.log('✅ pnpm is installed')

  // Try frozen lockfile first
  console.log('📦 Attempting frozen lockfile install...')
  try {
    execSync('pnpm i --frozen-lockfile', { stdio: 'inherit' })
    console.log('✅ Frozen lockfile install successful!')
  } catch (error) {
    console.log('⚠️  Frozen lockfile failed, updating lockfile...')
    
    // If frozen fails, update the lockfile
    execSync('pnpm install --no-frozen-lockfile', { stdio: 'inherit' })
    console.log('✅ Lockfile updated successfully!')
    
    // Test frozen again
    console.log('🧪 Testing frozen lockfile again...')
    execSync('pnpm i --frozen-lockfile', { stdio: 'inherit' })
    console.log('✅ Frozen lockfile now works!')
  }

  console.log('\n🎉 All pnpm issues resolved!')
  console.log('💡 You can now use "pnpm i --frozen-lockfile" safely')

} catch (error) {
  console.error('❌ Error:', error)
  console.log('\n🔧 Troubleshooting tips:')
  console.log('1. Make sure pnpm is installed: npm install -g pnpm')
  console.log('2. Clear node_modules: rm -rf node_modules pnpm-lock.yaml')
  console.log('3. Reinstall: pnpm install')
  process.exit(1)
} 