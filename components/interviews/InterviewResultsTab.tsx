"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, User, Calendar, CheckCircle, BarChart3, Users, AlertCircle, Clock } from "lucide-react"

interface InterviewScore {
  id: string
  applicationId: string
  totalScore: number
  totalPossibleScore: number
  scores: Record<string, number | string>
  subScores?: Record<string, Record<string, number>>
  comments?: Record<string, string>
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
  overallScore: string
  submittedBy: string
  interviewer?: {
    id: string
    name: string
    email: string
  }
}

interface InterviewResultsTabProps {
  applicationId: string
}

export function InterviewResultsTab({ applicationId }: InterviewResultsTabProps) {
  const [interviewScores, setInterviewScores] = useState<InterviewScore[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    console.log('🔄 InterviewResultsTab: Loading interview scores for applicationId:', applicationId)
    loadInterviewScores()
  }, [applicationId])

  const loadInterviewScores = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch all interview scores for this application
      const response = await fetch(`/api/interview-scores/all?applicationId=${applicationId}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      if (result.success) {
        setInterviewScores(result.scores || [])
        console.log('✅ InterviewResultsTab: Successfully loaded', result.scores?.length || 0, 'interview scores')
      } else {
        setInterviewScores([])
        console.log('⚠️ InterviewResultsTab: No scores found or error in response')
      }
    } catch (err) {
      console.error('Error fetching interview scores:', err)
      setError("Failed to load interview scores")
      setInterviewScores([])
    } finally {
      setLoading(false)
    }
  }

  const getScoreLevel = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100
    if (percentage >= 80) return { text: "Excellent", color: "text-green-600 bg-green-100 border-green-200" }
    if (percentage >= 70) return { text: "Good", color: "text-blue-600 bg-blue-100 border-blue-200" }
    if (percentage >= 50) return { text: "Fair", color: "text-yellow-600 bg-yellow-100 border-yellow-200" }
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
      <Card className="border-0 bg-white">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">Loading Interview Results...</h3>
              <p className="text-gray-500">Please wait while we fetch the interview data.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-0 bg-white">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="h-10 w-10 text-red-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">Error Loading Results</h3>
              <p className="text-gray-500">{error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (interviewScores.length === 0) {
    return (
      <Card className="border-0 bg-white">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">No Interview Results</h3>
              <p className="text-gray-500 max-w-md mx-auto">No interview scores have been submitted for this application yet.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card className="border-0 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-t-lg">
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <BarChart3 className="h-5 w-5" />
            Interview Results Summary - {interviewScores.length} Interviewer{interviewScores.length > 1 ? 's' : ''}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {interviewScores.map((score, index) => (
              <div key={score.id} className="bg-white p-4 rounded-lg border border-blue-200 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <User className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-sm">
                    {score.interviewer?.name || `Interviewer ${index + 1}`}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-lg font-bold text-blue-600">
                    {score.totalScore.toFixed(1)}/{score.totalPossibleScore}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-3 w-3 text-gray-500" />
                  <span className="text-xs text-gray-600">
                    {formatDate(score.submittedAt)}
                  </span>
                </div>
                <Badge className={`${getScoreLevel(score.totalScore, score.totalPossibleScore).color} border text-xs`}>
                  {getScoreLevel(score.totalScore, score.totalPossibleScore).text}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Comparative Analysis */}
      {interviewScores.length > 1 && (
        <Card className="border-0 bg-white">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-purple-800">
              <Users className="h-5 w-5" />
              Comparative Analysis - {interviewScores.length} Interviewers
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left p-4 font-semibold text-gray-800">Category</th>
                    {interviewScores.map((score, index) => (
                      <th key={score.id} className="text-center p-4 font-semibold text-gray-800">
                        {score.interviewer?.name || `Interviewer ${index + 1}`}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {interviewScores[0]?.sections.map((section) => (
                    <tr key={section.category} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <div>
                          <div className="font-semibold text-gray-800">{section.category}</div>
                          <div className="text-sm text-gray-600 mt-1">
                            {section.questions.length} questions
                          </div>
                        </div>
                      </td>
                      {interviewScores.map((score) => {
                        const matchingSection = score.sections.find(s => s.category === section.category)
                        const sectionScore = matchingSection?.scoredPoints || 0
                        const sectionTotal = matchingSection?.totalPoints || 1
                        const scoreLevel = getScoreLevel(sectionScore, sectionTotal)
                        
                        return (
                          <td key={score.id} className="text-center p-4">
                            <div className="space-y-2">
                              <div className="flex items-center justify-center gap-2">
                                <Star className="h-5 w-5 text-yellow-500" />
                                <span className="font-bold text-2xl text-gray-800">
                                  {sectionScore.toFixed(1)}
                                </span>
                              </div>
                              <div className="text-sm text-gray-600">
                                / {sectionTotal} points
                              </div>
                              <Badge className={`${scoreLevel.color} border text-xs font-medium px-2 py-1`}>
                                {scoreLevel.text}
                              </Badge>
                            </div>
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Individual Interview Details */}
      {interviewScores.map((score, index) => (
        <Card key={score.id} className="border-0 bg-white">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-t-lg">
            <CardTitle className="flex items-center justify-between text-orange-800">
              <span className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Interview #{index + 1} - {score.interviewer?.name || `Interviewer ${index + 1}`}
              </span>
              <Badge className="bg-green-100 text-green-800 border-green-200 font-medium">
                Completed
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              {/* Interview Summary */}
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-800">
                    <BarChart3 className="h-5 w-5" />
                    Interview Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <h4 className="font-medium mb-2 text-blue-700">Interviewer</h4>
                      {score.interviewer ? (
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-blue-600" />
                          <span className="font-medium">{score.interviewer.name}</span>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">Interviewer information not available</p>
                      )}
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2 text-blue-700">Completion Date</h4>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-blue-600" />
                        <span>{formatDate(score.submittedAt)}</span>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2 text-blue-700">Overall Score</h4>
                      <div className="flex items-center gap-2">
                        <Star className="h-5 w-5 text-yellow-500" />
                        <span className="text-2xl font-bold text-blue-600">
                          {score.totalScore.toFixed(1)}/{score.totalPossibleScore}
                        </span>
                      </div>
                      <Badge className={`${getScoreLevel(score.totalScore, score.totalPossibleScore).color} border-0 mt-1`}>
                        {getScoreLevel(score.totalScore, score.totalPossibleScore).text}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Detailed Scores by Section */}
              {score.sections.map((section) => (
                <Card key={section.category}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      {section.category} - {section.scoredPoints.toFixed(1)}/{section.totalPoints} points
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {section.questions.map((question) => {
                        const scoreLevel = getScoreLevel(question.scored, question.points)
                        const comment = score.comments?.[question.id]
                        
                        return (
                          <div key={question.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex-1">
                                <h4 className="font-medium text-lg">{question.text}</h4>
                                <p className="text-sm text-gray-600 mt-1">
                                  {question.points} points possible
                                </p>
                              </div>
                              <div className="flex items-center gap-3 ml-4">
                                <div className="text-right">
                                  <div className="flex items-center gap-2">
                                    <Star className="h-5 w-5 text-yellow-500" />
                                    <span className="text-2xl font-bold text-blue-600">
                                      {question.scored.toFixed(1)}/{question.points}
                                    </span>
                                  </div>
                                  <Badge className={`${scoreLevel.color} border-0 mt-1`}>
                                    {scoreLevel.text}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            {comment && (
                              <div className="bg-gray-50 p-3 rounded border-l-4 border-blue-200">
                                <p className="text-sm font-medium mb-1 text-gray-700">Comments:</p>
                                <p className="text-sm text-gray-600">{comment}</p>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* General Comments */}
              {score.scores['cement-comments'] && (
                <Card>
                  <CardHeader>
                    <CardTitle>General Comments</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed">
                      {typeof score.scores['cement-comments'] === 'string' 
                        ? score.scores['cement-comments'] 
                        : 'Comments available'
                      }
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
} 