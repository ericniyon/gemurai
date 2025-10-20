"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import {
  Users,
  Droplets,
  DollarSign,
  TrendingUp,
  Calendar,
  FileText,
  Plus,
  Search,
  RefreshCw,
  BarChart3,
  PieChart,
  Download,
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock,
  Loader2,
  Package,
  Warehouse,
  ArrowUpDown,
  Activity
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

// Types for MCC-Inventory Integration
interface MCCInventorySummary {
  mcc: {
    id: string
    name: string
    location: string
    warehouses: Array<{
      id: string
      name: string
      type: string
      capacity: number
      products: number
    }>
  }
  inventorySummary: {
    totalProducts: number
    totalQuantity: number
    totalValue: number
    warehouses: Array<{
      id: string
      name: string
      type: string
      capacity: number
      currentQuantity: number
      currentValue: number
      products: number
    }>
  }
}

interface MilkCollection {
  id: string
  farmerId: string
  collectionDate: string
  totalLiters: number
  unitPrice: number
  totalAmount: number
  status: string
  farmer: {
    name: string
    phone: string
  }
  product: {
    name: string
  }
  warehouse: {
    name: string
  }
  stockMove: {
    id: string
    state: string
  } | null
}

interface Farmer {
  id: string
  name: string
  phone: string
  location: string
  totalAmountEarned: number
  lastCollectionDate: string | null
  collections: MilkCollection[]
}

export default function EnhancedMCCDashboard() {
  const [inventorySummary, setInventorySummary] = useState<MCCInventorySummary | null>(null)
  const [collections, setCollections] = useState<MilkCollection[]>([])
  const [farmers, setFarmers] = useState<Farmer[]>([])
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { user } = useAuth()
  const [tab, setTab] = useState("overview")
  const [searchQuery, setSearchQuery] = useState("")

  // Mock MCC ID - in real implementation, this would come from user context
  const mccId = "mock-mcc-id"

  const fetchInventorySummary = async () => {
    try {
      const response = await fetch(`/api/v1/mcc/inventory?mccId=${mccId}`, {
        headers: {
          'Authorization': `Bearer ${user?.accessToken}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setInventorySummary(data.data)
      }
    } catch (error) {
      console.error("Failed to fetch inventory summary:", error)
      toast.error("Failed to load inventory summary")
    }
  }

  const fetchCollections = async () => {
    try {
      const response = await fetch(`/api/v1/mcc/collections?mccId=${mccId}`, {
        headers: {
          'Authorization': `Bearer ${user?.accessToken}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setCollections(data.data)
      }
    } catch (error) {
      console.error("Failed to fetch collections:", error)
      toast.error("Failed to load collections")
    }
  }

  const fetchFarmers = async () => {
    try {
      const response = await fetch(`/api/v1/mcc/farmers?mccId=${mccId}`, {
        headers: {
          'Authorization': `Bearer ${user?.accessToken}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setFarmers(data.data)
      }
    } catch (error) {
      console.error("Failed to fetch farmers:", error)
      toast.error("Failed to load farmers")
    }
  }

  const fetchAllData = async () => {
    setLoading(true)
    try {
      await Promise.all([
        fetchInventorySummary(),
        fetchCollections(),
        fetchFarmers()
      ])
    } catch (error) {
      console.error("Failed to fetch data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchAllData()
    setIsRefreshing(false)
    toast.success("Data refreshed successfully")
  }

  useEffect(() => {
    fetchAllData()
  }, [])

  const filteredFarmers = farmers.filter(farmer =>
    farmer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    farmer.phone.includes(searchQuery) ||
    farmer.location.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredCollections = collections.filter(collection =>
    collection.farmer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    collection.product.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading MCC Dashboard...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">MCC Management Dashboard</h1>
          <p className="text-muted-foreground">
            Integrated inventory management for milk collection centers
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Inventory Overview Cards */}
      {inventorySummary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inventorySummary.inventorySummary.totalProducts}</div>
              <p className="text-xs text-muted-foreground">
                MCC-specific products
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Quantity</CardTitle>
              <Droplets className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inventorySummary.inventorySummary.totalQuantity.toFixed(1)}L</div>
              <p className="text-xs text-muted-foreground">
                Total milk in inventory
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">RWF {inventorySummary.inventorySummary.totalValue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Current inventory value
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Warehouses</CardTitle>
              <Warehouse className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inventorySummary.inventorySummary.warehouses.length}</div>
              <p className="text-xs text-muted-foreground">
                Active warehouses
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs value={tab} onValueChange={setTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="collections">Collections</TabsTrigger>
          <TabsTrigger value="farmers">Farmers</TabsTrigger>
          <TabsTrigger value="processing">Processing</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Collections */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Recent Collections
                </CardTitle>
                <CardDescription>
                  Latest milk collections with inventory integration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredCollections.slice(0, 5).map((collection) => (
                    <div key={collection.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div>
                          <p className="font-medium">{collection.farmer.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {collection.totalLiters}L • {collection.product.name}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">RWF {collection.totalAmount.toLocaleString()}</p>
                        <Badge variant={collection.stockMove ? "default" : "secondary"}>
                          {collection.stockMove ? "In Inventory" : "Pending"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Warehouse Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Warehouse className="h-5 w-5 mr-2" />
                  Warehouse Status
                </CardTitle>
                <CardDescription>
                  Current inventory levels by warehouse
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {inventorySummary?.inventorySummary.warehouses.map((warehouse) => (
                    <div key={warehouse.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{warehouse.name}</h4>
                        <Badge variant="outline">{warehouse.type}</Badge>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Capacity:</span>
                          <span>{warehouse.capacity}L</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Current:</span>
                          <span>{warehouse.currentQuantity.toFixed(1)}L</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${(warehouse.currentQuantity / warehouse.capacity) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Inventory Tab */}
        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Management</CardTitle>
              <CardDescription>
                Real-time inventory tracking with stock moves
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Inventory Management</h3>
                <p className="text-muted-foreground mb-4">
                  Track milk products across all warehouses with real-time stock updates
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Collections Tab */}
        <TabsContent value="collections" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Milk Collections</span>
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="Search collections..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64"
                  />
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    New Collection
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>
                Milk collections with integrated inventory tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredCollections.map((collection) => (
                  <div key={collection.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Droplets className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{collection.farmer.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {collection.product.name} • {collection.warehouse.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(collection.collectionDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{collection.totalLiters}L</p>
                      <p className="text-sm text-muted-foreground">
                        RWF {collection.totalAmount.toLocaleString()}
                      </p>
                      <Badge 
                        variant={collection.stockMove ? "default" : "secondary"}
                        className="mt-1"
                      >
                        {collection.stockMove ? "In Inventory" : "Pending"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Farmers Tab */}
        <TabsContent value="farmers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Farmers</span>
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="Search farmers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64"
                  />
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Farmer
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>
                Farmer management with collection history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredFarmers.map((farmer) => (
                  <div key={farmer.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">{farmer.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {farmer.phone} • {farmer.location}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Last collection: {farmer.lastCollectionDate ? 
                            new Date(farmer.lastCollectionDate).toLocaleDateString() : 
                            'Never'
                          }
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">RWF {farmer.totalAmountEarned.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">
                        {farmer.collections.length} collections
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Processing Tab */}
        <TabsContent value="processing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ArrowUpDown className="h-5 w-5 mr-2" />
                Milk Processing
              </CardTitle>
              <CardDescription>
                Process raw milk into finished products
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <ArrowUpDown className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Milk Processing</h3>
                <p className="text-muted-foreground mb-4">
                  Convert raw milk into pasteurized milk and other products
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Start Processing
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
