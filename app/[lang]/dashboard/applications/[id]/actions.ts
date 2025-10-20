'use server'

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { verifyAuthToken } from "@/lib/auth-middleware"
import { canViewApplications, canManageApplications, canReviewApplications } from "@/lib/auth"

export async function getApplicationWithAuth(id: string) {
  try {
    if (!id) {
      return {
        error: "Application ID is required",
        errorType: "INVALID_INPUT"
      }
    }

    // First try to get from database
    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        evaluations: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            score: true,
            questionScores: true,
            createdAt: true,
            metadata: true
          }
        }
      }
    }).catch(error => {
      console.error("Database error:", error)
      return null
    })

    if (application) {
      // Set default permissions for public view
      const permissions = {
        canView: true,
        canEdit: false,
        canDelete: false,
        canEvaluate: false
      }

      return {
        application: {
          id: application.id,
          formData: application.formData,
          evaluations: application.evaluations.map(evaluation => ({
            id: evaluation.id,
            score: evaluation.score,
            questionScores: evaluation.questionScores,
            createdAt: evaluation.createdAt.toISOString(),
            metadata: evaluation.metadata
          }))
        },
        user: {
          id: "public",
          role: "public",
          permissions: ["applications.view"]
        },
        permissions
      }
    }

    // If not found in database, try to get from Google Sheets
    console.log("🔍 Application not found in database, checking if it's a Google Sheets application")
    
    // Import GoogleSheetsService to fetch the specific application
    const { GoogleSheetsService } = await import("@/lib/services/google-sheets-service")
    
    try {
      // Fetch all applications from Google Sheets
      const googleSheetsResult = await GoogleSheetsService.fetchApplicationsWithFallback()
      
      if (googleSheetsResult.source === 'google-sheets' && googleSheetsResult.data.length > 0) {
        // Find the specific application by ID
        const googleSheetsApp = googleSheetsResult.data.find(app => app.id === id)
        
        if (googleSheetsApp) {
          console.log("✅ Found application in Google Sheets:", googleSheetsApp.id)
          
          const permissions = {
            canView: true,
            canEdit: false,
            canDelete: false,
            canEvaluate: false
          }

          return {
            application: {
              id: googleSheetsApp.id,
              formData: googleSheetsApp.formData || {},
              evaluations: googleSheetsApp.evaluations || []
            },
            user: {
              id: "public",
              role: "public",
              permissions: ["applications.view"]
            },
            permissions
          }
        }
      }
    } catch (error) {
      console.error("❌ Error fetching from Google Sheets:", error)
    }
    
    // If still not found, return a basic structure
    const mockApplication = {
      id: id,
      formData: {
        'ID': id,
        'First Name': 'Google Sheets',
        'Lat Name': 'Application',
        'Total Score': 'N/A',
        'Vulnerability Category': 'Unknown',
        'district': 'Unknown',
        'Phone Number': 'N/A'
      },
      evaluations: []
    }

    const permissions = {
      canView: true,
      canEdit: false,
      canDelete: false,
      canEvaluate: false
    }

    return {
      application: {
        id: mockApplication.id,
        formData: mockApplication.formData,
        evaluations: mockApplication.evaluations
      },
      user: {
        id: "public",
        role: "public",
        permissions: ["applications.view"]
      },
      permissions
    }
  } catch (error) {
    console.error("Error fetching application:", error)
    return {
      error: "Failed to fetch application data",
      errorType: "SERVER_ERROR"
    }
  }
}

interface VulnerabilityScore {
  score: number
  level: "LOW" | "MEDIUM" | "HIGH"
  reason?: string
}

interface VulnerabilityAssessment {
  totalScore: number
  scores: Record<string, VulnerabilityScore>
  summary: string
  overallLevel: "LOW" | "MEDIUM" | "HIGH"
}

export async function evaluateVulnerability(applicationId: string): Promise<VulnerabilityAssessment> {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  // Get application data
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      formData: true
    }
  })

  if (!application) {
    throw new Error("Application not found")
  }

  const formData = application.formData

  // Calculate scores for each metric
  const scores: Record<string, VulnerabilityScore> = {
    "Income & Employment": calculateIncomeScore(formData),
    "Digital Access": calculateDigitalAccessScore(formData),
    "Family Status": calculateFamilyStatusScore(formData),
    "Female-Headed Household": calculateFemaleHeadedScore(formData),
    "Disability/Health Status": calculateHealthScore(formData),
    "Housing Conditions": calculateHousingScore(formData),
    "Social Capital": calculateSocialCapitalScore(formData),
    "Education Level": calculateEducationScore(formData),
    "Geographic Location": calculateLocationScore(formData),
    "Age Factor": calculateAgeScore(formData)
  }

  // Calculate total score
  const totalScore = Object.values(scores).reduce((sum, score) => sum + score.score, 0)

  // Determine overall level
  const overallLevel = totalScore >= 70 ? "HIGH" : totalScore >= 40 ? "MEDIUM" : "LOW"

  // Generate summary
  const summary = generateSummary(scores, totalScore, overallLevel)

  // Save evaluation
  await prisma.evaluation.create({
    data: {
      type: "VULNERABILITY",
      score: totalScore,
      questionScores: scores,
      metadata: {
        summary,
        overallLevel
      },
      applicationId,
      evaluatorId: session.user.id
    }
  })

  // Revalidate the application page
  revalidatePath(`/[lang]/dashboard/applications/${applicationId}`)

  return {
    totalScore,
    scores,
    summary,
    overallLevel
  }
}

// Helper functions for calculating individual scores

function calculateIncomeScore(formData: any): VulnerabilityScore {
  const monthlyIncome = Number(formData.monthly_income) || 0
  const hasStableJob = formData.employment_status === "EMPLOYED"
  const hasBusinessIncome = formData.has_business_income === "YES"

  let score = 0
  let reason = []

  if (monthlyIncome < 50000) {
    score += 20
    reason.push("Very low income")
  } else if (monthlyIncome < 100000) {
    score += 15
    reason.push("Low income")
  } else if (monthlyIncome < 200000) {
    score += 10
    reason.push("Moderate income")
  }

  if (!hasStableJob) {
    score += 5
    reason.push("No stable employment")
  }

  if (!hasBusinessIncome) {
    score += 5
    reason.push("No business income")
  }

  return {
    score,
    level: score >= 15 ? "HIGH" : score >= 10 ? "MEDIUM" : "LOW",
    reason: reason.join(", ")
  }
}

function calculateDigitalAccessScore(formData: any): VulnerabilityScore {
  const hasSmartphone = formData.has_smartphone === "YES"
  const hasInternet = formData.has_internet_access === "YES"
  const hasComputer = formData.has_computer === "YES"

  let score = 0
  let reason = []

  if (!hasSmartphone) {
    score += 5
    reason.push("No smartphone")
  }

  if (!hasInternet) {
    score += 5
    reason.push("No internet access")
  }

  if (!hasComputer) {
    score += 5
    reason.push("No computer")
  }

  return {
    score: Math.min(score, 15),
    level: score >= 10 ? "HIGH" : score >= 5 ? "MEDIUM" : "LOW",
    reason: reason.join(", ")
  }
}

function calculateFamilyStatusScore(formData: any): VulnerabilityScore {
  const dependents = Number(formData.number_of_dependents) || 0
  const isMarried = formData.marital_status === "MARRIED"

  let score = 0
  let reason = []

  if (dependents > 3) {
    score += 7
    reason.push("Many dependents")
  } else if (dependents > 0) {
    score += 4
    reason.push("Has dependents")
  }

  if (!isMarried) {
    score += 3
    reason.push("Single")
  }

  return {
    score: Math.min(score, 10),
    level: score >= 7 ? "HIGH" : score >= 4 ? "MEDIUM" : "LOW",
    reason: reason.join(", ")
  }
}

function calculateFemaleHeadedScore(formData: any): VulnerabilityScore {
  const isFemale = formData.gender === "FEMALE"
  const isHouseholdHead = formData.is_household_head === "YES"
  const hasSupport = formData.has_family_support === "YES"

  let score = 0
  let reason = []

  if (isFemale && isHouseholdHead) {
    score += 7
    reason.push("Female household head")
  }

  if (!hasSupport) {
    score += 3
    reason.push("No family support")
  }

  return {
    score: Math.min(score, 10),
    level: score >= 7 ? "HIGH" : score >= 4 ? "MEDIUM" : "LOW",
    reason: reason.join(", ")
  }
}

function calculateHealthScore(formData: any): VulnerabilityScore {
  const hasDisability = formData.has_disability === "YES"
  const hasChronicIllness = formData.has_chronic_illness === "YES"
  const hasHealthInsurance = formData.has_health_insurance === "YES"

  let score = 0
  let reason = []

  if (hasDisability) {
    score += 5
    reason.push("Has disability")
  }

  if (hasChronicIllness) {
    score += 3
    reason.push("Has chronic illness")
  }

  if (!hasHealthInsurance) {
    score += 2
    reason.push("No health insurance")
  }

  return {
    score: Math.min(score, 10),
    level: score >= 7 ? "HIGH" : score >= 4 ? "MEDIUM" : "LOW",
    reason: reason.join(", ")
  }
}

function calculateHousingScore(formData: any): VulnerabilityScore {
  const housingType = formData.housing_type
  const hasBasicUtilities = formData.has_basic_utilities === "YES"
  const isOwner = formData.housing_ownership === "OWNER"

  let score = 0
  let reason = []

  if (housingType === "TEMPORARY") {
    score += 5
    reason.push("Temporary housing")
  } else if (housingType === "SHARED") {
    score += 3
    reason.push("Shared housing")
  }

  if (!hasBasicUtilities) {
    score += 3
    reason.push("Lacks basic utilities")
  }

  if (!isOwner) {
    score += 2
    reason.push("Not a homeowner")
  }

  return {
    score: Math.min(score, 10),
    level: score >= 7 ? "HIGH" : score >= 4 ? "MEDIUM" : "LOW",
    reason: reason.join(", ")
  }
}

function calculateSocialCapitalScore(formData: any): VulnerabilityScore {
  const hasCommunitySupport = formData.has_community_support === "YES"
  const participatesInGroups = formData.participates_in_groups === "YES"
  const hasLocalNetwork = formData.has_local_network === "YES"

  let score = 0
  let reason = []

  if (!hasCommunitySupport) {
    score += 4
    reason.push("No community support")
  }

  if (!participatesInGroups) {
    score += 3
    reason.push("No group participation")
  }

  if (!hasLocalNetwork) {
    score += 3
    reason.push("Limited local network")
  }

  return {
    score: Math.min(score, 10),
    level: score >= 7 ? "HIGH" : score >= 4 ? "MEDIUM" : "LOW",
    reason: reason.join(", ")
  }
}

function calculateEducationScore(formData: any): VulnerabilityScore {
  const educationLevel = formData.education_level
  const hasVocationalTraining = formData.has_vocational_training === "YES"

  let score = 0
  let reason = []

  if (educationLevel === "NONE") {
    score += 5
    reason.push("No formal education")
  } else if (educationLevel === "PRIMARY") {
    score += 3
    reason.push("Primary education only")
  }

  if (!hasVocationalTraining) {
    score += 2
    reason.push("No vocational training")
  }

  return {
    score: Math.min(score, 5),
    level: score >= 4 ? "HIGH" : score >= 2 ? "MEDIUM" : "LOW",
    reason: reason.join(", ")
  }
}

function calculateLocationScore(formData: any): VulnerabilityScore {
  const isTargetArea = formData.is_target_area === "YES"
  const hasTransportAccess = formData.has_transport_access === "YES"

  let score = 0
  let reason = []

  if (!isTargetArea) {
    score += 3
    reason.push("Outside target area")
  }

  if (!hasTransportAccess) {
    score += 2
    reason.push("Limited transport access")
  }

  return {
    score: Math.min(score, 5),
    level: score >= 4 ? "HIGH" : score >= 2 ? "MEDIUM" : "LOW",
    reason: reason.join(", ")
  }
}

function calculateAgeScore(formData: any): VulnerabilityScore {
  const age = Number(formData.age) || 0

  let score = 0
  let reason = []

  if (age >= 18 && age <= 24) {
    score += 5
    reason.push("Youth (18-24)")
  } else if (age > 50) {
    score += 3
    reason.push("Over 50")
  }

  return {
    score: Math.min(score, 5),
    level: score >= 4 ? "HIGH" : score >= 2 ? "MEDIUM" : "LOW",
    reason: reason.join(", ")
  }
}

function generateSummary(
  scores: Record<string, VulnerabilityScore>,
  totalScore: number,
  overallLevel: string
): string {
  const highPriorityAreas = Object.entries(scores)
    .filter(([_, score]) => score.level === "HIGH")
    .map(([area]) => area)

  const summary = `Overall vulnerability level: ${overallLevel} (Score: ${totalScore}/100).`
    + (highPriorityAreas.length > 0
      ? ` High priority areas: ${highPriorityAreas.join(", ")}.`
      : " No high priority areas identified.")

  return summary
} 