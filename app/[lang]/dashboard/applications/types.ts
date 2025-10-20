export type Applicant = {
  name: string
  email: string
  phone: string
  location: string
  avatar?: string
}

export type Application = {
  id: string
  applicant: Applicant
  status: string
  lastUpdated: string
  submittedDate: string
  position: string
  score: number
  documents: Array<{
    name: string
    status: 'verified' | 'pending' | 'missing'
  }>
  education: string
  experience: string
  skills: string[]
  motivation: string
  goals: string
  availability: string
  formData: {
    q1?: string
    q2?: string
    q3?: string
    q4?: string
    q5?: string
    q6?: string
    q7?: string
    q8?: string
    q9?: string
    q11?: string
    q17?: string
    [key: string]: any
  }
} 