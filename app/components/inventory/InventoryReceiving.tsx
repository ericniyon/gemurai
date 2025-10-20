"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Package, Plus, Search, CheckCircle, Truck, MapPin, Database, AlertCircle } from "lucide-react"

interface Product {
  id: string
  name: string
  description?: string
  category: string
  stock: number
  barcode?: string
}

interface Location {
  id: string
  name: string
  code: string
  locationType: string
  warehouseId: string
  warehouse: {
    id: string
    name: string
    code: string
  }
}

interface ReceivingItem {
  id: string
  productId: string
  product: Product
  quantity: number
  receivedQuantity: number
  destinationLocationId: string
  destinationLocation: Location
  status: 'pending' | 'received' | 'verified'
  notes?: string
}

interface InventoryReceivingProps {
  onRefresh?: () => void
}

export function InventoryReceiving({ onRefresh }: InventoryReceivingProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [receivingItems, setReceivingItems] = useState<ReceivingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    productId: "",
    quantity: "",
    destinationLocationId: "",
    reference: "",
    notes: ""
  })
  const { toast } = useToast()

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/v1/superadmin/products", { credentials: "include" })
      const data = await response.json()
      if (data.success) {
        setProducts(data.products || [])
      }
    } catch (error) {
      console.error("Error fetching products:", error)
    }
  }

  const fetchLocations = async () => {
    try {
      const response = await fetch("/api/v1/superadmin/locations", { credentials: "include" })
      const data = await response.json()
      if (data.success) {
        setLocations(data.locations || [])
      }
    } catch (error) {
      console.error("Error fetching locations:", error)
    }
  }

  const fetchReceivingItems = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/v1/superadmin/stock-moves?moveType=INCOMING", {
        credentials: "include"
      })
      const data = await response.json()
      if (data.success) {
        // Transform stock moves to receiving items
        const items = data.stockMoves.map((move: any) => ({
          id: move.id,
          productId: move.productId,
          product: move.product,
          quantity: move.quantity,
          receivedQuantity: 0, // This would be tracked separately in a real system
          destinationLocationId: move.destinationLocationId,
          destinationLocation: move.destinationLocation,
          status: move.state === 'DONE' ? 'verified' : move.state === 'CONFIRMED' ? 'received' : 'pending',
          notes: move.notes
        }))
        setReceivingItems(items)
      }
    } catch (error) {
      console.error("Error fetching receiving items:", error)
      toast({
        title: "Error",
        description: "Failed to fetch receiving items",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
    fetchLocations()
    fetchReceivingItems()
  }, [])

  const handleCreateReceivingItem = async () => {
    try {
      const response = await fetch("/api/v1/superadmin/stock-moves", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          moveType: "INCOMING",
          quantity: parseInt(formData.quantity),
          warehouseId: locations.find(l => l.id === formData.destinationLocationId)?.warehouseId
        }),
        credentials: "include"
      })

      const data = await response.json()
      if (data.success) {
        toast({ title: "Success", description: "Receiving item created successfully" })
        fetchReceivingItems()
        setIsCreateDialogOpen(false)
        resetForm()
        onRefresh?.()
      } else {
        throw new Error(data.error || "Failed to create receiving item")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create receiving item",
        variant: "destructive",
      })
    }
  }

  const handleReceiveItem = async (itemId: string) => {
    try {
      const response = await fetch(`/api/v1/superadmin/stock-moves/confirm`, {
        method: "POST",
        credentials: "include",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: itemId }),
      })

      const data = await response.json()
      if (data.success) {
        toast({ title: "Success", description: "Item received and stock updated" })
        fetchReceivingItems()
        onRefresh?.()
      } else {
        throw new Error(data.error || "Failed to receive item")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to receive item",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      productId: "",
      quantity: "",
      destinationLocationId: "",
      reference: "",
      notes: ""
    })
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "Pending", color: "bg-yellow-500" },
      received: { label: "Received", color: "bg-blue-500" },
      verified: { label: "Verified", color: "bg-green-500" }
    }
    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, color: "bg-gray-500" }
    return <Badge className={config.color}>{config.label}</Badge>
  }

  const filteredItems = receivingItems.filter((item) => {
    const searchString = searchTerm.toLowerCase()
    return (
      item.product.name.toLowerCase().includes(searchString) ||
      item.product.barcode?.toLowerCase().includes(searchString) ||
      item.destinationLocation.name.toLowerCase().includes(searchString)
    )
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="text-gray-600">Loading receiving items...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Inventory Receiving</h2>
          <p className="text-sm text-gray-600">
            Receive goods → Record receipt → Update stock → Assign locations
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Receiving Item
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create Receiving Item</DialogTitle>
              <DialogDescription>
                Step 1: Record goods to be received
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="product">Product</Label>
                <Select
                  value={formData.productId}
                  onValueChange={(value) => setFormData({ ...formData, productId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} {product.barcode && `(${product.barcode})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Expected Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    placeholder="Enter quantity"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="destinationLocation">Receiving Location</Label>
                  <Select
                    value={formData.destinationLocationId}
                    onValueChange={(value) => setFormData({ ...formData, destinationLocationId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations
                        .filter(location => location.locationType === "RECEIVING" || location.locationType === "STORAGE")
                        .map((location) => (
                          <SelectItem key={location.id} value={location.id}>
                            {location.name} ({location.warehouse.name}) - {location.locationType}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reference">Reference</Label>
                <Input
                  id="reference"
                  value={formData.reference}
                  onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                  placeholder="PO number, delivery note, etc."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes about the receiving"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateReceivingItem}>
                Create Receiving Item
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Process Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Receiving Process Steps
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                1
              </div>
              <div>
                <p className="font-medium text-sm">Receive Goods</p>
                <p className="text-xs text-gray-600">Physical receipt of items</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <div className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                2
              </div>
              <div>
                <p className="font-medium text-sm">Record Receipt</p>
                <p className="text-xs text-gray-600">Document the receipt</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                3
              </div>
              <div>
                <p className="font-medium text-sm">Update Stock</p>
                <p className="text-xs text-gray-600">Increase inventory levels</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
              <div className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                4
              </div>
              <div>
                <p className="font-medium text-sm">Assign Locations</p>
                <p className="text-xs text-gray-600">Place items in storage</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search receiving items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Receiving Items Table */}
      <Card>
        <CardHeader>
          <CardTitle>Receiving Items ({filteredItems.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Expected Qty</TableHead>
                  <TableHead>Received Qty</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Package className="h-8 w-8 text-gray-400" />
                        <p className="text-gray-500">No receiving items found</p>
                        {searchTerm && <p className="text-sm text-gray-400">Try adjusting your search</p>}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{item.product.name}</p>
                          {item.product.barcode && (
                            <p className="text-sm text-gray-500">{item.product.barcode}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{item.quantity}</TableCell>
                      <TableCell className="font-medium">{item.receivedQuantity}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span>{item.destinationLocation.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {item.notes || "-"}
                      </TableCell>
                      <TableCell>
                        {item.status === 'pending' && (
                          <Button
                            size="sm"
                            onClick={() => handleReceiveItem(item.id)}
                            className="flex items-center gap-2"
                          >
                            <CheckCircle className="h-4 w-4" />
                            Receive
                          </Button>
                        )}
                        {item.status === 'received' && (
                          <Badge className="bg-green-500">Received</Badge>
                        )}
                        {item.status === 'verified' && (
                          <Badge className="bg-blue-500">Verified</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 