"use client"

/**
 * Public Learning Mode – browse and view public training modules without signing in.
 * Progress tracking only works when logged in.
 */
import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Library, ChevronRight } from "lucide-react"

type Module = {
  id: string
  title: string
  description: string | null
  durationMinutes: number
  difficultyLevel: string
  targetRole: string
  commodity?: { name: string } | null
  _count: { lessons: number }
}

export default function TrainingLibraryPage() {
  const params = useParams()
  const lang = (params?.lang as string) || "en"
  const [modules, setModules] = useState<Module[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/trainings/modules?publicOnly=true")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setModules(json.data)
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
          <Library className="h-7 w-7 text-emerald-600" />
          Training Library
        </h1>
        <p className="mt-1 text-slate-600">
          Public training content. Sign in to track progress and earn certifications.
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
            No public modules available yet.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((m) => (
            <Link key={m.id} href={`/${lang}/trainings/modules/${m.id}?public=1`}>
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
