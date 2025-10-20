import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

const SYSTEM_PROMPT = `You are an expert application evaluator for a Digital Commerce Champion (DCC) program. 
Evaluate the application based on the following criteria:
1. Business Understanding (20 points)
2. Digital Literacy (20 points)
3. Communication Skills (20 points)
4. Problem Solving (20 points)
5. Growth Potential (20 points)

For each application, provide:
1. A score out of 100 (sum of all criteria)
2. Detailed feedback
3. Key strengths (list)
4. Areas for improvement (list)
5. Individual scores for each criterion`

async function evaluateApplication(application: any) {
  try {
    const formattedApplication = JSON.stringify(application.formData, null, 2)
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Please evaluate this DCC application:\n${formattedApplication}` }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7
    })

    const evaluation = JSON.parse(completion.choices[0].message.content)
    
    // Save evaluation to database
    await prisma.applicationEvaluation.create({
      data: {
        applicationId: application.id,
        evaluatorId: "AI_SYSTEM", // You might want to create a special AI user in your database
        feedback: evaluation.feedback,
        improvements: evaluation.areasForImprovement,
        strengths: evaluation.keyStrengths,
        score: evaluation.totalScore,
        questionScores: evaluation.criteriaScores,
        type: "AI"
      }
    })

    return evaluation
  } catch (error) {
    console.error(`Error evaluating application ${application.id}:`, error)
    throw error
  }
}

export async function POST() {
  try {
    // Get all applications without AI evaluations
    const applications = await prisma.application.findMany({
      where: {
        NOT: {
          evaluations: {
            some: {
              type: "AI"
            }
          }
        }
      },
      include: {
        evaluations: true
      }
    })

    console.log(`Found ${applications.length} applications to evaluate`)

    // Process applications in parallel with rate limiting
    const results = await Promise.all(
      applications.map(app => evaluateApplication(app).catch(error => ({
        applicationId: app.id,
        error: error.message
      })))
    )

    const successful = results.filter(r => !r.error).length
    const failed = results.filter(r => r.error).length

    return NextResponse.json({
      message: `Processed ${applications.length} applications. Success: ${successful}, Failed: ${failed}`,
      results
    })
  } catch (error) {
    console.error("Error in AI evaluation process:", error)
    return NextResponse.json(
      { error: "Failed to process applications" },
      { status: 500 }
    )
  }
} 