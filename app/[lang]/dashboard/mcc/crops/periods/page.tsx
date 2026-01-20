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
  Calendar, 
  Plus, 
  RefreshCw, 
  Loader2,
  Edit,
  CheckCircle2
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function CropPeriodsPage() {
  const { user } = useAuth()
  const params = useParams()
  const lang = (params?.lang as string) || "en"
  
  const [periods, setPeriods] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formData, setFormData] = useState({
    periodNumber: "",
    startDate: "",
    endDate: "",
  })

  useEffect(() => {
    fetchPeriods()
  }, [])

  const fetchPeriods = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem("Gemurai_token")
      if (!user?.mccId) {
        toast.error("MCC ID required")
        return
      }
      
      // Note: API endpoint might need to be created for GET periods
      // For now, we'll create a placeholder
      const response = await fetch(`/api/v1/mcc/crops/periods?mccId=${user.mccId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (response.ok) {
        const data = await response.json()
        setPeriods(data.data || [])
      } else if (response.status === 404) {
        // Endpoint might not exist yet, set empty array
        setPeriods([])
      }
    } catch (error) {
      console.error("Error fetching periods:", error)
      // Don't show error if endpoint doesn't exist
      setPeriods([])
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

      const response = await fetch("/api/v1/mcc/crops/periods", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          mccId: user.mccId,
          periodNumber: parseInt(formData.periodNumber),
          startDate: formData.startDate,
          endDate: formData.endDate,
        }),
      })

      if (response.ok) {
        toast.success("Crop period created successfully")
        setIsFormOpen(false)
        setFormData({
          periodNumber: "",
          startDate: "",
          endDate: "",
        })
        fetchPeriods()
      } else {
        const data = await response.json()
        throw new Error(data.error || "Failed to create crop period")
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to create crop period")
    }
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
              <Calendar className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Crop Periods</h1>
              <p className="text-gray-600">Manage crop aggregation periods</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchPeriods}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => {
            setFormData({
              periodNumber: "",
              startDate: "",
              endDate: "",
            })
            setIsFormOpen(true)
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Create Period
          </Button>
        </div>
      </div>

      {/* Periods Table */}
      <Card>
        <CardHeader>
          <CardTitle>Crop Periods</CardTitle>
          <CardDescription>
            {periods.length} period(s) defined
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 mx-auto animate-spin text-gray-400" />
              <p className="mt-2 text-gray-500">Loading periods...</p>
            </div>
          ) : periods.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No crop periods created yet</p>
              <Button className="mt-4" onClick={() => setIsFormOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Period
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Period Number</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {periods.map((period) => {
                  const startDate = new Date(period.startDate)
                  const endDate = new Date(period.endDate)
                  const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
                  const isActive = new Date() >= startDate && new Date() <= endDate
                  const isPast = new Date() > endDate
                  
                  return (
                    <TableRow key={period.id}>
                      <TableCell className="font-medium">Period {period.periodNumber}</TableCell>
                      <TableCell>{startDate.toLocaleDateString()}</TableCell>
                      <TableCell>{endDate.toLocaleDateString()}</TableCell>
                      <TableCell>{duration} days</TableCell>
                      <TableCell>
                        <Badge variant={
                          isActive ? "default" :
                          isPast ? "secondary" : "outline"
                        }>
                          {isActive ? "Active" : isPast ? "Completed" : "Upcoming"}
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

      {/* Create Period Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Crop Period</DialogTitle>
            <DialogDescription>
              Define a new crop aggregation period
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="periodNumber">Period Number *</Label>
              <Input
                id="periodNumber"
                type="number"
                value={formData.periodNumber}
                onChange={(e) => setFormData({ ...formData, periodNumber: e.target.value })}
                required
                min="1"
                placeholder="e.g., 1, 2, 3"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date *</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                required
                min={formData.startDate}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Create Period
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
