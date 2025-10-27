import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import { prisma } from "@/lib/prisma"
import { verifyAuthToken } from "@/lib/token"
import { cookies } from "next/headers"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { z } from "zod"

// Lazy initialization of OpenAI client
let openaiInstance: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!openaiInstance) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }
    openaiInstance = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openaiInstance;
}

// Question title mapping for better prompts
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

// Scoring criteria and weights
const EVALUATION_CRITERIA = {
  INCOME: {
    weight: 20,
    title: "Income & Employment",
    evaluate: (formData: any) => {
      const monthlyIncome = Number(formData?.monthly_income) || 0
      const hasJob = formData?.employment_status?.toLowerCase() === 'employed'
      const hasBusinessIncome = formData?.income_sources?.includes('business')

      if (monthlyIncome < 50000 && !hasJob && !hasBusinessIncome) {
        return { score: 20, level: 'C', reason: 'High economic vulnerability' }
      } else if (monthlyIncome < 150000 || (!hasJob && !hasBusinessIncome)) {
        return { score: 10, level: 'B', reason: 'Moderate economic need' }
      }
      return { score: 5, level: 'A', reason: 'Stable income source' }
    }
  },
  DIGITAL_ACCESS: {
    weight: 15,
    title: "Digital Access",
    evaluate: (formData: any) => {
      const hasSmartphone = formData?.has_smartphone === 'yes'
      const hasInternet = formData?.has_internet === 'yes'
      const hasComputer = formData?.has_computer === 'yes'

      if (!hasSmartphone && !hasInternet) {
        return { score: 15, level: 'C', reason: 'No digital access' }
      } else if (!hasSmartphone || !hasInternet) {
        return { score: 10, level: 'B', reason: 'Limited digital access' }
      }
      return { score: 5, level: 'A', reason: 'Good digital access' }
    }
  },
  FAMILY_STATUS: {
    weight: 10,
    title: "Family Status",
    evaluate: (formData: any) => {
      const dependents = Number(formData?.dependents) || 0
      const maritalStatus = formData?.marital_status?.toLowerCase() || ''
      const isParent = formData?.has_children === 'yes'

      if (dependents > 3 || (isParent && maritalStatus.includes('single'))) {
        return { score: 10, level: 'C', reason: 'High family responsibility' }
      } else if (dependents > 0 || isParent) {
        return { score: 5, level: 'B', reason: 'Moderate family responsibility' }
      }
      return { score: 0, level: 'A', reason: 'Low family responsibility' }
    }
  },
  GENDER_HOUSEHOLD: {
    weight: 10,
    title: "Female-Headed Household",
    evaluate: (formData: any) => {
      const gender = formData?.gender?.toLowerCase() || ''
      const isHouseholdHead = formData?.is_household_head === 'yes'
      const hasSupport = formData?.has_family_support === 'yes'

      if (gender === 'female' && isHouseholdHead && !hasSupport) {
        return { score: 10, level: 'C', reason: 'Vulnerable female-headed household' }
      } else if (gender === 'female' && isHouseholdHead) {
        return { score: 5, level: 'B', reason: 'Female-headed with support' }
      }
      return { score: 0, level: 'A', reason: 'Not applicable' }
    }
  },
  HEALTH: {
    weight: 10,
    title: "Health Status",
    evaluate: (formData: any) => {
      const hasDisability = formData?.has_disability === 'yes'
      const hasChronicIllness = formData?.has_chronic_illness === 'yes'
      const hasHealthInsurance = formData?.has_health_insurance === 'yes'

      if ((hasDisability || hasChronicIllness) && !hasHealthInsurance) {
        return { score: 10, level: 'C', reason: 'Health vulnerability without insurance' }
      } else if (hasDisability || hasChronicIllness) {
        return { score: 5, level: 'B', reason: 'Health vulnerability with insurance' }
      }
      return { score: 0, level: 'A', reason: 'No health vulnerability' }
    }
  },
  HOUSING: {
    weight: 10,
    title: "Housing Conditions",
    evaluate: (formData: any) => {
      const housingType = formData?.housing_type?.toLowerCase() || ''
      const hasBasicUtilities = formData?.has_basic_utilities === 'yes'
      const isRenting = formData?.housing_ownership?.toLowerCase()?.includes('rent')

      if (!hasBasicUtilities || housingType.includes('temporary')) {
        return { score: 10, level: 'C', reason: 'Poor housing conditions' }
      } else if (isRenting || !housingType.includes('permanent')) {
        return { score: 5, level: 'B', reason: 'Moderate housing stability' }
      }
      return { score: 0, level: 'A', reason: 'Stable housing conditions' }
    }
  },
  COMMUNITY: {
    weight: 10,
    title: "Community Integration",
    evaluate: (formData: any) => {
      const hasLocalSupport = formData?.has_community_support === 'yes'
      const participatesCommunity = formData?.community_participation === 'yes'
      const yearsInCommunity = Number(formData?.years_in_community) || 0

      if (!hasLocalSupport && !participatesCommunity) {
        return { score: 10, level: 'C', reason: 'Low community integration' }
      } else if (!hasLocalSupport || !participatesCommunity || yearsInCommunity < 2) {
        return { score: 5, level: 'B', reason: 'Moderate community integration' }
      }
      return { score: 0, level: 'A', reason: 'Strong community integration' }
    }
  },
  EDUCATION: {
    weight: 5,
    title: "Education Level",
    evaluate: (formData: any) => {
      const educationLevel = formData?.education_level?.toLowerCase() || ''
      const hasVocationalTraining = formData?.has_vocational_training === 'yes'
      const yearsOfEducation = Number(formData?.years_of_education) || 0

      if (yearsOfEducation < 6 || educationLevel.includes('none')) {
        return { score: 5, level: 'C', reason: 'Limited education' }
      } else if (yearsOfEducation < 12 && !hasVocationalTraining) {
        return { score: 3, level: 'B', reason: 'Basic education' }
      }
      return { score: 0, level: 'A', reason: 'Adequate education' }
    }
  },
  LOCATION: {
    weight: 5,
    title: "Geographic Location",
    evaluate: (formData: any) => {
      const isTargetArea = formData?.is_target_area === 'yes'
      const distanceToCenter = Number(formData?.distance_to_center) || 0
      const hasTransport = formData?.has_transport_access === 'yes'

      if (isTargetArea && !hasTransport) {
        return { score: 5, level: 'C', reason: 'Remote target area' }
      } else if (isTargetArea || distanceToCenter > 10) {
        return { score: 3, level: 'B', reason: 'Moderate accessibility' }
      }
      return { score: 0, level: 'A', reason: 'Good accessibility' }
    }
  },
  AGE: {
    weight: 5,
    title: "Age Factor",
    evaluate: (formData: any) => {
      let age = Number(formData?.age) || 0
      if (formData?.date_of_birth) {
        const birthDate = new Date(formData.date_of_birth)
        const today = new Date()
        age = today.getFullYear() - birthDate.getFullYear()
      }

      if (age >= 18 && age <= 24) {
        return { score: 5, level: 'C', reason: 'Youth priority age group' }
      } else if (age > 24 && age <= 35) {
        return { score: 3, level: 'B', reason: 'Young adult' }
      }
      return { score: 0, level: 'A', reason: 'Adult' }
    }
  }
}

// Helper function to get overall vulnerability level
function getOverallLevel(totalScore: number, maxScore: number): 'A' | 'B' | 'C' {
  const percentage = (totalScore / maxScore) * 100
  if (percentage >= 70) return 'C'
  if (percentage >= 40) return 'B'
  return 'A'
}

// Helper function to get recommendations based on scores
function getRecommendations(scores: any) {
  const recommendations = []
  
  // High priority recommendations
  const highPriority = Object.entries(scores)
    .filter(([_, data]: [string, any]) => data.level === 'C')
    .map(([category, data]: [string, any]) => ({
      category,
      ...data
    }))

  if (highPriority.length > 0) {
    recommendations.push({
      priority: 'High',
      items: highPriority.map(item => 
        `${item.category}: ${item.reason}`
      )
    })
  }

  // Medium priority recommendations
  const mediumPriority = Object.entries(scores)
    .filter(([_, data]: [string, any]) => data.level === 'B')
    .map(([category, data]: [string, any]) => ({
      category,
      ...data
    }))

  if (mediumPriority.length > 0) {
    recommendations.push({
      priority: 'Medium',
      items: mediumPriority.map(item => 
        `${item.category}: ${item.reason}`
      )
    })
  }

  return recommendations
}

const MetricScoreSchema = z.object({
  score: z.number().min(0),
  comment: z.string(),
  lastUpdated: z.string()
});

const EmployerEvaluationSchema = z.object({
  id: z.string(),
  metrics: z.object({
    workExperience: MetricScoreSchema,
    yearsExperience: MetricScoreSchema,
    education: MetricScoreSchema,
    digitalLiteracy: MetricScoreSchema,
    availability: MetricScoreSchema,
    motivation: MetricScoreSchema
  }),
  overallComment: z.string(),
  totalScore: z.number().min(0).max(100),
  evaluatedBy: z.string(),
  evaluatedAt: z.string()
});

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const applicationId = params.id;
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        evaluations: true
      }
    });

    if (!application) {
      return new NextResponse("Application not found", { status: 404 });
    }

    const body = await request.json();
    const validatedData = EmployerEvaluationSchema.parse(body);

    // Create or update the employer evaluation
    const evaluation = await prisma.evaluation.upsert({
      where: {
        id: validatedData.id
      },
      create: {
        applicationId,
        score: validatedData.totalScore,
        level: getScoreLevel(validatedData.totalScore),
        questionScores: Object.entries(validatedData.metrics).reduce((acc, [key, value]) => ({
          ...acc,
          [key]: { score: value.score, comment: value.comment }
        }), {}),
        metadata: {
          summary: validatedData.overallComment,
          overallLevel: getScoreLevel(validatedData.totalScore),
          aiGenerated: false,
          evaluatedBy: validatedData.evaluatedBy,
          evaluatedAt: validatedData.evaluatedAt
        },
        createdAt: new Date(validatedData.evaluatedAt)
      },
      update: {
        score: validatedData.totalScore,
        level: getScoreLevel(validatedData.totalScore),
        questionScores: Object.entries(validatedData.metrics).reduce((acc, [key, value]) => ({
          ...acc,
          [key]: { score: value.score, comment: value.comment }
        }), {}),
        metadata: {
          summary: validatedData.overallComment,
          overallLevel: getScoreLevel(validatedData.totalScore),
          aiGenerated: false,
          evaluatedBy: validatedData.evaluatedBy,
          evaluatedAt: validatedData.evaluatedAt
        }
      }
    });

    // Calculate and update the combined score
    const evaluations = await prisma.evaluation.findMany({
      where: { applicationId }
    });

    const aiEvaluation = evaluations.find(
      evaluation => evaluation.metadata?.aiGenerated === true
    );
    const manualEvaluation = evaluations.find(
      evaluation => evaluation.metadata?.aiGenerated === false
    );

    if (aiEvaluation && manualEvaluation) {
      const combinedScore = (aiEvaluation.score + manualEvaluation.score) / 2;
      
      await prisma.application.update({
        where: { id: applicationId },
      data: {
          score: combinedScore,
          level: getScoreLevel(combinedScore),
          lastEvaluatedAt: new Date()
        }
      });
    } else {
      await prisma.application.update({
        where: { id: applicationId },
      data: {
          score: evaluation.score,
          level: evaluation.level,
          lastEvaluatedAt: new Date()
        }
      });
    }

    return NextResponse.json(evaluation);
  } catch (error) {
    console.error("Error in evaluate application:", error);
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 400 });
    }
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

function getScoreLevel(score: number): "HIGH" | "MEDIUM" | "LOW" {
  if (score >= 75) return "HIGH";
  if (score >= 50) return "MEDIUM";
  return "LOW";
}