import { Application, User, ApplicationEvaluation } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Loader2, Calculator } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"

interface ApplicationDetailsProps {
  application: Application & {
    user: Pick<User, "id" | "name" | "email" | "avatar">
    evaluations: (ApplicationEvaluation & {
      evaluator: Pick<User, "id" | "name" | "email" | "avatar">
    })[]
  }
}

export function ApplicationDetails({ application }: ApplicationDetailsProps) {
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [evaluationResult, setEvaluationResult] = useState<any>(null)

  const runEvaluation = async () => {
    setIsEvaluating(true)
    try {
      const response = await fetch(`/api/v1/applications/${application.id}/evaluate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.accessToken}`
        },
        body: JSON.stringify({ formData: application.formData })
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
        <div>
          <h1 className="text-2xl font-bold">{application.user.name}'s Application</h1>
          <p className="text-gray-500">
            Submitted on {new Date(application.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              application.status === "APPROVED"
                ? "bg-green-100 text-green-800"
                : application.status === "REJECTED"
                ? "bg-red-100 text-red-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {application.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Applicant Information</h2>
          <div className="space-y-2">
            <p>
              <span className="font-medium">Email:</span> {application.user.email}
            </p>
            <p>
              <span className="font-medium">Status:</span> {application.status}
            </p>
            <p>
              <span className="font-medium">Created:</span>{" "}
              {new Date(application.createdAt).toLocaleString()}
            </p>
            <p>
              <span className="font-medium">Last Updated:</span>{" "}
              {new Date(application.updatedAt).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Form Data</h2>
          <div className="space-y-2">
            {Object.entries(application.formData as Record<string, any>).map(([key, value]) => (
              <p key={key}>
                <span className="font-medium">{key}:</span>{" "}
                {typeof value === "object" ? JSON.stringify(value) : value}
              </p>
            ))}
          </div>
        </div>
      </div>

      {application.evaluations.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Evaluations</h2>
          <div className="space-y-4">
            {application.evaluations.map((evaluation) => (
              <div
                key={evaluation.id}
                className="border rounded-lg p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <p className="font-medium">
                    Evaluated by {evaluation.evaluator.name}
                  </p>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      evaluation.type === "APPROVED"
                        ? "bg-green-100 text-green-800"
                        : evaluation.type === "REJECTED"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {evaluation.type}
                  </span>
                </div>
                <p>
                  <span className="font-medium">Score:</span>{" "}
                  {evaluation.score}
                </p>
                <p>
                  <span className="font-medium">Feedback:</span>{" "}
                  {evaluation.feedback}
                </p>
                {evaluation.strengths && evaluation.strengths.length > 0 && (
                  <div>
                    <span className="font-medium">Strengths:</span>
                    <ul className="list-disc list-inside ml-4">
                      {evaluation.strengths.map((strength, index) => (
                        <li key={index}>{strength}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {evaluation.improvements && evaluation.improvements.length > 0 && (
                  <div>
                    <span className="font-medium">Areas for Improvement:</span>
                    <ul className="list-disc list-inside ml-4">
                      {evaluation.improvements.map((improvement, index) => (
                        <li key={index}>{improvement}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <p className="text-sm text-gray-500">
                  Evaluated on{" "}
                  {new Date(evaluation.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Evaluation Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Vulnerability Assessment</h3>
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
                Run Assessment
              </>
            )}
          </Button>
        </div>

        {evaluationResult && (
          <div className="space-y-6 mt-4">
            {/* Overall Score */}
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Overall Vulnerability Level</h4>
                  <p className="text-sm text-muted-foreground">
                    Score: {evaluationResult.score} / {evaluationResult.maxScore}
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