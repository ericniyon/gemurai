import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth_token")?.value || null
  return NextResponse.json({ token })
}

export async function POST(request: Request) {
  const { token } = await request.json()
  const response = NextResponse.json({ success: true })

  if (!token) {
    response.cookies.delete("auth_token")
    return response
  }

  response.cookies.set("auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 // 7 days
  })

  return response
} 