/**
 * Geo-aware reporting utilities
 * For aggregating data by zones, distance bands, and agent coverage
 */

import {
  calculateDistance,
  findWithinRadius,
  type Coordinates,
} from "./geo-calculations"

export interface EntityWithLocation {
  id: string
  latitude?: number | null
  longitude?: number | null
  [key: string]: any
}

export interface ZoneDefinition {
  name: string
  center: Coordinates
  radius: number // in kilometers
}

export interface DistanceBand {
  min: number // in kilometers
  max: number // in kilometers
  label: string
}

export interface ZoneStats {
  zone: string
  entityCount: number
  totalProduction: number
  totalAmount: number
  averagePerEntity: number
}

export interface DistanceBandStats {
  band: string
  entityCount: number
  totalIntake: number
  totalAmount: number
  averageDistance: number
}

export interface AgentCoverage {
  agentId: string
  agentName: string
  entitiesCovered: number
  totalProduction: number
  coverageRadius: number
  averageDistance: number
  zones: string[]
}

/**
 * Define zones based on MCC location and radius
 */
export function defineZones(
  center: Coordinates,
  zoneConfigs: Array<{ name: string; radius: number }>
): ZoneDefinition[] {
  return zoneConfigs.map((config) => ({
    name: config.name,
    center,
    radius: config.radius,
  }))
}

/**
 * Default zone configuration (concentric circles from MCC)
 */
export function getDefaultZones(center: Coordinates): ZoneDefinition[] {
  return [
    { name: "Zone 1 (0-5km)", center, radius: 5 },
    { name: "Zone 2 (5-10km)", center, radius: 10 },
    { name: "Zone 3 (10-20km)", center, radius: 20 },
    { name: "Zone 4 (20-50km)", center, radius: 50 },
    { name: "Zone 5 (50km+)", center, radius: Infinity },
  ]
}

/**
 * Default distance bands
 */
export function getDefaultDistanceBands(): DistanceBand[] {
  return [
    { min: 0, max: 5, label: "0-5 km" },
    { min: 5, max: 10, label: "5-10 km" },
    { min: 10, max: 20, label: "10-20 km" },
    { min: 20, max: 50, label: "20-50 km" },
    { min: 50, max: Infinity, label: "50+ km" },
  ]
}

/**
 * Assign entity to a zone
 */
export function assignToZone(
  entity: EntityWithLocation,
  zones: ZoneDefinition[]
): string | null {
  if (
    !entity.latitude ||
    !entity.longitude ||
    entity.latitude === null ||
    entity.longitude === null
  ) {
    return "Unknown"
  }

  const entityLocation: Coordinates = {
    latitude: entity.latitude,
    longitude: entity.longitude,
  }

  // Check zones in order (smallest to largest)
  const sortedZones = [...zones].sort((a, b) => a.radius - b.radius)

  for (const zone of sortedZones) {
    const distance = calculateDistance(zone.center, entityLocation)
    if (distance <= zone.radius) {
      return zone.name
    }
  }

  return "Out of Range"
}

/**
 * Assign entity to distance band
 */
export function assignToDistanceBand(
  entity: EntityWithLocation,
  center: Coordinates,
  bands: DistanceBand[]
): string | null {
  if (
    !entity.latitude ||
    !entity.longitude ||
    entity.latitude === null ||
    entity.longitude === null
  ) {
    return "Unknown"
  }

  const entityLocation: Coordinates = {
    latitude: entity.latitude,
    longitude: entity.longitude,
  }

  const distance = calculateDistance(center, entityLocation)

  for (const band of bands) {
    if (distance >= band.min && distance < band.max) {
      return band.label
    }
  }

  return "Out of Range"
}

/**
 * Calculate production by zone
 */
export function calculateProductionByZone(
  entities: EntityWithLocation[],
  zones: ZoneDefinition[],
  productionField: string = "totalLiters",
  amountField: string = "totalAmount"
): ZoneStats[] {
  const zoneStats: Record<string, ZoneStats> = {}

  // Initialize zones
  zones.forEach((zone) => {
    zoneStats[zone.name] = {
      zone: zone.name,
      entityCount: 0,
      totalProduction: 0,
      totalAmount: 0,
      averagePerEntity: 0,
    }
  })

  zoneStats["Unknown"] = {
    zone: "Unknown",
    entityCount: 0,
    totalProduction: 0,
    totalAmount: 0,
    averagePerEntity: 0,
  }

  // Aggregate by zone
  entities.forEach((entity) => {
    const zone = assignToZone(entity, zones) || "Unknown"
    if (!zoneStats[zone]) {
      zoneStats[zone] = {
        zone,
        entityCount: 0,
        totalProduction: 0,
        totalAmount: 0,
        averagePerEntity: 0,
      }
    }

    zoneStats[zone].entityCount += 1
    zoneStats[zone].totalProduction += Number(entity[productionField] || 0)
    zoneStats[zone].totalAmount += Number(entity[amountField] || 0)
  })

  // Calculate averages
  Object.values(zoneStats).forEach((stats) => {
    if (stats.entityCount > 0) {
      stats.averagePerEntity =
        stats.totalProduction / stats.entityCount
    }
  })

  return Object.values(zoneStats).filter((s) => s.entityCount > 0)
}

/**
 * Calculate intake by distance band
 */
export function calculateIntakeByDistanceBand(
  entities: EntityWithLocation[],
  center: Coordinates,
  bands: DistanceBand[],
  intakeField: string = "totalLiters",
  amountField: string = "totalAmount"
): DistanceBandStats[] {
  const bandStats: Record<string, DistanceBandStats> = {}

  // Initialize bands
  bands.forEach((band) => {
    bandStats[band.label] = {
      band: band.label,
      entityCount: 0,
      totalIntake: 0,
      totalAmount: 0,
      averageDistance: 0,
    }
  })

  bandStats["Unknown"] = {
    band: "Unknown",
    entityCount: 0,
    totalIntake: 0,
    totalAmount: 0,
    averageDistance: 0,
  }

  const distances: Record<string, number[]> = {}

  // Aggregate by distance band
  entities.forEach((entity) => {
    if (
      !entity.latitude ||
      !entity.longitude ||
      entity.latitude === null ||
      entity.longitude === null
    ) {
      const band = "Unknown"
      if (!bandStats[band]) {
        bandStats[band] = {
          band,
          entityCount: 0,
          totalIntake: 0,
          totalAmount: 0,
          averageDistance: 0,
        }
      }
      bandStats[band].entityCount += 1
      bandStats[band].totalIntake += Number(entity[intakeField] || 0)
      bandStats[band].totalAmount += Number(entity[amountField] || 0)
      return
    }

    const entityLocation: Coordinates = {
      latitude: entity.latitude,
      longitude: entity.longitude,
    }

    const distance = calculateDistance(center, entityLocation)
    const band = assignToDistanceBand(entity, center, bands) || "Unknown"

    if (!bandStats[band]) {
      bandStats[band] = {
        band,
        entityCount: 0,
        totalIntake: 0,
        totalAmount: 0,
        averageDistance: 0,
      }
    }

    if (!distances[band]) {
      distances[band] = []
    }

    bandStats[band].entityCount += 1
    bandStats[band].totalIntake += Number(entity[intakeField] || 0)
    bandStats[band].totalAmount += Number(entity[amountField] || 0)
    distances[band].push(distance)
  })

  // Calculate average distances
  Object.keys(bandStats).forEach((band) => {
    if (distances[band] && distances[band].length > 0) {
      const sum = distances[band].reduce((a, b) => a + b, 0)
      bandStats[band].averageDistance = sum / distances[band].length
    }
  })

  return Object.values(bandStats).filter((s) => s.entityCount > 0)
}

/**
 * Calculate agent coverage
 */
export function calculateAgentCoverage(
  agents: Array<EntityWithLocation & { name?: string }>,
  entities: EntityWithLocation[],
  productionField: string = "totalLiters"
): AgentCoverage[] {
  const coverage: AgentCoverage[] = []

  agents.forEach((agent) => {
    if (
      !agent.latitude ||
      !agent.longitude ||
      agent.latitude === null ||
      agent.longitude === null
    ) {
      return
    }

    const agentLocation: Coordinates = {
      latitude: agent.latitude,
      longitude: agent.longitude,
    }

    // Find entities within agent's coverage (assuming 20km default radius)
    const coveredEntities = findWithinRadius(agentLocation, 20, entities)

    const totalProduction = coveredEntities.reduce(
      (sum, { entity }) => sum + Number(entity[productionField] || 0),
      0
    )

    const distances = coveredEntities.map(({ distance }) => distance)
    const averageDistance =
      distances.length > 0
        ? distances.reduce((a, b) => a + b, 0) / distances.length
        : 0

    const maxDistance =
      distances.length > 0 ? Math.max(...distances) : 0

    // Determine zones covered
    const zones = new Set<string>()
    coveredEntities.forEach(({ entity }) => {
      const zone = assignToZone(entity, getDefaultZones(agentLocation))
      if (zone) zones.add(zone)
    })

    coverage.push({
      agentId: agent.id,
      agentName: agent.name || `Agent ${agent.id.slice(-6)}`,
      entitiesCovered: coveredEntities.length,
      totalProduction,
      coverageRadius: maxDistance,
      averageDistance,
      zones: Array.from(zones),
    })
  })

  return coverage.sort((a, b) => b.entitiesCovered - a.entitiesCovered)
}

/**
 * Format zone name for display
 */
export function formatZoneName(zone: string): string {
  return zone.replace("Zone ", "").replace(/\(.*?\)/, "").trim()
}

/**
 * Format distance band for display
 */
export function formatDistanceBand(band: string): string {
  return band
}
