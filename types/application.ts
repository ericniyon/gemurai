import { Application, User, ApplicationEvaluation } from "@prisma/client"

export interface Application {
  id: string
  status: string
  formData: {
    [key: string]: any
    q20?: string[]  // Languages field
  }
  createdAt: string
  updatedAt: string
}

export interface DCC {
  id: string
  status: string
  documentType: string
  documentNumber: string
  issuedDate: string
  expiryDate: string
  issuedBy: string
}

export interface ApplicationData {
  id: string
  phone: string
  email?: string
  status: string
  formData: {
    [key: string]: any
    q1?: string  // First Name
    q2?: string  // Last Name
    q7?: string  // Email (alternative)
    q8?: string  // Phone (alternative)
    q9?: string  // Email
    q10?: string // Phone
    q20?: string[] // Languages
  }
  currentStep: number
  notes?: string
  dccCreated: boolean
  createdAt?: string
  updatedAt?: string
  autoCreatedAt?: string
  lastActivity?: string
}

export interface ValidationResult {
  isValid: boolean
  missingFields: string[]
  errorMessage?: string
}

export interface ApplicationEvaluation {
  id: string
  applicationId: string
  evaluatorId: string
  type: string
  score: number
  totalScore: number
  scores: any
  overallLevel: string
  recommendations: {
    vulnerabilityRecommendations: string[]
    aiRecommendations: string[]
  }
  questionScores: {
    vulnerability: any
    ai: any
  }
  metadata: {
    vulnerabilityScore: number
    aiScore: number
    strengths: string[]
    improvements: string[]
  }
  createdAt: string
  updatedAt: string
}

export interface ApplicationWithRelations extends Application {
  user?: User | null
  evaluations?: ApplicationEvaluation[]
} 