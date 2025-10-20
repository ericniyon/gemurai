"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { ChevronLeft, ChevronRight, Eye } from "lucide-react"
import { ApplicationPreview } from "./application-preview"
import { formatRwandaPhoneNumber } from '@/lib/utils/phone-utils'

interface FormData {
  firstName: string
  lastName: string
  email?: string
  phone: string
  message: string
}

interface FormErrors {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  message?: string
}

interface MultiStepFormProps {
  onSubmit: (data: FormData) => void
  isSubmitting?: boolean
}

// Helper function to format phone numbers
function formatPhoneNumber(phone: string): string | null {
  return formatRwandaPhoneNumber(phone);
}

export default function MultiStepForm({ onSubmit, isSubmitting = false }: MultiStepFormProps) {
  const { toast } = useToast()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    message: ''
  })
  const [showPreview, setShowPreview] = useState(false)

  const totalSteps = 3
  const progress = (step / (totalSteps + 1)) * 100 // +1 for preview step

  const validateStep = (currentStep: number): boolean => {
    const errors: string[] = []

    switch (currentStep) {
      case 1:
        if (!formData.firstName?.trim()) errors.push("First name is required")
        if (!formData.lastName?.trim()) errors.push("Last name is required")
        break
      case 2:
        // Email is optional
        if (formData.email?.trim() && !isValidEmail(formData.email)) {
          errors.push("Invalid email format")
        }
        if (!formData.phone?.trim()) errors.push("Phone is required")
        break
      case 3:
        if (!formData.message?.trim()) errors.push("Message is required")
        break
    }

    if (errors.length > 0) {
      errors.forEach(error => {
        toast({
          title: "Validation Error",
          description: error,
          variant: "destructive"
        })
      })
      return false
    }

    return true
  }

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    setStep(step - 1)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateStep(step)) {
      onSubmit(formData)
    }
  }

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const renderFormStep = (step: number) => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => updateFormData('firstName', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => updateFormData('lastName', e.target.value)}
                required
              />
            </div>
          </div>
        )
      case 2:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email (Optional)</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => updateFormData('email', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => updateFormData('phone', e.target.value)}
                required
              />
            </div>
          </div>
        )
      case 3:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="message">Message</Label>
              <Input
                id="message"
                value={formData.message}
                onChange={(e) => updateFormData('message', e.target.value)}
                required
              />
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Application Form</CardTitle>
      </CardHeader>
      
      <Progress value={progress} className="mb-4" />
      
      <CardContent>
        {showPreview ? (
          <ApplicationPreview
            formData={formData}
            onBack={() => setShowPreview(false)}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            {renderFormStep(step)}

            <div className="flex justify-between">
              {step > 1 && (
                <Button type="button" onClick={handleBack} variant="outline">
                  Back
                </Button>
              )}
              {step < 3 ? (
                <Button type="button" onClick={handleNext}>
                  Next
                </Button>
              ) : (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </Button>
              )}
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  )
} 