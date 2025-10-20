'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { formatDate } from "@/lib/utils"
import { ApplicationEvaluation, User } from "@prisma/client"
import { Brain, CheckCircle, AlertCircle, LineChart, Target, Lightbulb, Loader2 } from "lucide-react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

interface AIEvaluationSectionProps {
  evaluation?: ApplicationEvaluation & {
    evaluator: User
  }
  loading?: boolean
}

export function AIEvaluationSection({ evaluation, loading }: AIEvaluationSectionProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              AI Evaluation
            </div>
            <Badge variant="secondary">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Evaluating...
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">
            Please wait while the AI evaluates this application...
          </p>
        </CardContent>
      </Card>
    )
  }

  if (!evaluation) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              AI Evaluation
            </div>
            <Badge variant="secondary">Pending</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">
            This application has not been evaluated by AI yet.
          </p>
        </CardContent>
      </Card>
    )
  }

  const questionScores = evaluation.questionScores as Record<string, number>
  const totalScore = evaluation.score

  // Calculate score levels
  const getScoreLevel = (score: number) => {
    if (score >= 80) return { label: "Excellent", color: "text-green-500" }
    if (score >= 70) return { label: "Good", color: "text-blue-500" }
    if (score >= 60) return { label: "Fair", color: "text-yellow-500" }
    return { label: "Needs Improvement", color: "text-red-500" }
  }

  const overallLevel = getScoreLevel(totalScore)

  return (
    <div className="space-y-6">
      {/* Overall Score Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              AI Evaluation Results
            </div>
            <Badge variant="success">Completed</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">{totalScore}/100</div>
            <Badge className={overallLevel.color}>
              {overallLevel.label}
            </Badge>
            <p className="text-sm text-gray-500 mt-2">
              Evaluated on {formatDate(evaluation.createdAt)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Scores */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LineChart className="h-5 w-5" />
            Criteria Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(questionScores).map(([criterion, score]) => {
            const level = getScoreLevel((score / 20) * 100)
            return (
              <div key={criterion} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{criterion}</span>
                  <span className={`${level.color} font-medium`}>
                    {score}/20
                  </span>
                </div>
                <Progress value={(score / 20) * 100} className="h-2" />
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Analysis Sections */}
      <Accordion type="single" collapsible className="space-y-4">
        <Card>
          <AccordionItem value="strengths" className="border-none">
            <AccordionTrigger className="px-6 py-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <h3 className="font-semibold">Key Strengths</h3>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-4">
              <ul className="space-y-2 list-disc list-inside">
                {evaluation.strengths.map((strength, index) => (
                  <li key={index} className="text-sm">
                    {strength}
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Card>

        <Card>
          <AccordionItem value="improvements" className="border-none">
            <AccordionTrigger className="px-6 py-4">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-orange-500" />
                <h3 className="font-semibold">Areas for Improvement</h3>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-4">
              <ul className="space-y-2 list-disc list-inside">
                {evaluation.improvements.map((improvement, index) => (
                  <li key={index} className="text-sm">
                    {improvement}
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Card>

        <Card>
          <AccordionItem value="feedback" className="border-none">
            <AccordionTrigger className="px-6 py-4">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-blue-500" />
                <h3 className="font-semibold">Detailed Analysis</h3>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-4">
              <p className="text-sm whitespace-pre-wrap">
                {evaluation.feedback}
              </p>
            </AccordionContent>
          </AccordionItem>
        </Card>
      </Accordion>
    </div>
  )
} 