export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { sql } from "@/lib/database"
import { RwandaDivisionsDB } from "@/lib/rwanda-divisions-db"

export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { formData, addressData } = body

    console.log("Received form data:", formData)
    console.log("Received address data:", addressData)

    // Validate address hierarchy if provided
    if (addressData && Object.values(addressData).some((val) => val)) {
      const isValidHierarchy = await RwandaDivisionsDB.validateHierarchy(
        addressData.province,
        addressData.district,
        addressData.sector,
        addressData.cell,
        addressData.village,
      )

      if (!isValidHierarchy) {
        return NextResponse.json({ error: "Invalid address hierarchy" }, { status: 400 })
      }
    }

    // Insert application with address references
    const result = await sql`
      INSERT INTO applications (
        email, 
        phone, 
        form_data,
        province_id,
        district_id,
        sector_id,
        cell_id,
        village_id,
        status,
        created_at
      ) VALUES (
        ${formData.email || ""},
        ${formData.phone || ""},
        ${JSON.stringify(formData)},
        ${addressData?.province || null},
        ${addressData?.district || null},
        ${addressData?.sector || null},
        ${addressData?.cell || null},
        ${addressData?.village || null},
        'SUBMITTED',
        NOW()
      )
      RETURNING id, email, phone, status, created_at
    `

    if (result.length > 0) {
      const application = result[0]

      // Get full address path for response
      let fullAddress: Record<string, any> | null = null
      if (addressData?.village) {
        fullAddress = await RwandaDivisionsDB.getFullAddressPath(addressData.village)
      }

      return NextResponse.json({
        success: true,
        application: {
          ...application,
          fullAddress,
        },
        message: "Application submitted successfully",
      })
    } else {
      throw new Error("Failed to create application")
    }
  } catch (error) {
    console.error("Application submission error:", error)
    return NextResponse.json(
      {
        error: "Failed to submit application",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
