"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Loader2, CheckCircle, AlertCircle } from "lucide-react"

export default function SeedInterviewCriteriaPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const { toast } = useToast()

  const handleSeedCriteria = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/v1/admin/seed-interview-criteria", {
        method: "POST",
        credentials: "include",
      })

      const data = await response.json()
      setResult(data)

      if (data.success) {
        toast({
          title: "Success",
          description: data.message,
        })
      } else {
        toast({
          title: "Error",
          description: data.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error seeding criteria:", error)
      toast({
        title: "Error",
        description: "Failed to seed interview criteria",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Seed Interview Criteria</h1>
          <p className="text-sm text-gray-500">
            Initialize the database with interview criteria for the Interview Guide and Interview Scoring functionality
          </p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Interview Criteria Setup</CardTitle>
          <CardDescription>
            This will add 20 standard interview criteria to the database for use in interview scoring and guides.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">Important Note</h4>
                <p className="text-sm text-blue-700 mt-1">
                  This operation will only add criteria if none exist. If criteria already exist, 
                  the operation will be skipped to prevent duplicates.
                </p>
              </div>
            </div>
          </div>
          
          <Button 
            onClick={handleSeedCriteria} 
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Seeding Criteria...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Seed Interview Criteria
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Result</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-4 rounded-lg">
              <pre className="text-sm overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 