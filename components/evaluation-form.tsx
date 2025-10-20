"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle, XCircle, Send, Save, Star } from "lucide-react"
import {
  type ApplicationEvaluation,
  type EvaluationAnswer,
  type EvaluationQuestion,
  saveEvaluation,
  getEvaluationByApplicationId,
  calculateOverallScore,
  createInitialEvaluation,
} from "@/lib/evaluation-service"
import { sendEvaluationFeedbackEmail } from "@/lib/email-service"

interface EvaluationFormProps {
  applicationId: string
  applicantName: string
  applicantEmail: string
  onEvaluationComplete?: (evaluation: ApplicationEvaluation) => void
}

export function EvaluationForm({
  applicationId,
  applicantName,
  applicantEmail,
  onEvaluationComplete,
}: EvaluationFormProps) {
  const [evaluation, setEvaluation] = useState<ApplicationEvaluation | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [sending, setSending] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Load existing evaluation or create new one
    const existingEvaluation = getEvaluationByApplicationId(applicationId)
    if (existingEvaluation) {
      setEvaluation(existingEvaluation)
    } else {
      setEvaluation(createInitialEvaluation(applicationId, "Current Evaluator"))
    }
    setLoading(false)
  }, [applicationId])

  const handleAnswerChange = (questionId: string, answer: string | string[], isCorrect?: boolean) => {
    if (!evaluation) return

    const updatedAnswers = [...evaluation.answers]
    const existingIndex = updatedAnswers.findIndex((a) => a.questionId === questionId)

    const newAnswer: EvaluationAnswer = {
      questionId,
      answer,
      isCorrect,
      reviewerComment: existingIndex >= 0 ? updatedAnswers[existingIndex].reviewerComment : "",
    }

    if (existingIndex >= 0) {
      updatedAnswers[existingIndex] = newAnswer
    } else {
      updatedAnswers.push(newAnswer)
    }

    const overallScore = calculateOverallScore(updatedAnswers, evaluation.questions)

    setEvaluation({
      ...evaluation,
      answers: updatedAnswers,
      overallScore,
      updatedAt: new Date().toISOString(),
    })
  }

  const handleCommentChange = (questionId: string, comment: string) => {
    if (!evaluation) return

    const updatedAnswers = [...evaluation.answers]
    const existingIndex = updatedAnswers.findIndex((a) => a.questionId === questionId)

    if (existingIndex >= 0) {
      updatedAnswers[existingIndex].reviewerComment = comment
    } else {
      updatedAnswers.push({
        questionId,
        answer: "",
        reviewerComment: comment,
      })
    }

    setEvaluation({
      ...evaluation,
      answers: updatedAnswers,
      updatedAt: new Date().toISOString(),
    })
  }

  const handleOverallCommentChange = (comment: string) => {
    if (!evaluation) return

    setEvaluation({
      ...evaluation,
      overallComment: comment,
      updatedAt: new Date().toISOString(),
    })
  }

  const handleSave = async () => {
    if (!evaluation) return

    setSaving(true)
    try {
      const updatedEvaluation = {
        ...evaluation,
        status: "draft" as const,
        updatedAt: new Date().toISOString(),
      }

      saveEvaluation(updatedEvaluation)
      setEvaluation(updatedEvaluation)

      toast({
        title: "Evaluation Saved",
        description: "Your evaluation has been saved as draft.",
      })
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save evaluation. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleSendFeedback = async () => {
    if (!evaluation) return

    setSending(true)
    try {
      // Validate evaluation before sending
      if (!evaluation.answers.length) {
        throw new Error("Please complete the evaluation before sending feedback")
      }

      if (!evaluation.overallComment) {
        throw new Error("Please provide an overall comment before sending feedback")
      }

      const updatedEvaluation = {
        ...evaluation,
        status: "sent" as const,
        updatedAt: new Date().toISOString(),
      }

      // Save evaluation first
      saveEvaluation(updatedEvaluation)

      // Send email feedback
      const emailResult = await sendEvaluationFeedbackEmail(applicantEmail, applicantName, updatedEvaluation)

      if (emailResult.success) {
        setEvaluation(updatedEvaluation)
        onEvaluationComplete?.(updatedEvaluation)

        toast({
          title: "Feedback Sent",
          description: "Evaluation feedback has been sent to the applicant.",
        })
      } else {
        throw new Error(emailResult.message || "Failed to send feedback email")
      }
    } catch (error: any) {
      console.error("Error sending feedback:", error)
      toast({
        title: "Send Failed",
        description: error.message || "Failed to send feedback. Please try again.",
        variant: "destructive",
      })

      // Revert evaluation status if email failed
      if (evaluation.status === "sent") {
        const revertedEvaluation = {
          ...evaluation,
          status: "completed" as const,
          updatedAt: new Date().toISOString(),
        }
        saveEvaluation(revertedEvaluation)
        setEvaluation(revertedEvaluation)
      }
    } finally {
      setSending(false)
    }
  }

  const getAnswerForQuestion = (questionId: string): EvaluationAnswer | undefined => {
    return evaluation?.answers.find((a) => a.questionId === questionId)
  }

  const getCategoryQuestions = (category: string): EvaluationQuestion[] => {
    return evaluation?.questions.filter((q) => q.category === category) || []
  }

  const getCategories = (): string[] => {
    const categories = evaluation?.questions.map((q) => q.category) || []
    return [...new Set(categories)]
  }

  const renderQuestionInput = (question: EvaluationQuestion) => {
    const answer = getAnswerForQuestion(question.id)

    switch (question.type) {
      case "rating":
        return (
          <div className="space-y-2">
            <RadioGroup
              value={answer?.answer as string}
              onValueChange={(value) => handleAnswerChange(question.id, value)}
            >
              <div className="flex items-center space-x-4">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <div key={rating} className="flex items-center space-x-2">
                    <RadioGroupItem value={rating.toString()} id={`${question.id}-${rating}`} />
                    <Label htmlFor={`${question.id}-${rating}`} className="flex items-center">
                      {rating} <Star className="h-3 w-3 ml-1" />
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>
        )

      case "yes_no":
        return (
          <RadioGroup
            value={answer?.answer as string}
            onValueChange={(value) => handleAnswerChange(question.id, value, value === "Yes")}
          >
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Yes" id={`${question.id}-yes`} />
                <Label htmlFor={`${question.id}-yes`} className="flex items-center text-green-600">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Yes
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="No" id={`${question.id}-no`} />
                <Label htmlFor={`${question.id}-no`} className="flex items-center text-red-600">
                  <XCircle className="h-4 w-4 mr-1" />
                  No
                </Label>
              </div>
            </div>
          </RadioGroup>
        )

      case "multiple_choice":
        return (
          <Select value={answer?.answer as string} onValueChange={(value) => handleAnswerChange(question.id, value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {question.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      default:
        return (
          <Textarea
            value={(answer?.answer as string) || ""}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder="Enter your evaluation..."
            rows={3}
          />
        )
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
      </div>
    )
  }

  if (!evaluation) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Failed to load evaluation form.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Overall Score Display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Evaluation Summary
            <div className="flex items-center gap-2">
              <Badge variant={evaluation.status === "sent" ? "default" : "secondary"}>
                {evaluation.status === "sent" ? "Sent" : evaluation.status === "completed" ? "Completed" : "Draft"}
              </Badge>
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
                  evaluation.overallScore >= 80
                    ? "bg-green-100 text-green-800"
                    : evaluation.overallScore >= 60
                      ? "bg-yellow-100 text-yellow-800"
                      : evaluation.overallScore > 0
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800"
                }`}
              >
                {evaluation.overallScore || 0}
              </div>
            </div>
          </CardTitle>
          <CardDescription>Evaluating {applicantName} for Digital Community Champion position</CardDescription>
        </CardHeader>
      </Card>

      {/* Evaluation Questions by Category */}
      {getCategories().map((category) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="text-lg">{category}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {getCategoryQuestions(category).map((question) => {
              const answer = getAnswerForQuestion(question.id)
              return (
                <div key={question.id} className="space-y-4 p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium mb-2">{question.question}</h4>
                      {question.required && (
                        <Badge variant="outline" className="text-xs mb-2">
                          Required
                        </Badge>
                      )}
                      <div className="mb-3">{renderQuestionInput(question)}</div>
                    </div>
                    <div className="ml-4 text-sm text-gray-500">Weight: {question.weight}%</div>
                  </div>

                  <Separator />

                  <div>
                    <Label htmlFor={`comment-${question.id}`} className="text-sm font-medium">
                      Comment for Applicant (Optional)
                    </Label>
                    <Textarea
                      id={`comment-${question.id}`}
                      value={answer?.reviewerComment || ""}
                      onChange={(e) => handleCommentChange(question.id, e.target.value)}
                      placeholder="Add a comment that will be sent to the applicant..."
                      rows={2}
                      className="mt-1"
                    />
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      ))}

      {/* Overall Comments */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Evaluation Comments</CardTitle>
          <CardDescription>General feedback that will be sent to the applicant</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={evaluation.overallComment}
            onChange={(e) => handleOverallCommentChange(e.target.value)}
            placeholder="Provide overall feedback for the applicant..."
            rows={4}
          />
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t">
        <div className="text-sm text-gray-500">Last updated: {new Date(evaluation.updatedAt).toLocaleString()}</div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleSave} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Saving..." : "Save Draft"}
          </Button>
          <Button onClick={handleSendFeedback} disabled={sending || evaluation.status === "sent"}>
            <Send className="mr-2 h-4 w-4" />
            {sending ? "Sending..." : evaluation.status === "sent" ? "Feedback Sent" : "Send Feedback"}
          </Button>
        </div>
      </div>
    </div>
  )
}
