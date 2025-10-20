"use client"

import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

interface FormData {
  province: string
  district: string
  sector: string
  cell: string
  village: string
}

// Define the types and functions that are currently missing
interface ValidationError {
  field: string
  message: string
}

interface FormConfig {
  sections: {
    questions: {
      id: string
      type: string
    }[]
  }[]
}

interface ApplicationData {
  id: string
  phone: string
  email?: string
  status: string
  createdAt: string
  updatedAt: string
  formData: any
  currentStep: number
}

// Mock implementations for the missing functions
const getFormConfig = (): FormConfig => {
  return {
    sections: [
      {
        questions: [
          { id: "q1", type: "text" },
          { id: "q2", type: "text" },
          { id: "q7", type: "email" },
          { id: "q8", type: "phone" },
        ],
      },
    ],
  }
}

const validateField = (question: any, value: any): string | undefined => {
  // Basic validation example
  if (question.required && !value) {
    return "This field is required."
  }
  return undefined
}

const markApplicationAsSubmitted = async (applicationId: string) => {
  // Mock implementation
  console.log(`Marking application ${applicationId} as submitted`)
  return Promise.resolve()
}

const saveApplicationProgress = async (data: ApplicationData) => {
  // Mock implementation
  console.log("Saving application progress:", data)
  return Promise.resolve()
}

const sendApplicationSubmissionEmail = async (email: string, name: string) => {
  // Mock implementation
  console.log(`Sending submission email to ${email} for ${name}`)
  return Promise.resolve({ success: true })
}

const clearSession = () => {
  // Mock implementation
  console.log("Clearing session")
}

const formConfig = {
  sections: [], // Replace with your actual form configuration
}

export default function ApplicationForm() {
  const { toast } = useToast()
  const router = useRouter()

  // Initialize formData with empty address fields to prevent undefined errors
  const [formData, setFormData] = useState<FormData>({
    province: "",
    district: "",
    sector: "",
    cell: "",
    village: "",
  })
  const [addressData, setAddressData] = useState<FormData>({
    province: "",
    district: "",
    sector: "",
    cell: "",
    village: "",
  })
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [applicationId, setApplicationId] = useState<string | null>(null)
  const [totalSteps, setTotalSteps] = useState(0)
  const [hasActiveSession, setHasActiveSession] = useState(false)
  const [sessionExpired, setSessionExpired] = useState(false)

  const handleSubmit = async () => {
    if (!formConfig) return

    // Final validation before submission
    let allValid = true
    const allErrors: ValidationError[] = []

    // Get the latest form configuration to ensure we're validating against current admin settings
    const currentFormConfig = getFormConfig()

    // Validate all sections from the current form configuration
    currentFormConfig.sections.forEach((section) => {
      section.questions.forEach((question) => {
        if (question.type === "dependent-dropdown") {
          // Validate address data directly
          const error = validateField(question, addressData)
          if (error) {
            allErrors.push({
              field: question.id,
              message: error,
            })
            allValid = false
          }
        } else {
          // Regular field validation
          const value = (formData as any)[question.id]
          const error = validateField(question, value)
          if (error) {
            allErrors.push({
              field: question.id,
              message: error,
            })
            allValid = false
          }
        }
      })
    })

    if (!allValid) {
      setValidationErrors(allErrors)
      toast({
        title: "Validation Error",
        description: `Please fix ${allErrors.length} error(s) before submitting your application.`,
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Mark application as submitted and convert to permanent
      if (applicationId) {
        await markApplicationAsSubmitted(applicationId)

        // Merge form data with address data
        const mergedData = {
          ...formData,
          ...addressData,
        }

        // Also update the status to "submitted" to ensure it appears in employer dashboard
        const updatedApplicationData: ApplicationData = {
          id: applicationId,
          phone: (formData as any).q8 || "",
          email: (formData as any).q7 || "",
          status: "submitted", // Ensure status is set to submitted
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          formData: mergedData,
          currentStep: totalSteps + 1,
        }

        await saveApplicationProgress(updatedApplicationData)

        // Auto-approve and create user account
        try {
          const autoApprovalResponse = await fetch("/api/v1/applications/auto-approve", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              applicationId: applicationId,
              autoCreateUser: true,
            }),
          })

          const autoApprovalResult = await autoApprovalResponse.json()

          if (autoApprovalResult.success && autoApprovalResult.userCreated) {
            toast({
              title: "Application Submitted & Account Created!",
              description: `Your application has been approved and your ${autoApprovalResult.user.role} account has been created. Check your email for login instructions.`,
            })
          } else {
            // Fallback to regular submission success
            // Notifications are handled automatically by the backend API
            toast({
              title: "Application Submitted Successfully!",
              description:
                "We'll review your application and get back to you within 3-5 business days. Check your email and SMS for confirmation.",
            })
            // Redirect to home page
            router.push('/rw');
          }
        } catch (autoApprovalError) {
          console.error("Auto-approval failed, falling back to manual review:", autoApprovalError)

          // Notifications are handled automatically by the backend API
          // No need to send additional notifications from frontend
          toast({
            title: "Application Submitted Successfully!",
            description:
              "We'll review your application and get back to you within 3-5 business days. Check your email and SMS for confirmation.",
          })
        }
      }

      // Clear session after successful submission
      clearSession()
      setHasActiveSession(false)
      setSessionExpired(false)
    } catch (error) {
      console.error("Submission failed:", error)
      toast({
        title: "Submission Failed",
        description: "Failed to submit application. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Rest of the component...
  return (
    <div>
      <h1>Application Form</h1>
      {/* TODO: Add form fields and UI here */}
    </div>
  );
}
