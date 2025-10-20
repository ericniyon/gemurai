import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuthToken } from "@/lib/token"
import { openai } from "@/lib/openai"
import { questionTitles } from "@/lib/form-service"
import { evaluateApplication } from '@/lib/ai-evaluation-service'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { hasAnyPermission } from '@/lib/auth'
import { cookies } from "next/headers"
import { evaluateVulnerability } from "@/lib/vulnerability-evaluation-service"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// Vulnerability scoring parameters
const VULNERABILITY_PARAMETERS = {
  INCOME_EMPLOYMENT: {
    weight: 20,
    scores: { A: 5, B: 10, C: 20 },
    title: "Income & Employment",
    description: "Direct economic need"
  },
  DIGITAL_ACCESS: {
    weight: 15,
    scores: { A: 5, B: 10, C: 15 },
    title: "Digital Access & Literacy",
    description: "Critical for program success"
  },
  MARITAL_FAMILY: {
    weight: 10,
    scores: { A: 0, B: 5, C: 10 },
    title: "Marital & Family Status",
    description: "Caregiver burden"
  },
  FEMALE_HEADED: {
    weight: 10,
    scores: { A: 0, B: 5, C: 10 },
    title: "Female-Headed Household",
    description: "Gendered vulnerability"
  },
  DISABILITY: {
    weight: 10,
    scores: { A: 0, B: 5, C: 10 },
    title: "Disability/Chronic Illness",
    description: "Capacity constraints"
  },
  HOUSING: {
    weight: 10,
    scores: { A: 0, B: 5, C: 10 },
    title: "Housing & Living Conditions",
    description: "Environmental vulnerability"
  },
  SOCIAL_CAPITAL: {
    weight: 10,
    scores: { A: 0, B: 5, C: 10 },
    title: "Social Capital",
    description: "Community resilience"
  },
  EDUCATION: {
    weight: 5,
    scores: { A: 0, B: 0, C: 5 },
    title: "Education",
    description: "Minimum eligibility"
  },
  RESIDENCE: {
    weight: 5,
    scores: { A: 0, B: 0, C: 5 },
    title: "Residence in Targeted Sector",
    description: "Geographic priority"
  },
  AGE: {
    weight: 5,
    scores: { A: 0, B: 3, C: 5 },
    title: "Age (18-24 priority)",
    description: "Youth targeting"
  }
}

// Helper function to determine vulnerability level
function determineVulnerabilityLevel(value: any, parameter: string): 'A' | 'B' | 'C' {
  switch (parameter) {
    case 'INCOME_EMPLOYMENT':
      const monthlyIncome = Number(value?.monthlyIncome) || 0
      const employmentStatus = value?.employmentStatus?.toLowerCase() || ''
      
      if (monthlyIncome > 300000 || employmentStatus.includes('full_time')) return 'A'
      if (monthlyIncome > 100000 || employmentStatus.includes('part_time')) return 'B'
      return 'C'

    case 'DIGITAL_ACCESS':
      const deviceOwnership = value?.deviceOwnership?.toLowerCase() || ''
      const internetAccess = value?.internetAccess?.toLowerCase() || ''
      
      if (deviceOwnership.includes('smartphone') && internetAccess.includes('regular')) return 'A'
      if (deviceOwnership.includes('basic') || internetAccess.includes('limited')) return 'B'
      return 'C'

    case 'MARITAL_FAMILY':
      const dependents = Number(value?.dependents) || 0
      const maritalStatus = value?.maritalStatus?.toLowerCase() || ''
      
      if (dependents === 0 && !maritalStatus.includes('married')) return 'A'
      if (dependents <= 2) return 'B'
      return 'C'

    case 'FEMALE_HEADED':
      const gender = value?.gender?.toLowerCase() || ''
      const isHouseholdHead = value?.isHouseholdHead === true || value?.isHouseholdHead === 'yes'
      
      if (gender === 'female' && isHouseholdHead) return 'C'
      if (gender === 'female') return 'B'
      return 'A'

    case 'DISABILITY':
      const hasDisability = value?.hasDisability === true || value?.hasDisability === 'yes'
      const hasChronicIllness = value?.hasChronicIllness === true || value?.hasChronicIllness === 'yes'
      const hasMildHealthIssues = value?.hasMildHealthIssues === true || value?.hasMildHealthIssues === 'yes'
      
      if (hasDisability || hasChronicIllness) return 'C'
      if (hasMildHealthIssues) return 'B'
      return 'A'

    case 'HOUSING':
      const housingType = value?.housingType?.toLowerCase() || ''
      const housingOwnership = value?.housingOwnership?.toLowerCase() || ''
      
      if (housingOwnership.includes('owned') && housingType.includes('permanent')) return 'A'
      if (housingOwnership.includes('rented') && housingType.includes('semi')) return 'B'
      return 'C'

    case 'SOCIAL_CAPITAL':
      const communityInvolvement = value?.communityInvolvement?.toLowerCase() || ''
      const associations = value?.associations?.toLowerCase() || ''
      
      if (communityInvolvement.includes('leadership') || associations.includes('active')) return 'A'
      if (communityInvolvement.includes('member') || associations.includes('member')) return 'B'
      return 'C'

    case 'EDUCATION':
      const educationYears = Number(value?.educationYears) || 0
      const highestLevel = value?.highestLevel?.toLowerCase() || ''
      
      if (educationYears >= 12 || highestLevel.includes('secondary')) return 'A'
      if (educationYears >= 9 || highestLevel.includes('primary')) return 'B'
      return 'C'

    case 'RESIDENCE':
      const sector = value?.sector?.toLowerCase() || ''
      const district = value?.district?.toLowerCase() || ''
      
      if (sector.includes('target') || district.includes('target')) return 'C'
      if (sector.includes('nearby') || district.includes('nearby')) return 'B'
      return 'A'

    case 'AGE':
      let age = Number(value) || 0
      if (typeof value === 'string' && value.includes('/')) {
        // Handle date of birth format
        const birthDate = new Date(value)
        const today = new Date()
        age = today.getFullYear() - birthDate.getFullYear()
      }
      
      if (age >= 18 && age <= 24) return 'C'
      if (age > 24 && age <= 30) return 'B'
      return 'A'

    default:
      return 'B'
  }
}

// Function to get vulnerability level description
function getVulnerabilityLevelDescription(level: string): string {
  switch (level) {
    case 'A': return '🟢 Low Vulnerability'
    case 'B': return '🟡 Moderate Vulnerability'
    case 'C': return '🔴 High Vulnerability'
    default: return '⚪ Unknown'
  }
}

// Function to evaluate application based on vulnerability parameters
function evaluateVulnerability(formData: any) {
  const scores: Record<string, { score: number, level: string }> = {}
  let totalScore = 0
  const strengths: string[] = []
  const improvements: string[] = []
  const recommendations: string[] = []

  // Evaluate each parameter
  Object.entries(VULNERABILITY_PARAMETERS).forEach(([key, param]) => {
    const value = formData[key.toLowerCase()]
    const level = determineVulnerabilityLevel(value, key)
    const score = param.scores[level]
    
    scores[param.title] = { score, level }
    totalScore += score

    // Add to strengths or improvements based on score
    if (score === param.scores.A) {
      strengths.push(`${param.title}: ${param.description}`)
    } else if (score === param.scores.C) {
      improvements.push(`${param.title}: ${param.description}`)
      recommendations.push(`Consider providing additional support for ${param.title.toLowerCase()} through targeted interventions and resources.`)
    }
  })

  // Calculate overall vulnerability level
  let overallLevel = 'A'
  if (totalScore >= 70) overallLevel = 'C'
  else if (totalScore >= 40) overallLevel = 'B'

  // Generate detailed feedback
  const feedback = `
╔════════════════════════════════════════════════════════════════╗
║                   VULNERABILITY ASSESSMENT REPORT                ║
╚════════════════════════════════════════════════════════════════╝

📊 OVERALL ASSESSMENT
──────────────────────────────────────────────────────────────────
Total Vulnerability Score: ${totalScore}/100
Overall Status: ${getVulnerabilityLevelDescription(overallLevel)}

📈 DETAILED PARAMETER SCORES
──────────────────────────────────────────────────────────────────
${Object.entries(scores)
  .map(([title, { score, level }]) => 
    `${getVulnerabilityLevelDescription(level)}  ${title}
    Score: ${score} points | Weight: ${VULNERABILITY_PARAMETERS[Object.keys(VULNERABILITY_PARAMETERS).find(k => VULNERABILITY_PARAMETERS[k].title === title)!].weight}%`
  )
  .join('\n\n')}

💪 IDENTIFIED STRENGTHS
──────────────────────────────────────────────────────────────────
${strengths.length > 0 ? strengths.map(s => `✓ ${s}`).join('\n') : 'No significant strengths identified.'}

⚠️ AREAS OF HIGH VULNERABILITY
──────────────────────────────────────────────────────────────────
${improvements.length > 0 ? improvements.map(i => `! ${i}`).join('\n') : 'No high vulnerability areas identified.'}

📋 RECOMMENDATIONS
──────────────────────────────────────────────────────────────────
${recommendations.length > 0 ? recommendations.map(r => `→ ${r}`).join('\n') : 'No specific recommendations at this time.'}

📌 NEXT STEPS
──────────────────────────────────────────────────────────────────
1. Review the identified areas of high vulnerability
2. Implement recommended support measures
3. Schedule follow-up assessment in 3-6 months
4. Monitor progress on vulnerability reduction efforts

Note: This assessment is based on the information provided in the application
and should be validated through follow-up interactions with the applicant.
──────────────────────────────────────────────────────────────────`

  return {
    overallScore: totalScore,
    questionScores: scores,
    strengths,
    improvements,
    feedback,
    overallLevel,
    recommendations
  }
}

// Map form data to vulnerability parameters
function mapFormDataToVulnerabilityParams(formData: any) {
  return {
    income_employment: {
      monthlyIncome: formData.monthlyIncome || formData.income || formData.q_income,
      employmentStatus: formData.employmentStatus || formData.employment || formData.q_employment
    },
    digital_access: {
      deviceOwnership: formData.deviceOwnership || formData.devices || formData.q_devices,
      internetAccess: formData.internetAccess || formData.internet || formData.q_internet
    },
    marital_family: {
      dependents: formData.dependents || formData.familySize || formData.q_dependents,
      maritalStatus: formData.maritalStatus || formData.q_marital
    },
    female_headed: {
      gender: formData.gender || formData.q_gender,
      isHouseholdHead: formData.isHouseholdHead || formData.householdHead || formData.q_household_head
    },
    disability: {
      hasDisability: formData.hasDisability || formData.disability || formData.q_disability,
      hasChronicIllness: formData.hasChronicIllness || formData.chronicIllness || formData.q_health,
      hasMildHealthIssues: formData.hasMildHealthIssues || formData.healthIssues || formData.q_health_issues
    },
    housing: {
      housingType: formData.housingType || formData.housing || formData.q_housing,
      housingOwnership: formData.housingOwnership || formData.ownership || formData.q_housing_ownership
    },
    social_capital: {
      communityInvolvement: formData.communityInvolvement || formData.community || formData.q_community,
      associations: formData.associations || formData.groups || formData.q_associations
    },
    education: {
      educationYears: formData.educationYears || formData.education || formData.q_education,
      highestLevel: formData.highestLevel || formData.educationLevel || formData.q_education_level
    },
    residence: {
      sector: formData.sector || formData.location || formData.q_sector,
      district: formData.district || formData.q_district
    },
    age: formData.age || formData.q_age || formData.dateOfBirth
  }
}

// Mock AI evaluation function for development
function generateMockEvaluation(formData: any) {
  const mappedData = mapFormDataToVulnerabilityParams(formData)
  return evaluateVulnerability(mappedData)
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Get application
    const application = await prisma.application.findUnique({
      where: { id: params.id },
      include: {
        evaluations: true,
        user: true
      }
    })

    if (!application) {
      return new NextResponse("Application not found", { status: 404 })
    }

    // First do vulnerability assessment
    const vulnerabilityResults = await evaluateVulnerability(application.id, "cmcv36wln0000dd01moxtiex9")
    
    // Then do AI evaluation
    const aiEvaluation = await evaluateApplication(application.formData, vulnerabilityResults.scores)

    // Save combined evaluation
    const evaluation = await prisma.applicationEvaluation.create({
      data: {
        applicationId: application.id,
        evaluatorId: "cmcv36wln0000dd01moxtiex9",
        type: "AI",
        score: aiEvaluation.score,
        totalScore: aiEvaluation.score,
        questionScores: {
          ...vulnerabilityResults.scores,
          ...aiEvaluation.questionScores
        },
        feedback: aiEvaluation.feedback,
        metadata: {
          vulnerabilityScore: vulnerabilityResults.totalScore,
          aiScore: aiEvaluation.score,
          strengths: [...vulnerabilityResults.strengths, ...aiEvaluation.strengths],
          improvements: [...vulnerabilityResults.improvements, ...aiEvaluation.improvements],
          recommendations: vulnerabilityResults.recommendations
        }
      }
    })

    // Update application status
    await prisma.application.update({
      where: { id: application.id },
      data: {
        status: "EVALUATED",
        lastEvaluatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      evaluation
    })
  } catch (error) {
    console.error("Error in AI evaluation:", error)
    return NextResponse.json(
      { error: "Failed to evaluate application" },
      { status: 500 }
    )
  }
}
