import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { cookies } from 'next/headers'
import { verifyAuthToken } from '@/lib/api-auth'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Checking authentication status...')
    
    // Test NextAuth session
    const session = await getServerSession(authOptions)
    console.log('📊 NextAuth session:', session ? 'Found' : 'Not found')
    
    // Test custom token
    const cookieStore = await cookies()
    const token = cookieStore.get("Gemurai_token")
    console.log('📊 Custom token:', token ? 'Found' : 'Not found')
    
    let user = null
    let tokenValid = false
    
    if (token) {
      try {
        user = await verifyAuthToken(token.value)
        tokenValid = true
        console.log('✅ Token verification successful')
      } catch (error) {
        console.log('❌ Token verification failed:', error)
        tokenValid = false
      }
    }
    
    return NextResponse.json({
      success: true,
      authenticated: !!(session || (token && tokenValid)),
      nextAuthSession: !!session,
      customToken: !!token,
      tokenValid: tokenValid,
      user: user ? {
        id: user.id,
        email: user.email,
        role: user.role
      } : null,
      timestamp: new Date().toISOString(),
      message: session ? 'NextAuth session active' : 
               (token && tokenValid) ? 'Custom token valid' :
               token ? 'Token present but invalid' : 'No authentication found'
    })
    
  } catch (error) {
    console.error('❌ Error checking authentication status:', error)
    return NextResponse.json(
      { 
        success: false,
        authenticated: false,
        error: "Failed to check authentication status",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
