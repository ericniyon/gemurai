"use client"

import type React from "react"
import { useEffect, useState } from "react"
import type { ReactNode } from "react"
import { ensureGlobals, isBrowser } from "@/lib/environment"

interface SSRSafeProps {
  children: ReactNode
  fallback?: ReactNode
  onMount?: () => void
}

export function SSRSafe({ children, fallback = null, onMount }: SSRSafeProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    // Ensure all globals are properly defined before mounting
    if (isBrowser) {
      try {
        ensureGlobals()
        onMount?.()
      } catch (error) {
        console.error("Error during SSRSafe mount:", error)
      }
    }
    setIsMounted(true)
  }, [onMount])

  if (!isMounted) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

// Higher-order component for making any component SSR-safe
export function withSSRSafe<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode,
  onMount?: () => void,
) {
  return function SSRSafeComponent(props: P) {
    return (
      <SSRSafe fallback={fallback} onMount={onMount}>
        <Component {...props} />
      </SSRSafe>
    )
  }
}

// Hook to safely check if we're on the client
export function useIsClient() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    if (isBrowser) {
      ensureGlobals()
    }
    setIsClient(true)
  }, [])

  return isClient
}

// Utility to safely access browser APIs
export { isBrowser } from "@/lib/environment"
