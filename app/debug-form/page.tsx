"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import {
  getFormConfig,
  getFormSectionByStep,
  type FormConfig,
  type FormSection,
  type FormQuestion,
} from "@/lib/form-service"

export default function DebugForm() {
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<any>({})
  const [formConfig, setFormConfig] = useState<FormConfig | null>(null)
  const [currentSection, setCurrentSection] = useState<FormSection | null>(null)

  useEffect(() => {
    const config = getFormConfig()
    setFormConfig(config)
    setCurrentSection(getFormSectionByStep(currentStep))
  }, [currentStep])

  const validateField = (question: FormQuestion, value: any): string | null => {
    console.log("🔍 Validating field:", question.id, "type:", question.type, "value:", value)

    if (question.type === "dependent-dropdown") {
      console.log("📍 Processing dependent dropdown for:", question.id)
      console.log("📍 Current formData:", formData)

      if (question.required) {
        const province = formData.province
        const district = formData.district
        const sector = formData.sector
        const cell = formData.cell
        const village = formData.village

        console.log("📍 Location fields:", { province, district, sector, cell, village })

        if (!province || !district || !sector || !cell || !village) {
          return "Please complete all address fields"
        }
      }
      return null
    }

    if (question.required && (!value || (typeof value === "string" && value.trim() === ""))) {
      return `${question.label} is required`
    }

    return null
  }

  const validateCurrentSection = (): boolean => {
    if (!currentSection) return true

    console.log("🚀 Starting validation for section:", currentSection.title)
    console.log("🚀 Current formData:", JSON.stringify(formData, null, 2))

    const errors: any[] = []

    try {
      currentSection.questions.forEach((question) => {
        console.log("🔄 Processing question:", question.id, "type:", question.type)

        let value

        if (question.type === "dependent-dropdown") {
          console.log("🎯 Dependent dropdown detected for:", question.id)
          // Don't try to access formData[question.id] for dependent dropdown
          value = {
            province: formData.province,
            district: formData.district,
            sector: formData.sector,
            cell: formData.cell,
            village: formData.village,
          }
          console.log("🎯 Using location data as value:", value)
        } else {
          console.log("🎯 Regular field, accessing formData[" + question.id + "]")
          value = formData[question.id]
          console.log("🎯 Field value:", value)
        }

        const error = validateField(question, value)
        console.log("🎯 Validation result for", question.id, ":", error)

        if (error) {
          errors.push({ field: question.id, message: error })
        }
      })
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message)
      } else {
        console.error(String(error))
      }
      return false
    }

    console.log("✅ Validation complete. Errors:", errors)

    if (errors.length > 0) {
      toast({
        title: "Validation Error",
        description: `Please fix ${errors.length} error(s) before proceeding.`,
        variant: "destructive",
      })
      return false
    }

    return true
  }

  const nextStep = () => {
    console.log("🚀 Next button clicked")
    console.log("🚀 Current step:", currentStep)
    console.log("🚀 Current section:", currentSection?.title)
    console.log("🚀 Form data before validation:", JSON.stringify(formData, null, 2))

    try {
      const isValid = validateCurrentSection()
      console.log("🚀 Validation result:", isValid)

      if (isValid) {
        setCurrentStep(currentStep + 1)
        toast({
          title: "Success",
          description: "Validation passed! Moving to next step.",
        })
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message)
      } else {
        console.error(String(error))
      }
      toast({
        title: "Error",
        description: "An error occurred during validation. Check console for details.",
        variant: "destructive",
      })
    }
  }

  const updateFormData = (field: string, value: any) => {
    console.log("📝 Updating form data:", field, "=", value)
    const newFormData = { ...formData, [field]: value }
    setFormData(newFormData)
    console.log("📝 New form data:", JSON.stringify(newFormData, null, 2))
  }

  if (!formConfig || !currentSection) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Debug Form - Step {currentStep}</CardTitle>
            <p className="text-sm text-gray-600">{currentSection.title}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentSection.questions.map((question) => (
              <div key={question.id} className="space-y-2">
                <label className="text-sm font-medium">
                  {question.label} {question.required && <span className="text-red-500">*</span>}
                </label>

                {question.type === "dependent-dropdown" ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Province"
                      value={formData.province || ""}
                      onChange={(e) => updateFormData("province", e.target.value)}
                      className="w-full p-2 border rounded"
                    />
                    <input
                      type="text"
                      placeholder="District"
                      value={formData.district || ""}
                      onChange={(e) => updateFormData("district", e.target.value)}
                      className="w-full p-2 border rounded"
                    />
                    <input
                      type="text"
                      placeholder="Sector"
                      value={formData.sector || ""}
                      onChange={(e) => updateFormData("sector", e.target.value)}
                      className="w-full p-2 border rounded"
                    />
                    <input
                      type="text"
                      placeholder="Cell"
                      value={formData.cell || ""}
                      onChange={(e) => updateFormData("cell", e.target.value)}
                      className="w-full p-2 border rounded"
                    />
                    <input
                      type="text"
                      placeholder="Village"
                      value={formData.village || ""}
                      onChange={(e) => updateFormData("village", e.target.value)}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                ) : (
                  <input
                    type="text"
                    placeholder={question.placeholder}
                    value={formData[question.id] || ""}
                    onChange={(e) => updateFormData(question.id, e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                )}
              </div>
            ))}

            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                disabled={currentStep === 1}
              >
                Previous
              </Button>

              <Button onClick={nextStep}>Next</Button>
            </div>

            <div className="mt-4 p-4 bg-gray-100 rounded">
              <h3 className="font-medium mb-2">Current Form Data:</h3>
              <pre className="text-xs overflow-auto">{JSON.stringify(formData, null, 2)}</pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
