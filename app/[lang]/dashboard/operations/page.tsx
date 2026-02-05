"use client"

import { useAuth } from "@/hooks/use-auth"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Calendar,
  Activity,
  Database,
  CreditCard,
  Settings2,
  ArrowRight,
  Droplets,
  Sprout,
} from "lucide-react"
import { cn } from "@/lib/utils"

const OPERATIONS = [
  {
    id: "mcc-periods",
    name: "MCC Periods",
    description: "Manage milk collection periods and schedules",
    href: "mcc/periods",
    icon: Calendar,
    iconColor: "text-[#0099f2]",
    iconBg: "bg-[#0099f2]/10",
    borderColor: "border-[#0099f2]/30",
  },
  {
    id: "dairy-processing",
    name: "Dairy Processing",
    description: "Process milk from raw to finished products",
    href: "mcc/processing",
    icon: Activity,
    iconColor: "text-sky-600",
    iconBg: "bg-sky-500/10",
    borderColor: "border-sky-200",
  },
  {
    id: "dairy-payments",
    name: "Dairy Payments",
    description: "Process and track dairy payments",
    href: "mcc/payments",
    icon: CreditCard,
    iconColor: "text-emerald-600",
    iconBg: "bg-emerald-500/10",
    borderColor: "border-emerald-200",
  },
  {
    id: "crop-periods",
    name: "Crop Periods",
    description: "Manage crop collection periods",
    href: "mcc/crops/periods",
    icon: Calendar,
    iconColor: "text-amber-600",
    iconBg: "bg-amber-500/10",
    borderColor: "border-amber-200",
  },
  {
    id: "crop-processing",
    name: "Crop Processing",
    description: "Process crops and track processing",
    href: "mcc/crops/processing",
    icon: Activity,
    iconColor: "text-emerald-600",
    iconBg: "bg-emerald-500/10",
    borderColor: "border-emerald-200",
  },
  {
    id: "crop-types",
    name: "Crop Types",
    description: "Configure crop types and categories",
    href: "mcc/crops/types",
    icon: Database,
    iconColor: "text-slate-600",
    iconBg: "bg-slate-100",
    borderColor: "border-slate-200",
  },
]

export default function OperationsPage() {
  const { user } = useAuth()
  const params = useParams()
  const lang = (params?.lang as string) || "en"
  const base = `/${lang}/dashboard`

  const canAccess =
    user &&
    (user.role === "MCC_MANAGER" || user.role === "ADMIN" || user.role === "SUPER_ADMIN")

  if (!user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#0099f2] border-t-transparent" />
      </div>
    )
  }

  if (!canAccess) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <Card className="max-w-md overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-lg">
          <CardContent className="pt-10 pb-10">
            <div className="flex flex-col items-center text-center">
              <div className="rounded-2xl bg-slate-100 p-4 mb-4">
                <Settings2 className="h-10 w-10 text-slate-400" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Access Denied</h2>
              <p className="mt-2 text-sm text-slate-600">
                You need MCC Manager or Admin access.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-[#0099f2]/5">
      <div className="relative">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-180px] right-[-120px] h-[420px] w-[420px] rounded-full bg-gradient-to-br from-[#0099f2]/20 via-indigo-400/10 to-purple-400/10 blur-3xl" />
          <div className="absolute bottom-[-160px] left-[-160px] h-[380px] w-[380px] rounded-full bg-gradient-to-tr from-emerald-400/15 via-sky-400/10 to-[#0099f2]/10 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
          <header className="mb-8">
            <div className="inline-flex items-center gap-2.5 rounded-full bg-white/90 px-4 py-2 shadow-sm ring-1 ring-slate-200/80 mb-4">
              <Settings2 className="h-4 w-4 text-[#0099f2]" />
              <span className="text-xs font-semibold uppercase tracking-wide text-[#0099f2]">
                HarvestPlus • Operations
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Periods, processing & payments
            </h1>
            <p className="mt-2 max-w-2xl text-slate-600 sm:text-base">
              Choose an area to manage MCC periods, dairy or crop processing, crop types, or dairy payments.
            </p>
          </header>

          <Card className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold text-slate-900">
                What do you want to manage?
              </CardTitle>
              <CardDescription className="text-slate-600">
                Select an option to open the corresponding screen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {OPERATIONS.map((opt) => {
                  const Icon = opt.icon
                  return (
                    <Link
                      key={opt.id}
                      href={`${base}/${opt.href}`}
                      className={cn(
                        "group relative flex flex-col items-start gap-4 rounded-2xl border-2 p-6 text-left transition-all duration-200",
                        "hover:shadow-lg hover:-translate-y-0.5 border-slate-200/80 bg-white hover:border-[#0099f2]/40",
                        opt.borderColor
                      )}
                    >
                      <div
                        className={cn(
                          "flex h-14 w-14 items-center justify-center rounded-xl transition-colors",
                          cn(opt.iconBg, opt.iconColor),
                          "group-hover:bg-[#0099f2]/15 group-hover:text-[#0099f2]"
                        )}
                      >
                        <Icon className="h-7 w-7" />
                      </div>
                      <div className="w-full space-y-1">
                        <p className="font-semibold text-slate-900">{opt.name}</p>
                        <p className="text-sm text-slate-500">{opt.description}</p>
                      </div>
                      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[#0099f2] group-hover:gap-2 transition-all">
                        Open
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    </Link>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
