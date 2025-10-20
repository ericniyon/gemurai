"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { 
  Users, 
  Save, 
  X, 
  Phone, 
  MapPin, 
  Calendar,
  AlertCircle,
  CheckCircle,
  Loader2,
  User,
  Mail,
  Hash
} from "lucide-react"
import { useAuthStore } from "@/lib/stores/auth-store"

interface AddFarmerFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

interface FarmerFormData {
  farmerNumber: number
  name: string
  gender: 'male' | 'female'
  phone: string
  email?: string
  location: string
  district: string
  sector: string
  cell: string
  village: string
  registrationDate: string
  status: 'active' | 'inactive' | 'suspended'
  notes?: string
  emergencyContact?: string
  emergencyPhone?: string
  bankAccount?: string
  bankName?: string
  idNumber: string
  cowCount: number
  expectedDailyMilk: number
  isCooperativeMember: boolean
  cooperativeName?: string
}

export function AddFarmerForm({ open, onOpenChange, onSuccess }: AddFarmerFormProps) {
  const { token, isAuthenticated } = useAuthStore()
  
  const [formData, setFormData] = useState<FarmerFormData>({
    farmerNumber: 0,
    name: '',
    gender: 'male',
    phone: '',
    email: '',
    location: '',
    district: '',
    sector: '',
    cell: '',
    village: '',
    registrationDate: new Date().toISOString().slice(0, 10),
    status: 'active',
    notes: '',
    emergencyContact: '',
    emergencyPhone: '',
    bankAccount: '',
    bankName: '',
    idNumber: '',
    cowCount: 0,
    expectedDailyMilk: 0,
    isCooperativeMember: false,
    cooperativeName: ''
  })
  
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Partial<FarmerFormData>>({})

  const districts = [
    'Kicukiro', 'Gasabo', 'Nyarugenge', 'Bugesera', 'Gatsibo', 'Kayonza', 'Kirehe', 'Ngoma', 'Nyagatare', 'Rwamagana',
    'Burera', 'Gakenke', 'Gicumbi', 'Musanze', 'Rulindo', 'Gisagara', 'Huye', 'Kamonyi', 'Muhanga', 'Nyamagabe',
    'Nyanza', 'Nyaruguru', 'Ruhango', 'Karongi', 'Ngororero', 'Nyabihu', 'Nyamasheke', 'Rubavu', 'Rusizi', 'Rutsiro'
  ]

  const banks = [
    'Bank of Kigali', 'Equity Bank', 'I&M Bank', 'GT Bank', 'Access Bank', 'Ecobank', 'Urwego Bank', 'Cogebanque',
    'Development Bank of Rwanda', 'Commercial Bank of Rwanda', 'Other'
  ]

  const validateForm = (): boolean => {
    const newErrors: Partial<FarmerFormData> = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Farmer name is required'
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    }
    
    
    if (!formData.district) {
      newErrors.district = 'District is required'
    }
    
    if (!formData.sector.trim()) {
      newErrors.sector = 'Sector is required'
    }
    
    // National ID validation
    if (!formData.idNumber.trim()) {
      newErrors.idNumber = 'National ID is required'
    } else if (!/^1\d{15}$/.test(formData.idNumber.replace(/\s/g, ''))) {
      newErrors.idNumber = 'National ID must be 16 digits starting with 1'
    }
    

    // Cooperative validation
    if (formData.isCooperativeMember && !formData.cooperativeName?.trim()) {
      newErrors.cooperativeName = 'Cooperative name is required when farmer is a cooperative member'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error("Please fix the errors before submitting")
      return
    }

    setIsLoading(true)
    
    try {
      // Prepare farmer data for API
      const farmerData = {
        mccId: "mcc_1760697250506", // Use the first available MCC ID
        name: formData.name,
        gender: formData.gender,
        phone: formData.phone,
        email: formData.email || undefined,
        nationalId: formData.idNumber || undefined,
        district: formData.district || undefined,
        sector: formData.sector || undefined,
        cell: formData.cell || undefined,
        village: formData.village || undefined,
        location: "Rwanda", // Base location - will be enhanced by service
        isCooperativeMember: formData.isCooperativeMember,
        cooperativeName: formData.cooperativeName || undefined,
        emergencyContact: formData.emergencyContact || undefined,
        emergencyPhone: formData.emergencyPhone || undefined,
        bankAccount: formData.bankAccount || undefined,
        bankName: formData.bankName || undefined,
        notes: formData.notes || undefined
      }

      // Call the API to create farmer
      console.log('Auth token from store:', token ? 'Present' : 'Missing')
      console.log('User authenticated:', isAuthenticated)
      
      if (!isAuthenticated || !token) {
        toast.error("Authentication required. Please log in again.")
        return
      }
      
      const response = await fetch('/api/v1/mcc/farmers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(farmerData)
      })

      console.log('Response status:', response.status)
      console.log('Response ok:', response.ok)

      if (!response.ok) {
        const errorData = await response.json()
        console.error('API Error Response:', errorData)
        throw new Error(errorData.error || 'Failed to create farmer')
      }

      const result = await response.json()
      
      toast.success("Farmer registered successfully!")
      onSuccess?.()
      onOpenChange(false)
      
      // Reset form
      setFormData({
        farmerNumber: 0,
        name: '',
        gender: 'male',
        phone: '',
        email: '',
        location: '',
        district: '',
        sector: '',
        cell: '',
        village: '',
        registrationDate: new Date().toISOString().slice(0, 10),
        status: 'active',
        notes: '',
        emergencyContact: '',
        emergencyPhone: '',
        bankAccount: '',
        bankName: '',
        idNumber: '',
        cowCount: 0,
        expectedDailyMilk: 0,
        isCooperativeMember: false,
        cooperativeName: ''
      })
      setErrors({})
      
    } catch (error) {
      console.error('Error creating farmer:', error)
      toast.error(error instanceof Error ? error.message : "Failed to register farmer. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white border-2 border-gray-200 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Register New Farmer
          </DialogTitle>
          <DialogDescription>
            Add a new farmer to the Milk Collection Cooperative. Fill in all required information.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
              <CardDescription>Essential farmer details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter farmer's full name"
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.name}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender *</Label>
                  <Select value={formData.gender} onValueChange={(value: 'male' | 'female') => setFormData(prev => ({ ...prev, gender: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+250 788 123 456"
                      className={`pl-10 ${errors.phone ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.phone}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="farmer@example.com"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="idNumber">National ID *</Label>
                  <Input
                    id="idNumber"
                    value={formData.idNumber}
                    onChange={(e) => {
                      // Only allow digits and limit to 16 characters
                      const value = e.target.value.replace(/\D/g, '').slice(0, 16)
                      setFormData(prev => ({ ...prev, idNumber: value }))
                    }}
                    placeholder="1XXXXXXXXXXXXXXX"
                    className={errors.idNumber ? 'border-red-500' : ''}
                    maxLength={16}
                  />
                  {errors.idNumber && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.idNumber}
                    </p>
                  )}
                  <p className="text-xs text-gray-500">Must be 16 digits starting with 1</p>
                </div>
              </div>

            </CardContent>
          </Card>

          {/* Location Information */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Location Information</CardTitle>
              <CardDescription>Farmer's address and location details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="district">District *</Label>
                  <Select value={formData.district} onValueChange={(value) => setFormData(prev => ({ ...prev, district: value }))}>
                    <SelectTrigger className={errors.district ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select district" />
                    </SelectTrigger>
                    <SelectContent>
                      {districts.map(district => (
                        <SelectItem key={district} value={district}>{district}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.district && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.district}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sector">Sector *</Label>
                  <Input
                    id="sector"
                    value={formData.sector}
                    onChange={(e) => setFormData(prev => ({ ...prev, sector: e.target.value }))}
                    placeholder="Enter sector name"
                    className={errors.sector ? 'border-red-500' : ''}
                  />
                  {errors.sector && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.sector}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cell">Cell</Label>
                  <Input
                    id="cell"
                    value={formData.cell}
                    onChange={(e) => setFormData(prev => ({ ...prev, cell: e.target.value }))}
                    placeholder="Enter cell name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="village">Village</Label>
                  <Input
                    id="village"
                    value={formData.village}
                    onChange={(e) => setFormData(prev => ({ ...prev, village: e.target.value }))}
                    placeholder="Enter village name"
                  />
                </div>
              </div>

            </CardContent>
          </Card>

          {/* Cooperative Information */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Cooperative Information</CardTitle>
              <CardDescription>Cooperative membership and farm details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="isCooperativeMember">Is this farmer a cooperative member?</Label>
                  <Select 
                    value={formData.isCooperativeMember ? 'yes' : 'no'} 
                    onValueChange={(value) => {
                      const isMember = value === 'yes'
                      setFormData(prev => ({ 
                        ...prev, 
                        isCooperativeMember: isMember,
                        cooperativeName: isMember ? prev.cooperativeName : ''
                      }))
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select membership status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes - Cooperative Member</SelectItem>
                      <SelectItem value="no">No - Independent Farmer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.isCooperativeMember && (
                  <div className="space-y-2">
                    <Label htmlFor="cooperativeName">Cooperative Name *</Label>
                    <Input
                      id="cooperativeName"
                      value={formData.cooperativeName}
                      onChange={(e) => setFormData(prev => ({ ...prev, cooperativeName: e.target.value }))}
                      placeholder="Enter cooperative name"
                      className={errors.cooperativeName ? 'border-red-500' : ''}
                    />
                    {errors.cooperativeName && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.cooperativeName}
                      </p>
                    )}
                  </div>
                )}
              </div>

            </CardContent>
          </Card>

          {/* Emergency Contact */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Emergency Contact</CardTitle>
              <CardDescription>Emergency contact information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emergencyContact">Emergency Contact Name</Label>
                  <Input
                    id="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={(e) => setFormData(prev => ({ ...prev, emergencyContact: e.target.value }))}
                    placeholder="Enter emergency contact name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergencyPhone">Emergency Phone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="emergencyPhone"
                      value={formData.emergencyPhone}
                      onChange={(e) => setFormData(prev => ({ ...prev, emergencyPhone: e.target.value }))}
                      placeholder="+250 788 123 456"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Banking Information */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Banking Information</CardTitle>
              <CardDescription>Bank account details for payments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bankName">Bank Name</Label>
                  <Select value={formData.bankName} onValueChange={(value) => setFormData(prev => ({ ...prev, bankName: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select bank" />
                    </SelectTrigger>
                    <SelectContent>
                      {banks.map(bank => (
                        <SelectItem key={bank} value={bank}>{bank}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bankAccount">Account Number</Label>
                  <Input
                    id="bankAccount"
                    value={formData.bankAccount}
                    onChange={(e) => setFormData(prev => ({ ...prev, bankAccount: e.target.value }))}
                    placeholder="Enter account number"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Notes */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Additional Information</CardTitle>
              <CardDescription>Any additional notes or comments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Enter any additional notes or comments"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <DialogFooter className="flex gap-3 pt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="px-6 py-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="px-8 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  <span className="font-medium">Registering Farmer...</span>
                </>
              ) : (
                <>
                  <Save className="h-5 w-5 mr-2" />
                  <span className="font-medium">Register Farmer</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}




