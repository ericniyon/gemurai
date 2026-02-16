export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { RwandaAdministrativeService } from "@/lib/rwanda-divisions"
import {
  hasRwandaDataInDb,
  getProvincesFromDb,
  getDistrictsByProvinceFromDb,
  getSectorsByDistrictFromDb,
  getCellsBySectorFromDb,
  getVillagesByCellFromDb,
  searchLocationsFromDb,
} from "@/lib/rwanda-divisions-db"

export const runtime = "nodejs"

async function useDbForRwanda(): Promise<boolean> {
  try {
    return await hasRwandaDataInDb()
  } catch (err) {
    console.warn("Rwanda divisions: DB check failed, using in-memory data:", err)
    return false
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const searchParams = url.searchParams
    const type = searchParams.get("type")
    const parentId = searchParams.get("parentId")
    const search = searchParams.get("search")

    const useDb = await useDbForRwanda()

    if (search) {
      if (useDb) {
        try {
          const results = await searchLocationsFromDb(search)
          return NextResponse.json(results)
        } catch (err) {
          console.warn("Rwanda divisions: search from DB failed, using in-memory:", err)
        }
      }
      const results = RwandaAdministrativeService.searchLocations(search)
      return NextResponse.json(results)
    }

    switch (type) {
      case "provinces":
        if (useDb) {
          try {
            const provinces = await getProvincesFromDb()
            return NextResponse.json(provinces)
          } catch (err) {
            console.warn("Rwanda divisions: getProvincesFromDb failed, using in-memory:", err)
          }
        }
        return NextResponse.json(RwandaAdministrativeService.getProvinces())

      case "districts":
        if (!parentId) {
          return NextResponse.json({ error: "Province ID required" }, { status: 400 })
        }
        if (useDb) {
          try {
            const districts = await getDistrictsByProvinceFromDb(parentId)
            return NextResponse.json(districts)
          } catch (err) {
            console.warn("Rwanda divisions: getDistrictsByProvinceFromDb failed, using in-memory:", err)
          }
        }
        return NextResponse.json(
          RwandaAdministrativeService.getDistrictsByProvince(parentId)
        )

      case "sectors":
        if (!parentId) {
          return NextResponse.json({ error: "District ID required" }, { status: 400 })
        }
        if (useDb) {
          try {
            const sectors = await getSectorsByDistrictFromDb(parentId)
            return NextResponse.json(sectors)
          } catch (err) {
            console.warn("Rwanda divisions: getSectorsByDistrictFromDb failed, using in-memory:", err)
          }
        }
        return NextResponse.json(
          RwandaAdministrativeService.getSectorsByDistrict(parentId)
        )

      case "cells": {
        if (!parentId) {
          return NextResponse.json({ error: "Sector ID required" }, { status: 400 })
        }
        if (useDb) {
          try {
            const cells = await getCellsBySectorFromDb(parentId)
            return NextResponse.json(cells)
          } catch (err) {
            console.warn("Rwanda divisions: getCellsBySectorFromDb failed, using in-memory:", err)
          }
        }
        const districtId = searchParams.get("districtId") ?? undefined
        return NextResponse.json(
          RwandaAdministrativeService.getCellsBySector(parentId, districtId)
        )
      }

      case "villages": {
        if (!parentId) {
          return NextResponse.json({ error: "Cell ID required" }, { status: 400 })
        }
        if (useDb) {
          try {
            const villages = await getVillagesByCellFromDb(parentId)
            return NextResponse.json(villages)
          } catch (err) {
            console.warn("Rwanda divisions: getVillagesByCellFromDb failed, using in-memory:", err)
          }
        }
        const sectorId = searchParams.get("sectorId") ?? undefined
        return NextResponse.json(
          RwandaAdministrativeService.getVillagesByCell(parentId, sectorId)
        )
      }

      default:
        return NextResponse.json({ error: "Invalid type parameter" }, { status: 400 })
    }
  } catch (error) {
    console.error("Rwanda divisions API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
