export interface EvaluationQuestion {
  id: string
  category: string
  question: string
  type: "multiple_choice" | "text" | "rating" | "yes_no"
  options?: string[]
  weight: number
  required: boolean
}

export interface EvaluationAnswer {
  questionId: string
  answer: string | string[]
  isCorrect?: boolean
  score?: number
  comment?: string
  reviewerComment?: string
}

export interface ApplicationEvaluation {
  applicationId: string
  evaluatorId: string
  evaluatorName: string
  questions: EvaluationQuestion[]
  answers: EvaluationAnswer[]
  overallScore: number
  overallComment: string
  status: "draft" | "completed" | "sent"
  createdAt: string
  updatedAt: string
}

// Default evaluation questions for DCC applications
export const defaultEvaluationQuestions: EvaluationQuestion[] = [
  {
    id: "q1",
    category: "Technical Skills",
    question: "Rate the applicant's computer literacy level based on their application",
    type: "rating",
    weight: 15,
    required: true,
  },
  {
    id: "q2",
    category: "Technical Skills",
    question: "Does the applicant demonstrate adequate digital communication skills?",
    type: "yes_no",
    weight: 10,
    required: true,
  },
  {
    id: "q3",
    category: "Experience",
    question: "How would you rate the applicant's relevant work experience?",
    type: "multiple_choice",
    options: ["Excellent (5+ years)", "Good (3-5 years)", "Fair (1-3 years)", "Limited (< 1 year)", "No experience"],
    weight: 20,
    required: true,
  },
  {
    id: "q4",
    category: "Education",
    question: "Is the applicant's education level appropriate for the DCC role?",
    type: "yes_no",
    weight: 15,
    required: true,
  },
  {
    id: "q5",
    category: "Communication",
    question: "Rate the quality of the applicant's written responses in the application",
    type: "rating",
    weight: 15,
    required: true,
  },
  {
    id: "q6",
    category: "Motivation",
    question: "How well does the applicant articulate their motivation for joining Gemurai?",
    type: "multiple_choice",
    options: [
      "Excellent - Clear and compelling",
      "Good - Well articulated",
      "Fair - Adequate",
      "Poor - Unclear or weak",
    ],
    weight: 10,
    required: true,
  },
  {
    id: "q7",
    category: "Availability",
    question: "Is the applicant's availability suitable for the role requirements?",
    type: "yes_no",
    weight: 5,
    required: true,
  },
  {
    id: "q8",
    category: "Documentation",
    question: "Are all required documents properly submitted and verified?",
    type: "yes_no",
    weight: 10,
    required: true,
  },
]

// Save evaluation to localStorage
export const saveEvaluation = (evaluation: ApplicationEvaluation): void => {
  if (typeof window === "undefined") return

  try {
    const evaluationsStr = localStorage.getItem("Gemurai_evaluations") || "{}"
    const evaluations = JSON.parse(evaluationsStr)

    evaluations[evaluation.applicationId] = evaluation
    localStorage.setItem("Gemurai_evaluations", JSON.stringify(evaluations))
  } catch (error) {
    console.error("Failed to save evaluation:", error)
  }
}

// Get evaluation by application ID
export const getEvaluationByApplicationId = (applicationId: string): ApplicationEvaluation | null => {
  if (typeof window === "undefined") return null

  try {
    const evaluationsStr = localStorage.getItem("Gemurai_evaluations")
    if (!evaluationsStr) return null

    const evaluations = JSON.parse(evaluationsStr)
    return evaluations[applicationId] || null
  } catch (error) {
    console.error("Failed to get evaluation:", error)
    return null
  }
}

// Calculate overall score based on answers
export const calculateOverallScore = (answers: EvaluationAnswer[], questions: EvaluationQuestion[]): number => {
  let totalScore = 0
  let totalWeight = 0

  answers.forEach((answer) => {
    const question = questions.find((q) => q.id === answer.questionId)
    if (!question) return

    let score = 0

    switch (question.type) {
      case "rating":
        // Rating from 1-5, convert to percentage
        score = (Number.parseInt(answer.answer as string) / 5) * 100
        break
      case "yes_no":
        score = answer.answer === "Yes" ? 100 : 0
        break
      case "multiple_choice":
        // Score based on option selected
        const optionIndex = question.options?.indexOf(answer.answer as string) || 0
        const maxOptions = question.options?.length || 1
        score = ((maxOptions - optionIndex) / maxOptions) * 100
        break
      default:
        score = answer.score || 0
    }

    totalScore += score * (question.weight / 100)
    totalWeight += question.weight
  })

  return totalWeight > 0 ? Math.round(totalScore) : 0
}

// Create initial evaluation for an application
export const createInitialEvaluation = (applicationId: string, evaluatorName: string): ApplicationEvaluation => {
  return {
    applicationId,
    evaluatorId: "current-user", // In real app, get from auth
    evaluatorName,
    questions: defaultEvaluationQuestions,
    answers: [],
    overallScore: 0,
    overallComment: "",
    status: "draft",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}
