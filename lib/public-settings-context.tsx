"use client"

import React, { createContext, useContext, useEffect, useState, useMemo } from "react"
import type { PublicSettings } from "@/lib/settings-public"

const defaultSettings: PublicSettings = {
  platformName: "HarvestPlus by YDEN",
  platformDescription: "Multi-Commodity Aggregation & Settlement Platform",
  supportEmail: "support@harvestplus.rw",
  supportPhone: "+250 788 123 456",
}

const PublicSettingsContext = createContext<PublicSettings>(defaultSettings)

export function PublicSettingsProvider({
  children,
  initialData,
}: {
  children: React.ReactNode
  initialData?: PublicSettings | null
}) {
  const [settings, setSettings] = useState<PublicSettings>(initialData ?? defaultSettings)
  const [fetched, setFetched] = useState(false)

  useEffect(() => {
    if (initialData) {
      setSettings(initialData)
      return
    }
    if (fetched) return
    let cancelled = false
    fetch("/api/settings/public")
      .then((res) => res.json())
      .then((result) => {
        if (cancelled || !result?.success || !result?.data) return
        setSettings({ ...defaultSettings, ...result.data })
      })
      .catch(() => {})
      .finally(() => setFetched(true))
    return () => {
      cancelled = true
    }
  }, [initialData, fetched])

  const value = useMemo(() => settings, [settings])

  return (
    <PublicSettingsContext.Provider value={value}>
      {children}
    </PublicSettingsContext.Provider>
  )
}

export function usePublicSettings(): PublicSettings {
  return useContext(PublicSettingsContext) ?? defaultSettings
}
