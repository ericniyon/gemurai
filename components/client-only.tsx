"use client"

import { useEffect, useState, type ReactNode } from "react"
import { Loader2 } from "lucide-react"

interface ClientOnlyProps {
  children: ReactNode
  fallback?: ReactNode
}

export function ClientOnly({ 
  children, 
  fallback = (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
    </div>
  ) 
}: ClientOnlyProps) {
  const [hasMounted, setHasMounted] = useState(false)

  // Use layout effect to avoid flicker
  useEffect(() => {
    setHasMounted(true)
  }, [])

  // During SSR and before hydration, render nothing
  if (!hasMounted) {
    return null
  }

  // After hydration, render the children
  return children
}

export function useIsClient() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  return isClient
}
