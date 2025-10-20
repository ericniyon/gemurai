"use client"

import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { toast, Toaster } from 'react-hot-toast'
import { api } from '@/lib/api-client'

interface ApplicationEvaluation {
  id: string
  type: string
  totalScore: number
  scores: Record<string, any>
  overallLevel: string
  recommendations: any
  createdAt: Date
  updatedAt: Date
}

interface ApplicationDetailsProps {
  application: {
    id: string
    formData: any
    status: string
    evaluations: ApplicationEvaluation[]
  }
  latestEvaluation: ApplicationEvaluation | null
}

export function ApplicationDetails({ application, latestEvaluation }: ApplicationDetailsProps) {
  const { user, isAuthenticated, isLoading } = useAuth()
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [evaluationResult, setEvaluationResult] = useState<ApplicationEvaluation | null>(latestEvaluation)

  const runEvaluation = async () => {
    if (!isAuthenticated || !user) {
      toast.error("You must be logged in to evaluate applications.")
      return
    }

    setIsEvaluating(true)
    try {
      const response = await api.request(`/applications/${application.id}/evaluate-vulnerability`, {
        method: 'POST',
        body: { formData: application.formData }
      })

      if (!response.success) {
        throw new Error(response.message || 'Evaluation failed')
      }

      setEvaluationResult(response.data)
      toast.success("The vulnerability assessment has been completed successfully.")
    } catch (error) {
      console.error('Evaluation error:', error)
      toast.error(error instanceof Error ? error.message : "Failed to complete the vulnerability assessment.")
    } finally {
      setIsEvaluating(false)
    }
  }

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      {/* Add your application details UI here */}
      <div className="flex justify-end">
        <button
          onClick={runEvaluation}
          disabled={isEvaluating || isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isEvaluating ? 'Evaluating...' : 'Run Vulnerability Assessment'}
        </button>
      </div>
      {evaluationResult && (
        <div className="mt-4 p-4 bg-white rounded shadow">
          <h3 className="text-lg font-semibold">Latest Evaluation Results</h3>
          <div className="mt-2">
            <p>Overall Score: {evaluationResult.totalScore}</p>
            <p>Level: {evaluationResult.overallLevel}</p>
            {/* Add more evaluation details as needed */}
          </div>
        </div>
      )}
    </div>
  )
}