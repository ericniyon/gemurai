"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, Loader2, CheckCircle } from "lucide-react"

interface InterviewCriteria {
  id: string
  name: string
  description: string
  maxScore: number
  weight: number
}

interface InterviewScoringModalProps {
  interviewId: string
  applicantName: string
  interviewerName: string
  scheduledDate: string
  onScoresSubmitted: () => void
}

export default function InterviewScoringModal({
  interviewId,
  applicantName,
  interviewerName,
  scheduledDate,
  onScoresSubmitted
}: InterviewScoringModalProps) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [criteria, setCriteria] = useState<InterviewCriteria[]>([])
  const [scores, setScores] = useState<Record<string, number>>({})
  const [comments, setComments] = useState<Record<string, string>>({})
  const [overallComment, setOverallComment] = useState("")
  const [interviewNotes, setInterviewNotes] = useState("")

  useEffect(() => {
    if (open) {
      fetchCriteria()
    }
  }, [open])

  const fetchCriteria = async () => {
    try {
      const response = await fetch("/api/v1/superadmin/interview-criteria", {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to fetch interview criteria")
      }

      const data = await response.json()
      if (data.success) {
        setCriteria(data.criteria)
        // Initialize scores with 0
        const initialScores: Record<string, number> = {}
        data.criteria.forEach((criterion: InterviewCriteria) => {
          initialScores[criterion.id] = 0
        })
        setScores(initialScores)
      }
    } catch (error) {
      console.error("Error fetching criteria:", error)
      toast({
        title: "Error",
        description: "Failed to load interview criteria",
        variant: "destructive",
      })
    }
  }

  const handleScoreChange = (criteriaId: string, score: number) => {
    setScores(prev => ({
      ...prev,
      [criteriaId]: Math.max(0, Math.min(10, score))
    }))
  }

  const handleCommentChange = (criteriaId: string, comment: string) => {
    setComments(prev => ({
      ...prev,
      [criteriaId]: comment
    }))
  }

  const calculateAverageScore = () => {
    const validScores = Object.values(scores).filter(score => score > 0)
    if (validScores.length === 0) return 0
    return validScores.reduce((sum, score) => sum + score, 0) / validScores.length
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const averageScore = calculateAverageScore()
    if (averageScore === 0) {
      toast({
        title: "Validation Error",
        description: "Please provide scores for at least one criteria",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const scoresArray = Object.entries(scores).map(([criteriaId, score]) => ({
        criteriaId,
        score,
        comments: comments[criteriaId] || ""
      }))

      const response = await fetch(`/api/v1/superadmin/applications?id=${interviewId}&action=submit-scores`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          scores: scoresArray,
          overallComment,
          interviewNotes
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to submit scores")
      }

      const data = await response.json()
      
      toast({
        title: "Success",
        description: "Interview scores submitted successfully",
      })

      // Reset form
      setScores({})
      setComments({})
      setOverallComment("")
      setInterviewNotes("")
      setOpen(false)
      
      // Notify parent component
      onScoresSubmitted()

    } catch (error) {
      console.error("Error submitting scores:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit scores",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Star className="h-4 w-4" />
          Submit Scores
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Interview Scoring</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Interview Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Interview Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Applicant:</span>
                <span>{applicantName}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Interviewer:</span>
                <span>{interviewerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Scheduled:</span>
                <span>{formatDate(scheduledDate)}</span>
              </div>
            </CardContent>
          </Card>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Scoring Criteria */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Scoring Criteria</h3>
              {criteria.map((criterion) => (
                <Card key={criterion.id}>
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{criterion.name}</h4>
                          <p className="text-sm text-gray-600">{criterion.description}</p>
                        </div>
                        <Badge variant="outline">Max: {criterion.maxScore}</Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`score-${criterion.id}`}>Score (0-10)</Label>
                          <Input
                            id={`score-${criterion.id}`}
                            type="number"
                            min="0"
                            max="10"
                            step="0.5"
                            value={scores[criterion.id] || 0}
                            onChange={(e) => handleScoreChange(criterion.id, parseFloat(e.target.value) || 0)}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`comment-${criterion.id}`}>Comments</Label>
                          <Textarea
                            id={`comment-${criterion.id}`}
                            value={comments[criterion.id] || ""}
                            onChange={(e) => handleCommentChange(criterion.id, e.target.value)}
                            placeholder="Add comments about this criteria..."
                            className="mt-1"
                            rows={2}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Overall Assessment */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Overall Assessment</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="overall-comment">Overall Comment</Label>
                  <Textarea
                    id="overall-comment"
                    value={overallComment}
                    onChange={(e) => setOverallComment(e.target.value)}
                    placeholder="Provide an overall assessment of the candidate..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="interview-notes">Interview Notes</Label>
                  <Textarea
                    id="interview-notes"
                    value={interviewNotes}
                    onChange={(e) => setInterviewNotes(e.target.value)}
                    placeholder="Additional notes from the interview..."
                    rows={3}
                  />
                </div>
              </div>

              {/* Average Score Display */}
              <Card className="bg-blue-50">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-blue-900">Average Score</h4>
                      <p className="text-sm text-blue-700">Based on all criteria</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-900">
                        {calculateAverageScore().toFixed(1)}/10
                      </div>
                      <div className="text-sm text-blue-700">
                        {Object.values(scores).filter(score => score > 0).length} criteria scored
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Submit Scores
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
} 