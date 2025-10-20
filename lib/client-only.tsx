"use client"

import type React from "react"

import { useEffect, useState } from "react"

interface ClientOnlyProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  if (!hasMounted) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

// Hook to check if we're on the client side
export function useIsClient() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  return isClient
}

// Utility to safely access browser APIs
export function isBrowser() {
  return typeof window !== "undefined"
}

// Safe localStorage access
export const safeLocalStorage = {
  getItem: (key: string): string | null => {
    if (!isBrowser()) return null
    try {
      return localStorage.getItem(key)
    } catch {
      return null
    }
  },
  setItem: (key: string, value: string): void => {
    if (!isBrowser()) return
    try {
      localStorage.setItem(key, value)
    } catch {
      // Silently fail
    }
  },
  removeItem: (key: string): void => {
    if (!isBrowser()) return
    try {
      localStorage.removeItem(key)
    } catch {
      // Silently fail
    }
  },
}

// Safe sessionStorage access
export const safeSessionStorage = {
  getItem: (key: string): string | null => {
    if (!isBrowser()) return null
    try {
      return sessionStorage.getItem(key)
    } catch {
      return null
    }
  },
  setItem: (key: string, value: string): void => {
    if (!isBrowser()) return
    try {
      sessionStorage.setItem(key, value)
    } catch {
      // Silently fail
    }
  },
  removeItem: (key: string): void => {
    if (!isBrowser()) return
    try {
      sessionStorage.removeItem(key)
    } catch {
      // Silently fail
    }
  },
}
