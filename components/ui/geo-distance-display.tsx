"use client"

import * as React from "react"
import { MapPin, Navigation } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  calculateDistance,
  formatDistance,
  type Coordinates,
} from "@/lib/utils/geo-calculations"

export interface GeoDistanceDisplayProps {
  from: Coordinates
  to: Coordinates
  className?: string
  title?: string
  showDetails?: boolean
  compact?: boolean
}

export function GeoDistanceDisplay({
  from,
  to,
  className,
  title = "Distance",
  showDetails = false,
  compact = false,
}: GeoDistanceDisplayProps) {
  const distance = calculateDistance(from, to)
  const distanceInMeters = distance * 1000

  if (compact) {
    return (
      <div className={cn("flex items-center gap-2 text-sm", className)}>
        <Navigation className="h-4 w-4 text-blue-600" />
        <span className="font-medium">{formatDistance(distance)}</span>
      </div>
    )
  }

  return (
    <Card className={cn("border-blue-200 bg-blue-50/30", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Navigation className="h-4 w-4 text-blue-600" />
            {title}
          </CardTitle>
          <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
            {formatDistance(distance)}
          </Badge>
        </div>
      </CardHeader>
      {showDetails && (
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600 mb-1">From</p>
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3 text-gray-400" />
                <span className="font-mono text-xs">
                  {from.latitude.toFixed(6)}, {from.longitude.toFixed(6)}
                </span>
              </div>
            </div>
            <div>
              <p className="text-gray-600 mb-1">To</p>
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3 text-gray-400" />
                <span className="font-mono text-xs">
                  {to.latitude.toFixed(6)}, {to.longitude.toFixed(6)}
                </span>
              </div>
            </div>
          </div>
          <div className="pt-2 border-t border-gray-200">
            <div className="grid grid-cols-3 gap-4 text-xs">
              <div>
                <p className="text-gray-500">Distance</p>
                <p className="font-medium">{formatDistance(distance)}</p>
              </div>
              <div>
                <p className="text-gray-500">Meters</p>
                <p className="font-medium">{Math.round(distanceInMeters)}m</p>
              </div>
              <div>
                <p className="text-gray-500">Kilometers</p>
                <p className="font-medium">{distance.toFixed(2)}km</p>
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
