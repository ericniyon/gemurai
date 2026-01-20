"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/use-auth"
import { useParams } from "next/navigation"
import { toast } from "sonner"
import { 
  Activity, 
  Plus, 
  RefreshCw, 
  Loader2,
  TrendingUp,
  Package
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function CropProcessingPage() {
  const { user } = useAuth()
  const params = useParams()
  const lang = (params?.lang as string) || "en"
  
  const [processingRecords, setProcessingRecords] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formData, setFormData] = useState({
    rawCropProductId: "",
    processedProductId: "",
    inputQuantity: 0,
    outputQuantity: 0,
    processingDate: new Date().toISOString().split('T')[0],
    processingSteps: "",
    qualityMetrics: "",
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem("Gemurai_token")
      
      // Fetch processing records
      if (user?.mccId) {
        const processingRes = await fetch(`/api/v1/mcc/crops/processing?mccId=${user.mccId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (processingRes.ok) {
          const data = await processingRes.json()
          setProcessingRecords(data.data || [])
        }
      }

      // Fetch products (for dropdowns)
      const productsRes = await fetch("/api/v1/products", {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (productsRes.ok) {
        const data = await productsRes.json()
        setProducts(data.data || [])
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      toast.error("Failed to load data")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem("Gemurai_token")
      if (!user?.mccId) {
        toast.error("MCC ID required")
        return
      }

      const response = await fetch("/api/v1/mcc/crops/processing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          mccId: user.mccId,
          rawCropProductId: formData.rawCropProductId,
          processedProductId: formData.processedProductId,
          inputQuantity: formData.inputQuantity,
          outputQuantity: formData.outputQuantity,
          processingDate: formData.processingDate,
          processingSteps: formData.processingSteps ? JSON.parse(formData.processingSteps) : undefined,
          qualityMetrics: formData.qualityMetrics ? JSON.parse(formData.qualityMetrics) : undefined,
        }),
      })

      if (response.ok) {
        toast.success("Crop processing recorded successfully")
        setIsFormOpen(false)
        setFormData({
          rawCropProductId: "",
          processedProductId: "",
          inputQuantity: 0,
          outputQuantity: 0,
          processingDate: new Date().toISOString().split('T')[0],
          processingSteps: "",
          qualityMetrics: "",
        })
        fetchData()
      } else {
        const data = await response.json()
        throw new Error(data.error || "Failed to record processing")
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to record processing")
    }
  }

  const efficiency = processingRecords.length > 0
    ? processingRecords.reduce((sum, r) => {
        const eff = r.outputQuantity && r.inputQuantity ? (r.outputQuantity / r.inputQuantity) * 100 : 0
        return sum + eff
      }, 0) / processingRecords.length
    : 0

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
              <Activity className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Crop Processing</h1>
              <p className="text-gray-600">Track crop processing workflows</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Record Processing
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Processing Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-bold">{processingRecords.length}</p>
              <Activity className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Average Efficiency</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-bold">{efficiency.toFixed(1)}%</p>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Output</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-bold">
                {processingRecords.reduce((sum, r) => sum + (r.outputQuantity || 0), 0).toLocaleString()}
              </p>
              <Package className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Processing Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>Processing Records</CardTitle>
          <CardDescription>
            {processingRecords.length} processing record(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 mx-auto animate-spin text-gray-400" />
              <p className="mt-2 text-gray-500">Loading processing records...</p>
            </div>
          ) : processingRecords.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Activity className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No processing records found</p>
              <Button className="mt-4" onClick={() => setIsFormOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Record First Processing
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Raw Product</TableHead>
                  <TableHead>Processed Product</TableHead>
                  <TableHead>Input Qty</TableHead>
                  <TableHead>Output Qty</TableHead>
                  <TableHead>Efficiency</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {processingRecords.map((record) => {
                  const efficiency = record.outputQuantity && record.inputQuantity
                    ? ((record.outputQuantity / record.inputQuantity) * 100).toFixed(1)
                    : "0"
                  
                  return (
                    <TableRow key={record.id}>
                      <TableCell>
                        {new Date(record.processingDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{record.rawCropProduct?.name || "N/A"}</TableCell>
                      <TableCell>{record.processedProduct?.name || "N/A"}</TableCell>
                      <TableCell>{record.inputQuantity} {record.rawCropProduct?.unit || ""}</TableCell>
                      <TableCell>{record.outputQuantity} {record.processedProduct?.unit || ""}</TableCell>
                      <TableCell>
                        <Badge variant={parseFloat(efficiency) >= 80 ? "default" : "secondary"}>
                          {efficiency}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Processing Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Record Crop Processing</DialogTitle>
            <DialogDescription>
              Record a crop processing workflow
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rawCropProductId">Raw Crop Product *</Label>
                <Select
                  value={formData.rawCropProductId}
                  onValueChange={(value) => setFormData({ ...formData, rawCropProductId: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select raw product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.filter(p => p.category?.toLowerCase().includes('crop') || p.name?.toLowerCase().includes('raw')).map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="processedProductId">Processed Product *</Label>
                <Select
                  value={formData.processedProductId}
                  onValueChange={(value) => setFormData({ ...formData, processedProductId: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select processed product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.filter(p => p.category?.toLowerCase().includes('processed') || p.name?.toLowerCase().includes('processed')).map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="inputQuantity">Input Quantity *</Label>
                <Input
                  id="inputQuantity"
                  type="number"
                  value={formData.inputQuantity}
                  onChange={(e) => setFormData({ ...formData, inputQuantity: parseFloat(e.target.value) || 0 })}
                  required
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="outputQuantity">Output Quantity *</Label>
                <Input
                  id="outputQuantity"
                  type="number"
                  value={formData.outputQuantity}
                  onChange={(e) => setFormData({ ...formData, outputQuantity: parseFloat(e.target.value) || 0 })}
                  required
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="processingDate">Processing Date *</Label>
                <Input
                  id="processingDate"
                  type="date"
                  value={formData.processingDate}
                  onChange={(e) => setFormData({ ...formData, processingDate: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="processingSteps">Processing Steps (JSON, optional)</Label>
              <Input
                id="processingSteps"
                value={formData.processingSteps}
                onChange={(e) => setFormData({ ...formData, processingSteps: e.target.value })}
                placeholder='["cleaning", "sorting", "packaging"]'
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="qualityMetrics">Quality Metrics (JSON, optional)</Label>
              <Input
                id="qualityMetrics"
                value={formData.qualityMetrics}
                onChange={(e) => setFormData({ ...formData, qualityMetrics: e.target.value })}
                placeholder='{"grade": "A", "moisture": 12}'
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Record Processing
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
