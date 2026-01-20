/**
 * Geo-location Consent Management
 * Handles consent flags for geo-location data collection and usage
 */

export interface GeoConsentFlags {
  locationCollectionConsent: boolean // Required - consent to collect location
  locationStorageConsent: boolean // Required - consent to store location
  locationSharingConsent?: boolean // Optional - consent to share with third parties
  locationAnalyticsConsent?: boolean // Optional - consent for analytics use
  locationMappingConsent?: boolean // Optional - consent for map visualization
  consentDate?: Date // When consent was given
  consentVersion?: string // Version of consent terms
  consentWithdrawnDate?: Date // When consent was withdrawn
  consentNotes?: string // Additional notes
}

export interface GeoConsentStatus {
  hasConsent: boolean
  consentFlags: GeoConsentFlags
  isActive: boolean
  canCollect: boolean
  canStore: boolean
  canShare: boolean
  canUseForAnalytics: boolean
  canUseForMapping: boolean
}

/**
 * Validate geo-location consent flags
 */
export function validateGeoConsent(flags: GeoConsentFlags): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  // Required consents
  if (flags.locationCollectionConsent !== true) {
    errors.push("Location collection consent is required")
  }

  if (flags.locationStorageConsent !== true) {
    errors.push("Location storage consent is required")
  }

  // Validate dates
  if (flags.consentDate && flags.consentWithdrawnDate) {
    if (flags.consentWithdrawnDate < flags.consentDate) {
      errors.push("Consent withdrawal date cannot be before consent date")
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Check if consent is active (not withdrawn)
 */
export function isConsentActive(flags: GeoConsentFlags): boolean {
  if (!flags.locationCollectionConsent || !flags.locationStorageConsent) {
    return false
  }

  if (flags.consentWithdrawnDate) {
    return false
  }

  return true
}

/**
 * Get consent status
 */
export function getConsentStatus(
  flags: GeoConsentFlags | null | undefined
): GeoConsentStatus {
  if (!flags) {
    return {
      hasConsent: false,
      consentFlags: {
        locationCollectionConsent: false,
        locationStorageConsent: false,
      },
      isActive: false,
      canCollect: false,
      canStore: false,
      canShare: false,
      canUseForAnalytics: false,
      canUseForMapping: false,
    }
  }

  const active = isConsentActive(flags)

  return {
    hasConsent: flags.locationCollectionConsent && flags.locationStorageConsent,
    consentFlags: flags,
    isActive: active,
    canCollect: active && flags.locationCollectionConsent === true,
    canStore: active && flags.locationStorageConsent === true,
    canShare:
      active &&
      flags.locationSharingConsent === true,
    canUseForAnalytics:
      active &&
      flags.locationAnalyticsConsent === true,
    canUseForMapping:
      active &&
      flags.locationMappingConsent === true,
  }
}

/**
 * Create default consent flags (all false)
 */
export function createDefaultConsentFlags(): GeoConsentFlags {
  return {
    locationCollectionConsent: false,
    locationStorageConsent: false,
    locationSharingConsent: false,
    locationAnalyticsConsent: false,
    locationMappingConsent: false,
    consentVersion: "1.0",
  }
}

/**
 * Withdraw consent
 */
export function withdrawConsent(
  flags: GeoConsentFlags
): GeoConsentFlags {
  return {
    ...flags,
    locationCollectionConsent: false,
    locationStorageConsent: false,
    locationSharingConsent: false,
    locationAnalyticsConsent: false,
    locationMappingConsent: false,
    consentWithdrawnDate: new Date(),
  }
}

/**
 * Grant consent
 */
export function grantConsent(
  flags: Partial<GeoConsentFlags> = {}
): GeoConsentFlags {
  return {
    locationCollectionConsent: true,
    locationStorageConsent: true,
    locationSharingConsent: flags.locationSharingConsent ?? false,
    locationAnalyticsConsent: flags.locationAnalyticsConsent ?? false,
    locationMappingConsent: flags.locationMappingConsent ?? false,
    consentDate: new Date(),
    consentVersion: flags.consentVersion || "1.0",
    consentNotes: flags.consentNotes,
  }
}
