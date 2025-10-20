import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const cookies = request.cookies
  const allCookies = Array.from(cookies.getAll())
  
  console.log("🔍 Debug: All cookies received:", allCookies)
  
  const tokenCookie = cookies.get("Gemurai_token")
  console.log("🔍 Debug: Gemurai_token cookie:", tokenCookie)
  
  return NextResponse.json({
    success: true,
    allCookies: allCookies.map((cookie) => ({
      name: cookie.name,
      value: cookie.value,
      path: cookie.path,
      httpOnly: cookie.httpOnly,
      secure: cookie.secure,
      sameSite: cookie.sameSite
    })),
    tokenCookie: tokenCookie ? {
      name: tokenCookie.name,
      value: tokenCookie.value,
      path: tokenCookie.path,
      httpOnly: tokenCookie.httpOnly,
      secure: tokenCookie.secure,
      sameSite: tokenCookie.sameSite
    } : null,
    hasToken: !!tokenCookie
  })
} 