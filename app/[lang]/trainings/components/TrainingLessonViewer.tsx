"use client"

/**
 * Renders a single lesson: video, pdf, text, or image.
 * Supports "Mark as complete" when authenticated; progress is saved via API.
 */
import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Loader2 } from "lucide-react"

type Lesson = {
  id: string
  title: string
  description: string | null
  contentType: string
  contentUrl: string | null
  orderIndex: number
  durationMinutes: number
}

export function TrainingLessonViewer({
  lesson,
  moduleId,
  lang,
  isAuthenticated,
  isCompleted,
  onComplete,
}: {
  lesson: Lesson
  moduleId: string
  lang: string
  isAuthenticated: boolean
  isCompleted: boolean
  onComplete: () => void
}) {
  const [marking, setMarking] = useState(false)

  const handleMarkComplete = async () => {
    if (!isAuthenticated || isCompleted) return
    setMarking(true)
    const token = localStorage.getItem("Gemurai_token")
    if (!token) {
      setMarking(false)
      return
    }
    try {
      const res = await fetch("/api/trainings/progress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ moduleId, lessonId: lesson.id }),
      })
      const json = await res.json()
      if (json.success) onComplete()
    } finally {
      setMarking(false)
    }
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <h2 className="text-lg font-semibold text-slate-900">{lesson.title}</h2>
        {lesson.description && (
          <p className="text-sm text-slate-600">{lesson.description}</p>
        )}
        <div className="flex flex-wrap gap-2 text-xs text-slate-500">
          <span>{lesson.contentType}</span>
          {lesson.durationMinutes > 0 && (
            <span>{lesson.durationMinutes} min</span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Content by type – external URL; optimized for low bandwidth (lazy/optional) */}
        {lesson.contentUrl && (
          <div className="min-h-[200px] overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
            {lesson.contentType === "video" && (
              <video
                key={lesson.id}
                src={lesson.contentUrl}
                controls
                className="w-full"
                preload="metadata"
                playsInline
              />
            )}
            {lesson.contentType === "pdf" && (
              <iframe
                key={lesson.id}
                src={lesson.contentUrl}
                title={lesson.title}
                className="h-[60vh] w-full"
              />
            )}
            {lesson.contentType === "image" && (
              <img
                key={lesson.id}
                src={lesson.contentUrl}
                alt={lesson.title}
                className="max-h-[60vh] w-full object-contain"
                loading="lazy"
              />
            )}
            {lesson.contentType === "text" && (
              <iframe
                key={lesson.id}
                src={lesson.contentUrl}
                title={lesson.title}
                className="h-[60vh] w-full border-0"
              />
            )}
          </div>
        )}
        {!lesson.contentUrl && (
          <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/50 py-12 text-center text-sm text-slate-500">
            No content URL. Contact your administrator to add content.
          </div>
        )}

        {isAuthenticated && (
          <div className="flex items-center gap-2">
            {isCompleted ? (
              <span className="flex items-center gap-2 text-sm text-emerald-600">
                <CheckCircle className="h-4 w-4" />
                Completed
              </span>
            ) : (
              <Button
                size="sm"
                onClick={handleMarkComplete}
                disabled={marking}
              >
                {marking ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="mr-2 h-4 w-4" />
                )}
                Mark as complete
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
