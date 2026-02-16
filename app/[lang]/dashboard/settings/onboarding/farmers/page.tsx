"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/hooks/use-auth"
import { useParams } from "next/navigation"
import { AddFarmerForm } from "@/app/[lang]/dashboard/mcc/components/AddFarmerForm"
import {
  Users,
  ArrowLeft,
  UserPlus,
  Phone,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function OnboardFarmerPage() {
  const { user } = useAuth()
  const params = useParams()
  const lang = (params?.lang as string) || "en"
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [farmers, setFarmers] = useState<any[]>([])
  const [isLoadingFarmers, setIsLoadingFarmers] = useState(true)

  const fetchFarmers = async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("Gemurai_token") : null
    if (!token) {
      setIsLoadingFarmers(false)
      return
    }
    try {
      const res = await fetch("/api/v1/mcc/farmers", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setFarmers(data.data || [])
      }
    } catch (error) {
      console.error("Error fetching farmers:", error)
    } finally {
      setIsLoadingFarmers(false)
    }
  }

  useEffect(() => {
    if (user) fetchFarmers()
  }, [user])

  if (!user || (user.role !== "MCC_MANAGER" && user.role !== "SUPER_ADMIN" && user.role !== "ADMIN")) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4 bg-slate-100">
        <Card className="max-w-md overflow-hidden border border-slate-200/80 bg-white/95 shadow-xl backdrop-blur-sm">
          <CardContent className="pt-8 pb-8">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 rounded-2xl bg-[#0f172a] p-4">
                <Users className="h-10 w-10 text-[#7dd3fc]" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Access Denied</h2>
              <p className="mt-2 text-sm text-slate-600">
                You need appropriate permissions to onboard farmers
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
          <span className="font-medium text-[#0099f2]">Onboard Farmer</span>
        </nav>

        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#0f172a] px-4 py-1.5 shadow-md ring-1 ring-slate-700/50 mb-4">
              <Users className="h-4 w-4 text-[#7dd3fc]" />
              <span className="text-xs font-semibold uppercase tracking-wide text-[#7dd3fc]">
                Onboarding • Farmers
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Farmer onboarding
            </h1>
            <p className="mt-1 text-slate-600">
              Register smallholder farmers. A unique code and ledger account will be created automatically. National ID verification is mandatory.
            </p>
          </div>
          <Button
            onClick={() => setIsFormOpen(true)}
            className="shrink-0 rounded-xl bg-[#0099f2] px-6 py-2.5 font-medium text-white shadow-md hover:bg-[#0082d9]"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Register farmer
          </Button>
        </header>

        <div className="grid gap-8 lg:grid-cols-[1fr_minmax(540px,640px)]">
          {/* Left: Farmers list */}
          <div className="order-2 lg:order-1">
            <Card className="overflow-hidden border border-slate-200/80 bg-white/95 shadow-lg shadow-slate-200/40 backdrop-blur-sm">
              <div className="border-b border-slate-200/80 bg-slate-100/80 px-6 py-4">
                <CardTitle className="flex items-center justify-between text-lg font-semibold text-slate-800">
                  <span>{farmers.length > 0 ? "Your farmers" : "Onboarded farmers"}</span>
                  <span className="text-sm font-normal text-slate-500">
                    {farmers.length} farmer{farmers.length !== 1 ? "s" : ""}
                  </span>
                </CardTitle>
                <p className="mt-0.5 text-sm text-slate-500">
                  {farmers.length > 0
                    ? "Farmers registered for your collection center."
                    : "No farmers yet. Register your first farmer using the form on the right."}
                </p>
              </div>
              <CardContent className="p-6">
                {isLoadingFarmers ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <Loader2 className="h-10 w-10 animate-spin text-[#0099f2] mb-4" />
                    <p className="text-sm text-slate-500">Loading farmers...</p>
                  </div>
                ) : farmers.length > 0 ? (
                  <div className="space-y-3">
                    {farmers.map((farmer) => (
                      <div
                        key={farmer.id}
                        className="flex items-center gap-4 rounded-xl border border-slate-200/60 bg-slate-50/50 px-4 py-3 hover:bg-slate-100/80 transition-colors"
                      >
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0099f2]/10">
                          <Users className="h-5 w-5 text-[#0099f2]" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-slate-900 truncate">{farmer.name}</p>
                          <p className="flex items-center gap-1.5 text-sm text-slate-500">
                            <Phone className="h-3.5 w-3.5" />
                            {farmer.phone || "—"}
                          </p>
                        </div>
                        {farmer.farmerCode && (
                          <span className="shrink-0 rounded-lg bg-[#0099f2]/10 px-2 py-1 text-xs font-medium text-[#0099f2]">
                            {farmer.farmerCode}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-200/80">
                      <Users className="h-8 w-8 text-slate-500" />
                    </div>
                    <p className="font-semibold text-slate-900">No farmers yet</p>
                    <p className="mt-1 text-sm text-slate-500">
                      Register your first farmer using the form on the right.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right: Register CTA card */}
          <div className="order-1 lg:order-2">
            <div className="lg:sticky lg:top-8">
              <Card className="overflow-hidden border border-slate-200/80 bg-white/95 shadow-lg shadow-slate-200/40 backdrop-blur-sm">
                <div className="h-1 w-full bg-gradient-to-r from-[#0099f2] via-[#1ab1f4] to-[#0082d9]" />
                <CardHeader className="pb-4 pt-6">
                  <CardTitle className="flex items-center gap-3 text-lg font-semibold text-slate-900">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0099f2]/10">
                      <UserPlus className="h-5 w-5 text-[#0099f2]" />
                    </div>
                    Register new farmer
                  </CardTitle>
                  <p className="text-sm text-slate-500">
                    Add a smallholder farmer to your collection center. A unique farmer code and ledger account will be created automatically.
                  </p>
                </CardHeader>
                <CardContent className="pb-6 pt-0">
                  <div className="space-y-4">
                    <p className="text-sm text-slate-600">
                      The registration form collects personal details, location, farm info, emergency contacts, and payment method. National ID is mandatory.
                    </p>
                    <Button
                      onClick={() => setIsFormOpen(true)}
                      className="w-full rounded-xl bg-[#0099f2] px-6 py-2.5 font-medium text-white shadow-md hover:bg-[#0082d9]"
                    >
                      <UserPlus className="mr-2 h-4 w-4" />
                      Register farmer
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <AddFarmerForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSuccess={() => {
          setIsFormOpen(false)
          fetchFarmers()
        }}
      />
    </div>
  )
}
