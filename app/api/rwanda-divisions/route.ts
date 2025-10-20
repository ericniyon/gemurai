export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { RwandaAdministrativeService } from "@/lib/rwanda-divisions"

export const runtime = "nodejs"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const searchParams = url.searchParams
    const type = searchParams.get("type")
    const parentId = searchParams.get("parentId")
    const search = searchParams.get("search")

    if (search) {
      // Search functionality
      const results = RwandaAdministrativeService.searchLocations(search)
      return NextResponse.json(results)
    }

    switch (type) {
      case "provinces":
        const provinces = RwandaAdministrativeService.getProvinces()
        return NextResponse.json(provinces)

      case "districts":
        if (!parentId) {
          return NextResponse.json({ error: "Province ID required" }, { status: 400 })
        }
        const districts = RwandaAdministrativeService.getDistrictsByProvince(parentId)
        return NextResponse.json(districts)

      case "sectors":
        if (!parentId) {
          return NextResponse.json({ error: "District ID required" }, { status: 400 })
        }
        const sectors = RwandaAdministrativeService.getSectorsByDistrict(parentId)
        return NextResponse.json(sectors)

      case "cells":
        if (!parentId) {
          return NextResponse.json({ error: "Sector ID required" }, { status: 400 })
        }
        const cells = RwandaAdministrativeService.getCellsBySector(parentId)
        return NextResponse.json(cells)

      case "villages":
        if (!parentId) {
          return NextResponse.json({ error: "Cell ID required" }, { status: 400 })
        }
        const villages = RwandaAdministrativeService.getVillagesByCell(parentId)
        return NextResponse.json(villages)

      default:
        return NextResponse.json({ error: "Invalid type parameter" }, { status: 400 })
    }
  } catch (error) {
    console.error("Rwanda divisions API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
