"use client"

import * as React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, AlertCircle, CheckCircle, Info } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  type GeoConsentFlags,
  validateGeoConsent,
  isConsentActive,
  grantConsent,
  withdrawConsent,
} from "@/lib/utils/geo-consent"

export interface GeoConsentFormProps {
  consentFlags: GeoConsentFlags | null | undefined
  onConsentChange: (flags: GeoConsentFlags) => Promise<void>
  entityName?: string
  consentVersion?: string
  readOnly?: boolean
  className?: string
}

export function GeoConsentForm({
  consentFlags,
  onConsentChange,
  entityName,
  consentVersion = "1.0",
  readOnly = false,
  className,
}: GeoConsentFormProps) {
  const [localFlags, setLocalFlags] = useState<GeoConsentFlags>(
    consentFlags || {
      locationCollectionConsent: false,
      locationStorageConsent: false,
      locationSharingConsent: false,
      locationAnalyticsConsent: false,
      locationMappingConsent: false,
      consentVersion,
    }
  )
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  const isActive = isConsentActive(localFlags)
  const validation = validateGeoConsent(localFlags)

  const handleFlagChange = (flag: keyof GeoConsentFlags, value: boolean) => {
    setLocalFlags((prev) => ({
      ...prev,
      [flag]: value,
      consentDate: value ? new Date() : prev.consentDate,
      consentVersion: value ? consentVersion : prev.consentVersion,
    }))
    setErrors([])
  }

  const handleGrantAll = () => {
    const granted = grantConsent({
      locationSharingConsent: true,
      locationAnalyticsConsent: true,
      locationMappingConsent: true,
      consentVersion,
    })
    setLocalFlags(granted)
    setErrors([])
  }

  const handleWithdraw = () => {
    const withdrawn = withdrawConsent(localFlags)
    setLocalFlags(withdrawn)
    setErrors([])
  }

  const handleSave = async () => {
    const validation = validateGeoConsent(localFlags)
    if (!validation.valid) {
      setErrors(validation.errors)
      return
    }

    setIsSaving(true)
    try {
      await onConsentChange(localFlags)
      setErrors([])
    } catch (error) {
      setErrors([error instanceof Error ? error.message : "Failed to save consent"])
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Geo-Location Consent
            </CardTitle>
            <CardDescription>
              {entityName
                ? `Consent management for ${entityName}`
                : "Manage geo-location data consent"}
            </CardDescription>
          </div>
          {isActive ? (
            <Badge className="bg-green-100 text-green-700 border-green-300">
              <CheckCircle className="h-3 w-3 mr-1" />
              Active
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-gray-100 text-gray-700">
              <AlertCircle className="h-3 w-3 mr-1" />
              Inactive
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {errors.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <ul className="list-disc list-inside">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Consent version: {localFlags.consentVersion || consentVersion}
            {localFlags.consentDate && (
              <span className="ml-2">
                • Granted: {new Date(localFlags.consentDate).toLocaleDateString()}
              </span>
            )}
            {localFlags.consentWithdrawnDate && (
              <span className="ml-2 text-red-600">
                • Withdrawn: {new Date(localFlags.consentWithdrawnDate).toLocaleDateString()}
              </span>
            )}
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          {/* Required Consents */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Required Consents *</Label>
            <div className="space-y-3 pl-4">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="collection"
                  checked={localFlags.locationCollectionConsent}
                  onCheckedChange={(checked) =>
                    handleFlagChange("locationCollectionConsent", checked === true)
                  }
                  disabled={readOnly}
                />
                <div className="flex-1">
                  <Label
                    htmlFor="collection"
                    className="font-medium cursor-pointer"
                  >
                    Location Collection Consent
                  </Label>
                  <p className="text-sm text-gray-600">
                    I consent to the collection of my geo-location data
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="storage"
                  checked={localFlags.locationStorageConsent}
                  onCheckedChange={(checked) =>
                    handleFlagChange("locationStorageConsent", checked === true)
                  }
                  disabled={readOnly}
                />
                <div className="flex-1">
                  <Label htmlFor="storage" className="font-medium cursor-pointer">
                    Location Storage Consent
                  </Label>
                  <p className="text-sm text-gray-600">
                    I consent to the storage of my geo-location data
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <Label className="text-base font-semibold">Optional Consents</Label>
            <div className="space-y-3 pl-4 mt-3">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="sharing"
                  checked={localFlags.locationSharingConsent || false}
                  onCheckedChange={(checked) =>
                    handleFlagChange("locationSharingConsent", checked === true)
                  }
                  disabled={readOnly}
                />
                <div className="flex-1">
                  <Label htmlFor="sharing" className="font-medium cursor-pointer">
                    Location Sharing Consent
                  </Label>
                  <p className="text-sm text-gray-600">
                    I consent to sharing my geo-location data with authorized third parties
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="analytics"
                  checked={localFlags.locationAnalyticsConsent || false}
                  onCheckedChange={(checked) =>
                    handleFlagChange("locationAnalyticsConsent", checked === true)
                  }
                  disabled={readOnly}
                />
                <div className="flex-1">
                  <Label htmlFor="analytics" className="font-medium cursor-pointer">
                    Location Analytics Consent
                  </Label>
                  <p className="text-sm text-gray-600">
                    I consent to using my geo-location data for analytics and reporting
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="mapping"
                  checked={localFlags.locationMappingConsent || false}
                  onCheckedChange={(checked) =>
                    handleFlagChange("locationMappingConsent", checked === true)
                  }
                  disabled={readOnly}
                />
                <div className="flex-1">
                  <Label htmlFor="mapping" className="font-medium cursor-pointer">
                    Location Mapping Consent
                  </Label>
                  <p className="text-sm text-gray-600">
                    I consent to displaying my geo-location on maps and visualizations
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {!readOnly && (
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleGrantAll}
                disabled={isSaving}
              >
                Grant All
              </Button>
              {isActive && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleWithdraw}
                  disabled={isSaving}
                  className="text-red-600 hover:text-red-700"
                >
                  Withdraw Consent
                </Button>
              )}
            </div>
            <Button
              onClick={handleSave}
              disabled={isSaving || !validation.valid}
            >
              {isSaving ? "Saving..." : "Save Consent"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
