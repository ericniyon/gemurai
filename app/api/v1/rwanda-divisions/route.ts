export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { sql } from "@/lib/database"

export const runtime = "nodejs"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const searchParams = url.searchParams
    const type = searchParams.get("type")
    const parentId = searchParams.get("parentId")
    const search = searchParams.get("search")

    if (search) {
      // Search functionality across all levels
      const searchTerm = `%${search.toLowerCase()}%`

      const provinces = await sql`
        SELECT id, name, 'province' as type FROM provinces 
        WHERE LOWER(name) LIKE ${searchTerm}
      `

      const districts = await sql`
        SELECT d.id, d.name, 'district' as type, p.name as province_name 
        FROM districts d 
        JOIN provinces p ON d.province_id = p.id
        WHERE LOWER(d.name) LIKE ${searchTerm}
      `

      const sectors = await sql`
        SELECT s.id, s.name, 'sector' as type, d.name as district_name, p.name as province_name
        FROM sectors s 
        JOIN districts d ON s.district_id = d.id
        JOIN provinces p ON d.province_id = p.id
        WHERE LOWER(s.name) LIKE ${searchTerm}
      `

      return NextResponse.json({
        provinces,
        districts,
        sectors,
      })
    }

    switch (type) {
      case "provinces":
        const provinces = await sql`
          SELECT id, name FROM provinces 
          WHERE id IN ('eastern', 'northern')
          ORDER BY name
        `
        return NextResponse.json(provinces)

      case "districts":
        if (!parentId) {
          return NextResponse.json({ error: "Province ID required" }, { status: 400 })
        }
        const districts = await sql`
          SELECT id, name FROM districts 
          WHERE province_id = ${parentId} 
          ORDER BY name
        `
        return NextResponse.json(districts)

      case "sectors":
        if (!parentId) {
          return NextResponse.json({ error: "District ID required" }, { status: 400 })
        }
        const sectors = await sql`
          SELECT id, name FROM sectors 
          WHERE district_id = ${parentId} 
          ORDER BY name
        `
        return NextResponse.json(sectors)

      case "cells":
        if (!parentId) {
          return NextResponse.json({ error: "Sector ID required" }, { status: 400 })
        }
        const cells = await sql`
          SELECT id, name FROM cells 
          WHERE sector_id = ${parentId} 
          ORDER BY name
        `
        return NextResponse.json(cells)

      case "villages":
        if (!parentId) {
          return NextResponse.json({ error: "Cell ID required" }, { status: 400 })
        }
        const villages = await sql`
          SELECT id, name FROM villages 
          WHERE cell_id = ${parentId} 
          ORDER BY name
        `
        return NextResponse.json(villages)

      default:
        return NextResponse.json({ error: "Invalid type parameter" }, { status: 400 })
    }
  } catch (error) {
    console.error("Rwanda divisions API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
