"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/hooks/use-auth"
import { useParams } from "next/navigation"
import { toast } from "sonner"
import { 
  Package, 
  Plus, 
  Search, 
  RefreshCw, 
  Calendar,
  TrendingUp,
  DollarSign,
  Loader2,
  Filter
} from "lucide-react"
import { AddCropCollectionForm } from "@/components/mcc/AddCropCollectionForm"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function CropCollectionsPage() {
  const { user } = useAuth()
  const params = useParams()
  const lang = (params?.lang as string) || "en"
  
  const [collections, setCollections] = useState<any[]>([])
  const [cropTypes, setCropTypes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterCropType, setFilterCropType] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem("Gemurai_token")
      
      // Fetch crop types
      const typesRes = await fetch("/api/v1/mcc/crops/types", {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (typesRes.ok) {
        const typesData = await typesRes.json()
        setCropTypes(typesData.data || [])
      }

      // Fetch collections
      if (user?.mccId) {
        const collectionsRes = await fetch(`/api/v1/mcc/crops/collections?mccId=${user.mccId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (collectionsRes.ok) {
          const collectionsData = await collectionsRes.json()
          setCollections(collectionsData.data || [])
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      toast.error("Failed to load data")
    } finally {
      setIsLoading(false)
    }
  }

  const filteredCollections = collections.filter((collection) => {
    const matchesSearch = 
      collection.farmer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      collection.cropType?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      collection.id.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCropType = filterCropType === "all" || collection.cropTypeId === filterCropType
    const matchesStatus = filterStatus === "all" || collection.status === filterStatus

    return matchesSearch && matchesCropType && matchesStatus
  })

  const stats = {
    total: filteredCollections.length,
    totalQuantity: filteredCollections.reduce((sum, c) => sum + (c.quantity || 0), 0),
    totalRevenue: filteredCollections.reduce((sum, c) => sum + (c.totalAmount || 0), 0),
    approved: filteredCollections.filter(c => c.status === "APPROVED").length,
    pending: filteredCollections.filter(c => c.status === "PENDING").length,
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
              <Package className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Crop Collections</h1>
              <p className="text-gray-600">Manage crop collections from farmers</p>
            </div>
          </div>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Record Collection
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Collections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-bold">{stats.total}</p>
              <Package className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Quantity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-bold">{stats.totalQuantity.toLocaleString()}</p>
              <TrendingUp className="h-8 w-8 text-blue-600" />
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
              <DollarSign className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm">Approved</span>
                <Badge variant="default">{stats.approved}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Pending</span>
                <Badge variant="secondary">{stats.pending}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by farmer, crop type, or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Crop Type</label>
              <Select value={filterCropType} onValueChange={setFilterCropType}>
                <SelectTrigger>
                  <SelectValue placeholder="All crop types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Crop Types</SelectItem>
                  {cropTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="PAID">Paid</SelectItem>
                  <SelectItem value="PROCESSED">Processed</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Collections List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Crop Collections</CardTitle>
              <CardDescription>
                {filteredCollections.length} collection(s) found
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={fetchData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 mx-auto animate-spin text-gray-400" />
              <p className="mt-2 text-gray-500">Loading collections...</p>
            </div>
          ) : filteredCollections.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No crop collections found</p>
              <Button className="mt-4" onClick={() => setIsFormOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Record First Collection
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCollections.map((collection) => (
                <Card key={collection.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">
                            {collection.cropType?.name || "Unknown Crop"}
                          </h3>
                          <Badge variant={
                            collection.status === "APPROVED" ? "default" :
                            collection.status === "PENDING" ? "secondary" :
                            collection.status === "REJECTED" ? "destructive" : "outline"
                          }>
                            {collection.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Farmer:</span> {collection.farmer?.name || "N/A"}
                          </div>
                          <div>
                            <span className="font-medium">Date:</span>{" "}
                            {new Date(collection.collectionDate).toLocaleDateString()}
                          </div>
                          <div>
                            <span className="font-medium">Quantity:</span> {collection.quantity} {collection.unit}
                          </div>
                          <div>
                            <span className="font-medium">Price:</span> RF {collection.pricePerUnit?.toLocaleString()}
                          </div>
                        </div>
                        {collection.qualityTests && Object.keys(collection.qualityTests).length > 0 && (
                          <div className="mt-2 text-xs text-gray-500">
                            Quality: {JSON.stringify(collection.qualityTests)}
                          </div>
                        )}
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-2xl font-bold">RF {collection.totalAmount?.toLocaleString()}</p>
                        <p className="text-sm text-gray-500">Net: RF {collection.netPayment?.toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Collection Form */}
      <AddCropCollectionForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSuccess={() => {
          fetchData()
          toast.success("Crop collection recorded successfully")
        }}
      />
    </div>
  )
}
