"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ArrowLeft,
  Save,
  Settings,
  Activity,
  Loader2,
  DollarSign,
  FlaskConical,
  User,
  Coins,
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"

// Supported currencies for Collection Centers
// Focused on East African Community (EAC) member states + USD
const SUPPORTED_CURRENCIES = [
  { code: "RWF", name: "Rwandan Franc", symbol: "FRw", country: "Rwanda" },
  { code: "KES", name: "Kenyan Shilling", symbol: "KSh", country: "Kenya" },
  { code: "UGX", name: "Ugandan Shilling", symbol: "USh", country: "Uganda" },
  { code: "TZS", name: "Tanzanian Shilling", symbol: "TSh", country: "Tanzania" },
  { code: "BIF", name: "Burundian Franc", symbol: "FBu", country: "Burundi" },
  { code: "SSP", name: "South Sudanese Pound", symbol: "SSP", country: "South Sudan" },
  { code: "CDF", name: "Congolese Franc", symbol: "FC", country: "DR Congo" },
  { code: "USD", name: "US Dollar", symbol: "$", country: "International" },
]

interface MCC {
  id: string
  name: string
  manager?: {
    id: string
    name: string
    email: string
  }
  settings?: {
    currency?: string
    pricing?: {
      basePricePerLiter?: number
      qualityBonuses?: {
        fat?: number
        protein?: number
      }
    }
    qualityRules?: {
      minFat?: number
      minProtein?: number
      maxTemp?: number
      antibioticTestRequired?: boolean
    }
  }
}

interface User {
  id: string
  name: string
  email: string
  role: string
}

// Helper to get currency symbol
const getCurrencySymbol = (code: string): string => {
  return SUPPORTED_CURRENCIES.find(c => c.code === code)?.symbol || code
}

export default function MCCSettingsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const mccId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [mcc, setMcc] = useState<MCC | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [formData, setFormData] = useState({
    managerUserId: "",
    currency: "RWF",
    basePricePerLiter: "",
    fatBonus: "",
    proteinBonus: "",
    minFat: "",
    minProtein: "",
    maxTemp: "",
    antibioticTestRequired: false,
  })

  useEffect(() => {
    if (mccId) {
      fetchMCC()
      fetchUsers()
    }
  }, [mccId])

  const fetchMCC = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("Gemurai_token")
      if (!token) {
        toast.error("Authentication required")
        router.push("/superadmin/login")
        return
      }

      const response = await fetch(`/api/v1/mcc/setup?id=${mccId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch MCC")
      }

      const data = await response.json()
      if (data.success && data.data) {
        const mccData = data.data
        setMcc(mccData)
        setFormData({
          managerUserId: mccData.managerUserId || "",
          currency: mccData.settings?.currency || "RWF",
          basePricePerLiter:
            mccData.settings?.pricing?.basePricePerLiter?.toString() || "",
          fatBonus: mccData.settings?.pricing?.qualityBonuses?.fat?.toString() || "",
          proteinBonus:
            mccData.settings?.pricing?.qualityBonuses?.protein?.toString() || "",
          minFat: mccData.settings?.qualityRules?.minFat?.toString() || "",
          minProtein: mccData.settings?.qualityRules?.minProtein?.toString() || "",
          maxTemp: mccData.settings?.qualityRules?.maxTemp?.toString() || "",
          antibioticTestRequired:
            mccData.settings?.qualityRules?.antibioticTestRequired || false,
        })
      }
    } catch (error) {
      console.error("Error fetching MCC:", error)
      toast.error("Failed to load MCC settings")
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("Gemurai_token")
      if (!token) return

      const response = await fetch("/api/v1/users?role=MCC_MANAGER&limit=100", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setUsers(data.data || [])
        }
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setSaving(true)
      const token = localStorage.getItem("Gemurai_token")
      if (!token) {
        toast.error("Authentication required")
        return
      }

      const settings = {
        currency: formData.currency || "RWF",
        pricing: {
          basePricePerLiter: formData.basePricePerLiter
            ? parseFloat(formData.basePricePerLiter)
            : undefined,
          qualityBonuses: {
            fat: formData.fatBonus ? parseFloat(formData.fatBonus) : undefined,
            protein: formData.proteinBonus
              ? parseFloat(formData.proteinBonus)
              : undefined,
          },
        },
        qualityRules: {
          minFat: formData.minFat ? parseFloat(formData.minFat) : undefined,
          minProtein: formData.minProtein ? parseFloat(formData.minProtein) : undefined,
          maxTemp: formData.maxTemp ? parseFloat(formData.maxTemp) : undefined,
          antibioticTestRequired: formData.antibioticTestRequired,
        },
      }

      const response = await fetch(`/api/v1/mcc/setup`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: mccId,
          managerUserId: formData.managerUserId || undefined,
          settings,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update settings")
      }

      if (data.success) {
        toast.success("Settings updated successfully")
        fetchMCC()
      }
    } catch (error) {
      console.error("Error updating settings:", error)
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update settings"
      toast.error(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Activity className="h-6 w-6 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-500">Loading settings...</span>
      </div>
    )
  }

  return (
    <div className="flex-1 p-2 sm:p-4 md:p-6 lg:p-8 bg-gray-50 max-w-[2000px] mx-auto min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/superadmin/mccs/${mccId}`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">MCC Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Configure pricing, quality rules, and manager</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Manager Assignment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Manager Assignment
            </CardTitle>
            <CardDescription>Assign a manager to this MCC</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="managerUserId">MCC Manager</Label>
              <Select
                value={formData.managerUserId}
                onValueChange={(value) =>
                  setFormData({ ...formData, managerUserId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a manager" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No Manager</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {mcc?.manager && (
                <p className="text-sm text-gray-500">
                  Current Manager: {mcc.manager.name} ({mcc.manager.email})
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Currency Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5" />
              Currency Settings
            </CardTitle>
            <CardDescription>Configure the operating currency for this Collection Center (East African Community currencies)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currency">Operating Currency</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) =>
                  setFormData({ ...formData, currency: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_CURRENCIES.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      <span className="flex items-center gap-2">
                        <span className="font-medium">{currency.code}</span>
                        <span className="text-muted-foreground">({currency.symbol})</span>
                        <span className="text-muted-foreground">- {currency.name}</span>
                        <span className="text-xs text-blue-600">• {currency.country}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                This currency will be used for all collections, payments, and financial transactions in this Collection Center.
                Supports all EAC member state currencies: Rwanda, Kenya, Uganda, Tanzania, Burundi, South Sudan, and DR Congo.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Pricing Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Pricing Settings
            </CardTitle>
            <CardDescription>Configure milk pricing rules (in {formData.currency})</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="basePricePerLiter">Base Price per Liter ({getCurrencySymbol(formData.currency)})</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                    {getCurrencySymbol(formData.currency)}
                  </span>
                  <Input
                    id="basePricePerLiter"
                    type="number"
                    step="0.01"
                    value={formData.basePricePerLiter}
                    onChange={(e) =>
                      setFormData({ ...formData, basePricePerLiter: e.target.value })
                    }
                    placeholder="0.00"
                    className="pl-12"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fatBonus">Fat Bonus per % ({getCurrencySymbol(formData.currency)})</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                    {getCurrencySymbol(formData.currency)}
                  </span>
                  <Input
                    id="fatBonus"
                    type="number"
                    step="0.01"
                    value={formData.fatBonus}
                    onChange={(e) =>
                      setFormData({ ...formData, fatBonus: e.target.value })
                    }
                    placeholder="0.00"
                    className="pl-12"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="proteinBonus">Protein Bonus per % ({getCurrencySymbol(formData.currency)})</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                    {getCurrencySymbol(formData.currency)}
                  </span>
                  <Input
                    id="proteinBonus"
                    type="number"
                    step="0.01"
                    value={formData.proteinBonus}
                    onChange={(e) =>
                      setFormData({ ...formData, proteinBonus: e.target.value })
                    }
                    placeholder="0.00"
                    className="pl-12"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quality Rules */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FlaskConical className="h-5 w-5" />
              Quality Rules
            </CardTitle>
            <CardDescription>Set quality standards for milk acceptance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minFat">Minimum Fat %</Label>
                <Input
                  id="minFat"
                  type="number"
                  step="0.01"
                  value={formData.minFat}
                  onChange={(e) =>
                    setFormData({ ...formData, minFat: e.target.value })
                  }
                  placeholder="3.0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minProtein">Minimum Protein %</Label>
                <Input
                  id="minProtein"
                  type="number"
                  step="0.01"
                  value={formData.minProtein}
                  onChange={(e) =>
                    setFormData({ ...formData, minProtein: e.target.value })
                  }
                  placeholder="3.0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxTemp">Maximum Temperature (°C)</Label>
                <Input
                  id="maxTemp"
                  type="number"
                  step="0.1"
                  value={formData.maxTemp}
                  onChange={(e) =>
                    setFormData({ ...formData, maxTemp: e.target.value })
                  }
                  placeholder="4.0"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="antibioticTestRequired"
                checked={formData.antibioticTestRequired}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    antibioticTestRequired: e.target.checked,
                  })
                }
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="antibioticTestRequired" className="cursor-pointer">
                Require antibiotic test
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/superadmin/mccs/${mccId}`)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

