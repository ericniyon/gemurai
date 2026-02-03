"use client"

import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { LucideIcon } from "lucide-react"

interface SettingsPageHeaderProps {
  title: string
  description: string
  icon: LucideIcon
  lang: string
}

export function SettingsPageHeader({ title, description, icon: Icon, lang }: SettingsPageHeaderProps) {
  return (
    <div className="mb-8">
      <Link
        href={`/${lang}/dashboard/settings`}
        className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 mb-4 transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Settings
      </Link>
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-xl bg-slate-900 text-white">
          <Icon className="h-7 w-7" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h1>
          <p className="text-slate-600 text-sm mt-0.5">{description}</p>
        </div>
      </div>
    </div>
  )
}
