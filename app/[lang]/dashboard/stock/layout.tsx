"use client"

import { ReactNode } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function StockLayout({ children }: { children: ReactNode }) {
  const params = useParams()
  const lang = (params?.lang as string) || "en"

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Stock Management</h2>
        <p className="text-muted-foreground">
          Manage your products and orders efficiently
        </p>
      </div>

      <div className="space-y-4">
        {children}
      </div>
    </div>
  )
} 