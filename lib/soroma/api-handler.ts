import { NextRequest, NextResponse } from "next/server"
import {
  getSoromaSessionForTenantRoute,
  getSoromaSessionFromToken,
} from "./auth"
import type { SoromaSession } from "./auth"
import { ZodError, type ZodSchema } from "zod"

async function resolveSoromaToken(request: NextRequest): Promise<string | null> {
  const authHeader = request.headers.get("authorization")
  const cookieToken = request.cookies.get("Gemurai_token")?.value
  return authHeader?.replace("Bearer ", "") || cookieToken || null
}

export async function withSoromaAuth(
  request: NextRequest,
  handler: (
    request: NextRequest,
    session: SoromaSession
  ) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    const token = await resolveSoromaToken(request)
    if (!token) {
      return soromaError("Unauthorized", 401, undefined, "AUTH_REQUIRED")
    }

    const session = await getSoromaSessionFromToken(token)
    if (!session) {
      return soromaError(
        "No SOROMA workspace access for this user",
        403,
        undefined,
        "WORKSPACE_ACCESS_DENIED"
      )
    }

    return handler(request, session)
  } catch (error) {
    return handleSoromaApiError(error)
  }
}

/** Tenant APIs must resolve permissions for the URL tenant, not the cookie workspace. */
export async function withSoromaTenantAuth(
  request: NextRequest,
  tenantId: string,
  handler: (
    request: NextRequest,
    session: SoromaSession
  ) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    const token = await resolveSoromaToken(request)
    if (!token) {
      return soromaError("Unauthorized", 401, undefined, "AUTH_REQUIRED")
    }

    const session = await getSoromaSessionForTenantRoute(token, tenantId)
    if (!session) {
      return soromaError(
        "No access to this tenant workspace",
        403,
        undefined,
        "TENANT_ACCESS_DENIED"
      )
    }

    return handler(request, session)
  } catch (error) {
    return handleSoromaApiError(error)
  }
}

export function soromaJson<T>(
  data: T,
  status = 200,
  meta?: Record<string, unknown>
) {
  return NextResponse.json(
    { success: true, data, ...(meta ? { meta } : {}) },
    { status }
  )
}

export function soromaError(
  message: string,
  status = 400,
  details?: unknown,
  code?: string
) {
  return NextResponse.json(
    {
      success: false,
      error: message,
      ...(code ? { code } : {}),
      ...(details ? { details } : {}),
    },
    { status }
  )
}

export async function parseSoromaBody<T>(
  request: NextRequest,
  schema: ZodSchema<T>
): Promise<T> {
  const body = await request.json()
  return schema.parse(body)
}

export function handleSoromaApiError(error: unknown) {
  if (error instanceof ZodError) {
    return soromaError("Validation failed", 422, {
      issues: error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    })
  }
  console.error("[SOROMA API]", error)
  return soromaError("Internal server error", 500, undefined, "INTERNAL_ERROR")
}
