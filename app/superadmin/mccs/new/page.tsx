"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"

const pageBackgroundClasses = "bg-gradient-to-br from-slate-50 via-white to-blue-50/40"
const cardBaseClasses =
  "relative overflow-hidden rounded-2xl border border-white/60 bg-white/85 backdrop-blur-md shadow-xl shadow-blue-100/60"

export default function NewMCCPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    location: "",
    region: "",
    address: "",
    managerUserId: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.location) {
      toast.error("Name and location are required")
      return
    }

    try {
      setLoading(true)
      const token = localStorage.getItem("Gemurai_token")
      if (!token) {
        toast.error("Authentication required")
        router.push("/superadmin/login")
        return
      }

      const response = await fetch("/api/v1/mcc/setup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          mcc: {
            name: formData.name,
            code: formData.code || undefined,
            location: formData.location,
            region: formData.region || undefined,
            address: formData.address || undefined,
            managerUserId: formData.managerUserId || undefined,
          },
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create MCC")
      }

      if (data.success) {
        toast.success("MCC created successfully")
        router.push(`/superadmin/mccs/${data.data?.mcc?.id || ""}`)
      } else {
        throw new Error(data.error || "Failed to create MCC")
      }
    } catch (error) {
      console.error("Error creating MCC:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to create MCC"
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`relative min-h-screen overflow-hidden ${pageBackgroundClasses}`}>
      <div className="pointer-events-none absolute top-[-180px] right-[-120px] h-[420px] w-[420px] rounded-full bg-gradient-to-br from-blue-500/20 via-indigo-400/10 to-purple-400/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-160px] left-[-160px] h-[380px] w-[380px] rounded-full bg-gradient-to-tr from-emerald-400/15 via-sky-400/10 to-blue-400/5 blur-3xl" />
      <div className="relative z-10 flex-1 p-2 sm:p-4 md:p-6 lg:p-8 max-w-[2000px] mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/superadmin/mccs")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Create New MCC</h1>
          <p className="text-sm text-gray-500 mt-1">Add a new Milk Collection Center</p>
        </div>
      </div>

      {/* Form */}
      <Card className={cardBaseClasses}>
        <CardHeader className="p-4 sm:p-6 border-b border-white/50">
          <CardTitle className="text-xl sm:text-2xl">MCC Information</CardTitle>
          <CardDescription className="text-sm">Enter the details for the new Milk Collection Center</CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="MCC Name"
                  required
                  className="h-12 rounded-xl border border-blue-100 bg-white/80 backdrop-blur-sm"
                />
              </div>

              {/* Code */}
              <div className="space-y-2">
                <Label htmlFor="code">Code</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="MCC-001"
                  className="h-12 rounded-xl border border-blue-100 bg-white/80 backdrop-blur-sm"
                />
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="City/Town"
                  required
                  className="h-12 rounded-xl border border-blue-100 bg-white/80 backdrop-blur-sm"
                />
              </div>

              {/* Region */}
              <div className="space-y-2">
                <Label htmlFor="region">Region</Label>
                <Input
                  id="region"
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  placeholder="Region/Province"
                  className="h-12 rounded-xl border border-blue-100 bg-white/80 backdrop-blur-sm"
                />
              </div>

              {/* Address */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Full address"
                  rows={3}
                  className="rounded-xl bg-white/80 backdrop-blur-sm"
                  style={{
                    border: "1px solid rgb(191, 219, 254)",
                    padding: "0.875rem 1rem",
                  }}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-4 pt-4 border-t border-white/60">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/superadmin/mccs")}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2 text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Create MCC
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      </div>
    </div>
  )
}

