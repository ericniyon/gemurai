"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { toast } from "sonner"
import { Truck, Save, X, Loader2 } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

interface ServiceDeliveryFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function ServiceDeliveryForm({
  open,
  onOpenChange,
  onSuccess,
}: ServiceDeliveryFormProps) {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    serviceId: "",
    farmerId: "none",
    scheduledDate: new Date().toISOString().slice(0, 16),
    notes: "",
  })

  const [services, setServices] = useState<any[]>([])
  const [farmers, setFarmers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (open && user?.mccId) {
      fetchServices()
      fetchFarmers()
    }
  }, [open, user?.mccId])

  const fetchServices = async () => {
    try {
      const token = localStorage.getItem("Gemurai_token")
      const response = await fetch("/api/v1/services", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setServices(data.data || [])
      }
    } catch (error) {
      console.error("Error fetching services:", error)
    }
  }

  const fetchFarmers = async () => {
    try {
      const token = localStorage.getItem("Gemurai_token")
      const response = await fetch(`/api/v1/mcc/farmers?mccId=${user?.mccId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setFarmers(data.data || [])
      }
    } catch (error) {
      console.error("Error fetching farmers:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.serviceId) {
      toast.error("Please select a service")
      return
    }

    if (!user?.mccId) {
      toast.error("Your profile is not assigned to an MCC")
      return
    }

    setIsLoading(true)

    try {
      const token = localStorage.getItem("Gemurai_token")
      const response = await fetch("/api/v1/services/deliveries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          serviceId: formData.serviceId,
          farmerId: formData.farmerId && formData.farmerId !== "none" ? formData.farmerId : undefined,
          mccId: user.mccId,
          scheduledDate: new Date(formData.scheduledDate).toISOString(),
          notes: formData.notes || undefined,
        }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        toast.success("Service delivery requested successfully")
        onSuccess?.()
        onOpenChange(false)
        setFormData({
          serviceId: "",
          farmerId: "none",
          scheduledDate: new Date().toISOString().slice(0, 16),
          notes: "",
        })
      } else {
        toast.error(result.error || "Failed to request service delivery")
      }
    } catch (error) {
      console.error("Error requesting service delivery:", error)
      toast.error("Failed to request service delivery")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Request Service Delivery
          </DialogTitle>
          <DialogDescription>
            Request a service delivery for a farmer or MCC
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="serviceId">
              Service <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.serviceId}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, serviceId: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select service" />
              </SelectTrigger>
              <SelectContent>
                {services.map((service) => (
                  <SelectItem key={service.id} value={service.id}>
                    {service.name} ({service.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="farmerId">Farmer (Optional)</Label>
            <Select
              value={formData.farmerId}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, farmerId: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select farmer (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None (MCC service)</SelectItem>
                {farmers.map((farmer) => (
                  <SelectItem key={farmer.id} value={farmer.id}>
                    {farmer.name} - {farmer.phone}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="scheduledDate">
              Scheduled Date <span className="text-red-500">*</span>
            </Label>
            <Input
              id="scheduledDate"
              type="datetime-local"
              value={formData.scheduledDate}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, scheduledDate: e.target.value }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Requesting...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Request Delivery
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
