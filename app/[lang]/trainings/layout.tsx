"use client"

/**
 * Standalone Training Portal layout.
 * Lightweight; optimized for mobile and low bandwidth.
 */
import type { ReactNode } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { BookOpen, LayoutDashboard, Library, Award, Layers } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { cn } from "@/lib/utils"

const navLinks = (lang: string, isAuthenticated: boolean) => [
  { href: `/${lang}/trainings/library`, label: "Library", icon: Library },
  ...(isAuthenticated
    ? [
        { href: `/${lang}/trainings/modules`, label: "All modules", icon: Layers },
        { href: `/${lang}/trainings/certifications`, label: "Certifications", icon: Award },
      ]
    : []),
]

export default function TrainingsLayout({ children }: { children: ReactNode }) {
  const params = useParams()
  const lang = (params?.lang as string) || "en"
  const { isAuthenticated } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50/80">
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur-md shadow-sm">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link
            href={`/${lang}/trainings`}
            className="flex items-center gap-3 rounded-lg transition-opacity hover:opacity-90"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-sm">
              <BookOpen className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <span className="block font-semibold tracking-tight text-slate-900">
                HarvestPlus
              </span>
              <span className="block text-xs font-medium text-slate-500">Training</span>
            </div>
          </Link>

          <nav className="flex items-center gap-1">
            {navLinks(lang, !!isAuthenticated).map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                >
                  <item.icon className="mr-1.5 h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            ))}
            {isAuthenticated && (
              <Link href={`/${lang}/dashboard`} className="ml-2">
                <Button variant="outline" size="sm" className="border-slate-200">
                  <LayoutDashboard className="mr-1.5 h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">{children}</main>
    </div>
  )
}
