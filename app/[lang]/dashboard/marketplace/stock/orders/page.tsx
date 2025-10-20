"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Plus } from "lucide-react"
import Link from "next/link"
import { StockOrderList } from "@/app/components/stock-order/StockOrderList"
import { StockOrderDialog } from "@/app/components/stock-order/StockOrderDialog"

export default function StockOrdersPage() {
  const { user } = useAuth()
  const params = useParams()
  const lang = (params?.lang as string) || "en"
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const { toast } = useToast()

  const handleOrderCreated = () => {
    setIsCreateDialogOpen(false)
    setRefreshKey(prev => prev + 1) // Force refresh of StockOrderList
    toast({
      title: "Success",
      description: "Stock order created successfully",
    })
  }

  useEffect(() => {
    // Any initialization logic if needed
    setIsLoading(false)
  }, [])

  if (isLoading) {
    return null
  }

  if (!user || (user.role !== "EMPLOYER" && user.role !== "DCC")) {
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
          <h1 className="text-2xl font-semibold">
            {user.role === "DCC" ? "My Stock Orders" : "Stock Orders"}
          </h1>
          <p className="text-muted-foreground">
            {user.role === "DCC" 
              ? "View and manage your stock orders" 
              : "View and manage stock orders from DCCs"
            }
          </p>
        </div>
        <div className="flex items-center gap-3">
          {user.role === "DCC" && (
            <Button 
              onClick={() => setIsCreateDialogOpen(true)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              New Order
            </Button>
          )}
          <Link href="../">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Stock
            </Button>
          </Link>
        </div>
      </div>

      {user.role === "EMPLOYER" && (
        <div className="bg-muted/50 p-6 rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Stock Analytics</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <h3 className="text-sm font-medium">Coming Soon</h3>
                <p className="text-xs text-muted-foreground mt-1">Stock analytics will be available soon</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
      
      <StockOrderList 
        isEmployer={user.role === "EMPLOYER" || user.role === "BRANCH_MANAGER"} 
        key={refreshKey} // Force refresh when orders are created
      />

      {/* Stock Order Dialog */}
      <StockOrderDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSuccess={handleOrderCreated}
        product={selectedProduct}
      />
    </div>
  )
} 