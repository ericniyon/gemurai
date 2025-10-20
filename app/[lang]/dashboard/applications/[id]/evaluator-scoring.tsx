'use client'

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { formatDate } from "@/lib/utils"
import { ApplicationEvaluation, User } from "@prisma/client"
import { UserCircle, Save, Edit, History } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface EvaluatorScoringProps {
  applicationId: string
  evaluations: (ApplicationEvaluation & {
    evaluator: User
  })[]
  canEvaluate: boolean
}

export function EvaluatorScoring({ applicationId, evaluations, canEvaluate }: EvaluatorScoringProps) {
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [scores, setScores] = useState({
    businessUnderstanding: 0,
    digitalLiteracy: 0,
    problemSolving: 0,
    communication: 0,
    leadership: 0
  })
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Get the most recent human evaluation
  const latestEvaluation = evaluations
    .filter(e => e.type === 'HUMAN')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/v1/applications/${applicationId}/evaluate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          scores,
          notes,
          type: 'HUMAN'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to submit evaluation')
      }

      toast({
        title: "Success",
        description: "Evaluation submitted successfully",
      })
      setIsEditing(false)
      // Refresh the page to show new evaluation
      window.location.reload()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit evaluation",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserCircle className="h-5 w-5" />
              Evaluator Assessment
            </div>
            {latestEvaluation ? (
              <Badge variant="success">Evaluated</Badge>
            ) : (
              <Badge variant="secondary">Pending</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!isEditing && latestEvaluation ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">
                    Last evaluated by {latestEvaluation.evaluator.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    on {formatDate(latestEvaluation.createdAt)}
                  </p>
                </div>
                {canEvaluate && (
                  <Button onClick={() => setIsEditing(true)} variant="outline">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Scores
                  </Button>
                )}
              </div>
              
              <div className="space-y-2">
                {Object.entries(latestEvaluation.questionScores as Record<string, number>).map(([criterion, score]) => (
                  <div key={criterion} className="flex justify-between items-center">
                    <span className="font-medium">{criterion}</span>
                    <span className="font-medium">{score}/20</span>
                  </div>
                ))}
              </div>

              {latestEvaluation.notes && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Notes</h4>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">
                    {latestEvaluation.notes}
                  </p>
                </div>
              )}
            </div>
          ) : canEvaluate ? (
            <div className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <label className="font-medium">Business Understanding</label>
                  <Input
                    type="number"
                    min="0"
                    max="20"
                    value={scores.businessUnderstanding}
                    onChange={(e) => setScores(prev => ({ ...prev, businessUnderstanding: Number(e.target.value) }))}
                  />
                </div>
                <div className="grid gap-2">
                  <label className="font-medium">Digital Literacy</label>
                  <Input
                    type="number"
                    min="0"
                    max="20"
                    value={scores.digitalLiteracy}
                    onChange={(e) => setScores(prev => ({ ...prev, digitalLiteracy: Number(e.target.value) }))}
                  />
                </div>
                <div className="grid gap-2">
                  <label className="font-medium">Problem Solving</label>
                  <Input
                    type="number"
                    min="0"
                    max="20"
                    value={scores.problemSolving}
                    onChange={(e) => setScores(prev => ({ ...prev, problemSolving: Number(e.target.value) }))}
                  />
                </div>
                <div className="grid gap-2">
                  <label className="font-medium">Communication</label>
                  <Input
                    type="number"
                    min="0"
                    max="20"
                    value={scores.communication}
                    onChange={(e) => setScores(prev => ({ ...prev, communication: Number(e.target.value) }))}
                  />
                </div>
                <div className="grid gap-2">
                  <label className="font-medium">Leadership</label>
                  <Input
                    type="number"
                    min="0"
                    max="20"
                    value={scores.leadership}
                    onChange={(e) => setScores(prev => ({ ...prev, leadership: Number(e.target.value) }))}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <label className="font-medium">Notes</label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add your evaluation notes here..."
                  rows={4}
                />
              </div>

              <div className="flex justify-end gap-2">
                {isEditing && (
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                )}
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>Submitting...</>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Submit Evaluation
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              You don't have permission to evaluate this application.
            </p>
          )}
        </CardContent>
      </Card>

      {evaluations.length > 1 && (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full">
              <History className="h-4 w-4 mr-2" />
              View Evaluation History
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Evaluation History</DialogTitle>
              <DialogDescription>
                View all previous evaluations for this application
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              {evaluations
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map((evaluation) => (
                  <Card key={evaluation.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{evaluation.evaluator.name}</p>
                          <p className="text-sm text-gray-500">
                            {formatDate(evaluation.createdAt)}
                          </p>
                        </div>
                        <Badge>
                          {evaluation.type === 'AI' ? 'AI Evaluation' : 'Human Evaluation'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {Object.entries(evaluation.questionScores as Record<string, number>).map(([criterion, score]) => (
                          <div key={criterion} className="flex justify-between items-center">
                            <span className="font-medium">{criterion}</span>
                            <span className="font-medium">{score}/20</span>
                          </div>
                        ))}
                        {evaluation.notes && (
                          <div className="mt-4">
                            <h4 className="font-medium mb-2">Notes</h4>
                            <p className="text-sm text-gray-600 whitespace-pre-wrap">
                              {evaluation.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
} 