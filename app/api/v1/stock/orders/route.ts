import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  // Redirect to the correct endpoint
  return NextResponse.redirect(new URL('/api/v1/stock-orders', request.url))
}

export async function POST(request: NextRequest) {
  // Redirect to the correct endpoint
  return NextResponse.redirect(new URL('/api/v1/stock-orders', request.url))
}

export async function PATCH(request: NextRequest) {
  // Redirect to the correct endpoint
  return NextResponse.redirect(new URL('/api/v1/stock-orders', request.url))
}

export async function DELETE(request: NextRequest) {
  // Redirect to the correct endpoint
  return NextResponse.redirect(new URL('/api/v1/stock-orders', request.url))
}
