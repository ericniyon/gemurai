"use client"

import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ReconciliationDashboard } from "@/components/reconciliation/ReconciliationDashboard"
import { RefreshCw, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"

export default function ReconciliationPage() {
  const { user } = useAuth()
  const params = useParams()
  const lang = (params?.lang as string) || "en"

  if (!user || (user.role !== "MCC_MANAGER" && user.role !== "SUPER_ADMIN" && user.role !== "ADMIN")) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <Card className="max-w-md border-slate-200/80">
          <CardContent className="pt-8 pb-8">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 rounded-xl bg-slate-900 p-4">
                <RefreshCw className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Access Denied</h2>
              <p className="mt-2 text-sm text-slate-600">
                You need MCC Manager or Admin access to run reconciliation.
              </p>
              <Link href={`/${lang}/dashboard`} className="mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/40">
      <div className="relative">
        {/* Decorative blurs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-180px] right-[-120px] h-[420px] w-[420px] rounded-full bg-gradient-to-br from-blue-500/20 via-indigo-400/10 to-purple-400/10 blur-3xl" />
          <div className="absolute bottom-[-160px] left-[-160px] h-[380px] w-[380px] rounded-full bg-gradient-to-tr from-emerald-400/15 via-sky-400/10 to-blue-400/5 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto w-full px-0 py-10">
          <header className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-3 rounded-full bg-white/80 px-4 py-1.5 shadow-sm ring-1 ring-gray-200">
                <RefreshCw className="h-4 w-4 text-blue-600" />
                <span className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                  HarvestPlus • Reconciliation
                </span>
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                  Reconciliation
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-gray-600 sm:text-base">
                  Reconcile collections, payments, and inventory for your MCC
                </p>
              </div>
            </div>
          </header>

          <ReconciliationDashboard />
        </div>
      </div>
    </div>
  )
}
