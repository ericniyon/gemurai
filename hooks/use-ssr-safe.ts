"use client"

import { useEffect, useState } from "react"
import { isBrowser, ensureGlobals } from "@/lib/environment"

/**
 * Hook to safely detect client-side mounting
 */
export function useIsClient(): boolean {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    // Ensure all globals are properly defined
    if (isBrowser) {
      ensureGlobals()
    }
    setIsClient(true)
  }, [])

  return isClient
}

/**
 * Hook to safely access browser APIs
 */
export function useSafeBrowser() {
  const isClient = useIsClient()

  return {
    isClient,
    isBrowser: isClient && isBrowser,
    localStorage: isClient ? localStorage : null,
    sessionStorage: isClient ? sessionStorage : null,
    document: isClient ? document : null,
    navigator: isClient ? navigator : null,
    location: isClient ? location : null,
  }
}

/**
 * Hook for safe feature detection
 */
export function useFeatureDetection() {
  const isClient = useIsClient()

  const [features, setFeatures] = useState({
    localStorage: false,
    sessionStorage: false,
    indexedDB: false,
    webWorkers: false,
    serviceWorkers: false,
    resizeObserver: false,
    intersectionObserver: false,
  })

  useEffect(() => {
    if (!isClient) return

    setFeatures({
      localStorage: typeof localStorage !== "undefined",
      sessionStorage: typeof sessionStorage !== "undefined",
      indexedDB: typeof indexedDB !== "undefined",
      webWorkers: typeof Worker !== "undefined",
      serviceWorkers: "serviceWorker" in navigator,
      resizeObserver: typeof ResizeObserver !== "undefined",
      intersectionObserver: typeof IntersectionObserver !== "undefined",
    })
  }, [isClient])

  return features
}

/**
 * Hook to safely run client-side only code
 */
export function useClientOnly(callback: () => void, deps: any[] = []) {
  const isClient = useIsClient()

  useEffect(() => {
    if (isClient) {
      callback()
    }
  }, [isClient, ...deps])
}
