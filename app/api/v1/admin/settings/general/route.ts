import { NextRequest, NextResponse } from "next/server"
import { verifyAuthToken } from "@/lib/api-auth"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"

const GENERAL_SETTINGS_KEY = "general"

const defaultSettings = {
  platformName: "HarvestPlus by YDEN",
  platformDescription: "Multi-Commodity Aggregation & Settlement Platform",
  defaultLanguage: "en",
  timezone: "Africa/Kigali",
  dateFormat: "DD/MM/YYYY",
  timeFormat: "24h",
  currency: "RWF",
  enableNotifications: true,
  enableEmailNotifications: true,
  enableSMSNotifications: false,
  maintenanceMode: false,
  allowUserRegistration: true,
  requireEmailVerification: false,
  sessionTimeout: 30,
  maxLoginAttempts: 5,
  supportEmail: "support@harvestplus.rw",
  supportPhone: "+250 788 123 456",
}

function getToken(req: NextRequest): string | null {
  const cookieToken = req.cookies.get("Gemurai_token")?.value
  if (cookieToken) return cookieToken
  const authHeader = req.headers.get("authorization")
  if (authHeader?.startsWith("Bearer ")) return authHeader.slice(7)
  return null
}

async function getSettingsFromDb(): Promise<Record<string, unknown> | null> {
  try {
    if (prisma.systemSetting?.findUnique) {
      const row = await prisma.systemSetting.findUnique({
        where: { key: GENERAL_SETTINGS_KEY },
      })
      if (row && typeof row.value === "object" && row.value !== null) return row.value as Record<string, unknown>
      return null
    }
  } catch (_) {
    // fallback to raw
  }
  const rows = await prisma.$queryRaw<Array<{ value: unknown }>>`
    SELECT value FROM system_settings WHERE key = ${GENERAL_SETTINGS_KEY} LIMIT 1
  `
  const row = rows[0]
  if (row && typeof row.value === "object" && row.value !== null) return row.value as Record<string, unknown>
  return null
}

async function saveSettingsToDb(value: Record<string, unknown>): Promise<void> {
  const json = JSON.stringify(value)
  try {
    if (prisma.systemSetting?.upsert) {
      await prisma.systemSetting.upsert({
        where: { key: GENERAL_SETTINGS_KEY },
        create: { key: GENERAL_SETTINGS_KEY, value: value as Prisma.JsonObject, updatedAt: new Date() },
        update: { value: value as Prisma.JsonObject, updatedAt: new Date() },
      })
      return
    }
  } catch (_) {
    // fallback to raw
  }
  await prisma.$executeRaw`
    INSERT INTO system_settings (id, key, value, "updatedAt")
    VALUES (gen_random_uuid(), ${GENERAL_SETTINGS_KEY}, ${json}::jsonb, NOW())
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, "updatedAt" = NOW()
  `
}

/**
 * GET /api/v1/admin/settings/general - Get general settings (from DB or defaults)
 */
export async function GET(req: NextRequest) {
  try {
    const authToken = getToken(req)
    if (!authToken) {
      return NextResponse.json({ success: false, error: "Authorization token required" }, { status: 401 })
    }

    const user = await verifyAuthToken(authToken)
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
    }

    const stored = await getSettingsFromDb()
    const data = stored ? { ...defaultSettings, ...stored } : defaultSettings

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error("Error fetching general settings:", error)
    return NextResponse.json(
      { success: true, data: defaultSettings },
      { status: 200 }
    )
  }
}

/**
 * POST /api/v1/admin/settings/general - Save general settings (persisted to DB)
 */
export async function POST(req: NextRequest) {
  try {
    const authToken = getToken(req)
    if (!authToken) {
      return NextResponse.json({ success: false, error: "Authorization token required" }, { status: 401 })
    }

    const user = await verifyAuthToken(authToken)
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
    }

    const body = await req.json()

    const data = {
      platformName: body.platformName ?? defaultSettings.platformName,
      platformDescription: body.platformDescription ?? defaultSettings.platformDescription,
      defaultLanguage: body.defaultLanguage ?? defaultSettings.defaultLanguage,
      timezone: body.timezone ?? defaultSettings.timezone,
      dateFormat: body.dateFormat ?? defaultSettings.dateFormat,
      timeFormat: body.timeFormat ?? defaultSettings.timeFormat,
      currency: body.currency ?? defaultSettings.currency,
      enableNotifications: body.enableNotifications ?? defaultSettings.enableNotifications,
      enableEmailNotifications: body.enableEmailNotifications ?? defaultSettings.enableEmailNotifications,
      enableSMSNotifications: body.enableSMSNotifications ?? defaultSettings.enableSMSNotifications,
      maintenanceMode: body.maintenanceMode ?? defaultSettings.maintenanceMode,
      allowUserRegistration: body.allowUserRegistration ?? defaultSettings.allowUserRegistration,
      requireEmailVerification: body.requireEmailVerification ?? defaultSettings.requireEmailVerification,
      sessionTimeout: typeof body.sessionTimeout === "number" ? body.sessionTimeout : parseInt(String(body.sessionTimeout), 10) || defaultSettings.sessionTimeout,
      maxLoginAttempts: typeof body.maxLoginAttempts === "number" ? body.maxLoginAttempts : parseInt(String(body.maxLoginAttempts), 10) || defaultSettings.maxLoginAttempts,
      supportEmail: body.supportEmail ?? defaultSettings.supportEmail,
      supportPhone: body.supportPhone ?? defaultSettings.supportPhone,
    }

    await saveSettingsToDb(data)

    return NextResponse.json({
      success: true,
      message: "General settings saved successfully",
      data,
    })
  } catch (error: any) {
    console.error("Error saving general settings:", error)
    const isTableMissing = error?.code === "P2021" || error?.message?.includes("system_settings") || error?.message?.includes("does not exist")
    return NextResponse.json(
      {
        success: false,
        error: isTableMissing ? "Database migration required. Run: npx prisma migrate deploy" : "Failed to save settings",
        details: process.env.NODE_ENV === "development" ? error?.message : undefined,
      },
      { status: 500 }
    )
  }
}
