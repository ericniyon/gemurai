"use client"

import * as React from "react"
import { useState } from "react"
import { GeoLocationInput } from "./geo-location-input"
import { GeoLocationDisplay } from "./geo-location-display"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Edit2, Save, X, Lock } from "lucide-react"
import { cn } from "@/lib/utils"

export interface GeoLocationEditorProps {
  latitude: number | null | undefined
  longitude: number | null | undefined
  onSave?: (location: { latitude: number | null; longitude: number | null }) => Promise<void>
  canEdit?: boolean
  className?: string
  title?: string
  description?: string
  entityType?: string
  entityId?: string
}

export function GeoLocationEditor({
  latitude,
  longitude,
  onSave,
  canEdit = false,
  className,
  title = "Location",
  description,
  entityType,
  entityId,
}: GeoLocationEditorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [currentLat, setCurrentLat] = useState<number | null>(latitude ?? null)
  const [currentLng, setCurrentLng] = useState<number | null>(longitude ?? null)
  const [hasChanges, setHasChanges] = useState(false)

  // Sync with external values when not editing
  React.useEffect(() => {
    if (!isEditing) {
      setCurrentLat(latitude ?? null)
      setCurrentLng(longitude ?? null)
      setHasChanges(false)
    }
  }, [latitude, longitude, isEditing])

  const handleLocationChange = (location: { latitude: number | null; longitude: number | null }) => {
    setCurrentLat(location.latitude)
    setCurrentLng(location.longitude)
    setHasChanges(
      location.latitude !== latitude || location.longitude !== longitude
    )
  }

  const handleSave = async () => {
    if (!onSave) return

    setIsSaving(true)
    try {
      await onSave({
        latitude: currentLat,
        longitude: currentLng,
      })
      setIsEditing(false)
      setHasChanges(false)
    } catch (error) {
      console.error("Error saving location:", error)
      throw error
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setCurrentLat(latitude ?? null)
    setCurrentLng(longitude ?? null)
    setIsEditing(false)
    setHasChanges(false)
  }

  if (!canEdit) {
    return (
      <div className={cn("relative", className)}>
        <GeoLocationDisplay
          latitude={latitude}
          longitude={longitude}
          title={title}
          description={description}
        />
        <div className="absolute top-2 right-2">
          <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-md text-xs text-gray-600">
            <Lock className="h-3 w-3" />
            <span>Read-only</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card className={cn("border-gray-200", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              {title}
            </CardTitle>
            {description && (
              <CardDescription className="mt-1">{description}</CardDescription>
            )}
          </div>
          {!isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              <Edit2 className="h-4 w-4 mr-1" />
              Edit
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditing ? (
          <>
            <GeoLocationInput
              latitude={currentLat}
              longitude={currentLng}
              onLocationChange={handleLocationChange}
              label="Location Coordinates"
            />
            <Separator />
            <div className="flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                disabled={isSaving}
              >
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={isSaving || !hasChanges}
              >
                <Save className="h-4 w-4 mr-1" />
                {isSaving ? "Saving..." : "Save"}
              </Button>
            </div>
          </>
        ) : (
          <GeoLocationDisplay
            latitude={currentLat}
            longitude={currentLng}
            title=""
            compact={false}
            showMapLink={true}
          />
        )}
      </CardContent>
    </Card>
  )
}
