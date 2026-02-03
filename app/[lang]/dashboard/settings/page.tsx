"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/hooks/use-auth"
import { useParams } from "next/navigation"
import Link from "next/link"
import {
  Settings,
  UserPlus,
  Users,
  Database,
  Bell,
  Shield,
  FileText,
  Globe,
  Cog,
  ChevronRight,
} from "lucide-react"

const settingsSections = [
  {
    title: "General Settings",
    description: "Platform name, localization, timezone, and registration",
    href: "general",
    icon: Globe,
    iconBg: "bg-sky-500/10 text-sky-600",
  },
  {
    title: "User Management",
    description: "Manage users, roles, and permissions",
    href: "user-management",
    icon: Users,
    iconBg: "bg-emerald-500/10 text-emerald-600",
  },
  {
    title: "Roles and Permission",
    description: "Manage roles and assign permissions",
    href: "roles",
    icon: Shield,
    iconBg: "bg-indigo-500/10 text-indigo-600",
  },
  {
    title: "System Configuration",
    description: "Backup, caching, rate limiting, and infrastructure",
    href: "system",
    icon: Cog,
    iconBg: "bg-violet-500/10 text-violet-600",
  },
  {
    title: "Notifications",
    description: "Email, SMS, and in-app notification preferences",
    href: "notifications",
    icon: Bell,
    iconBg: "bg-amber-500/10 text-amber-600",
  },
  {
    title: "Security",
    description: "Password policy, 2FA, API security, and data protection",
    href: "security",
    icon: Shield,
    iconBg: "bg-rose-500/10 text-rose-600",
  },
  {
    title: "Audit Logs",
    description: "View system activity and security audit trail",
    href: "audit",
    icon: FileText,
    iconBg: "bg-slate-500/10 text-slate-600",
  },
]

const onboardingSections = [
  {
    title: "Onboard Smallholder Farmer",
    description: "Register a new smallholder farmer",
    href: "onboarding/farmers",
    icon: Users,
    iconBg: "bg-emerald-500/10 text-emerald-600",
  },
  {
    title: "Onboard Agent / Abacunda",
    description: "Register a new field agent (Abacunda)",
    href: "onboarding/agents",
    icon: UserPlus,
    iconBg: "bg-violet-500/10 text-violet-600",
  },
]

const configSections = [
  {
    title: "Commodity Studio",
    description: "Categories, commodities, quality, inputs, seasons",
    href: "/dashboard/admin/commodity-studio",
    icon: Database,
    iconBg: "bg-amber-500/10 text-amber-600",
  },
]

export default function SettingsPage() {
  const { user } = useAuth()
  const params = useParams()
  const lang = (params?.lang as string) || "en"
  const baseHref = `/${lang}/dashboard/settings`

  if (!user || (user.role !== "MCC_MANAGER" && user.role !== "SUPER_ADMIN" && user.role !== "ADMIN")) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md border-slate-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-xl font-bold mb-2 text-slate-900">Access Denied</h2>
              <p className="text-slate-600">
                You need appropriate permissions to access system settings
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-slate-900 text-white">
            <Settings className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Settings</h1>
            <p className="text-slate-600 text-sm">Configure system-wide settings and manage your platform</p>
          </div>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Configuration</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {settingsSections.map((section) => {
            const Icon = section.icon
            return (
              <Link
                key={section.href}
                href={`${baseHref}/${section.href}`}
                className="group block"
              >
                <Card className="h-full border-slate-200/80 hover:border-slate-300 hover:shadow-md transition-all duration-200">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-lg ${section.iconBg}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900 group-hover:text-primary-600 transition-colors">
                            {section.title}
                          </h3>
                          <p className="text-sm text-slate-500 mt-0.5">{section.description}</p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-slate-600 shrink-0 transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Onboarding Section - ADMIN/SUPER_ADMIN only */}
      {(user.role === "ADMIN" || user.role === "SUPER_ADMIN") && (
        <div className="space-y-6">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Onboarding</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {onboardingSections.map((section) => {
              const Icon = section.icon
              return (
                <Link
                  key={section.href}
                  href={`${baseHref}/${section.href}`}
                  className="group block"
                >
                  <Card className="h-full border-slate-200/80 hover:border-slate-300 hover:shadow-md transition-all duration-200">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2.5 rounded-lg ${section.iconBg}`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-900 group-hover:text-primary-600 transition-colors">
                              {section.title}
                            </h3>
                            <p className="text-sm text-slate-500 mt-0.5">{section.description}</p>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-slate-600 shrink-0 transition-colors" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* Quick Links - ADMIN/SUPER_ADMIN only */}
      {(user.role === "ADMIN" || user.role === "SUPER_ADMIN") && (
        <div className="space-y-6">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Quick Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {configSections.map((section) => {
              const Icon = section.icon
              const isExternal = section.href.startsWith("/")
              const fullHref = isExternal ? `/${lang}${section.href}` : `${baseHref}/${section.href}`
              return (
                <Link
                  key={section.href}
                  href={fullHref}
                  className="group block"
                >
                  <Card className="h-full border-slate-200/80 hover:border-slate-300 hover:shadow-md transition-all duration-200">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2.5 rounded-lg ${section.iconBg}`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-900 group-hover:text-primary-600 transition-colors">
                              {section.title}
                            </h3>
                            <p className="text-sm text-slate-500 mt-0.5">{section.description}</p>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-slate-600 shrink-0 transition-colors" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
