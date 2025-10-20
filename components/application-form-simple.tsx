"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { AuthHeader } from "@/components/auth-header"
import { AuthFooter } from "@/components/auth-footer"
import { ChevronLeft, ChevronRight, CheckCircle, User, MapPin, GraduationCap } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface FormData {
  [key: string]: string
}

export default function ApplicationFormSimple() {
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const totalSteps = 3
  const progress = (currentStep / totalSteps) * 100

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      // Simulate submission
      await new Promise((resolve) => setTimeout(resolve, 2000))

      toast({
        title: "Application Submitted!",
        description: "Thank you for your application. We'll be in touch soon.",
      })

      // Reset form
      setFormData({})
      setCurrentStep(1)
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <User className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Personal Information</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName || ""}
                  onChange={(e) => updateFormData("firstName", e.target.value)}
                  placeholder="Enter your first name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName || ""}
                  onChange={(e) => updateFormData("lastName", e.target.value)}
                  placeholder="Enter your last name"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ""}
                onChange={(e) => updateFormData("email", e.target.value)}
                placeholder="your.email@example.com"
                required
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone || ""}
                onChange={(e) => updateFormData("phone", e.target.value)}
                placeholder="+250 7XX XXX XXX"
                required
              />
            </div>

            <div>
              <Label htmlFor="dateOfBirth">Date of Birth *</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth || ""}
                onChange={(e) => updateFormData("dateOfBirth", e.target.value)}
                required
              />
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Location & Background</h3>
            </div>

            <div>
              <Label htmlFor="province">Province *</Label>
              <Select value={formData.province || ""} onValueChange={(value) => updateFormData("province", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your province" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kigali">Kigali City</SelectItem>
                  <SelectItem value="northern">Northern Province</SelectItem>
                  <SelectItem value="southern">Southern Province</SelectItem>
                  <SelectItem value="eastern">Eastern</SelectItem>
                  <SelectItem value="western">Western Province</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="education">Education Level *</Label>
              <Select value={formData.education || ""} onValueChange={(value) => updateFormData("education", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your education level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="primary">Primary Education</SelectItem>
                  <SelectItem value="secondary">Secondary Education</SelectItem>
                  <SelectItem value="tvet">TVET Certificate</SelectItem>
                  <SelectItem value="diploma">Diploma</SelectItem>
                  <SelectItem value="bachelor">Bachelor's Degree</SelectItem>
                  <SelectItem value="master">Master's Degree</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="experience">Work Experience</Label>
              <Textarea
                id="experience"
                value={formData.experience || ""}
                onChange={(e) => updateFormData("experience", e.target.value)}
                placeholder="Describe your work experience..."
                rows={4}
              />
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <GraduationCap className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Motivation & Goals</h3>
            </div>

            <div>
              <Label htmlFor="motivation">Why do you want to join Gemurai? *</Label>
              <Textarea
                id="motivation"
                value={formData.motivation || ""}
                onChange={(e) => updateFormData("motivation", e.target.value)}
                placeholder="Tell us about your motivation to become a Digital Community Champion..."
                rows={4}
                required
              />
            </div>

            <div>
              <Label htmlFor="goals">What are your goals? *</Label>
              <Textarea
                id="goals"
                value={formData.goals || ""}
                onChange={(e) => updateFormData("goals", e.target.value)}
                placeholder="Describe your personal and professional goals..."
                rows={4}
                required
              />
            </div>

            <div>
              <Label htmlFor="availability">Availability</Label>
              <Select
                value={formData.availability || ""}
                onValueChange={(value) => updateFormData("availability", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your availability" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fulltime">Full-time (40+ hours/week)</SelectItem>
                  <SelectItem value="parttime">Part-time (20-39 hours/week)</SelectItem>
                  <SelectItem value="flexible">Flexible (10-19 hours/week)</SelectItem>
                  <SelectItem value="weekends">Weekends only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AuthHeader />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">DCC Application Form</CardTitle>
              <CardDescription>Join Gemurai as a Digital Community Champion</CardDescription>

              <div className="mt-4">
                <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                  <span>
                    Step {currentStep} of {totalSteps}
                  </span>
                  <span>{Math.round(progress)}% Complete</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            </CardHeader>

            <CardContent className="space-y-6">{renderStep()}</CardContent>

            <div className="flex justify-between p-6 border-t">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>

              {currentStep < totalSteps ? (
                <Button onClick={nextStep} className="flex items-center gap-2">
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Application
                      <CheckCircle className="h-4 w-4" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>

      <AuthFooter />
    </div>
  )
}
