"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { MapPin, Navigation, X, Loader2, CheckCircle2 } from "lucide-react"
import { validateCoordinates } from "@/lib/utils/geo-calculations"
import { toast } from "sonner"

interface GeoLocationInputProps {
  latitude?: number | null
  longitude?: number | null
  onLocationChange: (latitude: number | null, longitude: number | null) => void
  disabled?: boolean
  required?: boolean
  /** When true, automatically capture GPS location on mount if not already set */
  autoCapture?: boolean
  /** When true, hide all UI and only run auto-capture in background */
  minimal?: boolean
}

export function GeoLocationInput({
  latitude,
  longitude,
  onLocationChange,
  disabled = false,
  required = false,
  autoCapture = false,
  minimal = false,
}: GeoLocationInputProps) {
  const [lat, setLat] = useState<string>(
    latitude != null ? latitude.toString() : ""
  )
  const [lng, setLng] = useState<string>(
    longitude != null ? longitude.toString() : ""
  )
  const [isCapturing, setIsCapturing] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [capturedCoords, setCapturedCoords] = useState<{
    lat: number
    lng: number
  } | null>(null)
  const [errors, setErrors] = useState<{ lat?: string; lng?: string }>({})

  // Update local state when props change
  useEffect(() => {
    setLat(latitude != null ? latitude.toString() : "")
    setLng(longitude != null ? longitude.toString() : "")
  }, [latitude, longitude])

  // Auto-capture location on mount when autoCapture is true and no location set
  useEffect(() => {
    if (!autoCapture || disabled || latitude != null || longitude != null || isCapturing) return
    if (!navigator.geolocation) return

    setIsCapturing(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const capturedLat = position.coords.latitude
        const capturedLng = position.coords.longitude
        if (validateCoordinates(capturedLat, capturedLng)) {
          setLat(capturedLat.toString())
          setLng(capturedLng.toString())
          onLocationChange(capturedLat, capturedLng)
          if (!minimal) toast.success("Location captured automatically")
        }
        setIsCapturing(false)
      },
      () => setIsCapturing(false),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    )
  }, [autoCapture, disabled, minimal])

  const handleCaptureLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser")
      return
    }

    setIsCapturing(true)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const capturedLat = position.coords.latitude
        const capturedLng = position.coords.longitude

        // Validate captured coordinates
        if (!validateCoordinates(capturedLat, capturedLng)) {
          toast.error("Invalid coordinates captured")
          setIsCapturing(false)
          return
        }

        setCapturedCoords({ lat: capturedLat, lng: capturedLng })
        setShowConfirmDialog(true)
        setIsCapturing(false)
      },
      (error) => {
        console.error("Geolocation error:", error)
        let errorMessage = "Failed to capture location"
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location permission denied. Please enable location access."
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable"
            break
          case error.TIMEOUT:
            errorMessage = "Location request timed out"
            break
        }
        toast.error(errorMessage)
        setIsCapturing(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    )
  }

  const handleConfirmCapture = () => {
    if (capturedCoords) {
      setLat(capturedCoords.lat.toString())
      setLng(capturedCoords.lng.toString())
      onLocationChange(capturedCoords.lat, capturedCoords.lng)
      setShowConfirmDialog(false)
      setCapturedCoords(null)
      toast.success("Location captured successfully")
    }
  }

  const handleCancelCapture = () => {
    setShowConfirmDialog(false)
    setCapturedCoords(null)
  }

  const handleManualChange = (field: "lat" | "lng", value: string) => {
    const numValue = value === "" ? null : parseFloat(value)
    const newErrors = { ...errors }

    if (field === "lat") {
      setLat(value)
      if (value !== "" && (numValue == null || numValue < -90 || numValue > 90)) {
        newErrors.lat = "Latitude must be between -90 and 90"
      } else {
        delete newErrors.lat
      }
    } else {
      setLng(value)
      if (value !== "" && (numValue == null || numValue < -180 || numValue > 180)) {
        newErrors.lng = "Longitude must be between -180 and 180"
      } else {
        delete newErrors.lng
      }
    }

    setErrors(newErrors)

    // Update parent if both coordinates are valid
    if (field === "lat") {
      const lngValue = lng === "" ? null : parseFloat(lng)
      if (numValue != null && lngValue != null && validateCoordinates(numValue, lngValue)) {
        onLocationChange(numValue, lngValue)
      } else if (numValue == null) {
        onLocationChange(null, lngValue)
      }
    } else {
      const latValue = lat === "" ? null : parseFloat(lat)
      if (latValue != null && numValue != null && validateCoordinates(latValue, numValue)) {
        onLocationChange(latValue, numValue)
      } else if (numValue == null) {
        onLocationChange(latValue, null)
      }
    }
  }

  const handleClear = () => {
    setLat("")
    setLng("")
    onLocationChange(null, null)
    setErrors({})
  }

  const hasValidLocation = latitude != null && longitude != null

  if (minimal) {
    return null
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">
          Geo-location {required && <span className="text-red-500">*</span>}
        </Label>
        {hasValidLocation && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            disabled={disabled}
            className="h-7 text-xs"
          >
            <X className="h-3 w-3 mr-1" />
            Clear
          </Button>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={handleCaptureLocation}
          disabled={disabled || isCapturing}
          className="flex-1"
        >
          {isCapturing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Capturing...
            </>
          ) : (
            <>
              <Navigation className="h-4 w-4 mr-2" />
              Auto-Capture
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="geo-lat" className="text-xs text-muted-foreground">
            Latitude
          </Label>
          <div className="relative">
            <Input
              id="geo-lat"
              type="number"
              step="any"
              placeholder="-1.9441"
              value={lat}
              onChange={(e) => handleManualChange("lat", e.target.value)}
              disabled={disabled}
              className={errors.lat ? "border-red-500" : hasValidLocation ? "border-green-500" : ""}
              min="-90"
              max="90"
            />
            {hasValidLocation && !errors.lat && (
              <CheckCircle2 className="absolute right-2 top-2.5 h-4 w-4 text-green-500" />
            )}
          </div>
          {errors.lat && (
            <p className="text-xs text-red-500">{errors.lat}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="geo-lng" className="text-xs text-muted-foreground">
            Longitude
          </Label>
          <div className="relative">
            <Input
              id="geo-lng"
              type="number"
              step="any"
              placeholder="30.0619"
              value={lng}
              onChange={(e) => handleManualChange("lng", e.target.value)}
              disabled={disabled}
              className={errors.lng ? "border-red-500" : hasValidLocation ? "border-green-500" : ""}
              min="-180"
              max="180"
            />
            {hasValidLocation && !errors.lng && (
              <CheckCircle2 className="absolute right-2 top-2.5 h-4 w-4 text-green-500" />
            )}
          </div>
          {errors.lng && (
            <p className="text-xs text-red-500">{errors.lng}</p>
          )}
        </div>
      </div>

      {hasValidLocation && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" />
          <span>
            {latitude.toFixed(6)}, {longitude.toFixed(6)}
          </span>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Geo-location is optional. Use auto-capture for GPS coordinates or enter manually.
      </p>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Location</DialogTitle>
            <DialogDescription>
              Use the captured location coordinates?
            </DialogDescription>
          </DialogHeader>
          {capturedCoords && (
            <div className="space-y-2 py-4">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Latitude:</span>
                <span>{capturedCoords.lat.toFixed(6)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Longitude:</span>
                <span>{capturedCoords.lng.toFixed(6)}</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancelCapture}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleConfirmCapture}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
