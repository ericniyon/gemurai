#!/usr/bin/env tsx

import { cacheService } from '../lib/services/memory-cache-service'

async function setupRedis() {
  console.log('🚀 Setting up Memory Cache...')
  
  try {
    // Check if cache is available
    console.log('🔍 Checking cache availability...')
    const isAvailable = await cacheService.isAvailable()
    
    if (!isAvailable) {
      console.log('❌ Cache is not available.')
      return
    }
    
    console.log('✅ Memory cache is available!')
    
    // Test basic operations
    console.log('🧪 Testing Redis operations...')
    
    // Test set/get
    const testKey = 'test:applications'
    const testData = { message: 'Hello Redis!', timestamp: Date.now() }
    
    await cacheService.set(testKey, testData, 60) // 60 seconds TTL
    console.log('✅ Set operation successful')
    
    const retrieved = await cacheService.get(testKey)
    console.log('✅ Get operation successful:', retrieved)
    
    // Test cache statistics
    const stats = await cacheService.getStats()
    console.log('📊 Cache stats:', stats)
    
    // Clean up test data
    await cacheService.delete(testKey)
    console.log('✅ Delete operation successful')
    
    console.log('🎉 Memory cache setup completed successfully!')
    console.log('')
    console.log('📝 Next steps:')
    console.log('1. Applications will now be cached automatically')
    console.log('2. Cache TTL: 5 minutes for applications')
    console.log('3. Check cache health: GET /api/redis/health')
    console.log('4. Clear cache: POST /api/redis/health with action: "clear"')
    console.log('5. Cache is in-memory and will reset when server restarts')
    
  } catch (error) {
    console.error('❌ Memory cache setup failed:', error)
  }
}

// Run the setup
setupRedis() 