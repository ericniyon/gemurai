"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Star, Eye, Calendar, User, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface InterviewScores {
  id: string
  applicationId: string
  totalScore: number
  totalPossibleScore: number
  overallScore: string
  scores: Record<string, number>
  subScores?: Record<string, Record<string, number>>
  sections: Array<{
    category: string
    totalPoints: number
    scoredPoints: number
    questions: Array<{
      id: string
      text: string
      points: number
      scored: number
    }>
  }>
  submittedAt: string
  createdAt: string
  updatedAt: string
}

interface InterviewScoresViewProps {
  applicationId: string
  applicantName?: string
}

export default function InterviewScoresView({ applicationId, applicantName }: InterviewScoresViewProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [scores, setScores] = useState<InterviewScores | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (applicationId) {
      fetchScores()
    }
  }, [applicationId])

  const fetchScores = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/interview-scores?applicationId=${applicationId}`, {
        credentials: "include",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to fetch scores")
      }

      const data = await response.json()
      
      if (data.data) {
        setScores(data.data)
      } else {
        setError("No interview scores found for this application")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch interview scores"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getScoreLevel = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100
    if (percentage >= 80) return { text: "Excellent", color: "text-green-600 bg-green-100 border-green-200" }
    if (percentage >= 60) return { text: "Good", color: "text-blue-600 bg-blue-100 border-blue-200" }
    if (percentage >= 40) return { text: "Fair", color: "text-yellow-600 bg-yellow-100 border-yellow-200" }
    return { text: "Poor", color: "text-red-600 bg-red-100 border-red-200" }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Loading interview scores...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Scores Available</h3>
              <p className="text-gray-500 mb-4">{error}</p>
              <Button onClick={fetchScores} variant="outline">
                Try Again
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!scores) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Interview Scores</h3>
              <p className="text-gray-500">No interview scores have been submitted for this application yet.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Star className="h-5 w-5" />
            Interview Scores Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <h4 className="font-medium mb-2 text-blue-700">Applicant</h4>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-blue-600" />
                <span className="font-medium">{applicantName || "Unknown"}</span>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2 text-blue-700">Submitted Date</h4>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span>{formatDate(scores.submittedAt)}</span>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2 text-blue-700">Overall Score</h4>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                <span className="text-2xl font-bold text-blue-600">
                  {scores.overallScore}
                </span>
              </div>
              <div className="mt-1">
                <Badge className="bg-green-100 text-green-700 border-green-200">
                  {scores.totalScore.toFixed(1)}/{scores.totalPossibleScore} points
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Scores by Section */}
      {scores.sections && scores.sections.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Detailed Scores by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {scores.sections.map((section, index) => {
                const sectionScoreLevel = getScoreLevel(section.scoredPoints, section.totalPoints)
                const percentage = (section.scoredPoints / section.totalPoints) * 100

                return (
                  <div key={index} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex-1">
                        <h4 className="font-medium text-lg">{section.category}</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {section.questions.length} questions
                        </p>
                      </div>
                      <div className="flex items-center gap-3 ml-4">
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            <Star className="h-5 w-5 text-yellow-500" />
                            <span className="text-2xl font-bold text-blue-600">
                              {section.scoredPoints.toFixed(1)}/{section.totalPoints}
                            </span>
                          </div>
                          <Badge className={`${sectionScoreLevel.color} border mt-1`}>
                            {sectionScoreLevel.text} ({percentage.toFixed(0)}%)
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Individual Questions */}
                    <div className="space-y-2">
                      {section.questions.map((question) => {
                        const questionScoreLevel = getScoreLevel(question.scored, question.points)
                        const questionPercentage = (question.scored / question.points) * 100

                        return (
                          <div key={question.id} className="bg-gray-50 p-3 rounded border-l-4 border-blue-200">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-800">{question.text}</p>
                              </div>
                              <div className="flex items-center gap-2 ml-3">
                                <span className="text-sm font-semibold">
                                  {question.scored.toFixed(1)}/{question.points}
                                </span>
                                <Badge className={`${questionScoreLevel.color} border text-xs`}>
                                  {questionPercentage.toFixed(0)}%
                                </Badge>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Raw Scores Data */}
      {scores.scores && Object.keys(scores.scores).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-600" />
              Raw Scores Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
              {Object.entries(scores.scores).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span className="font-medium text-gray-700">{key}</span>
                  <Badge variant="outline" className="font-semibold">
                    {value}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 