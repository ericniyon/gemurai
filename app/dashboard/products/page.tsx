"use client"

import { ProductContent } from "./components/product-content"
import { ClientOnly } from "@/components/client-only"

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export default function ProductsPage() {
  return (
    <ClientOnly fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Loading products...</p>
        </div>
      </div>
    }>
      <ProductContent />
    </ClientOnly>
  )
} 