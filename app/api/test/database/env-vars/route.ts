import { NextResponse } from "next/server"

export const runtime = "nodejs"

export async function GET() {
  try {
    // Check for required database environment variables
    const requiredVars = [
      "DATABASE_URL",
      "POSTGRES_URL",
      "POSTGRES_PRISMA_URL",
      "DIRECT_URL",
      "POSTGRES_URL_NON_POOLING",
      "PGHOST",
      "PGDATABASE",
      "PGUSER",
      "PGPASSWORD",
    ]

    const variables: Record<string, { set: boolean; masked?: string }> = {}

    requiredVars.forEach((varName) => {
      const value = process.env[varName]
      variables[varName] = {
        set: !!value,
      }

      // Mask sensitive information if present
      if (value) {
        if (varName.includes("URL") || varName.includes("PASSWORD")) {
          // For URLs, show protocol and host but mask credentials and query params
          if (value.includes("://")) {
            try {
              const url = new URL(value)
              variables[varName].masked = `${url.protocol}//${url.host}/${url.pathname}?[masked]`
            } catch {
              variables[varName].masked = `${value.split("://")[0]}://[masked]`
            }
          } else {
            variables[varName].masked = "[masked]"
          }
        } else {
          // For non-sensitive vars, show the actual value
          variables[varName].masked = value
        }
      }
    })

    return NextResponse.json({
      success: true,
      variables,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
