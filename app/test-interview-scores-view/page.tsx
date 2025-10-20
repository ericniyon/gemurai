"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Search, Eye } from "lucide-react"
import InterviewScoresView from "@/components/interviews/InterviewScoresView"

export default function TestInterviewScoresViewPage() {
  const [applicationId, setApplicationId] = useState("APP-1751273501176-sb52oc9")
  const [applicantName, setApplicantName] = useState("Test Applicant")
  const [showScores, setShowScores] = useState(false)

  const handleViewScores = () => {
    if (applicationId.trim()) {
      setShowScores(true)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Interview Scores Viewer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="applicationId">Application ID</Label>
                  <Input
                    id="applicationId"
                    value={applicationId}
                    onChange={(e) => setApplicationId(e.target.value)}
                    placeholder="Enter application ID"
                  />
                </div>
                <div>
                  <Label htmlFor="applicantName">Applicant Name (Optional)</Label>
                  <Input
                    id="applicantName"
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    placeholder="Enter applicant name"
                  />
                </div>
              </div>
              <Button onClick={handleViewScores} className="w-full md:w-auto">
                <Search className="h-4 w-4 mr-2" />
                View Interview Scores
              </Button>
            </div>
          </CardContent>
        </Card>

        {showScores && (
          <InterviewScoresView 
            applicationId={applicationId} 
            applicantName={applicantName}
          />
        )}

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-gray-600">
              <p>• Enter an application ID to view interview scores for that application</p>
              <p>• Only interviewers (EMPLOYER, INTERVIEWER, SUPER_ADMIN) can view scores</p>
              <p>• The scores will show the overall score in the format: "Points Scored: X.X points"</p>
              <p>• Detailed breakdown by category and individual questions will be displayed</p>
              <p>• Sample application ID: APP-1751273501176-sb52oc9</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 