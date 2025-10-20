import { prisma } from "@/lib/prisma"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Question title mapping
export const questionTitles: Record<string, string> = {
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
export function getQuestionTitle(key: string): string {
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

export async function evaluateApplication(applicationId: string, formData: any) {
  try {
    // Prepare prompt for AI evaluation
    const prompt = `You are an expert application evaluator. Please evaluate the following application responses and provide:
1. A score out of 100
2. Detailed feedback explaining the score
3. Strengths and areas for improvement

Application Responses:
${Object.entries(formData)
  .map(([question, answer]) => `Question: ${question}\nAnswer: ${answer}`)
  .join("\n\n")}

Please format your response as follows:
Score: [number]
Evaluation: [detailed feedback]
Strengths: [bullet points]
Areas for Improvement: [bullet points]`

    try {
      // Get AI evaluation
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are an expert application evaluator providing detailed feedback.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      })

      const response = completion.choices[0].message.content

      // Parse AI response
      if (!response) {
        throw new Error("No response received from AI")
      }

      const scoreMatch = response.match(/Score: (\d+)/)
      const score = scoreMatch ? parseInt(scoreMatch[1]) : 75 // Default score if parsing fails

      // Save AI evaluation
      await prisma.applicationEvaluation.create({
        data: {
          applicationId,
          evaluatorId: "cmcv36wln0000dd01moxtiex9",
          score,
          totalScore: score,
          feedback: response,
          type: "AI",
        },
      })

      return {
        score,
        evaluation: response,
      }
    } catch (aiError: any) {
      // Handle quota exceeded error gracefully
      if (aiError.status === 429 || aiError.message?.includes('quota')) {
        console.warn("AI quota exceeded, skipping evaluation:", aiError.message)
        return {
          score: 75, // Default score
          evaluation: "AI evaluation skipped due to quota limitations. Application will be reviewed manually.",
        }
      }
      
      // For other AI-specific errors, log and return a default response
      console.error("AI evaluation error:", aiError)
      return {
        score: 75, // Default score
        evaluation: "AI evaluation unavailable. Application will be reviewed manually.",
      }
    }
  } catch (error) {
    console.error("Error in application evaluation:", error)
    // Return a default response for any other errors
    return {
      score: 75,
      evaluation: "Evaluation system encountered an error. Application will be reviewed manually.",
    }
  }
}