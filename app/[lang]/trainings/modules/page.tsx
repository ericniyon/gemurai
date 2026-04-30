"use client"

/**
 * Training Module List – all active modules (optionally filtered).
 * Lightweight list for mobile; supports role/commodity filtering via API.
 */
import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ChevronRight } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

type Module = {
  id: string
  title: string
  description: string | null
  durationMinutes: number
  difficultyLevel: string
  targetRole: string
  commodity?: { name: string; code: string } | null
  _count: { lessons: number }
}

export default function TrainingModuleListPage() {
  const params = useParams()
  const lang = (params?.lang as string) || "en"
  const { isAuthenticated } = useAuth()
  const [modules, setModules] = useState<Module[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("Gemurai_token") : null
    const headers: HeadersInit = token && isAuthenticated ? { Authorization: `Bearer ${token}` } : {}
    fetch("/api/trainings/modules", { headers })
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setModules(json.data)
      })
      .finally(() => setLoading(false))
  }, [isAuthenticated])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Training Modules</h1>
        <p className="mt-1 text-slate-600">
          Browse all available training. Progress is saved when you are signed in.
        </p>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-36" />
          ))}
        </div>
      ) : modules.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-slate-600">
            No modules available yet.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((m) => (
            <Link key={m.id} href={`/${lang}/trainings/modules/${m.id}`}>
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base font-medium line-clamp-2">
                      {m.title}
                    </CardTitle>
                    <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
                  </div>
                  {m.commodity?.name && (
                    <p className="text-xs text-slate-500">{m.commodity.name}</p>
                  )}
                </CardHeader>
                <CardContent>
                  {m.description && (
                    <p className="text-sm text-slate-600 line-clamp-2">{m.description}</p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
                    <span>{m.durationMinutes} min</span>
                    <span>·</span>
                    <span>{m.difficultyLevel}</span>
                    <span>·</span>
                    <span>{m._count.lessons} lessons</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
