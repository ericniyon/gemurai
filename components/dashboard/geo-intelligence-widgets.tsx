"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Users, TrendingUp, BarChart3, Navigation } from "lucide-react"
import {
  calculateAverageDistance,
  groupByDistanceBand,
  type DistanceBand,
} from "@/lib/utils/geo-calculations"

export interface GeoStatsData {
  farmersWithGeo: number
  agentsWithGeo: number
  mccsWithGeo: number
  warehousesWithGeo: number
  averageFarmerToMCCDistance: number | null
  distanceBands: Record<DistanceBand, number>
  totalEntitiesWithGeo: number
}

interface GeoIntelligenceWidgetsProps {
  stats: GeoStatsData
  isLoading?: boolean
}

export function GeoIntelligenceWidgets({
  stats,
  isLoading = false,
}: GeoIntelligenceWidgetsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total with Geo</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEntitiesWithGeo}</div>
            <p className="text-xs text-muted-foreground">
              Entities with location data
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Farmers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.farmersWithGeo}</div>
            <p className="text-xs text-muted-foreground">
              Farmers with geo-location
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agents</CardTitle>
            <Navigation className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.agentsWithGeo}</div>
            <p className="text-xs text-muted-foreground">
              Agents with geo-location
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Distance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.averageFarmerToMCCDistance != null
                ? `${stats.averageFarmerToMCCDistance.toFixed(1)} km`
                : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">
              Farmer to MCC average
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Distance Bands */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Distance Distribution
          </CardTitle>
          <CardDescription>
            Farmers grouped by distance from their MCC
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(stats.distanceBands).map(([band, count]) => (
              <div
                key={band}
                className="flex flex-col items-center p-4 rounded-lg border bg-gray-50"
              >
                <Badge variant="outline" className="mb-2">
                  {band}
                </Badge>
                <div className="text-2xl font-bold">{count}</div>
                <p className="text-xs text-muted-foreground mt-1">farmers</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Entity Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Entity Coverage</CardTitle>
          <CardDescription>
            Geo-location data coverage by entity type
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">MCCs</span>
              <Badge variant="outline">{stats.mccsWithGeo}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Warehouses</span>
              <Badge variant="outline">{stats.warehousesWithGeo}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Farmers</span>
              <Badge variant="outline">{stats.farmersWithGeo}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Agents</span>
              <Badge variant="outline">{stats.agentsWithGeo}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
