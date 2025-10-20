import { RwandaAdministrativeService } from "./rwanda-divisions"

export interface AddressValidationResult {
  isValid: boolean
  errors: string[]
  suggestions?: string[]
}

export class RwandaAddressValidator {
  static validateAddress(
    provinceId?: string,
    districtId?: string,
    sectorId?: string,
    cellId?: string,
    villageId?: string,
  ): AddressValidationResult {
    const errors: string[] = []
    const suggestions: string[] = []

    // Check if province is provided
    if (!provinceId) {
      errors.push("Province is required")
      return { isValid: false, errors, suggestions }
    }

    // Validate province exists
    const provinces = RwandaAdministrativeService.getProvinces()
    const province = provinces.find((p) => p.id === provinceId)
    if (!province) {
      errors.push("Invalid province selected")
      suggestions.push("Please select a valid province from the list")
      return { isValid: false, errors, suggestions }
    }

    // Check district if provided
    if (districtId) {
      const districts = RwandaAdministrativeService.getDistrictsByProvince(provinceId)
      const district = districts.find((d) => d.id === districtId)
      if (!district) {
        errors.push("Invalid district for the selected province")
        suggestions.push(`Available districts in ${province.name}: ${districts.map((d) => d.name).join(", ")}`)
        return { isValid: false, errors, suggestions }
      }

      // Check sector if provided
      if (sectorId) {
        const sectors = RwandaAdministrativeService.getSectorsByDistrict(districtId)
        const sector = sectors.find((s) => s.id === sectorId)
        if (!sector) {
          errors.push("Invalid sector for the selected district")
          suggestions.push(`Available sectors in ${district.name}: ${sectors.map((s) => s.name).join(", ")}`)
          return { isValid: false, errors, suggestions }
        }

        // Check cell if provided
        if (cellId) {
          const cells = RwandaAdministrativeService.getCellsBySector(sectorId)
          const cell = cells.find((c) => c.id === cellId)
          if (!cell) {
            errors.push("Invalid cell for the selected sector")
            suggestions.push(`Available cells in ${sector.name}: ${cells.map((c) => c.name).join(", ")}`)
            return { isValid: false, errors, suggestions }
          }

          // Check village if provided
          if (villageId) {
            const villages = RwandaAdministrativeService.getVillagesByCell(cellId)
            const village = villages.find((v) => v.id === villageId)
            if (!village) {
              errors.push("Invalid village for the selected cell")
              suggestions.push(`Available villages in ${cell.name}: ${villages.map((v) => v.name).join(", ")}`)
              return { isValid: false, errors, suggestions }
            }
          }
        }
      }
    }

    return { isValid: true, errors: [] }
  }

  static getFullAddressString(
    provinceId?: string,
    districtId?: string,
    sectorId?: string,
    cellId?: string,
    villageId?: string,
  ): string {
    const parts: string[] = []

    if (villageId) {
      const fullPath = RwandaAdministrativeService.getFullAddressPath(villageId)
      if (fullPath) {
        return `${fullPath.village}, ${fullPath.cell}, ${fullPath.sector}, ${fullPath.district}, ${fullPath.province}`
      }
    }

    // Fallback to building address from individual parts
    const provinces = RwandaAdministrativeService.getProvinces()
    const province = provinces.find((p) => p.id === provinceId)
    if (province) parts.push(province.name)

    if (districtId) {
      const districts = RwandaAdministrativeService.getDistrictsByProvince(provinceId!)
      const district = districts.find((d) => d.id === districtId)
      if (district) parts.unshift(district.name)
    }

    if (sectorId) {
      const sectors = RwandaAdministrativeService.getSectorsByDistrict(districtId!)
      const sector = sectors.find((s) => s.id === sectorId)
      if (sector) parts.unshift(sector.name)
    }

    if (cellId) {
      const cells = RwandaAdministrativeService.getCellsBySector(sectorId!)
      const cell = cells.find((c) => c.id === cellId)
      if (cell) parts.unshift(cell.name)
    }

    return parts.join(", ")
  }
}
