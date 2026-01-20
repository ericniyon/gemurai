"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"
import { 
  Building2, 
  Save, 
  X, 
  Phone, 
  MapPin,
  Loader2,
  Mail,
  User,
  FileText
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { GeoLocationInput } from "@/components/ui/geo-location-input"
import { Separator } from "@/components/ui/separator"

interface AddCustomerFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

interface CustomerFormData {
  name: string
  contact: string
  email: string
  address: string
  district: string
  contactPerson: string
  taxId: string
  notes: string
  gpsLatitude?: number | null
  gpsLongitude?: number | null
  geoConsent?: boolean
}

export function AddCustomerForm({ open, onOpenChange, onSuccess }: AddCustomerFormProps) {
  const { user } = useAuth()
  const missingMccAssignment = !user?.mccId
  
  const [formData, setFormData] = useState<CustomerFormData>({
    name: '',
    contact: '',
    email: '',
    address: '',
    district: '',
    contactPerson: '',
    taxId: '',
    notes: '',
    gpsLatitude: null,
    gpsLongitude: null,
    geoConsent: false
  })
  
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Partial<CustomerFormData>>({})
  const submitDisabled = isLoading || missingMccAssignment

  const validateForm = (): boolean => {
    const newErrors: Partial<CustomerFormData> = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Customer name is required'
    }
    
    if (!formData.contact.trim()) {
      newErrors.contact = 'Contact phone is required'
    } else if (!/^\+?[0-9]{10,15}$/.test(formData.contact.replace(/\s/g, ''))) {
      newErrors.contact = 'Please enter a valid phone number'
    }
    
    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error("Please fix the errors in the form")
      return
    }

    if (!user?.mccId) {
      toast.error("Your profile is not assigned to an MCC. Please contact an administrator.")
      return
    }

    setIsLoading(true)
    
    try {
      const token = localStorage.getItem("Gemurai_token")
      if (!token) {
        toast.error("Authentication required")
        return
      }

      const response = await fetch("/api/v1/mcc/customers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          contact: formData.contact.trim(),
          email: formData.email.trim() || null,
          address: formData.address.trim() || null,
          district: formData.district.trim() || null,
          contactPerson: formData.contactPerson.trim() || null,
          taxId: formData.taxId.trim() || null,
          notes: formData.notes.trim() || null,
          mccId: user?.mccId,
          gpsLatitude: formData.gpsLatitude || null,
          gpsLongitude: formData.gpsLongitude || null,
          geoConsent: formData.gpsLatitude != null && formData.gpsLongitude != null,
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        toast.success("Customer information saved. Create a sale to register the customer.")
        setFormData({
          name: '',
          contact: '',
          email: '',
          address: '',
          district: '',
          contactPerson: '',
          taxId: '',
          notes: '',
          gpsLatitude: null,
          gpsLongitude: null,
          geoConsent: false
        })
        setErrors({})
        onOpenChange(false)
        if (onSuccess) {
          onSuccess()
        }
      } else {
        toast.error(data.error || "Failed to save customer information")
      }
    } catch (error) {
      console.error("Error saving customer:", error)
      toast.error("Failed to save customer information")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setFormData({
        name: '',
        contact: '',
        email: '',
        address: '',
        district: '',
        contactPerson: '',
        taxId: '',
        notes: ''
      })
      setErrors({})
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl bg-white border-2 border-gray-200 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Add New Customer
          </DialogTitle>
          <DialogDescription>
            Enter customer information. Note: Customers are fully registered when you create a sale record for them.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {missingMccAssignment && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 shadow-sm">
              Your account is not linked to an MCC. Please contact your administrator to be assigned before adding customers.
            </div>
          )}
          <div className="space-y-4">
            {/* Customer Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Customer/Company Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter customer or company name"
                className={errors.name ? "border-red-500" : ""}
                style={{ border: '1px solid rgb(191, 219, 254)', borderWidth: '1px', paddingLeft: '1rem' }}
                disabled={isLoading}
              />
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name}</p>
              )}
            </div>

            {/* Contact Phone */}
            <div className="space-y-2">
              <Label htmlFor="contact" className="text-sm font-medium">
                Phone Number <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Phone className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 z-10" />
                <Input
                  id="contact"
                  type="tel"
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  placeholder="+250 788 123 456"
                  className={`pl-12 pr-2 ${errors.contact ? "border-red-500" : ""}`}
                  style={{ border: '1px solid rgb(191, 219, 254)', borderWidth: '1px', paddingLeft: '3rem' }}
                  disabled={isLoading}
                />
              </div>
              {errors.contact && (
                <p className="text-xs text-red-500">{errors.contact}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 z-10" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="customer@example.com"
                  className={`pl-12 pr-2 ${errors.email ? "border-red-500" : ""}`}
                  style={{ border: '1px solid rgb(191, 219, 254)', borderWidth: '1px', paddingLeft: '3rem' }}
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Grid for Address and District */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="address" className="text-sm font-medium">
                  Address
                </Label>
                <div className="relative">
                  <MapPin className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Street address"
                    className="pl-10 pr-2 min-h-[80px]"
                    style={{ border: '1px solid rgb(191, 219, 254)', borderWidth: '1px', paddingLeft: '1rem' }}
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* District */}
              <div className="space-y-2">
                <Label htmlFor="district" className="text-sm font-medium">
                  District/City
                </Label>
                <Input
                  id="district"
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  placeholder="e.g. Kigali, Musanze"
                  style={{ border: '1px solid rgb(191, 219, 254)', borderWidth: '1px', paddingLeft: '1rem' }}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Grid for Contact Person and Tax ID */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Contact Person */}
              <div className="space-y-2">
                <Label htmlFor="contactPerson" className="text-sm font-medium">
                  Contact Person
                </Label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="contactPerson"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    placeholder="Primary contact person name"
                    className="pl-10 pr-2"
                    style={{ border: '1px solid rgb(191, 219, 254)', borderWidth: '1px', paddingLeft: '1rem' }}
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Tax ID */}
              <div className="space-y-2">
                <Label htmlFor="taxId" className="text-sm font-medium">
                  Tax ID / Registration Number
                </Label>
                <Input
                  id="taxId"
                  value={formData.taxId}
                  onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                  placeholder="Optional for businesses"
                  style={{ border: '1px solid rgb(191, 219, 254)', borderWidth: '1px', paddingLeft: '1rem' }}
                  disabled={isLoading}
                />
              </div>
            </div>

            <Separator className="my-4" />

            {/* Geo-location Section */}
            <div className="space-y-2">
              <GeoLocationInput
                latitude={formData.gpsLatitude}
                longitude={formData.gpsLongitude}
                onLocationChange={(lat, lng) => {
                  setFormData(prev => ({
                    ...prev,
                    gpsLatitude: lat,
                    gpsLongitude: lng,
                    geoConsent: lat != null && lng != null
                  }))
                }}
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-medium">
                Additional Notes
              </Label>
              <div className="relative">
                <FileText className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any additional information about the customer..."
                  className="pl-10 min-h-[80px]"
                  style={{ border: '1px solid rgb(191, 219, 254)', borderWidth: '1px', paddingLeft: '1rem' }}
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitDisabled}
              className="bg-blue-600 hover:bg-blue-700 text-white/90 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Customer
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

