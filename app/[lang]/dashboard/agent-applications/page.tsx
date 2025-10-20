"use client"

import { useState, useEffect, Suspense } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { useAuth } from "@/hooks/use-auth"
import dynamic from "next/dynamic"
import { Loader2, AlertCircle } from "lucide-react"
import { getAgentApplications } from "./actions"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import type { Application } from "@prisma/client"

// Import the agent dashboard form
const AgentDashboardForm = dynamic(
  () => import("@/components/agent-dashboard-form"),
  {
    ssr: false,
    loading: () => <LoadingComponent />,
  }
)

// Import the applications list
const AgentApplicationsList = dynamic(
  () => import("./agent-applications-list"),
  {
    ssr: false,
    loading: () => <LoadingComponent />,
  }
)

function LoadingComponent() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card>
        <CardContent className="pt-6 flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <p className="text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    </div>
  )
}

function ErrorDisplay({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center justify-center py-6 space-y-4">
          <AlertCircle className="h-8 w-8 text-red-500" />
          <div className="text-center">
            <p className="text-lg font-medium text-red-600">Error Loading Applications</p>
            <p className="text-sm text-gray-500 mt-1">{message}</p>
          </div>
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            Try Again
          </button>
        </div>
      </CardContent>
    </Card>
  )
}

function ApplicationContent() {
  const params = useParams()
  const lang = (params?.lang as string) === 'rw' ? 'rw' : 'en'
  const { user } = useAuth()
  const [applicationId] = useState(`APP-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`)
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchApplications = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const result = await getAgentApplications()
      
      if (result.redirect) {
        // Handle redirect if needed
        window.location.href = result.redirect
        return
      }
      
      if (result.error) {
        setError(result.error)
        toast.error("Error", {
          description: result.error
        })
      } else {
        setApplications(result.applications || [])
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch applications"
      setError(errorMessage)
      toast.error("Error", {
        description: errorMessage
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchApplications()
  }, [])

  if (user?.role !== "AGENT") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              You do not have permission to access this page.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <Tabs defaultValue="applications" className="space-y-6">
        <TabsList>
          <TabsTrigger value="applications">{lang === 'rw' ? 'Ubusabe Bwanjye' : 'My Applications'}</TabsTrigger>
          <TabsTrigger value="new">{lang === 'rw' ? 'Ohereza Ubusabe Bushya' : 'Submit New Application'}</TabsTrigger>
        </TabsList>

        <TabsContent value="applications" className="space-y-4">
          {isLoading ? (
            <LoadingComponent />
          ) : error ? (
            <ErrorDisplay message={error} onRetry={fetchApplications} />
          ) : (
            <AgentApplicationsList 
              applications={applications}
            />
          )}
        </TabsContent>

        <TabsContent value="new">
          <AgentDashboardForm 
            initialApplicationId={applicationId}
            lang={lang}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default function AgentApplicationPage() {
  return (
    <Suspense fallback={<LoadingComponent />}>
      <ApplicationContent />
    </Suspense>
  )
} 