"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save, Loader2, Activity } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"

interface MCC {
  id: string
  name: string
  code: string
  location: string
  region: string
  address: string
  manager?: {
    id: string
    name: string
    email: string
  }
}

export default function EditMCCPage() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const mccId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    location: "",
    region: "",
    address: "",
  })

  useEffect(() => {
    if (mccId && mccId !== "new") {
      fetchMCC()
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
        const mcc = data.data
        setFormData({
          name: mcc.name || "",
          code: mcc.code || "",
          location: mcc.location || "",
          region: mcc.region || "",
          address: mcc.address || "",
        })
      }
    } catch (error) {
      console.error("Error fetching MCC:", error)
      toast.error("Failed to load MCC details")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.location) {
      toast.error("Name and location are required")
      return
    }

    try {
      setSaving(true)
      const token = localStorage.getItem("Gemurai_token")
      if (!token) {
        toast.error("Authentication required")
        router.push("/superadmin/login")
        return
      }

      const response = await fetch(`/api/v1/mcc/setup`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: mccId,
          ...formData,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update MCC")
      }

      if (data.success) {
        toast.success("MCC updated successfully")
        router.push(`/superadmin/mccs/${mccId}`)
      } else {
        throw new Error(data.error || "Failed to update MCC")
      }
    } catch (error) {
      console.error("Error updating MCC:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to update MCC"
      toast.error(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Activity className="h-6 w-6 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-500">Loading MCC details...</span>
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
          <h1 className="text-2xl md:text-3xl font-bold">Edit MCC</h1>
          <p className="text-sm text-gray-500 mt-1">Update MCC information</p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>MCC Information</CardTitle>
          <CardDescription>Update the details for this Milk Collection Center</CardDescription>
        </CardHeader>
        <CardContent>
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
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-4 pt-4 border-t">
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
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

