"use client"

import { ComponentType } from "react"
import { ClientOnly } from "@/components/client-only"

export function withAuth<P extends object>(Component: ComponentType<P>) {
  return function WithAuthComponent(props: P) {
    return (
      <ClientOnly fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        </div>
      }>
        <Component {...props} />
      </ClientOnly>
    )
  }
} 