export interface Application {
  id: string
  status: string
  formData: Record<string, string>
  email?: string
  phone?: string
  user?: {
    id: string
    name: string
    email: string
    avatar?: string
  }
}

export interface AIEvaluation {
  id: string
  applicationId: string
  evaluatorId: string
  score: number
  evaluation: string
  questionScores?: Record<string, number>
  strengths?: string[]
  improvements?: string[]
  createdAt: string
  updatedAt: string
}