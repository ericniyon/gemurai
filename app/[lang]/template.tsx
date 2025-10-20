"use client"

import { ClientOnly } from "@/components/client-only"

export default function Template({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClientOnly fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    }>
      {children}
    </ClientOnly>
  )
} 