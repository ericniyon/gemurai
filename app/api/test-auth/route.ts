import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { cookies } from 'next/headers'
import { verifyAuthToken } from '@/lib/api-auth'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Testing authentication status...')
    
    // Test NextAuth session
    const session = await getServerSession(authOptions)
    console.log('📊 NextAuth session:', session ? 'Found' : 'Not found')
    
    // Test custom token
    const cookieStore = await cookies()
    const token = cookieStore.get("Gemurai_token")
    console.log('📊 Custom token:', token ? 'Found' : 'Not found')
    
    let user = null
    if (token) {
      try {
        user = await verifyAuthToken(token.value)
        console.log('✅ Token verification successful')
      } catch (error) {
        console.log('❌ Token verification failed:', error)
      }
    }
    
    return NextResponse.json({
      success: true,
      nextAuthSession: !!session,
      customToken: !!token,
      user: user ? {
        id: user.id,
        email: user.email,
        role: user.role
      } : null,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Error testing authentication:', error)
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to test authentication",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
