"use client"

/**
 * Training Module Details + Lesson list and Lesson Viewer.
 * One page: list lessons on the left/side, selected lesson content on the right (or below on mobile).
 */
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { CheckCircle, Circle, FileText, Image, Video } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { TrainingLessonViewer } from "../../components/TrainingLessonViewer"

type Lesson = {
  id: string
  title: string
  description: string | null
  contentType: string
  contentUrl: string | null
  orderIndex: number
  durationMinutes: number
}

type Module = {
  id: string
  title: string
  description: string | null
  durationMinutes: number
  difficultyLevel: string
  targetRole: string
  commodity?: { name: string } | null
  lessons: Lesson[]
  _count: { lessons: number }
}

const contentTypeIcon: Record<string, React.ComponentType<{ className?: string }>> = {
  video: Video,
  pdf: FileText,
  text: FileText,
  image: Image,
}

export default function TrainingModuleDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const lang = (params?.lang as string) || "en"
  const moduleId = params?.moduleId as string
  const { isAuthenticated } = useAuth()
  const [module_, setModule] = useState<Module | null>(null)
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set())
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!moduleId) return
    const token = typeof window !== "undefined" ? localStorage.getItem("Gemurai_token") : null
    const headers: HeadersInit = token && isAuthenticated ? { Authorization: `Bearer ${token}` } : {}
    const q = new URLSearchParams()
    if (!isAuthenticated) q.set("publicOnly", "true")

    fetch(`/api/trainings/modules/${moduleId}?${q}`, { headers })
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setModule(json.data)
          const first = json.data.lessons?.[0]
          if (first) setSelectedLessonId(first.id)
        }
      })
      .finally(() => setLoading(false))
  }, [moduleId, isAuthenticated])

  useEffect(() => {
    if (!moduleId || !isAuthenticated) return
    const token = localStorage.getItem("Gemurai_token")
    if (!token) return
    fetch(`/api/trainings/progress?moduleId=${moduleId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data?.completedLessonIds) {
          setCompletedIds(new Set(json.data.completedLessonIds))
        }
      })
  }, [moduleId, isAuthenticated])

  const progressPercent =
    module_ && module_.lessons.length > 0
      ? Math.round((completedIds.size / module_.lessons.length) * 100)
      : 0

  const handleLessonComplete = (lessonId: string) => {
    setCompletedIds((prev) => new Set(prev).add(lessonId))
  }

  if (loading || !module_) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  const selectedLesson = module_.lessons.find((l) => l.id === selectedLessonId)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href={`/${lang}/trainings/modules`}
            className="text-sm text-slate-500 hover:text-slate-700"
          >
            ← Modules
          </Link>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">{module_.title}</h1>
          {module_.commodity?.name && (
            <p className="text-sm text-slate-500">{module_.commodity.name}</p>
          )}
        </div>
      </div>

      {module_.lessons.length > 0 && isAuthenticated && (
        <div className="flex items-center gap-4">
          <Progress value={progressPercent} className="h-2 flex-1 max-w-xs" />
          <span className="text-sm text-slate-600">
            {completedIds.size} / {module_.lessons.length} lessons
          </span>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <Card className="h-fit lg:sticky lg:top-20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Lessons</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {module_.lessons.map((lesson) => {
              const Icon = contentTypeIcon[lesson.contentType] || FileText
              const done = completedIds.has(lesson.id)
              const selected = selectedLessonId === lesson.id
              return (
                <button
                  key={lesson.id}
                  type="button"
                  onClick={() => setSelectedLessonId(lesson.id)}
                  className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    selected
                      ? "bg-emerald-100 text-emerald-900"
                      : "hover:bg-slate-100 text-slate-700"
                  }`}
                >
                  {done ? (
                    <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600" />
                  ) : (
                    <Circle className="h-4 w-4 shrink-0 text-slate-400" />
                  )}
                  <Icon className="h-4 w-4 shrink-0 text-slate-500" />
                  <span className="truncate">{lesson.title}</span>
                  {lesson.durationMinutes > 0 && (
                    <span className="ml-auto shrink-0 text-xs text-slate-400">
                      {lesson.durationMinutes}m
                    </span>
                  )}
                </button>
              )
            })}
          </CardContent>
        </Card>

        <div className="min-w-0">
          {selectedLesson ? (
            <TrainingLessonViewer
              lesson={selectedLesson}
              moduleId={module_.id}
              lang={lang}
              isAuthenticated={isAuthenticated}
              isCompleted={completedIds.has(selectedLesson.id)}
              onComplete={() => handleLessonComplete(selectedLesson.id)}
            />
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-slate-500">
                Select a lesson from the list.
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
