import { notFound } from "next/navigation"
import { getApplicationWithAuth } from "./actions"
import { SimpleApplicationDetail } from "./simple-application-detail"

interface ApplicationPageProps {
  params: {
    id: string
    lang: string
  }
  searchParams: { [key: string]: string | string[] | undefined }
}

interface ApplicationEvaluation {
  id: string
  score: number
  questionScores: Record<string, any>
  createdAt: string
  metadata?: {
    summary: string
    overallLevel: "LOW" | "MEDIUM" | "HIGH"
  }
}

interface ApplicationResult {
  application?: {
    id: string
    formData: any
    evaluations: ApplicationEvaluation[]
  }
  user?: {
    id: string
    role: string
    permissions: string[]
  }
  permissions?: {
    canView: boolean
    canEdit: boolean
    canDelete: boolean
    canEvaluate: boolean
  }
  error?: string
  errorType?: string
}

// This ensures params are properly handled in Next.js
export async function generateStaticParams() {
  return [
    { lang: 'en' },
    { lang: 'rw' }
  ]
}

async function getPageData(params: { id: string; lang: string }) {
  try {
    const result = await getApplicationWithAuth(params.id)

    // Handle not found case
    if (result.error && result.errorType === "NOT_FOUND") {
      return notFound()
    }

    // Handle other errors
    if (result.error) {
      console.error("Error fetching application:", result.error)
      throw new Error("Failed to load application")
    }

    return result
  } catch (error) {
    console.error("Error in getPageData:", error)
    throw new Error("An unexpected error occurred")
  }
}

export default async function ApplicationPage({ params }: ApplicationPageProps) {
  try {
    const awaitedParams = await params
    const result = await getApplicationWithAuth(awaitedParams.id) as ApplicationResult

    // Handle not found case
    if (!result || result.error || !result.application || !result.user || !result.permissions) {
      notFound()
    }

    return (
      <SimpleApplicationDetail 
        application={result.application}
        user={result.user}
        permissions={result.permissions}
      />
    )
  } catch (error) {
    console.error("Error loading application:", error)
    notFound()
  }
}
