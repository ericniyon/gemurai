"use client"

import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { StockOrderList } from "@/app/components/stock-order/StockOrderList"
import { useParams } from "next/navigation"

export default function StockOrdersPage() {
  const { user } = useAuth()
  const params = useParams()
  const lang = (params?.lang as string) || "en"

  if (!user || user.role !== "EMPLOYER") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="p-6">
          <CardContent>
            <h2 className="text-xl font-semibold text-red-600 mb-2">Access Denied</h2>
            <p className="text-gray-600">You don't have permission to access this page.</p>
            <Link href={`/${lang}/dashboard`}>
              <Button className="mt-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Return to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Stock Orders</h1>
          <p className="text-muted-foreground">View and manage stock orders from DCCs</p>
        </div>
        <Link href={`/${lang}/dashboard/stock`}>
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Stock
          </Button>
        </Link>
      </div>

      <StockOrderList isEmployer={true} />
    </div>
  )
} 