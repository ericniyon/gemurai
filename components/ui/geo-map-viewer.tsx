"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Users, Building2, Warehouse, Truck, X, Filter } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

export interface GeoEntity {
  id: string
  name: string
  type: "farmer" | "agent" | "mcc" | "warehouse" | "customer" | "supplier"
  latitude: number
  longitude: number
  mccId?: string
  mccName?: string
  metadata?: Record<string, any>
}

interface GeoMapViewerProps {
  entities: GeoEntity[]
  center?: { latitude: number; longitude: number }
  zoom?: number
  height?: string
  showFilters?: boolean
  onEntityClick?: (entity: GeoEntity) => void
}

// Simple map component using CSS and divs (can be replaced with Leaflet/Mapbox later)
export function GeoMapViewer({
  entities,
  center,
  zoom = 10,
  height = "500px",
  showFilters = true,
  onEntityClick,
}: GeoMapViewerProps) {
  const [selectedType, setSelectedType] = useState<string>("all")
  const [selectedMcc, setSelectedMcc] = useState<string>("all")
  const [selectedEntity, setSelectedEntity] = useState<GeoEntity | null>(null)

  // Filter entities
  const filteredEntities = entities.filter((entity) => {
    if (selectedType !== "all" && entity.type !== selectedType) return false
    if (selectedMcc !== "all" && entity.mccId !== selectedMcc) return false
    return true
  })

  // Get unique MCCs for filter
  const mccs = Array.from(
    new Set(entities.filter((e) => e.mccId).map((e) => e.mccId!))
  )

  // Calculate center if not provided
  const mapCenter = center || (filteredEntities.length > 0
    ? {
        latitude:
          filteredEntities.reduce((sum, e) => sum + e.latitude, 0) /
          filteredEntities.length,
        longitude:
          filteredEntities.reduce((sum, e) => sum + e.longitude, 0) /
          filteredEntities.length,
      }
    : { latitude: -1.9441, longitude: 30.0619 }) // Default to Kigali, Rwanda

  const handleEntityClick = (entity: GeoEntity) => {
    setSelectedEntity(entity)
    onEntityClick?.(entity)
  }

  const getEntityIcon = (type: GeoEntity["type"]) => {
    switch (type) {
      case "farmer":
        return <Users className="h-4 w-4" />
      case "agent":
        return <Users className="h-4 w-4" />
      case "mcc":
        return <Building2 className="h-4 w-4" />
      case "warehouse":
        return <Warehouse className="h-4 w-4" />
      case "customer":
        return <Building2 className="h-4 w-4" />
      case "supplier":
        return <Truck className="h-4 w-4" />
      default:
        return <MapPin className="h-4 w-4" />
    }
  }

  const getEntityColor = (type: GeoEntity["type"]) => {
    switch (type) {
      case "farmer":
        return "bg-green-500"
      case "agent":
        return "bg-blue-500"
      case "mcc":
        return "bg-purple-500"
      case "warehouse":
        return "bg-orange-500"
      case "customer":
        return "bg-yellow-500"
      case "supplier":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Geo-location Map
            </CardTitle>
            <CardDescription>
              Visualize entities on the map ({filteredEntities.length} shown)
            </CardDescription>
          </div>
          {showFilters && (
            <div className="flex gap-2">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="farmer">Farmers</SelectItem>
                  <SelectItem value="agent">Agents</SelectItem>
                  <SelectItem value="mcc">MCCs</SelectItem>
                  <SelectItem value="warehouse">Warehouses</SelectItem>
                  <SelectItem value="customer">Customers</SelectItem>
                  <SelectItem value="supplier">Suppliers</SelectItem>
                </SelectContent>
              </Select>
              {mccs.length > 0 && (
                <Select value={selectedMcc} onValueChange={setSelectedMcc}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="MCC" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All MCCs</SelectItem>
                    {mccs.map((mccId) => (
                      <SelectItem key={mccId} value={mccId}>
                        {entities.find((e) => e.mccId === mccId)?.mccName || mccId}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Simple map visualization */}
        <div
          className="relative w-full bg-gray-100 rounded-lg border-2 border-gray-300 overflow-hidden"
          style={{ height }}
        >
          {/* Map placeholder - in production, replace with Leaflet/Mapbox */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Map visualization</p>
              <p className="text-xs mt-1">
                {filteredEntities.length} entities with coordinates
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Center: {mapCenter.latitude.toFixed(4)}, {mapCenter.longitude.toFixed(4)}
              </p>
            </div>
          </div>

          {/* Entity markers (simplified visualization) */}
          {filteredEntities.map((entity) => {
            // Calculate relative position (simplified - in production use proper map projection)
            const latDiff = entity.latitude - mapCenter.latitude
            const lngDiff = entity.longitude - mapCenter.longitude
            const x = 50 + lngDiff * 1000 // Simplified scaling
            const y = 50 - latDiff * 1000

            return (
              <button
                key={entity.id}
                onClick={() => handleEntityClick(entity)}
                className={cn(
                  "absolute transform -translate-x-1/2 -translate-y-1/2",
                  "flex items-center justify-center",
                  "w-8 h-8 rounded-full border-2 border-white shadow-lg",
                  "hover:scale-110 transition-transform cursor-pointer",
                  getEntityColor(entity.type),
                  "text-white"
                )}
                style={{
                  left: `${Math.max(5, Math.min(95, x))}%`,
                  top: `${Math.max(5, Math.min(95, y))}%`,
                }}
                title={`${entity.name} (${entity.type})`}
              >
                {getEntityIcon(entity.type)}
              </button>
            )
          })}
        </div>

        {/* Entity list */}
        {filteredEntities.length > 0 && (
          <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
            <p className="text-sm font-medium text-gray-700">Entities on map:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {filteredEntities.slice(0, 10).map((entity) => (
                <div
                  key={entity.id}
                  onClick={() => handleEntityClick(entity)}
                  className="flex items-center gap-2 p-2 rounded border hover:bg-gray-50 cursor-pointer"
                >
                  <div className={cn("p-1 rounded", getEntityColor(entity.type))}>
                    {getEntityIcon(entity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{entity.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{entity.type}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {entity.latitude.toFixed(4)}, {entity.longitude.toFixed(4)}
                  </Badge>
                </div>
              ))}
            </div>
            {filteredEntities.length > 10 && (
              <p className="text-xs text-gray-500 text-center">
                +{filteredEntities.length - 10} more entities
              </p>
            )}
          </div>
        )}

        {/* Entity detail popup */}
        {selectedEntity && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className={cn("p-1 rounded", getEntityColor(selectedEntity.type))}>
                    {getEntityIcon(selectedEntity.type)}
                  </div>
                  <h3 className="font-semibold">{selectedEntity.name}</h3>
                  <Badge variant="outline" className="capitalize">
                    {selectedEntity.type}
                  </Badge>
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>
                    <span className="font-medium">Coordinates:</span>{" "}
                    {selectedEntity.latitude.toFixed(6)}, {selectedEntity.longitude.toFixed(6)}
                  </p>
                  {selectedEntity.mccName && (
                    <p>
                      <span className="font-medium">MCC:</span> {selectedEntity.mccName}
                    </p>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedEntity(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {filteredEntities.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No entities with geo-location data found</p>
            <p className="text-sm mt-1">
              Add geo-location data to entities to see them on the map
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
