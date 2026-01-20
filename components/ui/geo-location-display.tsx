"use client"

import * as React from "react"
import { useState } from "react"
import { MapPin, ExternalLink, Copy, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export interface GeoLocationDisplayProps {
  latitude: number | null | undefined
  longitude: number | null | undefined
  className?: string
  title?: string
  description?: string
  showMapLink?: boolean
  compact?: boolean
}

export function GeoLocationDisplay({
  latitude,
  longitude,
  className,
  title = "Location",
  description,
  showMapLink = true,
  compact = false,
}: GeoLocationDisplayProps) {
  const [copied, setCopied] = useState(false)

  const hasLocation = latitude !== null && latitude !== undefined && 
                      longitude !== null && longitude !== undefined

  const coordinates = hasLocation 
    ? `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
    : null

  const googleMapsUrl = hasLocation
    ? `https://www.google.com/maps?q=${latitude},${longitude}`
    : null

  const openStreetMapUrl = hasLocation
    ? `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}&zoom=15`
    : null

  const handleCopy = () => {
    if (coordinates) {
      navigator.clipboard.writeText(coordinates)
      setCopied(true)
      toast.success("Coordinates copied to clipboard")
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleOpenMap = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer")
  }

  if (!hasLocation) {
    if (compact) {
      return (
        <div className={cn("text-sm text-gray-500", className)}>
          <MapPin className="h-4 w-4 inline mr-1" />
          No location data
        </div>
      )
    }
    return (
      <Card className={cn("border-gray-200", className)}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-400" />
            {title}
          </CardTitle>
          {description && (
            <CardDescription>{description}</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-500 flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>No location data available</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (compact) {
    return (
      <div className={cn("flex items-center gap-2 text-sm", className)}>
        <MapPin className="h-4 w-4 text-green-600" />
        <span className="text-gray-700 font-mono text-xs">{coordinates}</span>
        {showMapLink && googleMapsUrl && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={() => handleOpenMap(googleMapsUrl)}
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            Map
          </Button>
        )}
      </div>
    )
  }

  return (
    <Card className={cn("border-green-200 bg-green-50/30", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-green-600" />
            <CardTitle className="text-base">{title}</CardTitle>
          </div>
          <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
            Located
          </Badge>
        </div>
        {description && (
          <CardDescription>{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Coordinates</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2"
              onClick={handleCopy}
            >
              {copied ? (
                <>
                  <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
                  <span className="text-xs">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3 mr-1" />
                  <span className="text-xs">Copy</span>
                </>
              )}
            </Button>
          </div>
          <div className="font-mono text-sm bg-white border border-gray-200 rounded-md p-2 text-gray-800">
            {coordinates}
          </div>
        </div>

        {showMapLink && (
          <div className="flex gap-2 pt-2 border-t border-gray-200">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => handleOpenMap(googleMapsUrl!)}
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Google Maps
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => handleOpenMap(openStreetMapUrl!)}
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              OpenStreetMap
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
