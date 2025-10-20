import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { z } from "zod"

// Utility: check if new role system tables exist
async function tableExists(tableName: string): Promise<boolean> {
  try {
    const result = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = ${tableName}
      )
    ` as any[]
    return result[0]?.exists || false
  } catch (error) {
    console.error(`Error checking if table ${tableName} exists:`, error)
    return false
  }
}

// Extract a district-like value by scanning any nested keys containing "district"
function extractDistrictFromFormData(formData: any): string {
  try {
    if (!formData || typeof formData !== 'object') return ""
    const stack = [formData]
    while (stack.length) {
      const current = stack.pop() as any
      if (!current || typeof current !== 'object') continue
      for (const key of Object.keys(current)) {
        const val = (current as any)[key]
        const lower = key.toLowerCase()
        if (lower.includes('district')) {
          if (typeof val === 'string' && val.trim()) return val.trim()
          if (val && typeof val === 'object') {
            const nameLike = (val as any).name || (val as any).label || (val as any).value
            if (typeof nameLike === 'string' && nameLike.trim()) return nameLike.trim()
          }
        }
        if (val && typeof val === 'object') stack.push(val)
      }
    }
    return ""
  } catch {
    return ""
  }
}

const dccSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  location: z.string().min(1, "Location is required"),
})

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    // Only superadmins/admins should access
    if (!["SUPER_ADMIN", "ADMIN"].includes((session.user as any).role)) {
      return NextResponse.json(
        { success: false, message: "Access denied" },
        { status: 403 }
      )
    }

    // Determine role system schema
    const [rolesTableExists, userRoleTableExists] = await Promise.all([
      tableExists("roles"),
      tableExists("user_role_assignments"),
    ])

    let dccUsers: Array<{
      id: string
      name: string
      email: string
      phone: string | null
      location: string
      status: "ACTIVE" | "INACTIVE"
      createdAt: string
      updatedAt: string
    }> = []

    if (rolesTableExists && userRoleTableExists) {
      // New role system: join roles and latest application to derive district
      const rows = await (prisma as any).$queryRawUnsafe(`
        SELECT 
          u.id,
          u.name,
          u.email,
          u.phone,
          u."isActive" as "isActive",
          u."createdAt" as "createdAt",
          u."updatedAt" as "updatedAt",
          COALESCE(
            app.form_district,
            app.form_q11_district,
            app.form_address_district,
            app.form_location_district,
            NULLIF(TRIM(SPLIT_PART(dp.location, ',', 2)), ''),
            NULLIF(TRIM(SPLIT_PART(dp.location, ',', 1)), '')
          ) AS derived_district
        FROM "users" u
        JOIN "user_role_assignments" ura ON ura."userId" = u.id AND ura."isActive" = true
        JOIN "roles" r ON r.id = ura."roleId" AND r.name = 'DCC'
        LEFT JOIN "dcc_profiles" dp ON dp."userId" = u.id
        LEFT JOIN LATERAL (
          SELECT 
            a."createdAt",
            a."formData"->>'district' AS form_district,
            a."formData"->'q11'->>'district' AS form_q11_district,
            a."formData"->'address'->>'district' AS form_address_district,
            a."formData"->'location'->>'district' AS form_location_district
          FROM "applications" a
          WHERE a."userId" = u.id
          ORDER BY a."createdAt" DESC
          LIMIT 1
        ) app ON TRUE
        ORDER BY u."createdAt" DESC
      `)

      dccUsers = (rows as any[]).map((row) => ({
        id: row.id,
        name: row.name,
        email: row.email,
        phone: row.phone || null,
        location: row.derived_district || "",
        status: row.isActive ? "ACTIVE" : "INACTIVE",
        createdAt: new Date(row.createdAt).toISOString(),
        updatedAt: new Date(row.updatedAt).toISOString(),
      }))
    } else {
      // Old schema: role stored on users table; join latest application
      const rows = await (prisma as any).$queryRawUnsafe(`
        SELECT 
          u.id,
          u.name,
          u.email,
          u.phone,
          u."isActive" as "isActive",
          u."createdAt" as "createdAt",
          u."updatedAt" as "updatedAt",
          COALESCE(
            app.form_district,
            app.form_q11_district,
            app.form_address_district,
            app.form_location_district
          ) AS derived_district
        FROM "users" u
        WHERE u.role = 'DCC'
        LEFT JOIN LATERAL (
          SELECT 
            a."createdAt",
            a."formData"->>'district' AS form_district,
            a."formData"->'q11'->>'district' AS form_q11_district,
            a."formData"->'address'->>'district' AS form_address_district,
            a."formData"->'location'->>'district' AS form_location_district
          FROM "applications" a
          WHERE a."userId" = u.id
          ORDER BY a."createdAt" DESC
          LIMIT 1
        ) app ON TRUE
        ORDER BY u."createdAt" DESC
      `)

      dccUsers = (rows as any[]).map((row) => ({
        id: row.id,
        name: row.name,
        email: row.email,
        phone: row.phone || null,
        location: row.derived_district || "",
        status: row.isActive ? "ACTIVE" : "INACTIVE",
        createdAt: new Date(row.createdAt).toISOString(),
        updatedAt: new Date(row.updatedAt).toISOString(),
      }))
    }

    // Fallback: derive district by searching applications using phone if still missing
    function generatePhoneVariants(phone: string): string[] {
      const raw = (phone || "").trim()
      const digits = raw.replace(/\D/g, "")
      const variants = new Set<string>()
      if (!raw) return []
      variants.add(raw)
      variants.add(digits)
      if (raw.startsWith("+250")) {
        const rest = raw.slice(4)
        variants.add("0" + rest)
        variants.add("250" + rest)
      } else if (raw.startsWith("250")) {
        const rest = raw.slice(3)
        variants.add("+250" + rest)
        variants.add("0" + rest)
      } else if (raw.startsWith("0")) {
        const rest = raw.slice(1)
        variants.add("+250" + rest)
        variants.add("250" + rest)
      }
      return Array.from(variants)
    }

    async function findDistrictByPhone(phone: string): Promise<string> {
      const candidates = generatePhoneVariants(phone)
      for (const p of candidates) {
        try {
          const rows = await (prisma as any).$queryRawUnsafe(
            `SELECT COALESCE(
                "formData"->>'district',
                "formData"->'q11'->>'district',
                "formData"->'address'->>'district',
                "formData"->'location'->>'district'
              ) AS district
             FROM "applications"
             WHERE (
               "formData"->>'phone' = $1 OR
               "formData"->'q3'->>'phone' = $1 OR
               "formData"->>'msisdn' = $1 OR
               "formData"->'contact'->>'phone' = $1
             )
             ORDER BY "createdAt" DESC
             LIMIT 1`,
            p
          )
          const d = rows?.[0]?.district
          if (d && typeof d === "string" && d.trim().length > 0) return d
        } catch (e) {
          // continue trying other variants
        }
      }
      return ""
    }

    const enriched = await Promise.all(
      dccUsers.map(async (u) => {
        if (!u.location) {
          // 1) try latest application by userId
          try {
            const app = await prisma.application.findFirst({
              where: { userId: u.id },
              orderBy: { createdAt: 'desc' },
              select: { formData: true }
            })
            const fromApp = extractDistrictFromFormData((app as any)?.formData)
            if (fromApp) {
              return { ...u, location: fromApp }
            }
          } catch {}

          // 2) fallback to phone-based search
          if (u.phone) {
            const district = await findDistrictByPhone(u.phone)
            if (district) {
              return { ...u, location: district }
            }
          }
        }
        return u
      })
    )

    return NextResponse.json({ success: true, dccs: enriched })
  } catch (error) {
    console.error("Error fetching DCCs:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch DCCs" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = dccSchema.parse(body)

    const dcc = await prisma.dCC.create({
      data: {
        ...validatedData,
        status: "ACTIVE",
      },
    })

    return NextResponse.json({ success: true, dcc })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error("Error creating DCC:", error)
    return NextResponse.json(
      { success: false, message: "Failed to create DCC" },
      { status: 500 }
    )
  }
} 