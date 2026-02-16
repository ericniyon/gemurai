"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"
import {
  UserPlus,
  Loader2,
  CheckCircle2,
  Shield,
  MapPin,
  Phone,
  Mail,
} from "lucide-react"
import { GeoLocationInput } from "@/components/ui/geo-location-input"
import { cn } from "@/lib/utils"

const inputBase =
  "h-11 rounded-xl border-2 border-blue-200 bg-white px-4 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all"

interface OnboardingAgentsContentProps {
  triggerOpenAddDialog?: boolean
  onTriggerConsumed?: () => void
}

export function OnboardingAgentsContent({ triggerOpenAddDialog, onTriggerConsumed }: OnboardingAgentsContentProps = {}) {
  const { user } = useAuth()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [agents, setAgents] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
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

  const fetchAgents = async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("Gemurai_token") : null
    if (!token) {
      setIsLoading(false)
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
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchAgents()
      setFormData((p) => ({ ...p, mccId: user.mccId || p.mccId }))
    }
  }, [user])

  useEffect(() => {
    if (triggerOpenAddDialog) {
      setIsDialogOpen(true)
      onTriggerConsumed?.()
    }
  }, [triggerOpenAddDialog, onTriggerConsumed])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (!formData.nationalId || !formData.nationalId.trim()) {
        toast.error("National ID is required for agent registration")
        setIsSubmitting(false)
        return
      }

      if (formData.password !== formData.confirmPassword) {
        toast.error("Passwords do not match")
        setIsSubmitting(false)
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
          role: "FIELD_AGENT",
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
      setIsDialogOpen(false)
      fetchAgents()
      resetForm()
    } catch (error: any) {
      toast.error(error.message || "Failed to register agent")
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
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

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <Loader2 className="h-10 w-10 mx-auto animate-spin text-blue-600 mb-3" />
        <p className="text-gray-500">Loading agents...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="border-2 border-blue-200 shadow-sm">
        <CardHeader className="border-b border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <UserPlus className="h-6 w-6 text-blue-600" />
              <div>
                <CardTitle className="text-2xl font-bold text-blue-900">Agents</CardTitle>
                <CardDescription className="text-gray-600 mt-1">
                  Register field agents (Abacunda) and manage your MCC&apos;s agent roster. Create a FIELD_AGENT account with unique agent code.
                </CardDescription>
              </div>
            </div>
            <Button
              onClick={() => {
                resetForm()
                setIsDialogOpen(true)
              }}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Register agent
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {agents.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <UserPlus className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p>No agents yet. Register your first field agent to get started.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {agents.map((agent) => (
                  <Card
                    key={agent.id}
                    className="border-2 border-blue-200 hover:border-blue-400 transition-all shadow-sm hover:shadow-md"
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg font-bold text-blue-900">{agent.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      {agent.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-blue-600" />
                          <span className="text-gray-800">{agent.phone}</span>
                        </div>
                      )}
                      {agent.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-blue-600" />
                          <span className="text-gray-800 truncate">{agent.email}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="flex max-w-4xl max-h-[90vh] flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-0 shadow-2xl">
          <div className="shrink-0 border-b border-slate-200/80 bg-gradient-to-br from-slate-50 via-white to-blue-50/40 px-6 pt-6 pb-4">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-blue-100/80 p-2.5">
                  <UserPlus className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold text-slate-900">Register new agent</DialogTitle>
                  <DialogDescription className="mt-1 text-slate-600">
                    Create a FIELD_AGENT account with unique agent code. National ID is required.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
          </div>

          <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5 space-y-6">
              <section className="space-y-4">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <Shield className="h-4 w-4 text-blue-600" />
                  Personal info
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="agent-name" className="text-sm font-semibold text-slate-700">Full name <span className="text-red-500">*</span></Label>
                    <Input
                      id="agent-name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      placeholder="Enter full name"
                      className="h-11 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="agent-email" className="text-sm font-semibold text-slate-700">Email <span className="text-red-500">*</span></Label>
                    <Input
                      id="agent-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      placeholder="agent@example.com"
                      className="h-11 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="agent-phone" className="text-sm font-semibold text-slate-700">Phone <span className="text-red-500">*</span></Label>
                    <Input
                      id="agent-phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                      placeholder="+250788123456"
                      className="h-11 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="agent-nationalId" className="text-sm font-semibold text-slate-700">National ID <span className="text-red-500">*</span></Label>
                    <Input
                      id="agent-nationalId"
                      value={formData.nationalId}
                      onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                      required
                      placeholder="1199912345678901"
                      className="h-11 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="agent-agentId" className="text-sm font-semibold text-slate-700">Agent ID <span className="text-slate-400 font-normal">(optional)</span></Label>
                    <Input
                      id="agent-agentId"
                      value={formData.agentId}
                      onChange={(e) => setFormData({ ...formData, agentId: e.target.value })}
                      placeholder="Auto-generated if empty"
                      className="h-11 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                  {user?.mccId && (
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="agent-mccId" className="text-sm font-semibold text-slate-700">MCC</Label>
                      <Input
                        id="agent-mccId"
                        value={formData.mccId}
                        disabled
                        className={cn("h-11 rounded-xl border border-slate-200", "bg-slate-100 text-slate-500")}
                      />
                    </div>
                  )}
                </div>
              </section>

              <section className="space-y-4 border-t border-slate-100 pt-5">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  Credentials
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="agent-password" className="text-sm font-semibold text-slate-700">Password <span className="text-red-500">*</span></Label>
                    <Input
                      id="agent-password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      minLength={6}
                      placeholder="Min. 6 characters"
                      className="h-11 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="agent-confirmPassword" className="text-sm font-semibold text-slate-700">Confirm <span className="text-red-500">*</span></Label>
                    <Input
                      id="agent-confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      required
                      placeholder="Re-enter password"
                      className="h-11 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                </div>
              </section>

              <div className="sr-only">
                <GeoLocationInput
                  latitude={formData.latitude}
                  longitude={formData.longitude}
                  onLocationChange={(lat, lng) =>
                    setFormData((p) => ({ ...p, latitude: lat, longitude: lng }))
                  }
                  autoCapture
                  minimal
                />
              </div>
            </div>

            <DialogFooter className="shrink-0 gap-3 border-t border-slate-200/80 px-6 py-4 bg-slate-50/50">
              <Button
                type="button"
                variant="outline"
                onClick={() => { resetForm(); setIsDialogOpen(false) }}
                className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
                className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-100"
              >
                Clear
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 font-semibold text-white shadow-lg shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50"
              >
                {isSubmitting ? (
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
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
