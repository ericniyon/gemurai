"use client"

import { ClientOnly } from "@/components/client-only"
import { AuthProvider } from "@/components/auth-provider"

export default function MarketplaceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClientOnly fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Loading marketplace...</p>
        </div>
      </div>
    }>
      {children}
    </ClientOnly>
  )
} 