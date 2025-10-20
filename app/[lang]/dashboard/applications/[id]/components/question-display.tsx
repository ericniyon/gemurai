"use client"

import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

// Question title mapping
const questionTitles: Record<string, string> = {
  businessName: "Business Name",
  businessType: "Type of Business",
  businessDescription: "Business Description",
  businessLocation: "Business Location",
  yearsInOperation: "Years in Operation",
  monthlyRevenue: "Monthly Revenue",
  employeeCount: "Number of Employees",
  businessGoals: "Business Goals",
  challengesFaced: "Challenges Faced",
  marketingStrategy: "Marketing Strategy",
  competitiveAdvantage: "Competitive Advantage",
  financialProjections: "Financial Projections",
  fundingNeeds: "Funding Requirements",
  implementationPlan: "Implementation Plan",
  riskMitigation: "Risk Mitigation Strategy",
}

// Helper function to get formatted question title
function getQuestionTitle(key: string): string {
  // First check our mapping
  if (questionTitles[key]) {
    return questionTitles[key]
  }
  
  // If not in mapping, format the key
  return key
    // Split on camelCase
    .replace(/([A-Z])/g, ' $1')
    // Split on underscores and remove them
    .split('_').join(' ')
    // Capitalize first letter
    .replace(/^./, str => str.toUpperCase())
    // Remove extra spaces
    .trim()
}

interface QuestionDisplayProps {
  question: string
  score: number
}

export function QuestionDisplay({ question, score }: QuestionDisplayProps) {
  return (
    <div className="space-y-3 p-4 border rounded-lg bg-gray-50">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900">{question}</h4>
        <Badge variant={score >= 80 ? "default" : score >= 60 ? "secondary" : "destructive"}>
          Score: {score}%
        </Badge>
      </div>
      <Progress 
        value={score} 
        className={cn(
          "h-1.5",
          score >= 80 ? "[&>div]:bg-green-500" : 
          score >= 60 ? "[&>div]:bg-yellow-500" : 
          "[&>div]:bg-red-500"
        )}
      />
    </div>
  )
}