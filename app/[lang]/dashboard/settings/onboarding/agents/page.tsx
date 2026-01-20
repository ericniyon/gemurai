"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/hooks/use-auth"
import { useParams } from "next/navigation"
import { toast } from "sonner"
import { UserPlus, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { GeoLocationInput } from "@/components/ui/geo-location-input"

export default function OnboardAgentPage() {
  const { user } = useAuth()
  const params = useParams()
  const lang = (params?.lang as string) || "en"
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    nationalId: "",
    agentId: "",
    mccId: user?.mccId || "",
    password: "",
    confirmPassword: "",
    latitude: null as number | null,
    longitude: null as number | null,
  })

  if (!user || (user.role !== "MCC_MANAGER" && user.role !== "SUPER_ADMIN" && user.role !== "ADMIN")) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-xl font-bold mb-2">Access Denied</h2>
              <p className="text-gray-600">
                You need appropriate permissions to onboard agents
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validate National ID (mandatory for agents)
      if (!formData.nationalId || !formData.nationalId.trim()) {
        toast.error("National ID is required for agent registration")
        setIsLoading(false)
        return
      }

      // Validate passwords match
      if (formData.password !== formData.confirmPassword) {
        toast.error("Passwords do not match")
        setIsLoading(false)
        return
      }

      const token = localStorage.getItem("Gemurai_token")
      const response = await fetch("/api/v1/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          role: "FIELD_AGENT",
          nationalId: formData.nationalId,
          agentId: formData.agentId,
          mccId: formData.mccId || undefined,
          latitude: formData.latitude || undefined,
          longitude: formData.longitude || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to register agent")
      }

      // Verify ID after registration
      if (formData.nationalId) {
        const verifyResponse = await fetch("/api/v1/admin/id-verification", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            entityType: "agent",
            entityId: data.data?.user?.id,
            nationalId: formData.nationalId,
            verified: true, // Auto-verify if provided during onboarding
          }),
        })

        if (!verifyResponse.ok) {
          console.warn("Agent registered but ID verification failed")
        }
      }

      toast.success("Agent registered successfully!")
      
      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        nationalId: "",
        agentId: "",
        mccId: user?.mccId || "",
        password: "",
        confirmPassword: "",
        latitude: null,
        longitude: null,
      })
    } catch (error: any) {
      toast.error(error.message || "Failed to register agent")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Link href={`/${lang}/dashboard/settings`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Settings
              </Button>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl">
              <UserPlus className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Onboard Agent / Abacunda</h1>
              <p className="text-gray-600">Register a new field agent (Abacunda) to the system</p>
            </div>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Agent Onboarding</CardTitle>
          <CardDescription>
            Register a new field agent (Abacunda). This will create an agent account with FIELD_AGENT role,
            generate a unique agent code, and enable them to collect commodities in the field.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Required Information</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Full Name</li>
                  <li>• Email Address</li>
                  <li>• Phone Number</li>
                  <li>• National ID (Mandatory)</li>
                  <li>• Password</li>
                </ul>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <h3 className="font-semibold text-purple-900 mb-2">Capabilities</h3>
                <ul className="text-sm text-purple-700 space-y-1">
                  <li>• Record collections</li>
                  <li>• Quality testing</li>
                  <li>• Offline sync</li>
                  <li>• Traceability recording</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Agent Registration Form */}
      <Card>
        <CardHeader>
          <CardTitle>Agent Registration Form</CardTitle>
          <CardDescription>
            Fill in the details to register a new field agent
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Enter full name"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  placeholder="agent@example.com"
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">
                  Phone Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  placeholder="+250788123456"
                />
              </div>

              {/* National ID */}
              <div className="space-y-2">
                <Label htmlFor="nationalId">
                  National ID <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="nationalId"
                  value={formData.nationalId}
                  onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                  required
                  placeholder="1199912345678901"
                />
                <p className="text-xs text-gray-500">Mandatory for agent registration</p>
              </div>

              {/* Agent ID (Optional) */}
              <div className="space-y-2">
                <Label htmlFor="agentId">Agent ID (Optional)</Label>
                <Input
                  id="agentId"
                  value={formData.agentId}
                  onChange={(e) => setFormData({ ...formData, agentId: e.target.value })}
                  placeholder="Auto-generated if not provided"
                />
              </div>

              {/* MCC ID (if user has mccId) */}
              {user?.mccId && (
                <div className="space-y-2">
                  <Label htmlFor="mccId">MCC</Label>
                  <Input
                    id="mccId"
                    value={formData.mccId}
                    disabled
                    className="bg-gray-100"
                  />
                  <p className="text-xs text-gray-500">Linked to your MCC</p>
                </div>
              )}

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">
                  Password <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={6}
                  placeholder="Minimum 6 characters"
                />
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  Confirm Password <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                  placeholder="Re-enter password"
                />
              </div>
            </div>

            {/* Geo Location (Optional) */}
            <div className="space-y-2">
              <Label>Location (Optional)</Label>
              <GeoLocationInput
                latitude={formData.latitude}
                longitude={formData.longitude}
                onLocationChange={(location) => {
                  setFormData({
                    ...formData,
                    latitude: location.latitude,
                    longitude: location.longitude,
                  })
                }}
                label="Agent Location (Optional)"
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setFormData({
                    name: "",
                    email: "",
                    phone: "",
                    nationalId: "",
                    agentId: "",
                    mccId: user?.mccId || "",
                    password: "",
                    confirmPassword: "",
                    latitude: null,
                    longitude: null,
                  })
                }}
              >
                Clear
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Registering...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Register Agent
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
