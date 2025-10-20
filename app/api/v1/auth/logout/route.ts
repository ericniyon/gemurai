import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    console.log('🚪 Logout API called')
    
    // Create response
    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully"
    })

    // Clear the auth cookie with various configurations to ensure it's removed
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
      expires: new Date(0), // Set to past date to delete
    }

    // Clear the cookie using both methods to ensure it's removed
    response.cookies.set("DJYH_token", "", cookieOptions)
    
    // Also set cookie clearing header for redundancy
    response.headers.set('Set-Cookie', [
      'DJYH_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly'
    ].join(', '))

    // Set cache control headers to prevent caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')

    console.log('✅ Logout successful, cookies cleared')
    return response
  } catch (error: any) {
    console.error("Logout error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Logout failed",
        error: error.message,
      },
      { status: 500 },
    )
  }
} 