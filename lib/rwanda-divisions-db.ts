import { prisma } from "@/lib/prisma"

export interface RwandaProvinceDto {
  id: string
  name: string
  slug?: string
}

export interface RwandaDistrictDto {
  id: string
  name: string
  provinceId: string
  slug?: string
}

export interface RwandaSectorDto {
  id: string
  name: string
  districtId: string
  slug?: string
}

export interface RwandaCellDto {
  id: string
  name: string
  sectorId: string
  slug?: string
}

export interface RwandaVillageDto {
  id: string
  name: string
  cellId: string
  slug?: string
}

export interface SearchLocationResult {
  type: "province" | "district" | "sector" | "cell" | "village"
  id: string
  name: string
  path?: string
}

export async function getProvincesFromDb(): Promise<RwandaProvinceDto[]> {
  const rows = await prisma.rwanda_province.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true },
  })
  return rows
}

export async function getDistrictsByProvinceFromDb(
  provinceId: string
): Promise<RwandaDistrictDto[]> {
  const rows = await prisma.rwanda_district.findMany({
    where: { provinceId },
    orderBy: { name: "asc" },
    select: { id: true, name: true, provinceId: true, slug: true },
  })
  return rows
}

export async function getSectorsByDistrictFromDb(
  districtId: string
): Promise<RwandaSectorDto[]> {
  const rows = await prisma.rwanda_sector.findMany({
    where: { districtId },
    orderBy: { name: "asc" },
    select: { id: true, name: true, districtId: true, slug: true },
  })
  return rows
}

export async function getCellsBySectorFromDb(
  sectorId: string
): Promise<RwandaCellDto[]> {
  const rows = await prisma.rwanda_cell.findMany({
    where: { sectorId },
    orderBy: { name: "asc" },
    select: { id: true, name: true, sectorId: true, slug: true },
  })
  return rows
}

export async function getVillagesByCellFromDb(
  cellId: string
): Promise<RwandaVillageDto[]> {
  const rows = await prisma.rwanda_village.findMany({
    where: { cellId },
    orderBy: { name: "asc" },
    select: { id: true, name: true, cellId: true, slug: true },
  })
  return rows
}

const SEARCH_LIMIT = 50

export async function searchLocationsFromDb(
  search: string
): Promise<SearchLocationResult[]> {
  const term = search.trim().toLowerCase()
  if (!term) return []

  const results: SearchLocationResult[] = []

  const [provinces, districts, sectors, cells, villages] = await Promise.all([
    prisma.rwanda_province.findMany({
      where: {
        OR: [
          { name: { contains: term, mode: "insensitive" } },
          { slug: { contains: term, mode: "insensitive" } },
        ],
      },
      take: SEARCH_LIMIT,
      select: { id: true, name: true },
    }),
    prisma.rwanda_district.findMany({
      where: {
        OR: [
          { name: { contains: term, mode: "insensitive" } },
          { slug: { contains: term, mode: "insensitive" } },
        ],
      },
      take: SEARCH_LIMIT,
      include: { province: { select: { name: true } } },
    }),
    prisma.rwanda_sector.findMany({
      where: {
        OR: [
          { name: { contains: term, mode: "insensitive" } },
          { slug: { contains: term, mode: "insensitive" } },
        ],
      },
      take: SEARCH_LIMIT,
      include: {
        district: { select: { name: true, province: { select: { name: true } } } },
      },
    }),
    prisma.rwanda_cell.findMany({
      where: {
        OR: [
          { name: { contains: term, mode: "insensitive" } },
          { slug: { contains: term, mode: "insensitive" } },
        ],
      },
      take: SEARCH_LIMIT,
      include: {
        sector: {
          select: {
            name: true,
            district: {
              select: { name: true, province: { select: { name: true } } },
            },
          },
        },
      },
    }),
    prisma.rwanda_village.findMany({
      where: {
        OR: [
          { name: { contains: term, mode: "insensitive" } },
          { slug: { contains: term, mode: "insensitive" } },
        ],
      },
      take: SEARCH_LIMIT,
      include: {
        cell: {
          select: {
            name: true,
            sector: {
              select: {
                name: true,
                district: {
                  select: {
                    name: true,
                    province: { select: { name: true } },
                  },
                },
              },
            },
          },
        },
      },
    }),
  ])

  for (const p of provinces) {
    results.push({ type: "province", id: p.id, name: p.name, path: p.name })
  }
  for (const d of districts) {
    results.push({
      type: "district",
      id: d.id,
      name: d.name,
      path: `${d.province.name} / ${d.name}`,
    })
  }
  for (const s of sectors) {
    const d = s.district
    results.push({
      type: "sector",
      id: s.id,
      name: s.name,
      path: `${d.province.name} / ${d.name} / ${s.name}`,
    })
  }
  for (const c of cells) {
    const s = c.sector
    const d = s.district
    results.push({
      type: "cell",
      id: c.id,
      name: c.name,
      path: `${d.province.name} / ${d.name} / ${s.name} / ${c.name}`,
    })
  }
  for (const v of villages) {
    const c = v.cell
    const s = c.sector
    const d = s.district
    results.push({
      type: "village",
      id: v.id,
      name: v.name,
      path: `${d.province.name} / ${d.name} / ${s.name} / ${c.name} / ${v.name}`,
    })
  }

  return results.slice(0, SEARCH_LIMIT)
}

export async function hasRwandaDataInDb(): Promise<boolean> {
  try {
    const count = await prisma.rwanda_province.count()
    return count > 0
  } catch {
    return false
  }
}

/** Validate that province -> district -> sector -> cell -> village form a valid hierarchy (by ID). */
export async function validateHierarchyFromDb(
  provinceId?: string | null,
  districtId?: string | null,
  sectorId?: string | null,
  cellId?: string | null,
  villageId?: string | null
): Promise<boolean> {
  if (!provinceId) return true
  try {
    const province = await prisma.rwanda_province.findUnique({ where: { id: provinceId } })
    if (!province) return false
    if (!districtId) return true

    const district = await prisma.rwanda_district.findFirst({
      where: { id: districtId, provinceId },
    })
    if (!district) return false
    if (!sectorId) return true

    const sector = await prisma.rwanda_sector.findFirst({
      where: { id: sectorId, districtId },
    })
    if (!sector) return false
    if (!cellId) return true

    const cell = await prisma.rwanda_cell.findFirst({
      where: { id: cellId, sectorId },
    })
    if (!cell) return false
    if (!villageId) return true

    const village = await prisma.rwanda_village.findFirst({
      where: { id: villageId, cellId },
    })
    return !!village
  } catch {
    return false
  }
}

/** Get full address path for a village ID (DB only). Returns null if not found. */
export async function getFullAddressPathFromDb(
  villageId: string
): Promise<{ province: string; district: string; sector: string; cell: string; village: string } | null> {
  try {
    const village = await prisma.rwanda_village.findUnique({
      where: { id: villageId },
      include: {
        cell: {
          include: {
            sector: {
              include: {
                district: {
                  include: { province: true },
                },
              },
            },
          },
        },
      },
    })
    if (!village?.cell?.sector?.district?.province) return null
    const { cell, sector, district, province } = {
      cell: village.cell,
      sector: village.cell.sector,
      district: village.cell.sector.district,
      province: village.cell.sector.district.province,
    }
    return {
      province: province.name,
      district: district.name,
      sector: sector.name,
      cell: cell.name,
      village: village.name,
    }
  } catch {
    return null
  }
}

/** DB-backed helpers for validation and full address path. Use when DB has Rwanda data. */
export const RwandaDivisionsDB = {
  validateHierarchy: validateHierarchyFromDb,
  getFullAddressPath: getFullAddressPathFromDb,
}
