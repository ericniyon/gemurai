"use client"

/**
 * Training Dashboard: hero, Continue Learning, Recommended, Completed.
 * Redesigned for clarity and visual hierarchy.
 */
import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import {
  BookOpen,
  ChevronRight,
  Award,
  PlayCircle,
  Sparkles,
  Clock,
  GraduationCap,
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { cn } from "@/lib/utils"

type Module = {
  id: string
  title: string
  description: string | null
  durationMinutes: number
  difficultyLevel: string
  targetRole: string
  commodity?: { name: string } | null
  _count?: { lessons: number }
  progressPercent?: number
  totalLessons?: number
  completedLessons?: number
}

type DashboardData = {
  recommended: Module[]
  inProgress: (Module & { progressPercent: number; completedLessons: number; totalLessons: number })[]
  completed: Module[]
}

const difficultyColors: Record<string, string> = {
  Beginner: "bg-emerald-100 text-emerald-800 border-emerald-200",
  Intermediate: "bg-amber-100 text-amber-800 border-amber-200",
  Advanced: "bg-rose-100 text-rose-800 border-rose-200",
}

function ModuleCard({
  module,
  lang,
  variant,
}: {
  module: Module
  lang: string
  variant: "recommended" | "continue" | "completed"
}) {
  const lessons = module._count?.lessons ?? module.totalLessons ?? 0
  const progress = "progressPercent" in module ? module.progressPercent : undefined
  const difficultyClass = difficultyColors[module.difficultyLevel] ?? "bg-slate-100 text-slate-700 border-slate-200"

  return (
    <Link href={`/${lang}/trainings/modules/${module.id}`} className="block group">
      <Card className="h-full overflow-hidden border-slate-200/80 bg-white transition-all duration-200 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
        <div className="border-l-4 border-l-primary/0 group-hover:border-l-primary bg-slate-50/50 group-hover:bg-slate-50/80 transition-colors">
          <CardHeader className="pb-2 pt-5">
            <div className="flex items-start justify-between gap-3">
              <CardTitle className="text-base font-semibold leading-snug text-slate-900 line-clamp-2 group-hover:text-primary transition-colors">
                {module.title}
              </CardTitle>
              <ChevronRight className="h-5 w-5 shrink-0 text-slate-300 group-hover:text-primary transition-colors" />
            </div>
            {module.description && (
              <p className="mt-1.5 text-sm text-slate-600 line-clamp-2">{module.description}</p>
            )}
          </CardHeader>
          <CardContent className="space-y-3 pb-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className={cn("text-xs font-medium border", difficultyClass)}>
                {module.difficultyLevel}
              </Badge>
              <span className="flex items-center gap-1 text-xs text-slate-500">
                <Clock className="h-3.5 w-3.5" />
                {module.durationMinutes} min
              </span>
              {lessons > 0 && (
                <span className="text-xs text-slate-500">{lessons} lessons</span>
              )}
            </div>
            {variant === "continue" && progress !== undefined && (
              <div className="space-y-1.5">
                <Progress value={progress} className="h-2" />
                <p className="text-xs font-medium text-slate-600">
                  {module.completedLessons ?? 0} / {module.totalLessons ?? 0} completed
                </p>
              </div>
            )}
            {variant === "completed" && (
              <div className="flex items-center gap-2 text-sm font-medium text-emerald-700">
                <Award className="h-4 w-4" />
                Completed
              </div>
            )}
          </CardContent>
        </div>
      </Card>
    </Link>
  )
}

export default function TrainingsDashboardPage() {
  const params = useParams()
  const lang = (params?.lang as string) || "en"
  const { isAuthenticated } = useAuth()
  const [data, setData] = useState<DashboardData | null>(null)
  const [allModules, setAllModules] = useState<Module[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isAuthenticated) {
      const token = typeof window !== "undefined" ? localStorage.getItem("Gemurai_token") : null
      if (token) {
        fetch("/api/trainings/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((res) => res.json())
          .then((json) => {
            if (json.success) setData(json.data)
            else setError(json.error || "Failed to load")
          })
          .catch(() => setError("Failed to load"))
          .finally(() => setLoading(false))
        return
      }
    }
    fetch("/api/trainings/modules")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setAllModules(json.data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [isAuthenticated])

  if (loading) {
    return (
      <div className="space-y-10">
        <div className="space-y-3">
          <Skeleton className="h-10 w-72" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-44 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-destructive/30 bg-destructive/5">
        <CardContent className="py-8 text-center">
          <p className="font-medium text-destructive">{error}</p>
          <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
            Try again
          </Button>
        </CardContent>
      </Card>
    )
  }

  const modulesForGuest = allModules.slice(0, 6)
  const hasAnyContent =
    (isAuthenticated && data && (data.inProgress?.length > 0 || data.recommended?.length > 0 || data.completed?.length > 0)) ||
    (!isAuthenticated && allModules.length > 0)

  return (
    <div className="space-y-12">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-primary/10 via-white to-primary/5 px-6 py-10 sm:px-10 sm:py-12">
        <div className="relative">
          <div className="flex items-center gap-2 text-primary">
            <Sparkles className="h-5 w-5" />
            <span className="text-sm font-semibold uppercase tracking-wider">Learning portal</span>
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Learn how the system works
          </h1>
          <p className="mt-2 max-w-xl text-lg text-slate-600">
            Training on HarvestPlus: collections, payments, farm-level data, and platform procedures. Start a module and track your progress.
          </p>
          {!isAuthenticated && (
            <p className="mt-3 text-sm text-slate-500">
              Sign in to save progress and earn certifications.
            </p>
          )}
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={`/${lang}/trainings/modules`}>
              <Button size="lg" className="shadow-sm">
                <BookOpen className="mr-2 h-4 w-4" />
                Browse modules
              </Button>
            </Link>
            <Link href={`/${lang}/trainings/library`}>
              <Button size="lg" variant="outline" className="border-slate-200">
                <GraduationCap className="mr-2 h-4 w-4" />
                Library
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Continue Learning (authenticated) */}
      {isAuthenticated && data?.inProgress && data.inProgress.length > 0 && (
        <section>
          <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-slate-900">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <PlayCircle className="h-4 w-4 text-primary" />
            </span>
            Continue learning
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {data.inProgress.map((m) => (
              <ModuleCard key={m.id} module={m} lang={lang} variant="continue" />
            ))}
          </div>
        </section>
      )}

      {/* Recommended / Browse */}
      <section>
        <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-slate-900">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <BookOpen className="h-4 w-4 text-primary" />
          </span>
          {isAuthenticated ? "Recommended for you" : "Browse training"}
        </h2>
        {isAuthenticated && data?.recommended?.length === 0 && data?.inProgress?.length === 0 && (
          <p className="mb-4 text-sm text-slate-500">
            No new recommendations. Browse all modules below.
          </p>
        )}
        {(isAuthenticated ? (data?.recommended?.length ?? 0) > 0 : modulesForGuest.length > 0) ? (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {(isAuthenticated ? data!.recommended : modulesForGuest).map((m) => (
                <ModuleCard key={m.id} module={m} lang={lang} variant="recommended" />
              ))}
            </div>
            <div className="mt-5">
              <Link href={`/${lang}/trainings/modules`}>
                <Button variant="outline" size="sm" className="border-slate-200">
                  View all modules
                </Button>
              </Link>
            </div>
          </>
        ) : (
          <>
            {hasAnyContent ? null : (
              <p className="text-sm text-slate-500">No modules available yet. Check the library.</p>
            )}
            <div className="mt-4">
              <Link href={`/${lang}/trainings/modules`}>
                <Button variant="outline" size="sm" className="border-slate-200">
                  View all modules
                </Button>
              </Link>
            </div>
          </>
        )}
      </section>

      {/* Completed (authenticated) */}
      {isAuthenticated && data?.completed && data.completed.length > 0 && (
        <section>
          <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-slate-900">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100">
              <Award className="h-4 w-4 text-amber-700" />
            </span>
            Completed
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {data.completed.map((m) => (
              <ModuleCard key={m.id} module={m} lang={lang} variant="completed" />
            ))}
          </div>
        </section>
      )}

      {/* Empty state: authenticated, no data */}
      {isAuthenticated && data && !data.recommended?.length && !data.inProgress?.length && !data.completed?.length && (
        <Card className="border-slate-200/80 bg-slate-50/50">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <BookOpen className="h-7 w-7 text-primary" />
            </div>
            <p className="mt-4 font-medium text-slate-700">No training started yet</p>
            <p className="mt-1 text-sm text-slate-500">Browse modules or the library to get started.</p>
            <div className="mt-6 flex gap-3">
              <Link href={`/${lang}/trainings/library`}>
                <Button variant="outline">Library</Button>
              </Link>
              <Link href={`/${lang}/trainings/modules`}>
                <Button>All modules</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty state: guest, no modules */}
      {!isAuthenticated && !loading && allModules.length === 0 && !error && (
        <Card className="border-slate-200/80 bg-slate-50/50">
          <CardContent className="py-12 text-center">
            <p className="text-slate-600">No modules available yet.</p>
            <Link href={`/${lang}/trainings/library`}>
              <Button variant="outline" className="mt-4">Library</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
