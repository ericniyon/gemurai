'use client'

import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useState } from "react"
import { triggerAIEvaluation, triggerBulkAIEvaluation } from "./actions"
import { Brain, Loader2 } from "lucide-react"

interface AIEvaluationButtonProps {
  applicationId?: string // Optional - if not provided, will do bulk evaluation
  variant?: "default" | "outline" | "secondary"
  size?: "default" | "sm" | "lg"
}

export function AIEvaluationButton({ applicationId, variant = "default", size = "default" }: AIEvaluationButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleClick = async () => {
    try {
      setIsLoading(true)
      
      let result
      if (applicationId) {
        // Single application evaluation
        result = await triggerAIEvaluation(applicationId)
        if (result.success) {
          toast({
            title: "Success",
            description: "AI evaluation started for this application"
          })
        }
      } else {
        // Bulk evaluation
        result = await triggerBulkAIEvaluation()
        if (result.success) {
          toast({
            title: "Success",
            description: `Started AI evaluation for ${result.count} applications`
          })
        }
      }

      if (!result.success) {
        throw new Error(result.error || 'Failed to start AI evaluation')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button 
      onClick={handleClick}
      disabled={isLoading}
      variant={variant}
      size={size}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {applicationId ? "Evaluating..." : "Processing..."}
        </>
      ) : (
        <>
          <Brain className="mr-2 h-4 w-4" />
          {applicationId ? "Evaluate with AI" : "Evaluate All Applications"}
        </>
      )}
    </Button>
  )
} 