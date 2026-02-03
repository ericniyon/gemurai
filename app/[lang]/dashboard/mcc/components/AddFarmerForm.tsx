"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"
import {
  Users,
  ChevronLeft,
  ChevronRight,
  Phone,
  MapPin,
  AlertCircle,
  Loader2,
  User,
  Mail,
  CreditCard,
  Heart,
  FileCheck,
  Check,
} from "lucide-react"
import { useAuthStore } from "@/lib/stores/auth-store"
import { GeoLocationInput } from "@/components/ui/geo-location-input"
import { cn } from "@/lib/utils"

interface AddFarmerFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

interface FarmerFormData {
  name: string
  gender: "male" | "female"
  phone: string
  email: string
  nationalId: string
  nfcId: string
  district: string
  sector: string
  cell: string
  village: string
  address: string
  defaultCollectionCenterId: string
  assignedAgentIds: string[]
  herdSize: number
  isCooperativeMember: boolean
  cooperativeName: string
  emergencyContactName: string
  emergencyPhone: string
  paymentMethod: "cash" | "mobile_money" | "bank_transfer" | "ikofi"
  bankName: string
  bankAccountNumber: string
  notes: string
  gpsLatitude: number | null
  gpsLongitude: number | null
  geoConsent: boolean
}

const INITIAL_FORM_DATA: FarmerFormData = {
  name: "",
  gender: "male",
  phone: "",
  email: "",
  nationalId: "",
  nfcId: "",
  district: "",
  sector: "",
  cell: "",
  village: "",
  address: "",
  defaultCollectionCenterId: "",
  assignedAgentIds: [],
  herdSize: 0,
  isCooperativeMember: false,
  cooperativeName: "",
  emergencyContactName: "",
  emergencyPhone: "",
  paymentMethod: "mobile_money",
  bankName: "",
  bankAccountNumber: "",
  notes: "",
  gpsLatitude: null,
  gpsLongitude: null,
  geoConsent: false,
}

const DISTRICTS = [
  "Kicukiro", "Gasabo", "Nyarugenge", "Bugesera", "Gatsibo", "Kayonza", "Kirehe", "Ngoma", "Nyagatare", "Rwamagana",
  "Burera", "Gakenke", "Gicumbi", "Musanze", "Rulindo", "Gisagara", "Huye", "Kamonyi", "Muhanga", "Nyamagabe",
  "Nyanza", "Nyaruguru", "Ruhango", "Karongi", "Ngororero", "Nyabihu", "Nyamasheke", "Rubavu", "Rusizi", "Rutsiro",
]

const BANKS = [
  "Bank of Kigali", "Equity Bank", "I&M Bank", "GT Bank", "Access Bank", "Ecobank", "Urwego Bank", "Cogebanque",
  "Development Bank of Rwanda", "Commercial Bank of Rwanda", "Other",
]

const STEPS = [
  { id: 1, title: "Personal & Location", icon: User, short: "Details" },
  { id: 2, title: "Farm, Emergency & Payment", icon: CreditCard, short: "Payment" },
  { id: 3, title: "Review & Submit", icon: FileCheck, short: "Review" },
]

const inputBase =
  "h-11 rounded-xl border border-slate-200 bg-white px-4 text-slate-900 placeholder:text-slate-400 transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"

export function AddFarmerForm({ open, onOpenChange, onSuccess }: AddFarmerFormProps) {
  const { token, isAuthenticated, user } = useAuthStore()
  const [formData, setFormData] = useState<FarmerFormData>(INITIAL_FORM_DATA)
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof FarmerFormData, string>>>({})
  const [mccId, setMccId] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    const resolved = user?.mccId || null
    if (resolved) {
      setMccId(resolved)
    } else {
      fetch("/api/v1/mcc/setup")
        .then((r) => r.json())
        .then((d) => {
          const first = d?.data?.[0]?.id ?? d?.data?.id
          setMccId(first || "mcc_1760697250506")
        })
        .catch(() => setMccId("mcc_1760697250506"))
    }
  }, [open, user?.mccId])

  useEffect(() => {
    if (!open) {
      setFormData(INITIAL_FORM_DATA)
      setErrors({})
      setStep(1)
    }
  }, [open])

  const validateStep = (s: number): boolean => {
    const newErrors: Partial<Record<keyof FarmerFormData, string>> = {}
    if (s === 1) {
      if (!formData.name.trim()) newErrors.name = "Full name is required"
      if (!formData.phone.trim()) newErrors.phone = "Phone number is required"
      if (!formData.nationalId.trim()) newErrors.nationalId = "National ID is required"
      else if (!/^1\d{15}$/.test(formData.nationalId.replace(/\s/g, ""))) {
        newErrors.nationalId = "National ID must be 16 digits starting with 1"
      }
      if (!formData.district) newErrors.district = "District is required"
      if (!formData.sector.trim()) newErrors.sector = "Sector is required"
    }
    if (s === 2) {
      if (formData.isCooperativeMember && !formData.cooperativeName?.trim()) {
        newErrors.cooperativeName = "Cooperative name is required when farmer is a member"
      }
      if (formData.paymentMethod === "bank_transfer") {
        if (!formData.bankAccountNumber?.trim()) newErrors.bankAccountNumber = "Account number is required"
        if (!formData.bankName) newErrors.bankName = "Bank name is required"
      }
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(step)) setStep((p) => Math.min(p + 1, STEPS.length))
  }

  const handleBack = () => setStep((p) => Math.max(p - 1, 1))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) {
      toast.error("Please fix the errors before submitting")
      return
    }
    if (!isAuthenticated || !token) {
      toast.error("Authentication required. Please log in again.")
      return
    }
    const resolvedMccId = mccId || user?.mccId || "mcc_1760697250506"

    setIsLoading(true)
    try {
      const locationParts = [formData.district, formData.sector, formData.cell, formData.village].filter(Boolean)
      const fullLocation = locationParts.length > 0 ? locationParts.join(", ") : "Rwanda"
      const emergencyContact = [formData.emergencyContactName, formData.emergencyPhone].filter(Boolean).join(" - ") || undefined

      const farmerData = {
        mccId: resolvedMccId,
        name: formData.name,
        gender: formData.gender,
        phone: formData.phone,
        email: formData.email || undefined,
        nationalId: formData.nationalId,
        nfcId: formData.nfcId || undefined,
        district: formData.district,
        sector: formData.sector,
        cell: formData.cell || undefined,
        village: formData.village || undefined,
        address: formData.address || fullLocation,
        location: fullLocation,
        herdSize: formData.herdSize || undefined,
        isCooperativeMember: formData.isCooperativeMember,
        cooperativeName: formData.cooperativeName || undefined,
        emergencyContact,
        emergencyPhone: formData.emergencyPhone || undefined,
        paymentMethod: formData.paymentMethod,
        bankName: formData.bankName || undefined,
        bankAccountNumber: formData.bankAccountNumber || undefined,
        notes: formData.notes || undefined,
        gpsLatitude: formData.gpsLatitude ?? undefined,
        gpsLongitude: formData.gpsLongitude ?? undefined,
        geoConsent: formData.gpsLatitude != null && formData.gpsLongitude != null,
      }

      const response = await fetch("/api/v1/mcc/farmers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(farmerData),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || "Failed to create farmer")
      }

      toast.success("Farmer registered successfully!")
      onSuccess?.()
      onOpenChange(false)
      setFormData(INITIAL_FORM_DATA)
      setErrors({})
      setStep(1)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to register farmer. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FarmerFormData, string>> = {}
    if (!formData.name.trim()) newErrors.name = "Full name is required"
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required"
    if (!formData.district) newErrors.district = "District is required"
    if (!formData.sector.trim()) newErrors.sector = "Sector is required"
    if (!formData.nationalId.trim()) {
      newErrors.nationalId = "National ID is required"
    } else if (!/^1\d{15}$/.test(formData.nationalId.replace(/\s/g, ""))) {
      newErrors.nationalId = "National ID must be 16 digits starting with 1"
    }
    if (formData.isCooperativeMember && !formData.cooperativeName?.trim()) {
      newErrors.cooperativeName = "Cooperative name is required when farmer is a member"
    }
    if (formData.paymentMethod === "bank_transfer" && !formData.bankAccountNumber?.trim()) {
      newErrors.bankAccountNumber = "Account number is required for bank transfer"
    }
    if (formData.paymentMethod === "bank_transfer" && !formData.bankName) {
      newErrors.bankName = "Bank name is required for bank transfer"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl overflow-hidden p-0 gap-0 border-0 shadow-2xl rounded-2xl bg-white [&>button]:absolute [&>button]:right-6 [&>button]:top-6 [&>button]:text-white/90 [&>button]:hover:text-white [&>button]:hover:bg-white/10">
        {/* Header */}
        <div className="relative px-8 pt-8 pb-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
          <DialogHeader className="relative">
            <DialogTitle className="flex items-center gap-3 text-2xl font-bold tracking-tight">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
                <Users className="h-6 w-6" />
              </div>
              Register New Farmer
            </DialogTitle>
            <DialogDescription className="text-slate-300 mt-1.5">
              Step {step} of {STEPS.length} — {STEPS[step - 1].title}
            </DialogDescription>
          </DialogHeader>

          {/* Stepper */}
          <div className="relative mt-6 flex items-center justify-between">
            {STEPS.map((s, i) => {
              const Icon = s.icon
              const isActive = step === s.id
              const isComplete = step > s.id
              return (
                <div key={s.id} className="flex flex-1 items-center">
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 font-semibold text-sm transition-all duration-300",
                      isComplete && "border-emerald-500 bg-emerald-500 text-white",
                      isActive && !isComplete && "border-primary bg-primary text-white scale-110 shadow-lg shadow-primary/30",
                      !isActive && !isComplete && "border-slate-600 bg-slate-700/50 text-slate-400"
                    )}
                  >
                    {isComplete ? <Check className="h-5 w-5" /> : <Icon className="h-4 w-4" />}
                  </div>
                  {i < STEPS.length - 1 && (
                    <div
                      className={cn(
                        "mx-1 h-0.5 flex-1 rounded-full transition-colors duration-300",
                        isComplete ? "bg-emerald-500/60" : "bg-slate-600/50"
                      )}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="flex-1 overflow-y-auto px-8 py-6 min-h-[320px]">
            {/* Step 1: Personal & Location */}
            {step === 1 && (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                <p className="text-sm text-slate-600 mb-4">Basic information and location details</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-medium">Full Name *</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                      placeholder="Enter full name"
                      className={cn(inputBase, errors.name && "border-destructive focus:ring-destructive/20")}
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5" /> {errors.name}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-medium">Gender</Label>
                    <Select value={formData.gender} onValueChange={(v: "male" | "female") => setFormData((p) => ({ ...p, gender: v }))}>
                      <SelectTrigger className={cn(inputBase, "flex h-11")}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-medium">Phone Number *</Label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        value={formData.phone}
                        onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                        placeholder="+250 788 123 456"
                        className={cn(inputBase, "pl-11", errors.phone && "border-destructive focus:ring-destructive/20")}
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5" /> {errors.phone}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-medium">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                        placeholder="farmer@example.com"
                        className={cn(inputBase, "pl-11")}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-medium">National ID *</Label>
                    <Input
                      value={formData.nationalId}
                      onChange={(e) => {
                        const v = e.target.value.replace(/\D/g, "").slice(0, 16)
                        setFormData((p) => ({ ...p, nationalId: v }))
                      }}
                      placeholder="1XXXXXXXXXXXXXXX"
                      maxLength={16}
                      className={cn(inputBase, errors.nationalId && "border-destructive focus:ring-destructive/20")}
                    />
                    {errors.nationalId && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5" /> {errors.nationalId}
                      </p>
                    )}
                    <p className="text-xs text-slate-500">16 digits starting with 1</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-medium">NFC Card ID</Label>
                    <Input
                      value={formData.nfcId}
                      onChange={(e) => setFormData((p) => ({ ...p, nfcId: e.target.value }))}
                      placeholder="Optional"
                      className={inputBase}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-medium">District *</Label>
                    <Select value={formData.district} onValueChange={(v) => setFormData((p) => ({ ...p, district: v }))}>
                      <SelectTrigger className={cn(inputBase, "flex h-11", errors.district && "border-destructive")}>
                        <SelectValue placeholder="Select district" />
                      </SelectTrigger>
                      <SelectContent>
                        {DISTRICTS.map((d) => (
                          <SelectItem key={d} value={d}>{d}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.district && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5" /> {errors.district}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-medium">Sector *</Label>
                    <Input
                      value={formData.sector}
                      onChange={(e) => setFormData((p) => ({ ...p, sector: e.target.value }))}
                      placeholder="Enter sector"
                      className={cn(inputBase, errors.sector && "border-destructive focus:ring-destructive/20")}
                    />
                    {errors.sector && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5" /> {errors.sector}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-medium">Cell</Label>
                    <Input
                      value={formData.cell}
                      onChange={(e) => setFormData((p) => ({ ...p, cell: e.target.value }))}
                      placeholder="Enter cell"
                      className={inputBase}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-medium">Village</Label>
                    <Input
                      value={formData.village}
                      onChange={(e) => setFormData((p) => ({ ...p, village: e.target.value }))}
                      placeholder="Enter village"
                      className={inputBase}
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2 lg:col-span-3">
                    <Label className="text-slate-700 font-medium">Detailed Address</Label>
                    <Input
                      value={formData.address}
                      onChange={(e) => setFormData((p) => ({ ...p, address: e.target.value }))}
                      placeholder="Street, landmark, or additional details"
                      className={inputBase}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Farm, Emergency & Payment */}
            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <p className="text-sm text-slate-600 mb-4">Farm details, emergency contact, and payment preferences</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-medium">Herd Size</Label>
                    <Input
                      type="number"
                      min={0}
                      value={formData.herdSize || ""}
                      onChange={(e) => setFormData((p) => ({ ...p, herdSize: parseInt(e.target.value, 10) || 0 }))}
                      placeholder="0"
                      className={inputBase}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-medium">Cooperative Member</Label>
                    <Select
                      value={formData.isCooperativeMember ? "yes" : "no"}
                      onValueChange={(v) =>
                        setFormData((p) => ({
                          ...p,
                          isCooperativeMember: v === "yes",
                          cooperativeName: v === "no" ? "" : p.cooperativeName,
                        }))
                      }
                    >
                      <SelectTrigger className={cn(inputBase, "flex h-11")}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {formData.isCooperativeMember && (
                    <div className="space-y-2">
                      <Label className="text-slate-700 font-medium">Cooperative Name *</Label>
                      <Input
                        value={formData.cooperativeName}
                        onChange={(e) => setFormData((p) => ({ ...p, cooperativeName: e.target.value }))}
                        placeholder="Enter cooperative name"
                        className={cn(inputBase, errors.cooperativeName && "border-destructive focus:ring-destructive/20")}
                      />
                      {errors.cooperativeName && (
                        <p className="text-sm text-destructive flex items-center gap-1">
                          <AlertCircle className="h-3.5 w-3.5" /> {errors.cooperativeName}
                        </p>
                      )}
                    </div>
                  )}
                  <div className="space-y-2 sm:col-span-2 lg:col-span-3 border-t border-slate-200 pt-5 mt-2">
                    <p className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
                      <Heart className="h-4 w-4 text-rose-500" /> Emergency Contact
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      <div className="space-y-2">
                        <Label className="text-slate-600 font-normal">Contact Name</Label>
                        <Input
                          value={formData.emergencyContactName}
                          onChange={(e) => setFormData((p) => ({ ...p, emergencyContactName: e.target.value }))}
                          placeholder="Name"
                          className={inputBase}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-600 font-normal">Contact Phone</Label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input
                            value={formData.emergencyPhone}
                            onChange={(e) => setFormData((p) => ({ ...p, emergencyPhone: e.target.value }))}
                            placeholder="+250 788 123 456"
                            className={cn(inputBase, "pl-11")}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 sm:col-span-2 lg:col-span-3 border-t border-slate-200 pt-5">
                    <p className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-primary" /> Payment Method
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      <div className="space-y-2">
                        <Label className="text-slate-700 font-medium">Preferred Payment Method</Label>
                        <Select
                          value={formData.paymentMethod}
                          onValueChange={(v: FarmerFormData["paymentMethod"]) => setFormData((p) => ({ ...p, paymentMethod: v }))}
                        >
                          <SelectTrigger className={cn(inputBase, "flex h-11")}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="mobile_money">Mobile Money (MoMo)</SelectItem>
                            <SelectItem value="ikofi">iKOFI Wallet</SelectItem>
                            <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                            <SelectItem value="cash">Cash</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {formData.paymentMethod === "bank_transfer" && (
                        <>
                          <div className="space-y-2">
                            <Label className="text-slate-700 font-medium">Bank Name *</Label>
                            <Select value={formData.bankName} onValueChange={(v) => setFormData((p) => ({ ...p, bankName: v }))}>
                              <SelectTrigger className={cn(inputBase, "flex h-11", errors.bankName && "border-destructive")}>
                                <SelectValue placeholder="Select bank" />
                              </SelectTrigger>
                              <SelectContent>
                                {BANKS.map((b) => (
                                  <SelectItem key={b} value={b}>{b}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {errors.bankName && (
                              <p className="text-sm text-destructive flex items-center gap-1">
                                <AlertCircle className="h-3.5 w-3.5" /> {errors.bankName}
                              </p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label className="text-slate-700 font-medium">Account Number *</Label>
                            <Input
                              value={formData.bankAccountNumber}
                              onChange={(e) => setFormData((p) => ({ ...p, bankAccountNumber: e.target.value }))}
                              placeholder="Enter account number"
                              className={cn(inputBase, errors.bankAccountNumber && "border-destructive focus:ring-destructive/20")}
                            />
                            {errors.bankAccountNumber && (
                              <p className="text-sm text-destructive flex items-center gap-1">
                                <AlertCircle className="h-3.5 w-3.5" /> {errors.bankAccountNumber}
                              </p>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                <div className="sr-only">
                  <GeoLocationInput
                    latitude={formData.gpsLatitude}
                    longitude={formData.gpsLongitude}
                    onLocationChange={(lat, lng) =>
                      setFormData((p) => ({
                        ...p,
                        gpsLatitude: lat,
                        gpsLongitude: lng,
                        geoConsent: lat != null && lng != null,
                      }))
                    }
                    autoCapture
                    minimal
                  />
                </div>
                </div>
              </div>
            )}

            {/* Step 3: Review & Submit */}
            {step === 3 && (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                    <p><span className="font-medium text-slate-600">Name:</span> {formData.name}</p>
                    <p><span className="font-medium text-slate-600">Phone:</span> {formData.phone}</p>
                    <p><span className="font-medium text-slate-600">National ID:</span> {formData.nationalId}</p>
                    <p><span className="font-medium text-slate-600">Location:</span> {[formData.district, formData.sector, formData.village].filter(Boolean).join(", ") || "—"}</p>
                    <p><span className="font-medium text-slate-600">Payment:</span> {formData.paymentMethod.replace("_", " ")}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700 font-medium">Additional Notes</Label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData((p) => ({ ...p, notes: e.target.value }))}
                    placeholder="Any additional notes or comments"
                    rows={3}
                    className={cn(inputBase, "resize-none py-3")}
                  />
                </div>
                <div className="pt-4 flex justify-center">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="bg-emerald-600 hover:bg-emerald-700 px-8 py-6 text-base font-semibold shadow-lg"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Registering...
                      </>
                    ) : (
                      "Register Farmer"
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between gap-4 px-8 py-5 border-t border-slate-200 bg-slate-50/80">
            <Button
              type="button"
              variant="ghost"
              onClick={step === 1 ? () => onOpenChange(false) : handleBack}
              className="text-slate-600 hover:text-slate-900 hover:bg-slate-200/80"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              {step === 1 ? "Cancel" : "Back"}
            </Button>
            {step < STEPS.length ? (
              <Button type="button" onClick={handleNext} className="bg-primary hover:bg-primary/90 px-6">
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button type="submit" disabled={isLoading} className="bg-emerald-600 hover:bg-emerald-700 px-6">
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Registering...
                  </>
                ) : (
                  "Register Farmer"
                )}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
