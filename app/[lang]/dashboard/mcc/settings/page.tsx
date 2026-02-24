"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/hooks/use-auth"
import { useParams } from "next/navigation"
import Link from "next/link"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Settings,
  Loader2,
  Save,
  ChevronRight,
  Coins,
  CreditCard,
  Palette,
  Sun,
  Moon,
  Monitor,
  Check,
} from "lucide-react"
import { SUPPORTED_CURRENCIES, DEFAULT_CURRENCY } from "@/lib/utils/currency"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const PAYMENT_METHODS = [
  { id: "cash", label: "Cash" },
  { id: "mobile_money", label: "Mobile Money" },
  { id: "bank_transfer", label: "Bank Transfer" },
] as const

const THEME_MODES = [
  { id: "light", label: "Light", icon: Sun },
  { id: "dark", label: "Dark", icon: Moon },
  { id: "system", label: "System", icon: Monitor },
] as const

const THEME_ACCENTS = [
  { id: "slate", label: "Slate", class: "bg-slate-500" },
  { id: "blue", label: "Blue", class: "bg-blue-500" },
  { id: "emerald", label: "Emerald", class: "bg-emerald-500" },
  { id: "violet", label: "Violet", class: "bg-violet-500" },
] as const

interface MCCSettings {
  currency?: string
  paymentMethods?: string[]
  theme?: {
    mode?: "light" | "dark" | "system"
    accent?: string
  }
}

export default function MCCSettingsPage() {
  const { user } = useAuth()
  const params = useParams()
  const lang = (params?.lang as string) || "en"
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [mccSettings, setMccSettings] = useState<MCCSettings>({})
  const [formData, setFormData] = useState({
    currency: DEFAULT_CURRENCY,
    paymentMethods: [] as string[],
    themeMode: "system" as "light" | "dark" | "system",
    themeAccent: "slate" as string,
  })

  useEffect(() => {
    if (user?.mccId) fetchSettings()
    else setLoading(false)
  }, [user?.mccId])

  const fetchSettings = async () => {
    if (!user?.mccId) return
    try {
      setLoading(true)
      const token = localStorage.getItem("Gemurai_token")
      if (!token) {
        toast.error("Authentication required")
        return
      }
      const res = await fetch(`/api/v1/mcc/setup?id=${user.mccId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error("Failed to load settings")
      const data = await res.json()
      if (data.success && data.data) {
        const settings = (data.data.settings || {}) as MCCSettings
        setMccSettings(settings)
        setFormData({
          currency: settings.currency || DEFAULT_CURRENCY,
          paymentMethods: Array.isArray(settings.paymentMethods) ? settings.paymentMethods : ["cash", "mobile_money", "bank_transfer"],
          themeMode: (settings.theme?.mode as "light" | "dark" | "system") || "system",
          themeAccent: settings.theme?.accent || "slate",
        })
      }
    } catch (e) {
      console.error(e)
      toast.error("Failed to load collection center settings")
    } finally {
      setLoading(false)
    }
  }

  const togglePaymentMethod = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      paymentMethods: prev.paymentMethods.includes(id)
        ? prev.paymentMethods.filter((x) => x !== id)
        : [...prev.paymentMethods, id],
    }))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.mccId) return
    try {
      setSaving(true)
      const token = localStorage.getItem("Gemurai_token")
      if (!token) {
        toast.error("Authentication required")
        return
      }
      const settings: MCCSettings = {
        ...mccSettings,
        currency: formData.currency,
        paymentMethods: formData.paymentMethods.length > 0 ? formData.paymentMethods : PAYMENT_METHODS.map((p) => p.id),
        theme: {
          mode: formData.themeMode,
          accent: formData.themeAccent,
        },
      }
      const res = await fetch("/api/v1/mcc/setup", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: user.mccId, settings }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to save")
      toast.success("Settings saved successfully")
      setMccSettings(settings)
      // Optional: apply theme to document for this session
      if (typeof document !== "undefined" && formData.themeMode !== "system") {
        document.documentElement.classList.remove("light", "dark")
        document.documentElement.classList.add(formData.themeMode)
      }
    } catch (e) {
      console.error(e)
      toast.error(e instanceof Error ? e.message : "Failed to save settings")
    } finally {
      setSaving(false)
    }
  }

  if (!user || (user.role !== "MCC_MANAGER" && user.role !== "SUPER_ADMIN")) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md border-slate-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-xl font-bold mb-2 text-slate-900">Access denied</h2>
              <p className="text-slate-600">You need Collection Center Manager access to view these settings.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!user.mccId && user.role === "MCC_MANAGER") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md border-slate-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-xl font-bold mb-2 text-slate-900">No collection center</h2>
              <p className="text-slate-600">Your account is not linked to a collection center. Contact an administrator.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        <p className="text-sm text-slate-500">Loading settings…</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-slate-900 text-white">
          <Settings className="h-7 w-7" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Collection Center settings</h1>
          <p className="text-slate-600 text-sm">Configure currency, payment methods, and theme for your collection center</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Currency */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Coins className="h-5 w-5 text-amber-600" />
              Currency
            </CardTitle>
            <CardDescription>Default currency for payments and reporting at this collection center</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={formData.currency} onValueChange={(v) => setFormData((p) => ({ ...p, currency: v }))}>
              <SelectTrigger className="max-w-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_CURRENCIES.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.symbol} {c.name} ({c.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Payment methods */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CreditCard className="h-5 w-5 text-sky-600" />
              Payment methods
            </CardTitle>
            <CardDescription>Which payment methods are accepted when processing farmer payments</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {PAYMENT_METHODS.map((method) => (
              <label
                key={method.id}
                className={cn(
                  "flex items-center gap-3 rounded-xl border-2 p-4 cursor-pointer transition-colors",
                  formData.paymentMethods.includes(method.id)
                    ? "border-sky-500 bg-sky-50/50"
                    : "border-slate-200 hover:border-slate-300"
                )}
              >
                <input
                  type="checkbox"
                  checked={formData.paymentMethods.includes(method.id)}
                  onChange={() => togglePaymentMethod(method.id)}
                  className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                />
                <span className="font-medium text-slate-900">{method.label}</span>
                {formData.paymentMethods.includes(method.id) && <Check className="h-4 w-4 text-sky-600 ml-auto" />}
              </label>
            ))}
            {formData.paymentMethods.length === 0 && (
              <p className="text-sm text-amber-600">Select at least one payment method.</p>
            )}
          </CardContent>
        </Card>

        {/* Theme */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Palette className="h-5 w-5 text-violet-600" />
              Theme
            </CardTitle>
            <CardDescription>Appearance of your collection center dashboard (light, dark, or system)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="text-sm font-medium text-slate-700 mb-2 block">Mode</Label>
              <div className="flex flex-wrap gap-3">
                {THEME_MODES.map((mode) => {
                  const Icon = mode.icon
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setFormData((p) => ({ ...p, themeMode: mode.id }))}
                      className={cn(
                        "flex items-center gap-2 rounded-xl border-2 px-4 py-3 transition-all",
                        formData.themeMode === mode.id
                          ? "border-violet-500 bg-violet-50 text-violet-900"
                          : "border-slate-200 hover:border-slate-300 text-slate-700"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      {mode.label}
                    </button>
                  )
                })}
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-slate-700 mb-2 block">Accent color</Label>
              <p className="text-xs text-slate-500 mb-2">Primary color used across your collection center views</p>
              <div className="flex flex-wrap gap-3">
                {THEME_ACCENTS.map((acc) => (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => setFormData((p) => ({ ...p, themeAccent: acc.id }))}
                    className={cn(
                      "flex items-center gap-2 rounded-xl border-2 px-4 py-3 transition-all",
                      formData.themeAccent === acc.id ? "border-slate-800 ring-2 ring-offset-2 ring-slate-400" : "border-slate-200 hover:border-slate-300"
                    )}
                  >
                    <span className={cn("h-4 w-4 rounded-full", acc.class)} />
                    {acc.label}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between gap-4 pt-4">
          <Link
            href={`/${lang}/dashboard/mcc`}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            <ChevronRight className="h-4 w-4 rotate-180" />
            Back to Collection Center
          </Link>
          <Button type="submit" disabled={saving || formData.paymentMethods.length === 0} className="gap-2">
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save settings
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
