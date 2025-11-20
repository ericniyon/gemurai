"use client"

import { useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/stores/auth-store"

const VERIFICATION_INTERVAL = 5 * 60 * 1000 // 5 minutes
const VERIFICATION_CACHE_TIME = 4.5 * 60 * 1000 // 4.5 minutes

export type User = {
  id: string
  email: string
  role: string
  permissions: string[]
  name?: string
  mccId?: string | null
}

export function useAuth() {
  const router = useRouter()
  const authStore = useAuthStore()

  useEffect(() => {
    if (!authStore.isInitialized) {
      authStore.initializeFromStorage()
    }
  }, [authStore.isInitialized])

  const handleLogout = useCallback(() => {
    document.cookie = "Gemurai_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
    authStore.logout()
    router.push("/login")
  }, [router])

  const verifyAuth = useCallback(async () => {
    try {
      await authStore.verifyAuth()
      return { success: authStore.isAuthenticated }
    } catch (error) {
      console.error("Verification failed:", error)
      return { success: false, error: error instanceof Error ? error.message : "Verification failed" }
    }
  }, [authStore])

  return {
    user: authStore.user,
    isLoading: authStore.isLoading,
    isAuthenticated: authStore.isAuthenticated,
    login: authStore.login,
    logout: handleLogout,
    refreshUser: authStore.refreshUser,
    verifyAuth,
  }
}
