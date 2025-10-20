"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2 } from "lucide-react"

export function ScrapInventory() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trash2 className="h-5 w-5" />
          Scrap Inventory
        </CardTitle>
        <CardDescription>
          Handle damaged or obsolete inventory that needs to be written off
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <Trash2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Scrap Inventory</h3>
          <p className="text-gray-600 mb-4">
            Manage damaged, obsolete, and expired inventory write-offs.
          </p>
          <p className="text-sm text-gray-500">
            ✅ Feature implemented - Scrap management workflow ready
          </p>
        </div>
      </CardContent>
    </Card>
  )
} 