"use client"

import { useState } from "react"
import { toast } from "sonner"
import { useNavigate } from "@/lib/navigation"
import ApplicationFormFixed from "./application-form-fixed"
import { Card, CardContent } from "@/components/ui/card"

export interface AgentDashboardFormProps {
  initialApplicationId?: string;
  isSessionExpired?: boolean;
  lang?: 'en' | 'rw';
}

export default function AgentDashboardForm({ initialApplicationId, isSessionExpired, lang = 'en' }: AgentDashboardFormProps) {
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSuccess = () => {
    setIsSubmitted(true)
    toast.success("Application submitted successfully!", {
      description: "You can now submit another application or view your submitted applications.",
    })
  }

  if (isSubmitted) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <h3 className="text-lg font-semibold text-green-600">{lang === 'rw' ? "Ubusabe bwoherejwe neza!" : "Application Submitted Successfully!"}</h3>
            <p className="text-muted-foreground">
              {lang === 'rw' ? "Ubusabe bwawe bwoherejwe. Ushobora kohereza ubundi busabe cyangwa kureba ubwasubijwe." : "Your application has been submitted. You can submit another application or view your submitted applications."}
            </p>
            <button
              onClick={() => setIsSubmitted(false)}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
            >
              {lang === 'rw' ? "Ohereza ubundi busabe" : "Submit Another Application"}
            </button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <ApplicationFormFixed
      initialApplicationId={initialApplicationId}
      isSessionExpired={isSessionExpired}
      onSubmitSuccess={handleSuccess}
      lang={lang}
    />
  )
} 