"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  User,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Briefcase,
  Heart,
  CheckCircle,
  ArrowLeft,
  Send,
} from "lucide-react"

interface PreviewProps {
  formData: Record<string, any>
  onBack: () => void
  onSubmit: () => void
  isSubmitting: boolean
}

export function ApplicationPreview({ formData, onBack, onSubmit, isSubmitting }: PreviewProps) {
  const renderSection = (title: string, icon: React.ReactNode, data: Record<string, any>) => {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-lg font-semibold">
          {icon}
          <h3>{title}</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-8">
          {Object.entries(data).map(([key, value]) => (
            <div key={key} className="space-y-1">
              <p className="text-sm font-medium text-gray-500">{key}</p>
              <p className="text-sm">
                {Array.isArray(value) ? (
                  <div className="flex flex-wrap gap-1">
                    {value.map((item, i) => (
                      <Badge key={i} variant="secondary">
                        {item}
                      </Badge>
                    ))}
                  </div>
                ) : typeof value === "object" ? (
                  JSON.stringify(value)
                ) : (
                  value || "Not provided"
                )}
              </p>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Group form data into sections
  const personalInfo = {
    "Full Name": `${formData.firstName || ""} ${formData.lastName || ""}`.trim() || "Not provided",
    "Date of Birth": formData.dateOfBirth || "Not provided",
    "Gender": formData.gender || "Not provided",
    "National ID": formData.nationalId || "Not provided",
  }

  const contactInfo = {
    "Email": formData.email || "Not provided",
    "Phone Number": formData.phone || "Not provided",
    "Address": formData.address || "Not provided",
    "Location": formData.location ? 
      `${formData.location.province || ""}, ${formData.location.district || ""}, ${formData.location.sector || ""}`.trim() : 
      "Not provided",
  }

  const educationInfo = {
    "Education Level": formData.educationLevel || "Not provided",
    "Field of Study": formData.fieldOfStudy || "Not provided",
    "Institution": formData.institution || "Not provided",
    "Graduation Year": formData.graduationYear || "Not provided",
  }

  const experienceInfo = {
    "Current Employment": formData.currentEmployment || "Not provided",
    "Years of Experience": formData.yearsOfExperience || "Not provided",
    "Skills": formData.skills || [],
    "Languages": formData.languages || [],
  }

  const motivationInfo = {
    "Why do you want to join?": formData.motivation || "Not provided",
    "What are your goals?": formData.goals || "Not provided",
    "Availability": formData.availability || "Not provided",
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          Application Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-green-50 border border-green-100 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-6 w-6 text-green-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-green-800">Review Your Application</h3>
              <p className="text-sm text-green-700 mt-1">
                Please review all your information carefully before submitting. You can go back to make changes if needed.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {renderSection("Personal Information", <User className="h-5 w-5" />, personalInfo)}
          <Separator />
          {renderSection("Contact Information", <Mail className="h-5 w-5" />, contactInfo)}
          <Separator />
          {renderSection("Education", <GraduationCap className="h-5 w-5" />, educationInfo)}
          <Separator />
          {renderSection("Experience & Skills", <Briefcase className="h-5 w-5" />, experienceInfo)}
          <Separator />
          {renderSection("Motivation", <Heart className="h-5 w-5" />, motivationInfo)}
        </div>

        <div className="flex justify-between items-center pt-6">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Edit
          </Button>
          <Button onClick={onSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              "Submitting..."
            ) : (
              <>
                Submit Application
                <Send className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 