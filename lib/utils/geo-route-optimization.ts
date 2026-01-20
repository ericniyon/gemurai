/**
 * Geo-route optimization utilities
 * Implements route optimization algorithms for collection agents
 */

import { calculateDistance, type Coordinates } from "./geo-calculations"

export interface RoutePoint extends Coordinates {
  id: string
  name: string
  type: "farmer" | "mcc" | "warehouse"
  priority?: number
}

export interface OptimizedRoute {
  points: RoutePoint[]
  totalDistance: number
  estimatedTime: number // in minutes
}

/**
 * Nearest Neighbor algorithm for route optimization
 * Simple but effective for small to medium route planning
 */
export function optimizeRouteNearestNeighbor(
  startPoint: Coordinates,
  points: RoutePoint[]
): OptimizedRoute {
  if (points.length === 0) {
    return { points: [], totalDistance: 0, estimatedTime: 0 }
  }

  const unvisited = [...points]
  const route: RoutePoint[] = []
  let currentPoint = startPoint
  let totalDistance = 0

  while (unvisited.length > 0) {
    // Find nearest unvisited point
    let nearestIndex = 0
    let nearestDistance = calculateDistance(currentPoint, unvisited[0])

    for (let i = 1; i < unvisited.length; i++) {
      const distance = calculateDistance(currentPoint, unvisited[i])
      if (distance < nearestDistance) {
        nearestDistance = distance
        nearestIndex = i
      }
    }

    // Add nearest point to route
    const nearest = unvisited.splice(nearestIndex, 1)[0]
    route.push(nearest)
    totalDistance += nearestDistance
    currentPoint = nearest
  }

  // Estimate time (assuming average speed of 30 km/h)
  const estimatedTime = (totalDistance / 30) * 60 // in minutes

  return {
    points: route,
    totalDistance: Math.round(totalDistance * 100) / 100,
    estimatedTime: Math.round(estimatedTime),
  }
}

/**
 * Group farmers by proximity to MCC
 */
export function groupFarmersByProximity(
  mccLocation: Coordinates,
  farmers: Array<RoutePoint>,
  maxDistance: number = 10 // km
): {
  nearby: RoutePoint[]
  far: RoutePoint[]
} {
  const nearby: RoutePoint[] = []
  const far: RoutePoint[] = []

  farmers.forEach((farmer) => {
    const distance = calculateDistance(mccLocation, farmer)
    if (distance <= maxDistance) {
      nearby.push(farmer)
    } else {
      far.push(farmer)
    }
  })

  return { nearby, far }
}

/**
 * Calculate coverage area for an agent
 */
export function calculateAgentCoverage(
  agentLocation: Coordinates,
  farmers: Array<RoutePoint>,
  maxRadius: number = 5 // km
): {
  covered: RoutePoint[]
  uncovered: RoutePoint[]
  coveragePercentage: number
} {
  const covered: RoutePoint[] = []
  const uncovered: RoutePoint[] = []

  farmers.forEach((farmer) => {
    const distance = calculateDistance(agentLocation, farmer)
    if (distance <= maxRadius) {
      covered.push(farmer)
    } else {
      uncovered.push(farmer)
    }
  })

  const coveragePercentage =
    farmers.length > 0 ? (covered.length / farmers.length) * 100 : 0

  return {
    covered,
    uncovered,
    coveragePercentage: Math.round(coveragePercentage * 100) / 100,
  }
}

/**
 * Assign farmers to agents based on proximity
 */
export function assignFarmersToAgents(
  agents: Array<RoutePoint & { capacity?: number }>,
  farmers: RoutePoint[]
): Map<string, RoutePoint[]> {
  const assignments = new Map<string, RoutePoint[]>()
  agents.forEach((agent) => assignments.set(agent.id, []))

  const unassigned = [...farmers]

  // Sort farmers by priority if available
  unassigned.sort((a, b) => (b.priority || 0) - (a.priority || 0))

  unassigned.forEach((farmer) => {
    let bestAgent: RoutePoint | null = null
    let bestDistance = Infinity

    agents.forEach((agent) => {
      const distance = calculateDistance(agent, farmer)
      const currentAssignments = assignments.get(agent.id) || []
      const capacity = agent.capacity || Infinity

      if (distance < bestDistance && currentAssignments.length < capacity) {
        bestDistance = distance
        bestAgent = agent
      }
    })

    if (bestAgent) {
      assignments.get(bestAgent.id)!.push(farmer)
    }
  })

  return assignments
}
