"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/hooks/use-auth"
import { useParams } from "next/navigation"
import { toast } from "sonner"
import {
  UserPlus,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  Shield,
  MapPin,
  Phone,
  Mail,
} from "lucide-react"
import Link from "next/link"
import { GeoLocationInput } from "@/components/ui/geo-location-input"
import { cn } from "@/lib/utils"

export default function OnboardAgentPage() {
  const { user } = useAuth()
  const params = useParams()
  const lang = (params?.lang as string) || "en"
  const [isLoading, setIsLoading] = useState(false)
  const [agents, setAgents] = useState<any[]>([])
  const [isLoadingAgents, setIsLoadingAgents] = useState(true)
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

  const inputBase =
    "h-11 rounded-xl border border-slate-200/80 bg-slate-50 px-4 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#0099f2]/50 focus:ring-2 focus:ring-[#0099f2]/20 focus:outline-none transition-all"

  const fetchAgents = async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("Gemurai_token") : null
    if (!token) {
      setIsLoadingAgents(false)
      return
    }
    try {
      const res = await fetch("/api/v1/farm-level-data/agents", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setAgents(data.data || [])
      } else {
        const err = await res.json()
        if (res.status === 400 && err.error?.includes("MCC")) {
          setAgents([])
        }
      }
    } catch (error) {
      console.error("Error fetching agents:", error)
      setAgents([])
    } finally {
      setIsLoadingAgents(false)
    }
  }

  useEffect(() => {
    if (user) fetchAgents()
  }, [user])

  if (!user || (user.role !== "MCC_MANAGER" && user.role !== "SUPER_ADMIN" && user.role !== "ADMIN")) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4 bg-slate-100">
        <Card className="max-w-md overflow-hidden border border-slate-200/80 bg-white/95 shadow-xl backdrop-blur-sm">
          <CardContent className="pt-8 pb-8">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 rounded-2xl bg-[#0f172a] p-4">
                <UserPlus className="h-10 w-10 text-[#7dd3fc]" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Access Denied</h2>
              <p className="mt-2 text-sm text-slate-600">
                You need appropriate permissions to onboard agents
              </p>
              <Link href={`/${lang}/dashboard/settings`} className="mt-6">
                <Button variant="outline" size="sm" className="rounded-xl">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Settings
                </Button>
              </Link>
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
      if (!formData.nationalId || !formData.nationalId.trim()) {
        toast.error("National ID is required for agent registration")
        setIsLoading(false)
        return
      }

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
          registrationType: "individual",
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          role: "AGENT",
          additionalData: {
            national_id: formData.nationalId,
            mccId: formData.mccId || undefined,
            gpsLatitude: formData.latitude ?? undefined,
            gpsLongitude: formData.longitude ?? undefined,
          },
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || data.errors?.[0] || "Failed to register agent")
      }

      if (formData.nationalId && data?.user?.id) {
        const verifyResponse = await fetch("/api/v1/admin/id-verification", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            entityType: "agent",
            entityId: data.user.id,
            nationalId: formData.nationalId,
            verified: true,
          }),
        })

        if (!verifyResponse.ok) {
          console.warn("Agent registered but ID verification failed")
        }
      }

      toast.success("Agent registered successfully!")
      fetchAgents()

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

  const clearForm = () => {
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
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="w-full px-4 py-8 sm:px-6 lg:px-8">
        <nav className="mb-8 flex items-center gap-2 text-sm">
          <Link
            href={`/${lang}/dashboard/settings`}
            className="text-slate-500 hover:text-slate-900 transition-colors"
          >
            Settings
          </Link>
          <span className="text-slate-400">/</span>
          <span className="font-medium text-[#0099f2]">Onboard Agent</span>
        </nav>

        <header className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#0f172a] px-4 py-1.5 shadow-md ring-1 ring-slate-700/50 mb-4">
            <UserPlus className="h-4 w-4 text-[#7dd3fc]" />
            <span className="text-xs font-semibold uppercase tracking-wide text-[#7dd3fc]">
              Onboarding • Agents
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Agent onboarding
          </h1>
          <p className="mt-1 text-slate-600">
            Register field agents (Abacunda) and manage your MCC&apos;s agent roster.
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-[1fr_minmax(540px,640px)]">
          {/* Left: Agent list */}
          <div className="order-2 lg:order-1">
            <Card className="overflow-hidden border border-slate-200/80 bg-white/95 shadow-lg shadow-slate-200/40 backdrop-blur-sm">
              <div className="border-b border-slate-200/80 bg-slate-100/80 px-6 py-4">
                <CardTitle className="flex items-center justify-between text-lg font-semibold text-slate-800">
                  <span>{agents.length > 0 ? "Your agents" : "Onboarded agents"}</span>
                  <span className="text-sm font-normal text-slate-500">
                    {agents.length} agent{agents.length !== 1 ? "s" : ""}
                  </span>
                </CardTitle>
                <p className="mt-0.5 text-sm text-slate-500">
                  {agents.length > 0
                    ? "Field agents registered for your MCC."
                    : "No agents yet. Register your first agent below."}
                </p>
              </div>
              <CardContent className="p-6">
                {isLoadingAgents ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <Loader2 className="h-10 w-10 animate-spin text-[#0099f2] mb-4" />
                    <p className="text-sm text-slate-500">Loading agents...</p>
                  </div>
                ) : agents.length > 0 ? (
                  <div className="space-y-3">
                    {agents.map((agent) => (
                      <div
                        key={agent.id}
                        className="flex items-center gap-4 rounded-xl border border-slate-200/60 bg-slate-50/50 px-4 py-3 hover:bg-slate-100/80 transition-colors"
                      >
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0099f2]/10">
                          <UserPlus className="h-5 w-5 text-[#0099f2]" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-slate-900 truncate">{agent.name}</p>
                          <div className="mt-0.5 flex flex-wrap items-center gap-x-4 gap-y-0.5 text-sm text-slate-500">
                            {agent.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="h-3.5 w-3.5" />
                                {agent.phone}
                              </span>
                            )}
                            {agent.email && (
                              <span className="flex items-center gap-1 truncate">
                                <Mail className="h-3.5 w-3.5 shrink-0" />
                                {agent.email}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-200/80">
                      <UserPlus className="h-8 w-8 text-slate-500" />
                    </div>
                    <p className="font-semibold text-slate-900">No agents yet</p>
                    <p className="mt-1 text-sm text-slate-500">
                      Register your first field agent using the form on the right.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right: Registration form */}
          <div className="order-1 lg:order-2">
            <div className="lg:sticky lg:top-8">
              <Card className="overflow-hidden border border-slate-200/80 bg-white/95 shadow-lg shadow-slate-200/40 backdrop-blur-sm">
                <div className="h-1 w-full bg-gradient-to-r from-[#0099f2] via-[#1ab1f4] to-[#0082d9]" />
                <CardHeader className="pb-4 pt-6">
                  <CardTitle className="flex items-center gap-3 text-lg font-semibold text-slate-900">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0099f2]/10">
                      <UserPlus className="h-5 w-5 text-[#0099f2]" />
                    </div>
                    Register new agent
                  </CardTitle>
                  <p className="text-sm text-slate-500">
                    Create an AGENT account with unique agent code.
                  </p>
                </CardHeader>
                <CardContent className="pb-6 pt-0">
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-[#0099f2]" />
                        <h3 className="text-sm font-semibold text-slate-800">Personal info</h3>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2 sm:col-span-2">
                          <Label htmlFor="name" className="text-sm font-medium text-slate-700">
                            Full name <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            placeholder="Enter full name"
                            className={inputBase}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                            Email <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                            placeholder="agent@example.com"
                            className={inputBase}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone" className="text-sm font-medium text-slate-700">
                            Phone <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            required
                            placeholder="+250788123456"
                            className={inputBase}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="nationalId" className="text-sm font-medium text-slate-700">
                            National ID <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="nationalId"
                            value={formData.nationalId}
                            onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                            required
                            placeholder="1199912345678901"
                            className={inputBase}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="agentId" className="text-sm font-medium text-slate-700">
                            Agent ID <span className="text-slate-400 font-normal">(optional)</span>
                          </Label>
                          <Input
                            id="agentId"
                            value={formData.agentId}
                            onChange={(e) => setFormData({ ...formData, agentId: e.target.value })}
                            placeholder="Auto-generated if empty"
                            className={inputBase}
                          />
                        </div>
                        {user?.mccId && (
                          <div className="space-y-2 sm:col-span-2">
                            <Label htmlFor="mccId" className="text-sm font-medium text-slate-700">
                              MCC
                            </Label>
                            <Input
                              id="mccId"
                              value={formData.mccId}
                              disabled
                              className={cn(inputBase, "bg-slate-100 text-slate-500")}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4 border-t border-slate-100 pt-5">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-[#0099f2]" />
                        <h3 className="text-sm font-semibold text-slate-800">Credentials</h3>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                            Password <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="password"
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                            minLength={6}
                            placeholder="Min. 6 characters"
                            className={inputBase}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700">
                            Confirm <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="confirmPassword"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            required
                            placeholder="Re-enter password"
                            className={inputBase}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="sr-only">
                      <GeoLocationInput
                        latitude={formData.latitude}
                        longitude={formData.longitude}
                        onLocationChange={(lat, lng) => setFormData((p) => ({ ...p, latitude: lat, longitude: lng }))}
                        autoCapture
                        minimal
                      />
                    </div>

                    <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end sm:gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={clearForm}
                        className="rounded-xl border-slate-200"
                      >
                        Clear
                      </Button>
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="rounded-xl bg-[#0099f2] px-6 py-2.5 font-medium text-white shadow-md hover:bg-[#0082d9] disabled:opacity-50"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Registering...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Register agent
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
