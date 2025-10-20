"use client"

import React, { useEffect, useState, ReactNode } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { ClientOnly } from './client-only'

function DynamicAuthProvider({ children }: { children: ReactNode }) {
  const [isMounted, setIsMounted] = useState(false)
  const auth = useAuth()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted || auth.isInitialized) return

    // Add a small delay to prevent immediate initialization
    const timer = setTimeout(async () => {
      try {
        await auth.verifyAuth()
      } catch (error) {
        console.warn("Auth verification failed during initialization:", error)
        // Don't fail initialization for infrastructure errors
        const errorMessage = error instanceof Error ? error.message : String(error)
        const isInfrastructureError = errorMessage.includes('connect') || 
                                   errorMessage.includes('network') || 
                                   errorMessage.includes('database') ||
                                   errorMessage.includes('timeout') ||
                                   errorMessage.includes('ECONNREFUSED')
        
        if (!isInfrastructureError) {
          // Only log out for actual auth errors, not infrastructure issues
          console.error("Auth error during initialization:", error)
        }
      }
      auth.setIsInitialized(true)
    }, 100)

    return () => clearTimeout(timer)
  }, [isMounted, auth.isInitialized])

  if (!isMounted) {
    return null
  }

  return <>{children}</>
}

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <ClientOnly>
      <DynamicAuthProvider>{children}</DynamicAuthProvider>
    </ClientOnly>
  )
}