import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Testing interview scores API...')
    
    // Test database connection first
    await prisma.$connect()
    console.log('✅ Database connected')
    
    // Test basic query
    const userCount = await prisma.user.count()
    console.log('✅ User count:', userCount)
    
    // Test application query
    const applicationId = 'APP-1751546863833-4ijo5du'
    const application = await prisma.application.findUnique({
      where: { id: applicationId }
    })
    console.log('✅ Application found:', !!application)
    
    return NextResponse.json({
      success: true,
      message: 'API test successful',
      data: {
        userCount,
        applicationExists: !!application,
        applicationId
      }
    })
    
  } catch (error) {
    console.error('❌ API test failed:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'API test failed', 
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}
