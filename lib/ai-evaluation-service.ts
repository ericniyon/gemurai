import OpenAI from 'openai'
import { Application } from '@prisma/client'

// Lazy initialization of OpenAI client
let openaiInstance: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!openaiInstance) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured');
    }
    openaiInstance = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }
  return openaiInstance;
}

// Scoring criteria for the AI to follow
const VULNERABILITY_SCORING_CRITERIA = {
  income_employment: {
    maxPoints: 20,
    criteria: [
      "Low income or unemployment",
      "Informal employment",
      "Seasonal work",
      "Multiple jobs to make ends meet"
    ]
  },
  digital_access: {
    maxPoints: 15,
    criteria: [
      "No smartphone or computer",
      "Limited internet access",
      "No digital skills",
      "Cannot afford data"
    ]
  },
  family_status: {
    maxPoints: 10,
    criteria: [
      "Single parent",
      "Large family size",
      "Dependents to support",
      "Family member with special needs"
    ]
  },
  female_headed_household: {
    maxPoints: 10,
    criteria: [
      "Female-headed household",
      "Gender-based barriers",
      "Limited access to resources",
      "Cultural constraints"
    ]
  },
  disability_chronic_illness: {
    maxPoints: 10,
    criteria: [
      "Physical disability",
      "Chronic illness",
      "Mental health challenges",
      "Caregiver responsibilities"
    ]
  },
  housing_conditions: {
    maxPoints: 10,
    criteria: [
      "Poor housing quality",
      "Overcrowded living conditions",
      "Unstable housing situation",
      "High rent burden"
    ]
  },
  education_skills: {
    maxPoints: 15,
    criteria: [
      "Low education level",
      "No formal training",
      "Skills mismatch",
      "Limited access to education"
    ]
  },
  social_capital: {
    maxPoints: 10,
    criteria: [
      "Limited social networks",
      "No community support",
      "Isolation",
      "Language barriers"
    ]
  }
}

const SCREENING_CRITERIA = [
  "Willing to attend training: Must be 'Yes' or auto-reject",
  "Can travel within sector: 'No' should be flagged",
  "Device ownership: 'No' requires training adjustment"
]

export async function evaluateApplication(formData: any, vulnerabilityScores?: Record<string, { score: number, level: string }>) {
  try {
    // Extract relevant information from form data
    const extractedData = {
      personalInfo: {
        firstName: formData.q1 || formData.firstName,
        lastName: formData.q2 || formData.lastName,
        email: formData.q9 || formData.q7 || formData.email,
        phone: formData.q10 || formData.q8 || formData.phone,
        gender: formData.q4 || formData.gender,
        dateOfBirth: formData.q3 || formData.dateOfBirth,
        nationalId: formData.q5 || formData.nationalId
      },
      location: {
        province: formData.q11?.province || formData.province,
        district: formData.q11?.district || formData.district,
        sector: formData.q11?.sector || formData.sector,
        cell: formData.q11?.cell || formData.cell,
        village: formData.q11?.village || formData.village
      },
      education: {
        educationLevel: formData.q12 || formData.educationLevel,
        yearsOfEducation: formData.q13 || formData.yearsOfEducation,
        skills: formData.q14 || formData.skills || [],
        languages: formData.q20 || formData.languages || []
      },
      employment: {
        employmentStatus: formData.q15 || formData.employmentStatus,
        currentPosition: formData.q16 || formData.currentPosition,
        employer: formData.q17 || formData.employer,
        yearsExperience: formData.q18 || formData.yearsExperience,
        monthlyIncome: formData.q19 || formData.monthlyIncome
      },
      digitalAccess: {
        hasSmartphone: formData.hasSmartphone,
        hasInternet: formData.hasInternet,
        digitalSkills: formData.digitalSkills || []
      },
      familyStatus: {
        maritalStatus: formData.maritalStatus,
        dependents: formData.dependents,
        isHouseholdHead: formData.isHouseholdHead
      },
      health: {
        hasDisability: formData.hasDisability,
        hasChronicIllness: formData.hasChronicIllness,
        healthIssues: formData.healthIssues
      },
      housing: {
        housingType: formData.housingType,
        hasUtilities: formData.hasUtilities
      },
      community: {
        communityInvolvement: formData.communityInvolvement,
        supportNetwork: formData.supportNetwork
      }
    }

    // Prepare the evaluation prompt
    const prompt = `You are an expert evaluator for a vulnerability assessment program. Please evaluate the following application data and provide scores based on our criteria.

Application Data:
${JSON.stringify(extractedData, null, 2)}

${vulnerabilityScores ? `
Existing Vulnerability Scores:
${JSON.stringify(vulnerabilityScores, null, 2)}
` : ''}

Scoring Criteria:
${Object.entries(VULNERABILITY_SCORING_CRITERIA)
  .map(([category, { maxPoints, criteria }]) => 
    `${category} (Max ${maxPoints}pts):
${criteria.map(c => "- " + c).join("\n")}`)
  .join("\n\n")}

Screening Criteria:
${SCREENING_CRITERIA.map(c => "- " + c).join("\n")}

Please provide:
1. Detailed scoring breakdown for each category
2. Total vulnerability score
3. Any screening flags or concerns
4. Brief explanation of the scoring decisions
5. Recommendations for support

Format your response as JSON with the following structure:
{
  "categoryScores": {
    "category_name": {
      "score": number,
      "breakdown": string[],
      "explanation": string
    }
  },
  "totalScore": number,
  "screeningResults": {
    "autoReject": boolean,
    "flags": string[],
    "adjustments": string[]
  },
  "explanation": string,
  "recommendations": string[]
}`

    // Get AI evaluation
    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-1106",
      messages: [
        {
          role: "system",
          content: "You are an expert evaluator for a vulnerability assessment program. Provide detailed, objective evaluations based on the given criteria."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    })

    // Parse and validate the response
    const evaluation = JSON.parse(completion.choices[0].message.content)

    // Convert scores to A/B/C format for the matrix
    const questionScores = Object.entries(evaluation.categoryScores).reduce((acc, [category, data]) => {
      const { score, maxPoints } = VULNERABILITY_SCORING_CRITERIA[category]
      const percentage = (data.score / maxPoints) * 100
      
      acc[category] = percentage >= 80 ? "C" : 
                     percentage >= 40 ? "B" : "A"
      return acc
    }, {})

    // Combine with existing vulnerability scores if provided
    if (vulnerabilityScores) {
      Object.assign(questionScores, vulnerabilityScores)
    }

    return {
      type: 'AI',
      score: evaluation.totalScore,
      questionScores,
      feedback: evaluation.explanation,
      strengths: evaluation.recommendations.filter(r => r.startsWith("Strength:")),
      improvements: evaluation.recommendations.filter(r => r.startsWith("Area for support:")),
      screeningResults: evaluation.screeningResults,
      rawEvaluation: evaluation
    }
  } catch (error) {
    console.error('AI Evaluation error:', error)
    throw new Error('Failed to evaluate application')
  }
} 