import { NextResponse } from "next/server"
import { getPublicSettings } from "@/lib/settings-public"

/**
 * GET /api/settings/public - Public general settings (no auth)
 * Used by contact page, footer, and marketing pages.
 */
export async function GET() {
  try {
    const data = await getPublicSettings()
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Error fetching public settings:", error)
    const { getPublicSettings: getDefaults } = await import("@/lib/settings-public")
    const data = await getDefaults().catch(() => null)
    return NextResponse.json({ success: true, data: data ?? {} }, { status: 200 })
  }
}
