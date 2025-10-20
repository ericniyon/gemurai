import { notFound } from "next/navigation"
import { getApplicationWithAuth } from "./actions"
import { Suspense } from "react"
import { Loader2 } from "lucide-react"

interface ApplicationLayoutProps {
  children: React.ReactNode
  params: {
    id: string
    lang: string
  }
}

async function getApplicationData(params: { id: string; lang: string }) {
  try {
    const result = await getApplicationWithAuth(params.id)

    if (result.error) {
      if (result.errorType === "NOT_FOUND") {
        notFound()
      }
      throw new Error(result.error)
    }

    return result
  } catch (error) {
    console.error("Error fetching application:", error)
    throw error
  }
}

export default async function ApplicationLayout({ children, params }: ApplicationLayoutProps) {
  // Get application data without auth check
  const awaitedParams = await params
  await getApplicationData(awaitedParams)

  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    }>
      {children}
    </Suspense>
  )
} 