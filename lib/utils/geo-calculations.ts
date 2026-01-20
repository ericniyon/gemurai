/**
 * Geo-calculation utilities using pure TypeScript
 * Implements Haversine distance formula for calculating distances between coordinates
 */

export interface Coordinates {
  latitude: number
  longitude: number
}

export type DistanceBand = '0-2km' | '2-5km' | '5-10km' | '>10km'

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param coord1 First coordinate (latitude, longitude)
 * @param coord2 Second coordinate (latitude, longitude)
 * @returns Distance in kilometers
 */
export function calculateDistance(
  coord1: Coordinates,
  coord2: Coordinates
): number {
  const R = 6371 // Earth's radius in kilometers

  const dLat = toRadians(coord2.latitude - coord1.latitude)
  const dLon = toRadians(coord2.longitude - coord1.longitude)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(coord1.latitude)) *
      Math.cos(toRadians(coord2.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c

  return Math.round(distance * 100) / 100 // Round to 2 decimal places
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}

/**
 * Get distance band for a given distance in kilometers
 * @param distance Distance in kilometers
 * @returns Distance band category
 */
export function getDistanceBand(distance: number): DistanceBand {
  if (distance <= 2) return '0-2km'
  if (distance <= 5) return '2-5km'
  if (distance <= 10) return '5-10km'
  return '>10km'
}

/**
 * Calculate distance from farmer to MCC
 * @param farmerLat Farmer's latitude
 * @param farmerLng Farmer's longitude
 * @param mccLat MCC's latitude
 * @param mccLng MCC's longitude
 * @returns Distance in kilometers, or null if coordinates are missing
 */
export function calculateFarmerToMCCDistance(
  farmerLat: number | null | undefined,
  farmerLng: number | null | undefined,
  mccLat: number | null | undefined,
  mccLng: number | null | undefined
): number | null {
  if (
    farmerLat == null ||
    farmerLng == null ||
    mccLat == null ||
    mccLng == null
  ) {
    return null
  }

  return calculateDistance(
    { latitude: farmerLat, longitude: farmerLng },
    { latitude: mccLat, longitude: mccLng }
  )
}

/**
 * Calculate distance from agent to farmer
 * @param agentLat Agent's latitude
 * @param agentLng Agent's longitude
 * @param farmerLat Farmer's latitude
 * @param farmerLng Farmer's longitude
 * @returns Distance in kilometers, or null if coordinates are missing
 */
export function calculateAgentToFarmerDistance(
  agentLat: number | null | undefined,
  agentLng: number | null | undefined,
  farmerLat: number | null | undefined,
  farmerLng: number | null | undefined
): number | null {
  if (
    agentLat == null ||
    agentLng == null ||
    farmerLat == null ||
    farmerLng == null
  ) {
    return null
  }

  return calculateDistance(
    { latitude: agentLat, longitude: agentLng },
    { latitude: farmerLat, longitude: farmerLng }
  )
}

/**
 * Group entities by distance band from a reference point
 * @param reference Reference coordinates
 * @param entities Array of entities with coordinates
 * @returns Map of distance bands to entity counts
 */
export function groupByDistanceBand<T extends Coordinates>(
  reference: Coordinates,
  entities: T[]
): Record<DistanceBand, number> {
  const bands: Record<DistanceBand, number> = {
    '0-2km': 0,
    '2-5km': 0,
    '5-10km': 0,
    '>10km': 0,
  }

  entities.forEach((entity) => {
    const distance = calculateDistance(reference, entity)
    const band = getDistanceBand(distance)
    bands[band]++
  })

  return bands
}

/**
 * Calculate average distance from a set of entities to a reference point
 * @param reference Reference coordinates
 * @param entities Array of entities with coordinates
 * @returns Average distance in kilometers, or null if no entities
 */
export function calculateAverageDistance<T extends Coordinates>(
  reference: Coordinates,
  entities: T[]
): number | null {
  if (entities.length === 0) return null

  const totalDistance = entities.reduce((sum, entity) => {
    return sum + calculateDistance(reference, entity)
  }, 0)

  return Math.round((totalDistance / entities.length) * 100) / 100
}

/**
 * Validate coordinates
 * @param latitude Latitude value
 * @param longitude Longitude value
 * @returns true if coordinates are valid
 */
export function validateCoordinates(
  latitude: number | null | undefined,
  longitude: number | null | undefined
): boolean {
  if (latitude == null || longitude == null) return false
  return (
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  )
}
