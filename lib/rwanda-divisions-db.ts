import { sql } from "@/lib/database"

export interface Province {
  id: string
  name: string
}

export interface District {
  id: string
  name: string
  province_id: string
}

export interface Sector {
  id: string
  name: string
  district_id: string
}

export interface Cell {
  id: string
  name: string
  sector_id: string
}

export interface Village {
  id: string
  name: string
  cell_id: string
}

export class RwandaDivisionsDB {
  // Get all provinces
  static async getProvinces(): Promise<Province[]> {
    try {
      const result = await sql`
        SELECT id, name FROM provinces ORDER BY name
      `
      return result as Province[]
    } catch (error) {
      console.error("Error fetching provinces:", error)
      return []
    }
  }

  // Get districts by province ID
  static async getDistrictsByProvince(provinceId: string): Promise<District[]> {
    try {
      const result = await sql`
        SELECT id, name, province_id FROM districts 
        WHERE province_id = ${provinceId} 
        ORDER BY name
      `
      return result as District[]
    } catch (error) {
      console.error("Error fetching districts:", error)
      return []
    }
  }

  // Get sectors by district ID
  static async getSectorsByDistrict(districtId: string): Promise<Sector[]> {
    try {
      const result = await sql`
        SELECT id, name, district_id FROM sectors 
        WHERE district_id = ${districtId} 
        ORDER BY name
      `
      return result as Sector[]
    } catch (error) {
      console.error("Error fetching sectors:", error)
      return []
    }
  }

  // Get cells by sector ID
  static async getCellsBySector(sectorId: string): Promise<Cell[]> {
    try {
      const result = await sql`
        SELECT id, name, sector_id FROM cells 
        WHERE sector_id = ${sectorId} 
        ORDER BY name
      `
      return result as Cell[]
    } catch (error) {
      console.error("Error fetching cells:", error)
      return []
    }
  }

  // Get villages by cell ID
  static async getVillagesByCell(cellId: string): Promise<Village[]> {
    try {
      const result = await sql`
        SELECT id, name, cell_id FROM villages 
        WHERE cell_id = ${cellId} 
        ORDER BY name
      `
      return result as Village[]
    } catch (error) {
      console.error("Error fetching villages:", error)
      return []
    }
  }

  // Get full address path by village ID
  static async getFullAddressPath(villageId: string) {
    try {
      const result = await sql`
        SELECT 
          v.id as village_id, v.name as village_name,
          c.id as cell_id, c.name as cell_name,
          s.id as sector_id, s.name as sector_name,
          d.id as district_id, d.name as district_name,
          p.id as province_id, p.name as province_name
        FROM villages v
        JOIN cells c ON v.cell_id = c.id
        JOIN sectors s ON c.sector_id = s.id
        JOIN districts d ON s.district_id = d.id
        JOIN provinces p ON d.province_id = p.id
        WHERE v.id = ${villageId}
      `

      if (result.length > 0) {
        return result[0]
      }
      return null
    } catch (error) {
      console.error("Error fetching full address path:", error)
      return null
    }
  }

  // Validate administrative division hierarchy
  static async validateHierarchy(
    provinceId?: string,
    districtId?: string,
    sectorId?: string,
    cellId?: string,
    villageId?: string,
  ): Promise<boolean> {
    try {
      if (!provinceId) return true

      // Check if province exists
      const provinceExists = await sql`
        SELECT 1 FROM provinces WHERE id = ${provinceId}
      `
      if (provinceExists.length === 0) return false

      if (!districtId) return true

      // Check if district belongs to province
      const districtExists = await sql`
        SELECT 1 FROM districts WHERE id = ${districtId} AND province_id = ${provinceId}
      `
      if (districtExists.length === 0) return false

      if (!sectorId) return true

      // Check if sector belongs to district
      const sectorExists = await sql`
        SELECT 1 FROM sectors WHERE id = ${sectorId} AND district_id = ${districtId}
      `
      if (sectorExists.length === 0) return false

      if (!cellId) return true

      // Check if cell belongs to sector
      const cellExists = await sql`
        SELECT 1 FROM cells WHERE id = ${cellId} AND sector_id = ${sectorId}
      `
      if (cellExists.length === 0) return false

      if (!villageId) return true

      // Check if village belongs to cell
      const villageExists = await sql`
        SELECT 1 FROM villages WHERE id = ${villageId} AND cell_id = ${cellId}
      `
      return villageExists.length > 0
    } catch (error) {
      console.error("Error validating hierarchy:", error)
      return false
    }
  }

  // Search across all administrative levels
  static async searchLocations(query: string) {
    try {
      const searchTerm = `%${query.toLowerCase()}%`

      const provinces = await sql`
        SELECT id, name, 'province' as type FROM provinces 
        WHERE LOWER(name) LIKE ${searchTerm}
        ORDER BY name
      `

      const districts = await sql`
        SELECT d.id, d.name, 'district' as type, p.name as province_name 
        FROM districts d 
        JOIN provinces p ON d.province_id = p.id
        WHERE LOWER(d.name) LIKE ${searchTerm}
        ORDER BY d.name
      `

      const sectors = await sql`
        SELECT s.id, s.name, 'sector' as type, d.name as district_name, p.name as province_name
        FROM sectors s 
        JOIN districts d ON s.district_id = d.id
        JOIN provinces p ON d.province_id = p.id
        WHERE LOWER(s.name) LIKE ${searchTerm}
        ORDER BY s.name
      `

      const cells = await sql`
        SELECT c.id, c.name, 'cell' as type, s.name as sector_name, d.name as district_name
        FROM cells c
        JOIN sectors s ON c.sector_id = s.id
        JOIN districts d ON s.district_id = d.id
        WHERE LOWER(c.name) LIKE ${searchTerm}
        ORDER BY c.name
      `

      const villages = await sql`
        SELECT v.id, v.name, 'village' as type, c.name as cell_name, s.name as sector_name
        FROM villages v
        JOIN cells c ON v.cell_id = c.id
        JOIN sectors s ON c.sector_id = s.id
        WHERE LOWER(v.name) LIKE ${searchTerm}
        ORDER BY v.name
      `

      return {
        provinces,
        districts,
        sectors,
        cells,
        villages,
      }
    } catch (error) {
      console.error("Error searching locations:", error)
      return {
        provinces: [],
        districts: [],
        sectors: [],
        cells: [],
        villages: [],
      }
    }
  }
}
