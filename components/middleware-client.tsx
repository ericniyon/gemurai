"use client"

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { useNavigate } from "@/lib/navigation"

export function MiddlewareClient() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const navigate = useNavigate()
  const pathname = usePathname()
  const lastPathRef = useRef(pathname)
  const redirectingRef = useRef(false)

  useEffect(() => {
    if (isLoading || !pathname) return

    // Prevent handling the same path multiple times
    if (lastPathRef.current === pathname) return
    lastPathRef.current = pathname

    // Prevent multiple redirects
    if (redirectingRef.current) return

    // Handle unauthenticated users
    if (!isAuthenticated) {
      redirectingRef.current = true
      const searchParams = new URLSearchParams({ redirect: pathname })
      navigate.replace(`/login?${searchParams.toString()}`)
      return
    }

    redirectingRef.current = false
  }, [pathname, isAuthenticated, isLoading, navigate])

  return null
} 