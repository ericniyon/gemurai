import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/database"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query } = body

    if (!query) {
      return NextResponse.json(
        {
          success: false,
          error: "No query provided",
        },
        { status: 400 },
      )
    }

    // Execute the query
    const result = await sql`${query}`

    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        details: {
          name: error.name,
          code: error.code,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
