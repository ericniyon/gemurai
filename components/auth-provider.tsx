"use client"

import { useEffect, useState, useCallback, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuthStore } from "@/lib/stores/auth-store"

const TOKEN_KEY = "Gemurai_token"
const USER_KEY = "Gemurai_user"
const VERIFICATION_INTERVAL = 30 * 60 * 1000 // 30 minutes (increased from 10 minutes)

// Loading fallback component
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-4">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      <p className="text-sm text-muted-foreground">Loading...</p>
    </div>
  </div>
)

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { 
    initializeFromStorage, 
    isInitialized, 
    isAuthenticated,
    verifyAuth,
    setIsLoading 
  } = useAuthStore()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Initialize auth state
  useEffect(() => {
    if (!isInitialized) {
      console.log("🔄 Initializing auth state from storage...")
      initializeFromStorage()
    }
  }, [isInitialized, initializeFromStorage])

  // Periodically verify auth state
  useEffect(() => {
    if (!isMounted || !isInitialized || !isAuthenticated) {
      console.log("⏭️ Skipping auth verification:", { 
        isMounted, 
        isInitialized, 
        isAuthenticated 
      })
      return
    }

    console.log("🔄 Setting up periodic auth verification (every 30 minutes)")

    const verifyInterval = setInterval(async () => {
      // Skip verification if user is actively using the app (document has focus)
      if (document.hasFocus()) {
        console.log("⏭️ Skipping auth verification - user is active")
        return
      }
      
      console.log("🔍 Running periodic auth verification...")
      try {
        await verifyAuth()
        console.log("✅ Auth verification completed successfully")
      } catch (error) {
        console.error('❌ Auth verification error:', error)
        
        // Check if it's an infrastructure error
        const errorMessage = error instanceof Error ? error.message : String(error)
        const isInfrastructureError = errorMessage.includes('connect') || 
                                   errorMessage.includes('network') || 
                                   errorMessage.includes('database') ||
                                   errorMessage.includes('timeout') ||
                                   errorMessage.includes('ECONNREFUSED')
        
        if (isInfrastructureError) {
          console.warn("🌐 Infrastructure error during auth verification, keeping session:", errorMessage)
          // Don't log out for infrastructure errors, just log and continue
        } else {
          console.error("🔐 Actual auth error during verification:", error)
          // The auth store will handle multiple failures gracefully
        }
      }
    }, VERIFICATION_INTERVAL)
    
    return () => {
      console.log("🧹 Cleaning up auth verification interval")
      clearInterval(verifyInterval)
    }
  }, [isMounted, isInitialized, isAuthenticated, verifyAuth, pathname, router])

  if (!isMounted) {
    return <LoadingFallback />
  }

  return <>{children}</>
}

export default AuthProvider
