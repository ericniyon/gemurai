"use client"

import { useEffect, useCallback } from "react"
import { useAuth } from "./use-auth"

export function usePermissionUpdates() {
  const { refreshUser } = useAuth()

  const handlePermissionUpdate = useCallback(async (event: CustomEvent) => {
    console.log("🔄 Permission update detected:", event.detail)
    
    try {
      // Refresh user data to get updated permissions
      await refreshUser()
      console.log("✅ Auth context refreshed after permission update")
    } catch (error) {
      console.error("❌ Error refreshing auth context after permission update:", error)
    }
  }, [refreshUser])

  useEffect(() => {
    // Listen for permission update events
    window.addEventListener('permissionsUpdated', handlePermissionUpdate as EventListener)
    
    // Cleanup
    return () => {
      window.removeEventListener('permissionsUpdated', handlePermissionUpdate as EventListener)
    }
  }, [handlePermissionUpdate])

  // Function to manually trigger a permission update event
  const triggerPermissionUpdate = useCallback(() => {
    window.dispatchEvent(new CustomEvent('permissionsUpdated', {
      detail: {
        timestamp: new Date().toISOString(),
        message: 'Manual permission update triggered'
      }
    }))
  }, [])

  return {
    triggerPermissionUpdate
  }
} 