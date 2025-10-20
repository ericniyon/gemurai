import { NextRequest, NextResponse } from 'next/server'
import { cacheService } from '@/lib/services/memory-cache-service'

export async function POST(request: NextRequest) {
  try {
    console.log('🧹 Clearing applications cache...')
    
    // Clear the applications cache
    await cacheService.delete('applications')
    
    console.log('✅ Applications cache cleared successfully')
    
    return NextResponse.json({
      success: true,
      message: 'Applications cache cleared successfully'
    })
    
  } catch (error) {
    console.error('❌ Error clearing cache:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
