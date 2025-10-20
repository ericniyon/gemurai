"use client"

import { Star, User, Calendar, CheckCircle, BarChart3, Users } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface InterviewScore {
  id: string
  score: number
  comments: string
  criteria: {
    id: string
    name: string
    description: string
    maxScore: number
  }
}

interface Interview {
  id: string
  status: string
  overallScore: number | null
  overallComment: string | null
  interviewNotes: string | null
  completedAt: string | null
  interviewer?: {
    id: string
    name: string
    email: string
  } | null
  scores: InterviewScore[]
}

interface InterviewResultsProps {
  interview: Interview
}

interface ComparativeResultsProps {
  interviews: Interview[]
  criteria: Array<{
    id: string
    name: string
    description: string
    maxScore: number
  }>
}

export function InterviewResults({ interview }: InterviewResultsProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return 'bg-blue-100 text-blue-800'
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800'
      case 'COMPLETED': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getScoreLevel = (score: number) => {
    if (score >= 8) return { text: "Excellent", color: "text-green-600 bg-green-100" }
    if (score >= 6) return { text: "Good", color: "text-blue-600 bg-blue-100" }
    if (score >= 4) return { text: "Fair", color: "text-yellow-600 bg-yellow-100" }
    return { text: "Poor", color: "text-red-600 bg-red-100" }
  }

  const calculateAverageScore = () => {
    if (!interview.scores || interview.scores.length === 0) return 0
    const total = interview.scores.reduce((sum, score) => sum + score.score, 0)
    return Math.round((total / interview.scores.length) * 10) / 10
  }

  return (
    <div className="space-y-6">
      {/* Interview Summary Card */}
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
              {interview.interviewer ? (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">{interview.interviewer.name}</span>
                </div>
              ) : (
                <p className="text-sm text-gray-500">Interviewer information not available</p>
              )}
            </div>
            
            <div>
              <h4 className="font-medium mb-2 text-blue-700">Completion Date</h4>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span>{formatDate(interview.completedAt)}</span>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2 text-blue-700">Overall Score</h4>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                <span className="text-2xl font-bold text-blue-600">
                  {interview.overallScore || calculateAverageScore()}/10
                </span>
              </div>
              {interview.overallScore && (
                <Badge className={`${getScoreLevel(interview.overallScore).color} border-0 mt-1`}>
                  {getScoreLevel(interview.overallScore).text}
                </Badge>
              )}
            </div>
          </div>

          <div className="mt-4">
            <h4 className="font-medium mb-2 text-blue-700">Status</h4>
            <Badge className={getStatusColor(interview.status)}>
              {interview.status}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Scores Card */}
      {interview.scores && interview.scores.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Detailed Scores by {interview.interviewer?.name || 'Interviewer'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {interview.scores.map((score) => {
                const scoreLevel = getScoreLevel(score.score)
                return (
                  <div key={score.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-medium text-lg">{score.criteria.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{score.criteria.description}</p>
                      </div>
                      <div className="flex items-center gap-3 ml-4">
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            <Star className="h-5 w-5 text-yellow-500" />
                            <span className="text-2xl font-bold text-blue-600">
                              {score.score}/{score.criteria.maxScore}
                            </span>
                          </div>
                          <Badge className={`${scoreLevel.color} border-0 mt-1`}>
                            {scoreLevel.text}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    {score.comments && (
                      <div className="bg-gray-50 p-3 rounded border-l-4 border-blue-200">
                        <p className="text-sm font-medium mb-1 text-gray-700">Comments:</p>
                        <p className="text-sm text-gray-600">{score.comments}</p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overall Assessment */}
      {interview.overallComment && (
        <Card>
          <CardHeader>
            <CardTitle>Overall Assessment</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed">{interview.overallComment}</p>
          </CardContent>
        </Card>
      )}

      {/* Interview Notes */}
      {interview.interviewNotes && (
        <Card>
          <CardHeader>
            <CardTitle>Interview Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed">{interview.interviewNotes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export function ComparativeResults({ interviews, criteria }: ComparativeResultsProps) {
  const getScoreLevel = (score: number) => {
    if (score >= 8) return { text: "Excellent", color: "text-green-600 bg-green-100" }
    if (score >= 6) return { text: "Good", color: "text-blue-600 bg-blue-100" }
    if (score >= 4) return { text: "Fair", color: "text-yellow-600 bg-yellow-100" }
    return { text: "Poor", color: "text-red-600 bg-red-100" }
  }

  const getScoreForInterviewer = (interview: Interview, criteriaId: string) => {
    return interview.scores?.find(score => score.criteriaId === criteriaId)
  }

  const calculateAverageForCriteria = (criteriaId: string) => {
    const scores = interviews
      .map(interview => getScoreForInterviewer(interview, criteriaId))
      .filter(score => score !== undefined)
      .map(score => score!.score)
    
    if (scores.length === 0) return 0
    const total = scores.reduce((sum, score) => sum + score, 0)
    return Math.round((total / scores.length) * 10) / 10
  }

  const completedInterviews = interviews.filter(interview => interview.status === 'COMPLETED')

  if (completedInterviews.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Completed Interviews</h3>
              <p className="text-gray-500">No interviews have been completed yet.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card className="border-purple-200 bg-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-800">
            <Users className="h-5 w-5" />
            Comparative Analysis - {completedInterviews.length} Interviewer{completedInterviews.length > 1 ? 's' : ''}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {completedInterviews.map((interview, index) => (
              <div key={interview.id} className="bg-white p-3 rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-4 w-4 text-purple-600" />
                  <span className="font-medium text-sm">
                    {interview.interviewer?.name || `Interviewer ${index + 1}`}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-lg font-bold text-purple-600">
                    {interview.overallScore || 0}/10
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Comparative Scores Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Score Comparison by Criteria
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Criteria</th>
                  {completedInterviews.map((interview, index) => (
                    <th key={interview.id} className="text-center p-3 font-medium">
                      {interview.interviewer?.name || `Interviewer ${index + 1}`}
                    </th>
                  ))}
                  <th className="text-center p-3 font-medium bg-gray-50">Average</th>
                </tr>
              </thead>
              <tbody>
                {criteria.map((criterion) => {
                  const averageScore = calculateAverageForCriteria(criterion.id)
                  const averageLevel = getScoreLevel(averageScore)
                  
                  return (
                    <tr key={criterion.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div>
                          <div className="font-medium">{criterion.name}</div>
                          <div className="text-sm text-gray-600">{criterion.description}</div>
                        </div>
                      </td>
                      {completedInterviews.map((interview) => {
                        const score = getScoreForInterviewer(interview, criterion.id)
                        const scoreLevel = score ? getScoreLevel(score.score) : null
                        
                        return (
                          <td key={interview.id} className="text-center p-3">
                            {score ? (
                              <div className="space-y-1">
                                <div className="flex items-center justify-center gap-1">
                                  <Star className="h-4 w-4 text-yellow-500" />
                                  <span className="font-bold text-lg">{score.score}</span>
                                </div>
                                <Badge className={`${scoreLevel.color} border-0 text-xs`}>
                                  {scoreLevel.text}
                                </Badge>
                                {score.comments && (
                                  <div className="text-xs text-gray-500 mt-1 max-w-32 truncate" title={score.comments}>
                                    💬 {score.comments.substring(0, 30)}...
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                        )
                      })}
                      <td className="text-center p-3 bg-gray-50">
                        <div className="space-y-1">
                          <div className="flex items-center justify-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span className="font-bold text-lg">{averageScore}</span>
                          </div>
                          <Badge className={`${averageLevel.color} border-0 text-xs`}>
                            {averageLevel.text}
                          </Badge>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Individual Interview Details */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Individual Interview Details</h3>
        {completedInterviews.map((interview, index) => (
          <Card key={interview.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {interview.interviewer?.name || `Interviewer ${index + 1}`}
                </span>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="font-bold">{interview.overallScore || 0}/10</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <InterviewResults interview={interview} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 