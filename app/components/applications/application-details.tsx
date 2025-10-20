import { useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Loader2, Calculator } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { Application } from "@prisma/client"

interface ApplicationDetailsProps {
  application: Application
}

export function ApplicationDetails({ application }: ApplicationDetailsProps) {
  const { data: session } = useSession()
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [evaluationResult, setEvaluationResult] = useState<any>(null)

  const runEvaluation = async () => {
    setIsEvaluating(true)
    try {
      const response = await fetch(`/api/v1/applications/${application.id}/evaluate-vulnerability`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.accessToken}`
        }
      })

      const result = await response.json()
      if (!result.success) {
        throw new Error(result.error || 'Evaluation failed')
      }

      setEvaluationResult(result.data)
      toast({
        title: "Evaluation Complete",
        description: "The vulnerability assessment has been completed successfully.",
      })
    } catch (error) {
      console.error('Evaluation error:', error)
      toast({
        title: "Evaluation Failed",
        description: error.message || "Failed to complete the vulnerability assessment.",
        variant: "destructive"
      })
    } finally {
      setIsEvaluating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Application Details</h2>
        <Button 
          onClick={runEvaluation} 
          disabled={isEvaluating}
        >
          {isEvaluating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Running Assessment...
            </>
          ) : (
            <>
              <Calculator className="mr-2 h-4 w-4" />
              Run Vulnerability Assessment
            </>
          )}
        </Button>
      </div>

      {/* Application Information */}
      <div className="grid gap-4">
        {/* Basic Information */}
        <div className="p-4 bg-muted rounded-lg">
          <h3 className="font-medium mb-2">Basic Information</h3>
          <div className="grid gap-2">
            <div>
              <span className="font-medium">Application ID: </span>
              <span>{application.id}</span>
            </div>
            <div>
              <span className="font-medium">Status: </span>
              <Badge>{application.status}</Badge>
            </div>
            <div>
              <span className="font-medium">Submitted: </span>
              <span>{new Date(application.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Form Data */}
        <div className="p-4 bg-muted rounded-lg">
          <h3 className="font-medium mb-2">Form Data</h3>
          <pre className="whitespace-pre-wrap text-sm">
            {JSON.stringify(application.formData, null, 2)}
          </pre>
        </div>

        {/* Evaluation Results */}
        {evaluationResult && (
          <div className="space-y-6">
            {/* Overall Score */}
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Overall Vulnerability Level</h4>
                  <p className="text-sm text-muted-foreground">
                    Score: {evaluationResult.totalScore} / {evaluationResult.maxScore}
                  </p>
                </div>
                <Badge 
                  variant={
                    evaluationResult.overallLevel === 'C' ? 'destructive' :
                    evaluationResult.overallLevel === 'B' ? 'warning' :
                    'success'
                  }
                  className="text-lg px-3 py-1"
                >
                  Level {evaluationResult.overallLevel}
                </Badge>
              </div>
            </div>

            {/* Detailed Scores */}
            <div className="space-y-2">
              <h4 className="font-medium">Detailed Assessment</h4>
              <div className="grid gap-4 md:grid-cols-2">
                {Object.entries(evaluationResult.scores).map(([category, data]: [string, any]) => (
                  <div 
                    key={category}
                    className="p-3 border rounded-md"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{category}</span>
                      <Badge
                        variant={
                          data.level === 'C' ? 'destructive' :
                          data.level === 'B' ? 'warning' :
                          'success'
                        }
                      >
                        Level {data.level}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{data.reason}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            {evaluationResult.recommendations?.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Recommendations</h4>
                <div className="space-y-4">
                  {evaluationResult.recommendations.map((rec: any, index: number) => (
                    <div key={index} className="space-y-2">
                      <h5 className="text-sm font-medium">
                        {rec.priority} Priority Actions
                      </h5>
                      <ul className="list-disc list-inside space-y-1">
                        {rec.items.map((item: string, itemIndex: number) => (
                          <li key={itemIndex} className="text-sm text-muted-foreground">
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
} 