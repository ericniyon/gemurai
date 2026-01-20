"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/use-auth"
import { useParams } from "next/navigation"
import Link from "next/link"
import { 
  Sprout, 
  Package, 
  Database, 
  Calendar, 
  Activity,
  Plus,
  TrendingUp,
  BarChart3,
  FileText
} from "lucide-react"
import { AddCropCollectionForm } from "@/components/mcc/AddCropCollectionForm"
import { toast } from "sonner"

export default function AgriculturePage() {
  const { user } = useAuth()
  const params = useParams()
  const lang = (params?.lang as string) || "en"
  
  const [cropTypes, setCropTypes] = useState<any[]>([])
  const [cropCollections, setCropCollections] = useState<any[]>([])
  const [cropPeriods, setCropPeriods] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCollectionFormOpen, setIsCollectionFormOpen] = useState(false)

  useEffect(() => {
    fetchAgricultureData()
  }, [])

  const fetchAgricultureData = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem("Gemurai_token")
      
      const [typesRes, collectionsRes, periodsRes] = await Promise.all([
        fetch("/api/v1/mcc/crops/types", {
          headers: { Authorization: `Bearer ${token}` }
        }),
        user?.mccId ? fetch(`/api/v1/mcc/crops/collections?mccId=${user.mccId}`, {
          headers: { Authorization: `Bearer ${token}` }
        }) : Promise.resolve(null),
        user?.mccId ? fetch(`/api/v1/mcc/crops/periods?mccId=${user.mccId}`, {
          headers: { Authorization: `Bearer ${token}` }
        }) : Promise.resolve(null)
      ])

      if (typesRes.ok) {
        const data = await typesRes.json()
        setCropTypes(data.data || [])
      }

      if (collectionsRes && collectionsRes.ok) {
        const data = await collectionsRes.json()
        setCropCollections(data.data || [])
      }

      if (periodsRes && periodsRes.ok) {
        const data = await periodsRes.json()
        setCropPeriods(data.data || [])
      }
    } catch (error) {
      console.error("Error fetching agriculture data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const stats = {
    totalCropTypes: cropTypes.length,
    totalCollections: cropCollections.length,
    totalPeriods: cropPeriods.length,
    totalVolume: cropCollections.reduce((sum, c) => sum + (c.quantity || 0), 0),
    totalRevenue: cropCollections.reduce((sum, c) => sum + (c.totalAmount || 0), 0)
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
              <Sprout className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Agriculture - Crops Sector</h1>
              <p className="text-gray-600">Manage crop collections, types, periods, and processing</p>
            </div>
          </div>
        </div>
        <Button onClick={() => setIsCollectionFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Record Crop Collection
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Crop Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-bold">{stats.totalCropTypes}</p>
              <Database className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Collections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-bold">{stats.totalCollections}</p>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-bold">{stats.totalVolume.toLocaleString()}</p>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
            <p className="text-xs text-gray-500 mt-1">kg/bags</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-bold">RF {stats.totalRevenue.toLocaleString()}</p>
              <BarChart3 className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="collections" className="space-y-6">
        <TabsList>
          <TabsTrigger value="collections">
            <Package className="h-4 w-4 mr-2" />
            Collections
          </TabsTrigger>
          <TabsTrigger value="types">
            <Database className="h-4 w-4 mr-2" />
            Crop Types
          </TabsTrigger>
          <TabsTrigger value="periods">
            <Calendar className="h-4 w-4 mr-2" />
            Periods
          </TabsTrigger>
          <TabsTrigger value="processing">
            <Activity className="h-4 w-4 mr-2" />
            Processing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="collections">
          <Card>
            <CardHeader>
              <CardTitle>Crop Collections</CardTitle>
              <CardDescription>
                Record and manage crop collections (crop_collections)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Loading collections...</div>
              ) : cropCollections.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>No crop collections recorded yet</p>
                  <Button 
                    className="mt-4" 
                    onClick={() => setIsCollectionFormOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Record First Collection
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {cropCollections.map((collection) => (
                    <Card key={collection.id}>
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold">{collection.cropType?.name || "Unknown Crop"}</p>
                            <p className="text-sm text-gray-500">
                              {collection.farmer?.name} • {new Date(collection.collectionDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">{collection.quantity} {collection.unit}</p>
                            <p className="text-sm text-gray-500">RF {collection.totalAmount?.toLocaleString()}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="types">
          <Card>
            <CardHeader>
              <CardTitle>Crop Types</CardTitle>
              <CardDescription>
                Manage crop types (crop_types) - Maize, Beans, Rice, etc.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Loading crop types...</div>
              ) : cropTypes.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Database className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>No crop types defined yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {cropTypes.map((type) => (
                    <Card key={type.id}>
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold">{type.name}</p>
                            <p className="text-xs text-gray-500">Code: {type.code}</p>
                            <p className="text-xs text-gray-500">Unit: {type.unitOfMeasure}</p>
                          </div>
                          <Badge variant={type.isActive ? "default" : "secondary"}>
                            {type.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="periods">
          <Card>
            <CardHeader>
              <CardTitle>Crop Periods</CardTitle>
              <CardDescription>
                Manage crop aggregation periods (crop_periods)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Loading periods...</div>
              ) : cropPeriods.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>No crop periods created yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cropPeriods.map((period) => (
                    <Card key={period.id}>
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold">Period {period.periodNumber}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(period.startDate).toLocaleDateString()} - {new Date(period.endDate).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge>{period.status}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="processing">
          <Card>
            <CardHeader>
              <CardTitle>Crop Processing</CardTitle>
              <CardDescription>
                Track crop processing workflows (crop_processing)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Activity className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>Crop processing records will appear here</p>
                <Link href={`/${lang}/dashboard/mcc/crops/processing`}>
                  <Button variant="outline" className="mt-4">
                    View Processing Records
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Crop Collection Form */}
      <AddCropCollectionForm
        open={isCollectionFormOpen}
        onOpenChange={setIsCollectionFormOpen}
        onSuccess={() => {
          fetchAgricultureData()
          toast.success("Crop collection recorded successfully")
        }}
      />
    </div>
  )
}
