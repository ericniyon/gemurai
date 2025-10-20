"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Progress } from "@/components/ui/progress"
import { AuthHeader } from "@/components/auth-header"
import { AuthFooter } from "@/components/auth-footer"
import { DependentDropdown } from "@/components/dependent-dropdown"
import {
  User,
  Upload,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  FileText,
  GraduationCap,
  Briefcase,
  Heart,
  Save,
  Clock,
  BookOpen,
  Shield,
  AlertCircle,
  X,
  Database,
  MapPin,
  RefreshCw,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ResumeApplicationDialog } from "@/components/resume-application-dialog"
import { createSession, getActiveSession, updateSessionActivity, clearSession } from "@/lib/session-manager"
import { SessionTimer } from "@/components/session-timer"
import { useDatabaseStatus } from "@/hooks/use-database-status"
import {
  getFormConfig,
  getFormSectionByStep,
  getTotalSteps,
  type FormConfig,
  type FormSection,
  type FormQuestion,
} from "@/lib/form-service"
import { formatRwandaPhoneNumber, isValidRwandaPhoneNumber, formatPhoneInput } from '@/lib/utils/phone-utils';
import { getTranslation } from "@/lib/utils/translation-utils"
import { useRouter } from "next/navigation"

// Define types
interface FormData {
  [key: string]: any
}

interface ValidationError {
  field: string
  message: string
}

interface ApplicationData {
  id: string
  phone: string
  email?: string  // Make email optional
  status: string
  createdAt: string
  updatedAt: string
  formData: any
  currentStep: number
  notes?: string
  dccCreated?: boolean
  autoCreatedAt?: string
  lastActivity?: string
}

// Safe field access function
const safeGetFieldValue = (formData: FormData, fieldId: string, fieldType: string): any => {
  try {
    if (fieldType === "dependent-dropdown") {
      // For dependent dropdown, return location data object
      return {
        province: formData.province || "",
        district: formData.district || "",
        sector: formData.sector || "",
        cell: formData.cell || "",
        village: formData.village || "",
      }
    }

    // For regular fields, safely access the field
    return formData[fieldId] || ""
  } catch (error) {
    console.error(`Error accessing field ${fieldId}:`, error)
    return ""
  }
}

// Application storage functions
const saveApplicationProgress = async (applicationData: ApplicationData): Promise<ApplicationData> => {
  try {
    // Convert status to match database enum
    let dbStatus = applicationData.status.toUpperCase()
    if (dbStatus === "AUTO_CREATED" || dbStatus === "TEMPORARY") {
      dbStatus = "TEMPORARY"
    } else if (dbStatus === "SUBMITTED") {
      dbStatus = "SUBMITTED"
    } else if (dbStatus === "UNDER_REVIEW") {
      dbStatus = "UNDER_REVIEW"
    } else if (dbStatus === "PENDING_DOCUMENTS") {
      dbStatus = "PENDING_DOCUMENTS"
    } else if (dbStatus === "APPROVED") {
      dbStatus = "APPROVED"
    } else if (dbStatus === "REJECTED") {
      dbStatus = "REJECTED"
    }

    const response = await fetch("/api/v1/applications/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...applicationData,
        status: dbStatus,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("Failed to save application progress:", errorData)
      throw new Error(errorData.message || "Failed to save application")
    }

    const data = await response.json()

    if (!data.success) {
      throw new Error(data.message || "Failed to save application")
    }

    // Return the updated application data
    return {
      ...applicationData,
      id: data.data.id,
      createdAt: data.data.createdAt,
      updatedAt: data.data.updatedAt,
    }
  } catch (error) {
    console.error("Failed to save application progress:", error)
    throw error
  }
}

const getApplicationById = async (id: string): Promise<ApplicationData | null> => {
  try {
    // Get token from cookie
    const cookies = document.cookie.split(';')
    const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('Gemurai_token='))
    const token = tokenCookie ? tokenCookie.split('=')[1] : null

    if (!token) {
      throw new Error("No authentication token found")
    }

    const response = await fetch(`/api/v1/applications/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (response.status === 404) {
      return null // Return null for "not found" case
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `Failed to fetch application: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    if (!data.success || !data.application) {
      return null // Return null if no application data
    }

    // Convert database status to application status
    let appStatus = data.application.status.toLowerCase()
    if (appStatus === "temporary") {
      appStatus = "temporary"
    }

    return {
      id: data.application.id,
      phone: data.application.phone || "",
      email: data.application.email || "",
      status: appStatus,
      createdAt: data.application.createdAt,
      updatedAt: data.application.updatedAt,
      formData: data.application.formData || {},
      currentStep: data.application.currentStep || 1,
      notes: data.application.notes || null,
      dccCreated: data.application.dccCreated || false,
    }
  } catch (error) {
    console.error("Failed to get application by ID:", error)
    if (error instanceof Error && error.message.includes("Application not found")) {
      return null // Return null for "not found" error
    }
    throw error // Re-throw other errors
  }
}

const getApplicationByPhone = async (phone: string): Promise<ApplicationData | null> => {
  try {
    // Clean phone number for comparison
    const cleanPhone = phone.replace(/[^\d+]/g, '')
    let formattedPhone = cleanPhone

    // Handle +250 format
    if (cleanPhone.startsWith('+250')) {
      const digits = cleanPhone.slice(4) // Remove +250
      if (digits.length === 9) {
        formattedPhone = `+250 ${digits.slice(0,3)} ${digits.slice(3,6)} ${digits.slice(6)}`
      }
    }
    
    // Handle 07 format
    if (cleanPhone.startsWith('07')) {
      const digits = cleanPhone.slice(2) // Remove 07
      if (digits.length === 7) {
        formattedPhone = `+250 7${digits.slice(0,2)} ${digits.slice(2,5)} ${digits.slice(5)}`
      }
    }

    const response = await fetch(`/api/v1/applications/search?phone=${cleanPhone}`)

    if (!response.ok) {
      throw new Error("Failed to fetch application by phone")
    }

    const data = await response.json()

    if (!data.success || !data.data || data.data.length === 0) {
      return null
    }

    const application = data.data[0]

    // Convert database status to application status
    const appStatus = application.status.toLowerCase()

    return {
      id: application.id,
      phone: application.phone,
      email: application.email,
      status: appStatus,
      createdAt: application.createdAt,
      updatedAt: application.updatedAt,
      formData: application.formData,
      currentStep: application.currentStep,
      notes: application.notes,
      dccCreated: application.dccCreated,
    }
  } catch (error) {
    console.error("Failed to get application by phone:", error)
    return null
  }
}

const autoCreateApplication = async (
  formData: any,
  phone: string,
  email: string,
  currentStep: number,
): Promise<ApplicationData> => {
  const id = `auto_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const now = new Date().toISOString()

  const applicationData: ApplicationData = {
    id,
    phone: phone.trim(),
    email: email.trim(),
    status: "auto_created",
    createdAt: now,
    updatedAt: now,
    autoCreatedAt: now,
    lastActivity: now,
    formData,
    currentStep,
  }

  try {
    return await saveApplicationProgress(applicationData)
  } catch (error) {
    console.error("Failed to auto-create application:", error)
    throw error
  }
}

const upgradeToTemporaryApplication = async (id: string): Promise<void> => {
  try {
    const application = await getApplicationById(id)

    if (!application || application.status !== "auto_created") {
      return
    }

    application.status = "temporary"
    await saveApplicationProgress(application)
  } catch (error) {
    console.error("Failed to upgrade application to temporary:", error)
    throw error
  }
}

const markApplicationAsSubmitted = async (id: string): Promise<void> => {
  try {
    const application = await getApplicationById(id)

    if (!application) {
      throw new Error("Application not found")
    }

    application.status = "submitted"
    await saveApplicationProgress(application)
  } catch (error) {
    console.error("Failed to mark application as submitted:", error)
    throw error
  }
}

const hasAnyApplications = async (): Promise<boolean> => {
  try {
    const response = await fetch(`/api/v1/applications/count`)

    if (!response.ok) {
      throw new Error("Failed to check for applications")
    }

    const data = await response.json()
    return data.success && data.count > 0
  } catch (error) {
    console.error("Failed to check for applications:", error)
    return false
  }
}

const sendApplicationSubmissionEmail = async (email: string, name: string): Promise<{ success: boolean }> => {
  try {
    const response = await fetch(`/api/email/application-submission`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        name,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to send application submission email")
    }

    const data = await response.json()
    return { success: data.success }
  } catch (error) {
    console.error("Failed to send application submission email:", error)
    return { success: false }
  }
}

const getPublicApplicationData = async (id: string) => {
  try {
    const response = await fetch(`/api/v1/applications/public/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data.success ? data.application : null
  } catch (error) {
    console.error("Error fetching public application data:", error)
    return null
  }
}

export default function ApplicationFormSafe() {
  const { toast } = useToast()
  const router = useRouter()

  // Move ALL useState hooks to the top - no conditional hooks
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [applicationId, setApplicationId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [hasCreatedTempAccount, setHasCreatedTempAccount] = useState(false)
  const [hasActiveSession, setHasActiveSession] = useState(false)
  const [sessionExpired, setSessionExpired] = useState(false)
  const [formConfig, setFormConfig] = useState<FormConfig | null>(null)
  const [totalSteps, setTotalSteps] = useState(0)
  const [currentSection, setCurrentSection] = useState<FormSection | null>(null)
  const [showResumeDialog, setShowResumeDialog] = useState(false)
  const [hasSavedApplications, setHasSavedApplications] = useState(false)
  const [lastSaved, setLastSaved] = useState<string | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  // Custom hooks MUST be called unconditionally
  const { isConnected: isUsingDatabase, error: databaseError, isChecking: isDatabaseChecking } = useDatabaseStatus()

  // Move handleStartNewApplication here so it has access to state setters
  const handleStartNewApplication = () => {
    // Clear all session data
    clearSession()

    // Reset all application state
    setApplicationId(null)
    setFormData({})
    setCurrentStep(1)
    setHasCreatedTempAccount(false)
    setHasActiveSession(false)
    setSessionExpired(false)
    setLastSaved(null)
    setValidationErrors([])
    setTouchedFields(new Set())

    // Reset current section to first section
    if (formConfig) {
      setCurrentSection(getFormSectionByStep(1, formConfig))
    }

    // Show success message
    toast({
      title: "New Application Started",
      description: "You can now start filling out a fresh application form.",
    })
  }

  // Check for form configuration updates
  const checkForFormUpdates = useCallback(async () => {
    try {
      const latestConfig = await getFormConfig("dcc-application-form", "en")

      if (formConfig && latestConfig.updatedAt !== formConfig.updatedAt) {
        setFormConfig(latestConfig)
        setTotalSteps(getTotalSteps("en"))

        // Update current section if it still exists
        const updatedSection = getFormSectionByStep(currentStep, "en")
        if (updatedSection) {
          setCurrentSection(updatedSection)
        } else {
          // If current section no longer exists, go to first section
          setCurrentStep(1)
          setCurrentSection(getFormSectionByStep(1, "en"))
        }

        toast({
          title: "Form Updated",
          description: "The application form has been updated with the latest changes.",
        })
      }
    } catch (error) {
      console.error("Failed to check for form updates:", error)
    }
  }, [formConfig, currentStep, toast])

  // Load form configuration and active session
  useEffect(() => {
    const initializeForm = async () => {
      try {
        setIsLoading(true)
        setLoadError(null)

        console.log("🚀 Starting form initialization...")

        // Get form configuration from admin-managed form service with timeout
        try {
          const config = await getFormConfig("dcc-application-form", "en")
          console.log("✅ Form config loaded:", config)
          
          if (!config || !config.sections) {
            throw new Error("Invalid form configuration")
          }

          setFormConfig(config)
          setTotalSteps(getTotalSteps("en"))

          // If we have an application ID, try to load it
          if (applicationId) {
            try {
              const savedApplication = await getApplicationById(applicationId)
              if (savedApplication) {
                setFormData(savedApplication.formData || {})
                const step = savedApplication.currentStep || 1
                setCurrentStep(step)
                setCurrentSection(getFormSectionByStep(step, "en"))
              } else {
                // If application not found, start fresh
                console.log("🔄 Application not found, starting fresh form")
                handleStartNewApplication()
                setCurrentSection(getFormSectionByStep(1, "en"))
              }
            } catch (error) {
              if (error instanceof Error && error.message.includes("Application not found")) {
                console.log("🔄 Application not found, starting fresh form")
                handleStartNewApplication()
                setCurrentSection(getFormSectionByStep(1, "en"))
              } else {
                throw error // Re-throw other errors
              }
            }
          } else {
            // No application ID, start with first section
            setCurrentSection(getFormSectionByStep(1, "en"))
          }
        } catch (error) {
          console.error("❌ Failed to load form config:", error)
          // Use fallback form config
          const fallbackConfig: FormConfig = {
            id: "fallback-form",
            title: "Gemurai Application Form",
            description: "Digital Community Champion Application",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isActive: true,
            sections: [
              {
                id: "contact",
                title: "Contact Information",
                description: "Contact details for the applicant",
                order: 1,
                questions: [
                  {
                    id: "q7",
                    type: "email",
                    label: "Email Address (Optional)",
                    placeholder: "Enter your email",
                    required: false,
                    order: 3,
                  },
                  {
                    id: "q8",
                    type: "phone",
                    label: "Phone Number",
                    placeholder: "+250 7XX XXX XXX",
                    required: true,
                    order: 4,
                  },
                ],
              },
            ],
          }
          setFormConfig(fallbackConfig)
          setTotalSteps(fallbackConfig.sections.length)
          setCurrentStep(1)
          setCurrentSection(getFormSectionByStep(1, fallbackConfig))
        }
      } catch (error) {
        console.error("❌ Form initialization error:", error)
        setLoadError("Failed to initialize application form. Please try again.")
      } finally {
        setIsLoading(false)
        console.log("🏁 Form initialization finished")
      }
    }

    // Add a timeout for the entire initialization process
    const initWithTimeout = async () => {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Initialization timeout")), 10000),
      )

      try {
        await Promise.race([initializeForm(), timeoutPromise])
      } catch (error) {
        console.error("❌ Initialization timed out or failed:", error)
        setLoadError("Application form took too long to load. Please refresh the page.")
        setIsLoading(false)
      }
    }

    initWithTimeout()
  }, [applicationId, handleStartNewApplication])

  // Update current section when step changes
  useEffect(() => {
    if (formConfig) {
      const section = getFormSectionByStep(currentStep, formConfig)
      setCurrentSection(section)
      // Clear validation errors when changing steps
      setValidationErrors([])
      setTouchedFields(new Set())
    }
  }, [currentStep, formConfig])

  // Auto-create application when contact info is complete
  useEffect(() => {
    // Check if we're on the contact section (step 2) and have both phone and email
    if (
      currentStep === 2 &&
      !hasCreatedTempAccount &&
      formData.q7 && // email
      formData.q8 && // phone
      formData.q7.trim() !== "" &&
      formData.q8.trim() !== ""
    ) {
      autoCreateApplicationFromContactInfo()
    }
  }, [formData.q7, formData.q8, currentStep, hasCreatedTempAccount])

  const progress = formConfig ? (currentStep / (getTotalSteps(formConfig) + 1)) * 100 : 0 // +1 for preview step

  // Validation functions
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Format phone number for display and storage
  const formatPhoneNumber = (phone: string): string => {
    const formatted = formatRwandaPhoneNumber(phone);
    return formatted || phone;
  };

  const validatePhone = (phone: string): boolean => {
    return isValidRwandaPhoneNumber(phone);
  };

  // Update form data with proper phone formatting
  const updateFormData = (id: string, value: any) => {
    let formattedValue = value;
    
    // For phone fields, format while typing
    if ((id === 'q8' || id === 'q10' || id === 'q10b') && typeof value === 'string') {
      formattedValue = formatPhoneInput(value);
    }
    
    setFormData((prev) => ({
      ...prev,
      [id]: formattedValue,
    }));
  };

  // Handle field blur for formatting
  const handleBlur = (id: string) => {
    if ((id === 'q8' || id === 'q10' || id === 'q10b') && formData[id]) {
      const formatted = formatRwandaPhoneNumber(formData[id]);
      if (formatted) {
        setFormData((prev) => ({
          ...prev,
          [id]: formatted,
        }));
      }
    }
    markFieldAsTouched(id);
  };

  const validateNationalId = (id: string): boolean => {
    // Rwanda National ID format: 1 XXXX X XXXXXXX X XX (16 digits)
    const idRegex = /^[1-9]\s?\d{4}\s?\d\s?\d{7}\s?\d\s?\d{2}$/
    return idRegex.test(id)
  }

  // Validate field
  const validateField = (question: FormQuestion, value: any): string[] => {
    const errors: string[] = [];
    const label = question.label;

    try {
      // Required field validation
      if (question.required) {
        if (question.type === "dependent-dropdown") {
          // Handle address validation
          const addressData = value as any;
          if (!addressData || typeof addressData !== 'object') {
            errors.push("Please complete all address fields");
            return errors;
          }
          
          // Check each required address field
          const requiredFields = ['province', 'district', 'sector', 'cell', 'village'];
          const missingFields = requiredFields.filter(field => !addressData[field]);
          
          if (missingFields.length > 0) {
            errors.push("Please complete all address fields");
          }
        } else if (!value || (typeof value === "string" && value.trim() === "")) {
          errors.push(`${label} is required`);
        }
      }

      // Pattern validation
      if (question.validation?.pattern && value) {
        const pattern = new RegExp(question.validation.pattern);
        if (!pattern.test(value)) {
          errors.push(question.validation.message || "Invalid format");
        }
      }

      // Type-specific validation
      switch (question.type) {
        case "email":
          if (value && value.trim() !== "" && !validateEmail(value)) {
            errors.push("Please enter a valid email address");
          }
          break;

        case "text":
          // Name validation
          if ((question.id === "q1" || question.id === "q2") && value.length < 2) {
            errors.push(`${label} must be at least 2 characters`);
          }
          break;

        case "textarea":
          if (question.required && value.length < 10) {
            errors.push(`${label} must be at least 10 characters`);
          }
          break;
      }

      return errors;
    } catch (error) {
      console.error(`❌ Error validating field ${question.id}:`, error);
      return [`Error validating ${question.label}`];
    }
  };

  const validateCurrentSection = (): boolean => {
    if (!currentSection) return true;

    console.log("🚀 Starting validation for section:", currentSection.title);
    console.log("🚀 Current formData:", formData);

    const errors: ValidationError[] = [];
    const newTouchedFields = new Set(touchedFields);

    try {
      currentSection.questions.forEach((question) => {
        console.log(`🔄 Processing question: ${question.id} (${question.type})`);

        let value;
        if (question.type === "dependent-dropdown") {
          // For address fields, construct the value object from individual fields
          value = {
            province: formData.province || "",
            district: formData.district || "",
            sector: formData.sector || "",
            cell: formData.cell || "",
            village: formData.village || ""
          };
          console.log(`📍 Address data:`, value);
        } else {
          value = formData[question.id];
        }

        const fieldErrors = validateField(question, value);
        console.log(`🔄 Validation result for ${question.id}:`, fieldErrors);

        if (fieldErrors.length > 0) {
          fieldErrors.forEach((error) => {
            errors.push({
              field: question.id,
              message: error
            });
            newTouchedFields.add(question.id);
          });
        }
      });
    } catch (error) {
      console.error("❌ Error during section validation:", error);
      toast({
        title: "Validation Error",
        description: "An error occurred during validation. Please try again.",
        variant: "destructive"
      });
      return false;
    }

    setValidationErrors(errors);
    setTouchedFields(newTouchedFields);

    if (errors.length > 0) {
      console.log("❌ Validation errors found:", errors);
      toast({
        title: "Validation Error",
        description: `Please fix ${errors.length} error(s) before proceeding to the next section.`,
        variant: "destructive"
      });
      return false;
    }

    console.log("✅ Validation passed!");
    return true;
  };

  const getFieldError = (fieldId: string): string | null => {
    const error = validationErrors.find((err) => err.field === fieldId)
    return error ? error.message : null
  }

  const markFieldAsTouched = (fieldId: string) => {
    setTouchedFields((prev) => new Set([...prev, fieldId]))
  }

  const updateFormData = (field: string, value: any) => {
    console.log(`📝 Updating form data: ${field} = ${value}`)
    const updatedFormData = { ...formData, [field]: value }
    setFormData(updatedFormData)

    // Mark field as touched
    markFieldAsTouched(field)

    // Validate field in real-time if it was touched
    if (touchedFields.has(field)) {
      const question = currentSection?.questions.find((q) => q.id === field)
      if (question) {
        const fieldValue = safeGetFieldValue(updatedFormData, field, question.type)
        const error = validateField(question, fieldValue)
        setValidationErrors((prev) => {
          const filtered = prev.filter((err) => err.field !== field)
          if (error) {
            return [...filtered, { field, message: error }]
          }
          return filtered
        })
      }
    }

    // Auto-save if we have an application ID
    if (applicationId && hasCreatedTempAccount) {
      autoSaveProgress(updatedFormData)
    }
  }

  // Debounced auto-save
  const autoSaveProgress = async (updatedData: FormData) => {
    if (!applicationId) return

    try {
      const applicationData: ApplicationData = {
        id: applicationId,
        phone: updatedData.q8 || "", // phone field
        email: updatedData.q7 || "", // email field
        status: "temporary",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        formData: updatedData,
        currentStep,
      }

      const savedApp = await saveApplicationProgress(applicationData)
      updateSessionActivity(applicationId)
      setLastSaved(new Date().toLocaleTimeString())

      // Update application ID if it changed (new application created)
      if (savedApp.id !== applicationId) {
        setApplicationId(savedApp.id)
        createSession(savedApp.id)
      }
    } catch (error) {
      console.error("Auto-save failed:", error)
      toast({
        title: "Auto-save Failed",
        description: "Failed to save your progress automatically. Please save manually.",
        variant: "destructive",
      })
    }
  }

  const autoCreateApplicationFromContactInfo = async () => {
    try {
      // Check if application already exists for this phone number
      const existingApp = await getApplicationByPhone(formData.q8)

      if (existingApp) {
        // Update existing application instead of creating new one
        const updatedData = { ...existingApp.formData, ...formData }
        const applicationData: ApplicationData = {
          ...existingApp,
          formData: updatedData,
          currentStep: Math.max(existingApp.currentStep, currentStep),
          updatedAt: new Date().toISOString(),
          lastActivity: new Date().toISOString(),
        }

        const savedApp = await saveApplicationProgress(applicationData)
        setApplicationId(savedApp.id)
        setHasCreatedTempAccount(true)
        setHasSavedApplications(true)
        createSession(savedApp.id)
        setHasActiveSession(true)
        setSessionExpired(false)
        setLastSaved(new Date().toLocaleTimeString())

        toast({
          title: "Application Updated",
          description: "Your existing application has been updated with new information.",
        })
      } else {
        // Create new auto-created application
        const autoApp = await autoCreateApplication(formData, formData.q8, formData.q7, currentStep)
        setApplicationId(autoApp.id)
        setHasCreatedTempAccount(true)
        setHasSavedApplications(true)
        createSession(autoApp.id)
        setHasActiveSession(true)
        setSessionExpired(false)
        setLastSaved(new Date().toLocaleTimeString())

        toast({
          title: "Application Auto-Created",
          description:
            "Your application has been automatically saved. You can resume it anytime using your phone number.",
        })
      }
    } catch (error) {
      console.error("Failed to auto-create application:", error)
      toast({
        title: "Auto-save Failed",
        description: "Failed to auto-save your application. Please save manually.",
        variant: "destructive",
      })
    }
  }

  const saveProgress = async () => {
    setIsSaving(true)

    try {
      if (applicationId) {
        // Upgrade auto-created application to temporary when user manually saves
        await upgradeToTemporaryApplication(applicationId)

        // Update existing application
        const applicationData: ApplicationData = {
          id: applicationId,
          phone: formData.q8 || "",
          email: formData.q7 || "",
          status: "temporary", // Upgrade to temporary
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastActivity: new Date().toISOString(),
          formData,
          currentStep,
        }

        const savedApp = await saveApplicationProgress(applicationData)
        updateSessionActivity(savedApp.id)
        setHasSavedApplications(true)
        setLastSaved(new Date().toLocaleTimeString())

        // Update application ID if it changed
        if (savedApp.id !== applicationId) {
          setApplicationId(savedApp.id)
          createSession(savedApp.id)
        }
      } else if (formData.q8 && formData.q7) {
        // Create new application if we have contact info
        await autoCreateApplicationFromContactInfo()
      } else {
        // Save basic progress even without contact info
        const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const applicationData: ApplicationData = {
          id: tempId,
          phone: formData.q8 || "",
          email: formData.q7 || "",
          status: "temporary",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastActivity: new Date().toISOString(),
          formData,
          currentStep,
        }

        const savedApp = await saveApplicationProgress(applicationData)
        setApplicationId(savedApp.id)
        setHasSavedApplications(true)
        setLastSaved(new Date().toLocaleTimeString())
        createSession(savedApp.id)
      }

      toast({
        title: "Progress Saved",
        description: "Your application progress has been saved to the database.",
      })
    } catch (error) {
      console.error("Save failed:", error)
      toast({
        title: "Save Failed",
        description: "Failed to save progress. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleFileUpload = (field: string, file: File | null) => {
    setFormData((prev) => ({ ...prev, [field]: file ? file.name : null }))
    markFieldAsTouched(field)

    // Validate file upload
    if (file) {
      const question = currentSection?.questions.find((q) => q.id === field)
      if (question?.required || file) {
        // Remove any existing error for this field
        setValidationErrors((prev) => prev.filter((err) => err.field !== field))
      }
    }

    // Auto-save if we have an application ID
    if (applicationId && hasCreatedTempAccount) {
      const updatedData = { ...formData, [field]: file ? file.name : null }
      autoSaveProgress(updatedData)
    }
  }

  const nextStep = async () => {
    console.log("🚀 Next button clicked")
    console.log("🚀 Current step:", currentStep)
    console.log("🚀 Current section:", currentSection?.title)

    try {
      // Validate current section before proceeding
      if (!validateCurrentSection()) {
        return
      }

      if (currentStep < totalSteps + 1) {
        setIsTransitioning(true)

        // Add transition delay
        await new Promise((resolve) => setTimeout(resolve, 150))

        const newStep = currentStep + 1
        setCurrentStep(newStep)

        // Auto-save progress and update session if we have an application ID
        if (applicationId) {
          try {
            const applicationData: ApplicationData = {
              id: applicationId,
              phone: formData.q8 || "",
              email: formData.q7 || "",
              status: "temporary",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              formData,
              currentStep: newStep,
            }

            await saveApplicationProgress(applicationData)
            updateSessionActivity(applicationId)
            setLastSaved(new Date().toLocaleTimeString())
          } catch (error) {
            console.error("Failed to save progress:", error)
            toast({
              title: "Auto-save Failed",
              description: "Failed to save your progress when moving to the next step.",
              variant: "destructive",
            })
          }
        }

        setIsTransitioning(false)
      }
    } catch (error) {
      console.error("❌ Error in nextStep:", error)
      toast({
        title: "Error",
        description: "An error occurred while proceeding to the next step.",
        variant: "destructive",
      })
      setIsTransitioning(false)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setIsTransitioning(true)

      setTimeout(() => {
        const newStep = currentStep - 1
        setCurrentStep(newStep)

        // Update saved step if we have an application ID
        if (applicationId) {
          try {
            const applicationData: ApplicationData = {
              id: applicationId,
              phone: formData.q8 || "",
              email: formData.q7 || "",
              status: "temporary",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              formData,
              currentStep: newStep,
            }

            saveApplicationProgress(applicationData)
              .then(() => {
                updateSessionActivity(applicationId)
                setLastSaved(new Date().toLocaleTimeString())
              })
              .catch((error) => {
                console.error("Failed to save progress:", error)
              })
          } catch (error) {
            console.error("Failed to save progress:", error)
          }
        }

        setIsTransitioning(false)
      }, 150)
    }
  }

  const handleSubmit = async () => {
    if (!formConfig) return

    // Final validation before submission
    let allValid = true
    const allErrors: ValidationError[] = []

    // Get the latest form configuration to ensure we're validating against current admin settings
    try {
      const currentFormConfig = await getFormConfig()

      // Validate all sections from the current form configuration
      currentFormConfig.sections.forEach((section) => {
        section.questions.forEach((question) => {
          const value = safeGetFieldValue(formData, question.id, question.type)
          const error = validateField(question, value)

          if (error) {
            allErrors.push({
              field: question.id,
              message: error,
            })
            allValid = false
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

      // Mark application as submitted and convert to permanent
      if (applicationId) {
        await markApplicationAsSubmitted(applicationId)

        // Also update the status to "submitted" to ensure it appears in employer dashboard
        const updatedApplicationData: ApplicationData = {
          id: applicationId,
          phone: formData.q8 || "",
          email: formData.q7 || "",
          status: "submitted", // Ensure status is set to submitted
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          formData,
          currentStep: totalSteps + 1,
        }

        await saveApplicationProgress(updatedApplicationData)

        // Fetch public application data after submission
        const publicData = await getPublicApplicationData(applicationId)
        if (publicData) {
          console.log("Public application data:", publicData)
        }
      }

      // Notifications are handled automatically by the backend API
      toast({
        title: "Application Submitted Successfully!",
        description:
          "We'll review your application and get back to you within 3-5 business days. Check your email and SMS for confirmation.",
      })
      // Redirect to home page
      router.push('/rw');

      // Clear session after successful submission
      clearSession()
      setHasActiveSession(false)
      setSessionExpired(false)
    } catch (error) {
      console.error("Failed to validate form:", error)
      toast({
        title: "Validation Error",
        description: "Failed to validate form. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSessionExpired = () => {
    setSessionExpired(true)
    setHasActiveSession(false)
    clearSession()
    toast({
      title: "Session Expired",
      description: "Your session has expired. You can resume your application using your phone number.",
      variant: "destructive",
    })
  }

  const handleApplicationResumed = (application: ApplicationData) => {
    setFormData(application.formData)
    setCurrentStep(application.currentStep)
    setCurrentSection(getFormSectionByStep(application.currentStep))
    setApplicationId(application.id)
    setHasCreatedTempAccount(true)
    setHasActiveSession(true)
    setSessionExpired(false)
    setHasSavedApplications(true)
    createSession(application.id)

    toast({
      title: "Application Resumed",
      description: "Your previous application data has been loaded successfully.",
    })
  }

  const renderFormField = (question: FormQuestion) => {
    const { id, type, label, placeholder, required, options } = question
    const fieldError = getFieldError(id)
    const hasError = fieldError !== null

    switch (type) {
      case "text":
      case "email":
        return (
          <div key={id} className="space-y-2 animate-in fade-in-50 duration-300">
            <Label htmlFor={id} className="text-sm font-medium flex items-center gap-1">
              {label}
              {required && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id={id}
              type={type}
              placeholder={placeholder}
              value={safeGetFieldValue(formData, id, type)}
              onChange={(e) => updateFormData(id, e.target.value)}
              onBlur={() => markFieldAsTouched(id)}
              required={required}
              className={`rounded-lg border-gray-200 focus:border-primary focus:ring-primary transition-all duration-200 focus:scale-[1.02] ${
                hasError ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
              }`}
            />
            {hasError && (
              <div className="flex items-center gap-1 text-red-600 text-sm animate-in fade-in-50 duration-200">
                <AlertCircle className="h-4 w-4" />
                {fieldError}
              </div>
            )}
          </div>
        )

      case "date":
        return (
          <div key={id} className="space-y-2 animate-in fade-in-50 duration-300">
            <Label htmlFor={id} className="text-sm font-medium flex items-center gap-1">
              {label}
              {required && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id={id}
              type="date"
              value={safeGetFieldValue(formData, id, type)}
              onChange={(e) => updateFormData(id, e.target.value)}
              onBlur={() => markFieldAsTouched(id)}
              required={required}
              className={`rounded-lg border-gray-200 focus:border-primary focus:ring-primary transition-all duration-200 focus:scale-[1.02] ${
                hasError ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
              }`}
            />
            {hasError && (
              <div className="flex items-center gap-1 text-red-600 text-sm animate-in fade-in-50 duration-200">
                <AlertCircle className="h-4 w-4" />
                {fieldError}
              </div>
            )}
          </div>
        )

      case "textarea":
        return (
          <div key={id} className="space-y-2 animate-in fade-in-50 duration-300">
            <Label htmlFor={id} className="text-sm font-medium flex items-center gap-1">
              {label}
              {required && <span className="text-red-500">*</span>}
            </Label>
            <Textarea
              id={id}
              placeholder={placeholder}
              value={safeGetFieldValue(formData, id, type)}
              onChange={(e) => updateFormData(id, e.target.value)}
              onBlur={() => markFieldAsTouched(id)}
              required={required}
              rows={4}
              className={`rounded-lg border-gray-200 focus:border-primary focus:ring-primary transition-all duration-200 focus:scale-[1.02] ${
                hasError ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
              }`}
            />
            {hasError && (
              <div className="flex items-center gap-1 text-red-600 text-sm animate-in fade-in-50 duration-200">
                <AlertCircle className="h-4 w-4" />
                {fieldError}
              </div>
            )}
          </div>
        )

      case "select":
        return (
          <div key={id} className="space-y-2 animate-in fade-in-50 duration-300">
            <Label htmlFor={id} className="text-sm font-medium flex items-center gap-1">
              {label}
              {required && <span className="text-red-500">*</span>}
            </Label>
            <Select
              value={safeGetFieldValue(formData, id, type)}
              onValueChange={(value) => updateFormData(id, value)}
              onOpenChange={(open) => !open && markFieldAsTouched(id)}
            >
              <SelectTrigger
                className={`rounded-lg border-gray-200 focus:border-primary focus:ring-primary transition-all duration-200 hover:scale-[1.01] ${
                  hasError ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                }`}
              >
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
              <SelectContent>
                {options?.map((option: string, index: number) => (
                  <SelectItem key={index} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {hasError && (
              <div className="flex items-center gap-1 text-red-600 text-sm animate-in fade-in-50 duration-200">
                <AlertCircle className="h-4 w-4" />
                {fieldError}
              </div>
            )}
          </div>
        )

      case "radio":
        return (
          <div key={id} className="space-y-3 animate-in fade-in-50 duration-300">
            <Label className="text-sm font-medium flex items-center gap-1">
              {label}
              {required && <span className="text-red-500">*</span>}
            </Label>
            <RadioGroup
              value={safeGetFieldValue(formData, id, type)}
              onValueChange={(value) => updateFormData(id, value)}
            >
              {options?.map((option: string, index: number) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 hover:bg-gray-50 p-2 rounded-lg transition-colors duration-200"
                  onClick={() => markFieldAsTouched(id)}
                >
                  <RadioGroupItem value={option} id={`${id}-${index}`} />
                  <Label htmlFor={`${id}-${index}`} className="text-sm font-normal cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            {hasError && (
              <div className="flex items-center gap-1 text-red-600 text-sm animate-in fade-in-50 duration-200">
                <AlertCircle className="h-4 w-4" />
                {fieldError}
              </div>
            )}
          </div>
        )

      case "checkbox":
        const checkboxValue = safeGetFieldValue(formData, id, type)
        const checkboxArray = Array.isArray(checkboxValue) ? checkboxValue : []

        return (
          <div key={id} className="space-y-3 animate-in fade-in-50 duration-300">
            <Label className="text-sm font-medium flex items-center gap-1">
              {label}
              {required && <span className="text-red-500">*</span>}
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {options?.map((option: string, index: number) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 hover:bg-gray-50 p-2 rounded-lg transition-colors duration-200"
                >
                  <Checkbox
                    id={`${id}-${index}`}
                    checked={checkboxArray.includes(option)}
                    onCheckedChange={(checked) => {
                      markFieldAsTouched(id)
                      if (checked) {
                        updateFormData(id, [...checkboxArray, option])
                      } else {
                        updateFormData(
                          id,
                          checkboxArray.filter((v: string) => v !== option),
                        )
                      }
                    }}
                  />
                  <Label htmlFor={`${id}-${index}`} className="text-sm font-normal cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </div>
            {hasError && (
              <div className="flex items-center gap-1 text-red-600 text-sm animate-in fade-in-50 duration-200">
                <AlertCircle className="h-4 w-4" />
                {fieldError}
              </div>
            )}
          </div>
        )

      case "file":
        return (
          <div key={id} className="space-y-2 animate-in fade-in-50 duration-300">
            <Label htmlFor={id} className="text-sm font-medium flex items-center gap-1">
              {label}
              {required && <span className="text-red-500">*</span>}
            </Label>
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-all duration-300 hover:bg-gray-50 ${
                hasError ? "border-red-500" : "border-gray-300"
              }`}
            >
              <Upload className="mx-auto h-12 w-12 text-gray-400 transition-transform duration-200 hover:scale-110" />
              <div className="mt-4">
                <Label htmlFor={id} className="cursor-pointer">
                  <span className="mt-2 block text-sm font-medium text-gray-900">Click to upload or drag and drop</span>
                  <span className="mt-1 block text-xs text-gray-500">{placeholder}</span>
                </Label>
                <Input
                  id={id}
                  type="file"
                  className="hidden"
                  onChange={(e) => handleFileUpload(id, e.target.files?.[0] || null)}
                  required={required}
                />
              </div>
              {safeGetFieldValue(formData, id, type) && (
                <div className="mt-2 text-sm text-green-600 animate-in fade-in-50 duration-300">
                  ✓ {safeGetFieldValue(formData, id, type)}
                </div>
              )}
            </div>
            {hasError && (
              <div className="flex items-center gap-1 text-red-600 text-sm animate-in fade-in-50 duration-200">
                <AlertCircle className="h-4 w-4" />
                {fieldError}
              </div>
            )}
          </div>
        )

      case "dependent-dropdown":
        const locationValue = safeGetFieldValue(formData, id, type)

        return (
          <div key={id} className="space-y-2 animate-in fade-in-50 duration-300">
            <Label className="text-sm font-medium flex items-center gap-1">
              {label}
              {required && <span className="text-red-500">*</span>}
            </Label>
            <DependentDropdown
              value={locationValue}
              onChange={(locationData) => {
                updateFormData("province", locationData.province)
                updateFormData("district", locationData.district)
                updateFormData("sector", locationData.sector)
                updateFormData("cell", locationData.cell)
                updateFormData("village", locationData.village)
              }}
              onBlur={() => {
                markFieldAsTouched("province")
                markFieldAsTouched("district")
                markFieldAsTouched("sector")
                markFieldAsTouched("cell")
                markFieldAsTouched("village")
              }}
            />
            {hasError && (
              <div className="flex items-center gap-1 text-red-600 text-sm animate-in fade-in-50 duration-200">
                <AlertCircle className="h-4 w-4" />
                {fieldError}
              </div>
            )}
          </div>
        )

      case "phone":
        return (
          <div key={id} className="space-y-2 animate-in fade-in-50 duration-300">
            <Label htmlFor={id} className="text-sm font-medium flex items-center gap-1">
              {label}
              {required && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id={id}
              type="tel"
              placeholder={placeholder}
              value={safeGetFieldValue(formData, id, type)}
              onChange={(e) => updateFormData(id, e.target.value)}
              onBlur={() => handleBlur(id)}
              required={required}
              className="rounded-lg border-gray-200 focus:border-primary focus:ring-primary transition-all duration-200 focus:scale-[1.02]"
            />
            <p className="text-sm text-gray-500 mt-1">
              Enter your phone number
            </p>
          </div>
        );

      case "number":
        return (
          <div key={id} className="space-y-2 animate-in fade-in-50 duration-300">
            <Label htmlFor={id} className="text-sm font-medium flex items-center gap-1">
              {label}
              {required && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id={id}
              type="number"
              placeholder={placeholder}
              value={safeGetFieldValue(formData, id, type)}
              onChange={(e) => updateFormData(id, e.target.value)}
              onBlur={() => markFieldAsTouched(id)}
              required={required}
              className={`rounded-lg border-gray-200 focus:border-primary focus:ring-primary transition-all duration-200 focus:scale-[1.02] ${
                hasError ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
              }`}
            />
            {hasError && (
              <div className="flex items-center gap-1 text-red-600 text-sm animate-in fade-in-50 duration-200">
                <AlertCircle className="h-4 w-4" />
                {fieldError}
              </div>
            )}
          </div>
        );

      default:
        return null
    }
  }

  const renderPreviewSection = (section: FormSection) => {
    return (
      <div key={section.id} className="mb-6 animate-in fade-in-50 duration-300">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-primary/10 rounded-lg transition-transform duration-200 hover:scale-105">
            {getSectionIcon(section.id)}
          </div>
          <div>
            <h3 className="font-semibold text-lg">{section.title}</h3>
            <p className="text-sm text-gray-500">{section.description}</p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 hover:bg-gray-100 transition-colors duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {section.questions
              .sort((a, b) => a.order - b.order)
              .map((question) => {
                const value = safeGetFieldValue(formData, question.id, question.type)

                // Skip empty values
                if (
                  !value ||
                  (Array.isArray(value) && value.length === 0) ||
                  (typeof value === "object" && Object.values(value).every((v) => !v))
                ) {
                  return null
                }

                return (
                  <div key={question.id} className="space-y-1">
                    <p className="text-sm font-medium text-gray-700">{question.label}</p>
                    {renderPreviewValue(question, value)}
                  </div>
                )
              })}
          </div>
        </div>
      </div>
    )
  }

  const renderPreviewValue = (question: FormQuestion, value: any) => {
    if (!value) return <p className="text-sm text-gray-500">Not provided</p>

    switch (question.type) {
      case "checkbox":
        if (Array.isArray(value) && value.length > 0) {
          return (
            <div className="flex flex-wrap gap-1">
              {value.map((item: string, i: number) => (
                <span
                  key={i}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary animate-in fade-in-50 duration-300"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  {item}
                </span>
              ))}
            </div>
          )
        }
        return <p className="text-sm text-gray-500">None selected</p>

      case "file":
        return (
          <p className="text-sm text-green-600 flex items-center gap-1 animate-in fade-in-50 duration-300">
            <CheckCircle className="h-4 w-4" />
            {value}
          </p>
        )

      case "textarea":
        return <p className="text-sm text-gray-800 whitespace-pre-line">{value}</p>

      case "dependent-dropdown":
        if (typeof value === "object" && value !== null) {
          const locationParts = [value.province, value.district, value.sector, value.cell, value.village].filter(
            Boolean,
          )
          return <p className="text-sm text-gray-800">{locationParts.join(", ") || "Not provided"}</p>
        }
        return <p className="text-sm text-gray-500">Not provided</p>

      default:
        return <p className="text-sm text-gray-800">{value}</p>
    }
  }

  const getSectionIcon = (sectionId: string) => {
    switch (sectionId) {
      case "section-1":
        return <User className="h-6 w-6" />
      case "section-2":
        return <MapPin className="h-6 w-6" />
      case "section-3":
        return <GraduationCap className="h-6 w-6" />
      case "section-4":
        return <Briefcase className="h-6 w-6" />
      case "section-5":
        return <Heart className="h-6 w-6" />
      case "section-6":
        return <FileText className="h-6 w-6" />
      default:
        return <BookOpen className="h-6 w-6" />
    }
  }

  const canProceedToNext = (): boolean => {
    if (!currentSection) return true

    console.log("🔍 Checking if can proceed to next for section:", currentSection.title)

    try {
      const sectionErrors = currentSection.questions.filter((question) => {
        console.log(`🔍 Checking question for proceed: ${question.id} (${question.type})`)

        const value = safeGetFieldValue(formData, question.id, question.type)
        console.log(`🔍 Value for proceed check:`, value)

        const hasError = validateField(question, value) !== null
        console.log(`🔍 Has error for ${question.id}:`, hasError)
        return hasError
      })

      console.log("🔍 Section errors count:", sectionErrors.length)
      return sectionErrors.length === 0
    } catch (error) {
      console.error("❌ Error in canProceedToNext:", error)
      return false
    }
  }

  // Loading state with timeout
  const loadingState = (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600 mb-4">Loading application form...</p>
        <p className="text-sm text-gray-500 mb-6">This should only take a few seconds</p>
        <Button variant="outline" onClick={() => window.location.reload()} className="text-sm">
          Taking too long? Refresh page
        </Button>
      </div>
    </div>
  )

  // Error state
  const errorState = (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-red-200">
        <CardHeader className="bg-red-50 border-b border-red-100">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <CardTitle>Error Loading Application</CardTitle>
          </div>
          <CardDescription>We encountered an error while loading the application form.</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <p className="text-red-600">{loadError}</p>
          <p className="mt-4 text-sm text-gray-600">
            Please try refreshing the page. If the problem persists, contact our support team.
          </p>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-4">
          <Button variant="outline" onClick={() => (window.location.href = "/")}>
            Go to Home
          </Button>
          <Button onClick={() => window.location.reload()}>Refresh Page</Button>
        </CardFooter>
      </Card>
    </div>
  )

  const sessionExpiredState = (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 animate-in fade-in-50 duration-500">
      <AuthHeader />
      <div className="flex items-center justify-center min-h-[80vh] px-4">
        <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm border-0 shadow-lg animate-in slide-in-from-bottom-4 duration-500">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4 animate-pulse">
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
            <CardTitle className="text-xl">Session Expired</CardTitle>
            <CardDescription>Your application session has expired, but your progress is saved.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full" onClick={handleStartNewApplication}>
              Start New Application
            </Button>
            {hasSavedApplications && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setShowResumeDialog(true)
                  setSessionExpired(false)
                }}
              >
                Resume Previous Application
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
      <AuthFooter />
    </div>
  )

  const formConfigLoadingState = (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">Loading form configuration...</p>
      </div>
    </div>
  )

  // Check for updates every 30 seconds
  useEffect(() => {
    const interval = setInterval(checkForFormUpdates, 30000)
    return () => clearInterval(interval)
  }, [checkForFormUpdates])

  return (
    <>
      {isLoading ? (
        loadingState
      ) : loadError ? (
        errorState
      ) : sessionExpired && !hasActiveSession ? (
        sessionExpiredState
      ) : !formConfig ? (
        formConfigLoadingState
      ) : (
        <div className="min-h-screen bg-gray-50 animate-in fade-in-50 duration-500">
          <AuthHeader />

          {/* Session Timer */}
          {hasActiveSession && applicationId && (
            <SessionTimer applicationId={applicationId} />
          )}

          {/* Validation Error Summary */}
          {validationErrors.length > 0 && (
            <div className="bg-red-50 border-b border-red-200 px-4 py-3 animate-in slide-in-from-top-2 duration-300">
              <div className="container mx-auto max-w-7xl">
                <div className="flex items-center gap-2 text-red-800">
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-medium">
                    {validationErrors.length} validation error(s) found. Please fix them before proceeding.
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setValidationErrors([])}
                    className="ml-auto text-red-600 hover:text-red-800"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="container mx-auto px-4 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {/* Left Side - Branded Onboarding (1/3) */}
              <div className="lg:col-span-1">
                <div className="sticky top-6 space-y-6">
                  {/* Main Branding Card */}
                  <Card className="bg-gradient-to-br from-primary to-secondary text-white border-0 shadow-md hover:shadow-lg transition-all duration-300 animate-in slide-in-from-left-4">
                    <CardContent className="p-6">
                      <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                          <GraduationCap className="h-8 w-8 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Join Gemurai</h2>
                        <p className="text-primary-100 text-sm">Become a Digital Community Champion</p>
                      </div>

                      <div className="space-y-4">
                        {[
                          {
                            title: "Digital Skills Training",
                            desc: "Learn essential digital skills for the modern economy",
                          },
                          {
                            title: "Income Opportunities",
                            desc: "Access to jobs, entrepreneurship, and financial services",
                          },
                          { title: "Community Impact", desc: "Make a difference in your community while earning" },
                          { title: "Ongoing Support", desc: "Continuous mentorship and professional development" },
                        ].map((item, index) => (
                          <div
                            key={index}
                            className="flex items-start gap-3 animate-in fade-in-50 duration-300 hover:bg-white/10 p-2 rounded-lg transition-colors"
                            style={{ animationDelay: `${index * 100}ms` }}
                          >
                            <CheckCircle className="h-5 w-5 text-green-300 mt-0.5 flex-shrink-0" />
                            <div>
                              <h3 className="font-semibold text-sm">{item.title}</h3>
                              <p className="text-xs text-primary-100 mt-1">{item.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Application Process */}
                  <Card
                    className="border-0 shadow-md hover:shadow-lg transition-all duration-300 animate-in slide-in-from-left-4"
                    style={{ animationDelay: "100ms" }}
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-primary" />
                        Application Process
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        {[
                          { step: 1, text: "Complete application form", active: currentStep >= 1 },
                          { step: 2, text: "Submit required documents", active: currentStep >= 6 },
                          { step: 3, text: "Interview with our team", active: false },
                          { step: 4, text: "Begin your training journey", active: false },
                        ].map((item, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-lg transition-all duration-200"
                            style={{ animationDelay: `${index * 50}ms` }}
                          >
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                                item.active ? "bg-green-500 text-white scale-110" : "bg-gray-200 text-gray-600"
                              }`}
                            >
                              {item.step}
                            </div>
                            <span className="text-sm">{item.text}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Database Status */}
                  <Card
                    className="border-0 shadow-md hover:shadow-lg transition-all duration-300 animate-in slide-in-from-left-4"
                    style={{ animationDelay: "200ms" }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Database className="h-5 w-5 text-primary" />
                        <h3 className="font-semibold text-sm">Database Status</h3>
                      </div>
                      <div className="text-sm">
                        {isDatabaseChecking ? (
                          <div className="flex items-center gap-2 text-gray-600">
                            <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                            Checking database connection...
                          </div>
                        ) : isUsingDatabase ? (
                          <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle className="h-4 w-4" />
                            Connected to database
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-red-600">
                            <AlertCircle className="h-4 w-4" />
                            {databaseError || "Database connection error"}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Help & Support */}
                  <Card
                    className="border-0 shadow-md hover:shadow-lg transition-all duration-300 animate-in slide-in-from-left-4"
                    style={{ animationDelay: "300ms" }}
                  >
                    <CardContent className="p-4">
                      <div className="text-center">
                        <h3 className="font-semibold text-sm mb-2">Need Help?</h3>
                        <p className="text-xs text-gray-600 mb-3">
                          Our support team is here to assist you with your application.
                        </p>
                        <div className="space-y-2">
                          <a
                            href="mailto:support@Gemurai.rw"
                            className="block text-xs text-primary hover:underline transition-colors duration-200"
                          >
                            support@Gemurai.rw
                          </a>
                          <a
                            href="tel:+250788123456"
                            className="block text-xs text-primary hover:underline transition-colors duration-200"
                          >
                            +250 788 123 456
                          </a>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Right Side - Application Form (2/3) */}
              <div className="lg:col-span-2">
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm animate-in slide-in-from-right-4 duration-500">
                  <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-secondary/5">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl">
                          {currentStep <= totalSteps ? currentSection?.title : "Review Your Application"}
                        </CardTitle>
                        <CardDescription>
                          {currentStep <= totalSteps ? currentSection?.description : "Please review your information"}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        {hasSavedApplications && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowResumeDialog(true)}
                            className="flex items-center gap-1"
                          >
                            <RefreshCw className="h-4 w-4" />
                            <span className="hidden sm:inline">Resume</span>
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={saveProgress}
                          disabled={isSaving || !isUsingDatabase}
                          className="flex items-center gap-1"
                        >
                          {isSaving ? (
                            <>
                              <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                              <span className="hidden sm:inline">Saving...</span>
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4" />
                              <span className="hidden sm:inline">Save</span>
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                        <span>
                          Step {currentStep} of {totalSteps + 1}
                        </span>
                        <span>{Math.round(progress)}% Complete</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>

                    {/* Last Saved Indicator */}
                    {lastSaved && (
                      <div className="mt-2 text-xs text-gray-500 flex items-center gap-1 animate-in fade-in-50 duration-300">
                        <Clock className="h-3 w-3" />
                        Last saved at {lastSaved}
                      </div>
                    )}
                  </CardHeader>

                  <CardContent className="p-6">
                    {/* Form Sections */}
                    <div className={`space-y-6 ${isTransitioning ? "opacity-0" : "opacity-100"} transition-opacity`}>
                      {/* Regular Form Steps */}
                      {currentStep <= totalSteps && currentSection && (
                        <div className="space-y-6">
                          {currentSection.questions
                            .sort((a, b) => a.order - b.order)
                            .map((question) => renderFormField(question))}
                        </div>
                      )}

                      {/* Preview/Review Step */}
                      {currentStep > totalSteps && (
                        <div className="space-y-6">
                          <div className="bg-green-50 border border-green-100 rounded-lg p-4 mb-6 animate-in fade-in-50 duration-300">
                            <div className="flex items-start gap-3">
                              <Shield className="h-6 w-6 text-green-600 mt-0.5" />
                              <div>
                                <h3 className="font-semibold text-green-800">Ready to Submit</h3>
                                <p className="text-sm text-green-700 mt-1">
                                  Please review your application details below before final submission.
                                </p>
                              </div>
                            </div>
                          </div>

                          {formConfig.sections.map((section) => renderPreviewSection(section))}
                        </div>
                      )}
                    </div>
                  </CardContent>

                  <CardFooter className="flex justify-between border-t p-6">
                    <Button
                      variant="outline"
                      onClick={prevStep}
                      disabled={currentStep === 1}
                      className="flex items-center gap-2"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>

                    {currentStep <= totalSteps ? (
                      <Button
                        onClick={nextStep}
                        disabled={!canProceedToNext() || !isUsingDatabase}
                        className="flex items-center gap-2"
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !isUsingDatabase}
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
                  </CardFooter>
                </Card>

                {/* Database Error Warning */}
                {!isUsingDatabase && !isDatabaseChecking && (
                  <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4 animate-in fade-in-50 duration-300">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-6 w-6 text-red-600 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-red-800">Database Connection Error</h3>
                        <p className="text-sm text-red-700 mt-1">
                          {databaseError || "Unable to connect to the database. Your progress cannot be saved."}
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2 text-red-600 border-red-200 hover:bg-red-100"
                          onClick={() => window.location.reload()}
                        >
                          <RefreshCw className="h-4 w-4 mr-1" />
                          Retry Connection
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <AuthFooter />

          {/* Resume Application Dialog */}
          {showResumeDialog && (
            <ResumeApplicationDialog
              onApplicationResumed={handleApplicationResumed}
            />
          )}
        </div>
      )}
    </>
  )
}
