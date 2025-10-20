"use client"

import { ReactNode } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"

interface AuthGuardProps {
  children: ReactNode
  fallback?: ReactNode
  redirectTo?: string
}

export function AuthGuard({ children, fallback, redirectTo }: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    if (redirectTo) {
      router.push(redirectTo)
      return null
    }
    return fallback || null
  }

  return <>{children}</>
} 