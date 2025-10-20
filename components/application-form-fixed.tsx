"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Progress } from "@/components/ui/progress"
import { AuthHeader } from "@/components/auth-header"
import { AuthFooter } from "@/components/auth-footer"
import { DependentDropdown } from "@/components/dependent-dropdown"
import { Combobox } from "@/components/ui/combobox"
import DependentDropdownDB from "@/components/dependent-dropdown-db"
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
  Shield,
  AlertCircle,
  Database,
  MapPin,
  RefreshCw,
  Trash2,
  Loader2,
  Calendar as CalendarIcon,
  ChevronDown,
} from "lucide-react"
import { toast } from "sonner"
import { 
  createSession, 
  getActiveSession, 
  updateSessionActivity, 
  clearSession,
  cleanupApplicationStorage 
} from "@/lib/session-manager"
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
import { useNavigate } from "@/lib/navigation"
import { useRouter } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { validateApplication } from "@/lib/form-validation"
import type { ApplicationData } from "@/lib/application-storage"
import { 
  saveApplicationProgress, 
  getApplicationById, 
  submitApplication, 
  autoCreateApplication as createApplication,
  markApplicationAsSubmitted as markAsSubmitted
} from "@/lib/application-storage"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { format, subYears, isValid } from "date-fns"
import { formServiceTranslations } from "@/lib/translations/form-service"
import { ApplicationData as ApplicationDataType } from "@/types/application"
import { generateApplicationId } from "@/lib/utils"
import { sendApplicationSubmissionEmail } from "@/lib/email-service"

interface FormData {
  [key: string]: any;
  q1?: string;
  q2?: string;
  q11?: string;
  q12?: string;
}

// Define types
interface ValidationError {
  field: string;
  message: string;
}

// Safe field access function
const safeGetFieldValue = (formData: FormData, fieldId: string, fieldType: string): any => {
  try {
    if (fieldType === "dependent-dropdown") {
      // For dependent dropdown, return location data object
      const locationData = {
        province: formData.province || "",
        district: formData.district || "",
        sector: formData.sector || "",
        cell: formData.cell || "",
        village: formData.village || "",
      }
      console.log(`📍 Safe get field value for ${fieldId}:`, locationData)
      return locationData
    }

    // For regular fields, safely access the field
    return formData[fieldId] || ""
  } catch (error) {
    console.error(`Error accessing field ${fieldId}:`, error)
    return ""
  }
}

// Auto create application
const autoCreateApplication = async (
  formData: FormData,
  phone: string,
  email: string,
  currentStep: number,
): Promise<ApplicationData> => {
  return await createApplication(formData, phone, email, currentStep)
}

const upgradeToTemporaryApplication = async (id: string): Promise<void> => {
  try {
    const application = await getApplicationById(id)

    if (!application || application.status !== "TEMPORARY") {
      return
    }

    await saveApplicationProgress({
      ...application,
      status: "TEMPORARY",
      phone: application.formData?.q10 || "",
      email: application.formData?.q9 || "",
      notes: application.notes || "",
      dccCreated: application.dccCreated || false,
      autoCreatedAt: application.autoCreatedAt,
      lastActivity: new Date().toISOString()
    })
  } catch (error) {
    console.error("Failed to upgrade application to temporary:", error)
    throw error
  }
}

const markApplicationAsSubmitted = async (id: string): Promise<void> => {
  await markAsSubmitted(id)
}

interface FormTranslation {
  label: string;
  placeholder: string;
  options?: string[];
  validation?: string;
}

interface FormTranslations {
  sections: {
    personalInfo: {
      title: string;
      description: string;
    };
    // ... other sections
  };
  questions: {
    [key: string]: FormTranslation;
  };
}

interface Translations {
  loading: {
    title: string;
    description: string;
  };
  form: {
    title: string;
    saving: string;
    description: string;
    required: string;
    validation: {
      required: string;
      invalidEmail: string;
      invalidPhone: string;
      minLength: string;
      age: string;
      address: string;
      disability: string;
      error: string;
      fixErrors: string;
      invalidFormat: string;
    };
    phone: {
      hint: string;
    };
  };
  navigation: {
    previous: string;
    next: string;
    submitting: string;
    submit: string;
  };
  submitting: {
    title: string;
    description: string;
  };
  error: {
    title: string;
    tryAgain: string;
  };
  maintenance: {
    title: string;
    description: string;
  };
  branding: {
    title: string;
    subtitle: string;
    communityImpact: {
      title: string;
      description: string;
    };
    professionalGrowth: {
      title: string;
      description: string;
    };
    networkOpportunities: {
      title: string;
      description: string;
    };
  };
}

type SupportedLanguage = 'en' | 'rw'

interface ApplicationFormFixedProps {
  initialApplicationId?: string
  isSessionExpired?: boolean
  onSubmitSuccess?: () => void
  lang?: SupportedLanguage
}

// Update the translations access
const getTranslation = (lang: string, path: string): string => {
  const safeLang = (lang === 'rw' || lang === 'en') ? lang : 'en'
  const translationObj = translations[safeLang]
  return path.split('.').reduce((obj: any, key: string) => obj?.[key], translationObj) || ''
}

function LoadingComponent({ message, description, lang = 'en' }) {
  const t = translations[lang as keyof typeof translations] || translations.en
  const isSubmitting = message === "Submitting Application"
  const text = isSubmitting ? t.submitting : t.loading

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            {text.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-600">
            <p>{text.description}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-red-600">Error Loading Form</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-600">
            <p>{error.message}</p>
            <button
              onClick={reset}
              className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
            >
              Try Again
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

interface QuestionRendererProps {
  question: FormQuestion
  value: any
  formData: FormData
  onChange: (field: string, value: any) => void
  onBlur?: (field: string) => void
  error?: string | null
  onFileUpload?: (field: string, file: File | null) => void
  onBatchUpdate?: (updates: Record<string, any>) => void
  lang?: string
}

function QuestionRenderer({ 
  question, 
  value, 
  formData,
  onChange, 
  onBlur, 
  error, 
  onFileUpload, 
  onBatchUpdate, 
  lang = 'en' 
}: QuestionRendererProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    onChange(question.id, e.target.value)
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(question.id, e.target.checked)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    onChange(question.id, file)
  }

  const handleBlur = () => {
    if (onBlur) {
      onBlur(question.id)
    }
  }

  const questionClasses = cn(
    "space-y-2",
    error && "text-red-500"
  )

  const inputClasses = cn(
    error && "border-red-500 focus:ring-red-500"
  )

  switch (question.type) {
    case "text":
    case "email":
      return (
        <div className={questionClasses}>
          <Label htmlFor={question.id} className="font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {question.label}
            {question.required && <span className="text-red-500 ml-1" title={getTranslation(lang, 'form.required')}>*</span>}
          </Label>
          <Input
            id={question.id}
            type={question.type}
            placeholder={question.placeholder}
            value={value || ""}
            onChange={(e) => {
              if (question.id === 'q5') {
                const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 16)
                onChange(question.id, digitsOnly)
              } else {
                onChange(question.id, e.target.value)
              }
            }}
            onBlur={handleBlur}
            className={inputClasses}
            {...(question.id === 'q5' ? { maxLength: 16, inputMode: 'numeric', pattern: '\\d*' } : {})}
          />
          {error && <p className="text-sm">{error}</p>}
        </div>
      )

    case "phone": {
      return (
        <div className={questionClasses}>
          <Label htmlFor={question.id} className="font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {question.label}
            {question.required && <span className="text-red-500 ml-1" title="Required">*</span>}
          </Label>
          <Input
            id={question.id}
            type="tel"
            placeholder={question.placeholder}
            value={value || ""}
            onChange={(e) => {
              // Only allow digits and spaces
              const cleaned = e.target.value.replace(/[^\d\s]/g, '')
              // Limit to max 10 digits
              const limited = cleaned.replace(/\s/g, '').slice(0, 10)
              onChange(question.id, limited)
            }}
            onBlur={() => {
              // Format on blur
              if (value) {
                const cleaned = value.replace(/\s+/g, '').trim()
                if (cleaned.length === 10) {
                  // Format as 07XX XXX XXX
                  const formatted = cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{2})/, '$1$2 $3 $4')
                  onChange(question.id, formatted)
                }
              }
              onBlur?.(question.id)
            }}
            className={inputClasses}
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <p className="text-sm text-gray-500 mt-1">
            {getTranslation(lang, 'form.phone.hint')}
          </p>
        </div>
      );
    }

    case "date": {
      const today = new Date();
      // Allow only ages between 18 and 33
      const minDate = subYears(today, 33); // oldest allowed
      const maxDate = subYears(today, 18); // youngest allowed
      
      // Parse the value to a Date object if it exists
      const selectedDate = value ? new Date(value) : null;
      
      return (
        <div className={questionClasses}>
          <Label htmlFor={question.id} className="font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {question.label}
            {question.required && <span className="text-red-500 ml-1" title={getTranslation(lang, 'form.required')}>*</span>}
          </Label>
          <div className="relative">
            <DatePicker
              id={question.id}
              selected={selectedDate}
              onChange={(date) => {
                // Format the date to YYYY-MM-DD before passing to onChange
                const formattedDate = date ? format(date, 'yyyy-MM-dd') : '';
                onChange(question.id, formattedDate);
              }}
              onBlur={() => onBlur?.(question.id)}
              dateFormat="dd/MM/yyyy"
              maxDate={maxDate}
              minDate={minDate}
              placeholderText={question.placeholder}
              showMonthDropdown
              showYearDropdown
              scrollableYearDropdown
              yearDropdownItemNumber={100}
              dropdownMode="select"
              withPortal
              popperPlacement="bottom-start"
              className={cn(
                inputClasses,
                "pl-10 w-full",
                error ? "border-red-500" : ""
              )}
              customInput={
                <Input
                  className={cn(
                    inputClasses,
                    "pl-10" // Add padding for the calendar icon
                  )}
                />
              }
            />
            <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <p className="text-sm text-muted-foreground mt-1">
            {lang === 'rw' ? 
              "Kanda hano uhitemo itariki yawe y'amavuko" : 
              "Click here to select your date of birth"}
          </p>
        </div>
      );
    }

    case "radio":
      return (
        <div className={questionClasses}>
          <Label className="font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {question.label}
            {question.required && <span className="text-red-500 ml-1" title={getTranslation(lang, 'form.required')}>*</span>}
          </Label>
          <RadioGroup
            value={value || ""}
            onValueChange={(value) => onChange(question.id, value)}
            className={question.id === "communityConnection" ? "grid grid-cols-1 md:grid-cols-2 gap-2 mt-2" : "flex flex-col space-y-2 mt-2"}
          >
            {question.options?.map((option) => (
              <div key={option} className={cn(
                "flex items-center space-x-2",
                question.id === "communityConnection" && "p-2 bg-gray-50/50 rounded-lg hover:bg-gray-100/50 transition-colors duration-300"
              )}>
                <RadioGroupItem value={option} id={`${question.id}-${option}`} />
                <Label
                  htmlFor={`${question.id}-${option}`}
                  className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
          {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
        </div>
      )

    case "textarea":
      return (
        <div className={questionClasses}>
          <Label htmlFor={question.id} className="font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {question.label}
            {question.required && <span className="text-red-500 ml-1" title={getTranslation(lang, 'form.required')}>*</span>}
          </Label>
          <Textarea
            id={question.id}
            placeholder={question.placeholder}
            value={value || ""}
            onChange={handleChange}
            onBlur={handleBlur}
            className={inputClasses}
          />
          {error && <p className="text-sm">{error}</p>}
        </div>
      )

    case "select":
      return (
        <div className={questionClasses}>
          <Label htmlFor={question.id} className="font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {question.label}
            {question.required && <span className="text-red-500 ml-1" title={getTranslation(lang, 'form.required')}>*</span>}
          </Label>
          <div className="relative">
            <Select value={value || ""} onValueChange={(value) => onChange(question.id, value)}>
              <SelectTrigger 
                id={question.id} 
                className={cn(
                  inputClasses,
                  "w-full flex items-center justify-between",
                  "text-left font-normal",
                  !value && "text-muted-foreground"
                )}
              >
                <SelectValue placeholder={question.placeholder} />
              </SelectTrigger>
              <SelectContent>
                {question.options?.map((option) => (
                  <SelectItem 
                    key={option} 
                    value={option}
                    className="cursor-pointer hover:bg-accent"
                  >
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50 pointer-events-none" />
          </div>
          {error && <p className="text-sm">{error}</p>}
          <p className="text-sm text-muted-foreground mt-1">
            {lang === 'rw' ? 
              "Kanda hano uhitemo usubiza" : 
              "Click here to select your answer"}
          </p>
        </div>
      )

    case "checkbox":
      const checkboxValue = Array.isArray(value) ? value : []
      return (
        <div className={questionClasses}>
          <Label className="font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {question.label}
            {question.required && <span className="text-red-500 ml-1" title={getTranslation(lang, 'form.required')}>*</span>}
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
            {question.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Checkbox
                  id={`${question.id}-${index}`}
                  checked={checkboxValue.includes(option)}
                  onCheckedChange={(checked) => {
                    const newValue = [...checkboxValue];
                    if (checked) {
                      newValue.push(option);
                      // Clear other text when unchecking Ibindi (sobanura)/Other
                      if (option === "Ibindi (sobanura)" || option === "Other") {
                        onChange(`${question.id}-other`, "");
                      }
                    } else {
                      const index = newValue.indexOf(option);
                      if (index > -1) {
                        newValue.splice(index, 1);
                      }
                      // Clear other text when unchecking Ibindi (sobanura)/Other
                      if (option === "Ibindi (sobanura)" || option === "Other") {
                        onChange(`${question.id}-other`, "");
                      }
                    }
                    onChange(question.id, newValue);
                  }}
                />
                <Label htmlFor={`${question.id}-${index}`} className="font-normal peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  {option}
                </Label>
              </div>
            ))}
          </div>
          {question.subFields?.other && checkboxValue.includes(lang === 'rw' ? "Ibindi (sobanura)" : "Other") && (
            <div className="mt-4">
              <Label className="font-medium">
                {question.subFields.other.label}
                {question.subFields.other.required && <span className="text-red-500 ml-1" title={getTranslation(lang, 'form.required')}>*</span>}
              </Label>
              <Textarea
                id={`${question.id}-other`}
                value={formData[`${question.id}-other`] || ""}
                onChange={(e) => onChange(`${question.id}-other`, e.target.value)}
                placeholder={question.subFields.other.placeholder}
                className="mt-2"
              />
            </div>
          )}
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
      )

    case "dependent-dropdown":
      return (
        <div key={question.id} className="col-span-full space-y-2 animate-in fade-in-50 duration-300">
          <Label className="text-sm font-medium flex items-center gap-1">
            <Label htmlFor={question.id} className="font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              {question.label}
              {question.required && <span className="text-red-500" title={getTranslation(lang, 'form.required')}>*</span>}
            </Label>
          </Label>
          <DependentDropdown
            value={value || {}}
            onChange={(updates) => {
              if (onBatchUpdate) {
                onBatchUpdate(updates);
              }
            }}
            error={Boolean(error)}
            lang={lang}
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
      )

    case "file":
      return (
        <div className={questionClasses}>
          <Label htmlFor={question.id} className="font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {question.label}
            {question.required && <span className="text-red-500 ml-1" title={getTranslation(lang, 'form.required')}>*</span>}
          </Label>
          <Input
            id={question.id}
            type="file"
            onChange={(e) => {
              const file = e.target.files?.[0] || null
              if (onFileUpload) {
                onFileUpload(question.id, file)
              } else {
                handleFileChange(e)
              }
            }}
            accept={question.validation?.acceptedTypes?.join(",") || ".pdf,.png,.jpg,.jpeg"}
            className={inputClasses}
          />
          {error && <p className="text-sm">{error}</p>}
        </div>
      )

    default:
      return null
  }
}

const translations: Record<'en' | 'rw', Translations> = {
  en: {
    loading: {
      title: "Loading Application Form",
      description: "Please wait while we load the application form..."
    },
    form: {
      title: "Application Form",
      saving: "Saving...",
      description: "Please fill out the form below",
      required: "Required",
      validation: {
        required: "is required",
        invalidEmail: "Please enter a valid email address",
        invalidPhone: "Please enter a valid phone number (07XXXXXXXX)",
        minLength: "must be at least {0} characters",
        age: "Age must be between 16 and 100 years",
        address: "Please complete all address fields",
        disability: "Please select at least one option",
        error: "An error occurred during validation. Please try again.",
        fixErrors: "Please fix {0} error(s) before proceeding.",
        invalidFormat: "Invalid format"
      },
      phone: {
        hint: "Enter your phone number"
      }
    },
    navigation: {
      previous: "Previous",
      next: "Next",
      submitting: "Submitting...",
      submit: "Submit Application"
    },
    submitting: {
      title: "Submitting Application",
      description: "Please wait while we submit your application..."
    },
    error: {
      title: "Error Loading Form",
      tryAgain: "Try Again"
    },
    maintenance: {
      title: "Under Maintenance",
      description: "The application form is currently under maintenance. Please try again later."
    },
    branding: {
      title: "Digital Community Champions",
      subtitle: "Join our network of digital champions making a difference in communities across Rwanda",
      communityImpact: {
        title: "Make a Difference",
        description: "Help bridge the digital divide in your community"
      },
      professionalGrowth: {
        title: "Grow Your Skills",
        description: "Access training and development opportunities"
      },
      networkOpportunities: {
        title: "Join Our Network",
        description: "Connect with other champions across Rwanda"
      }
    }
  },
  rw: {
    loading: {
      title: "Tegereza Ifishi y'ubusabe",
      description: "Nyamuneka tegereza Ifishi y'ubusabe ruribukinguke..."
    },
    form: {
      title: "Ifishi y'ubusabe",
      saving: "Kubika...",
      description: "Nyamuneka uzuza urupapuro rukurikira",
      required: "Birakenewe",
      validation: {
        required: "irakenewe",
        invalidEmail: "Nyamuneka andika imeli ikora",
        invalidPhone: "Nyamuneka andika numero ya telefoni ikora (07XXXXXXXX)",
        minLength: "igomba kuba nibura inyuguti {0}",
        age: "Imyaka igomba kuba hagati ya 16 na 100",
        address: "Nyamuneka uzuza amakuru yose y'aho utuye",
        disability: "Nyamuneka hitamo nibura uburyo bumwe",
        error: "Habaye ikibazo mu kugenzura. Nyamuneka ongera ugerageze.",
        fixErrors: "Nyamuneka kosora amakosa {0} mbere yo gukomeza.",
        invalidFormat: "Ntabwo byanditse neza"
      },
      phone: {
        hint: "Andika nomero ya telefoni"
      }
    },
    navigation: {
      previous: "Gusubira Inyuma",
      next: "Komeza",
      submitting: "Kohereza...",
      submit: "Ohereza Ubusabe"
    },
    submitting: {
      title: "Kohereza Ubusabe",
      description: "Nyamuneka tegereza Ubusabe ruribukinguke..."
    },
    error: {
      title: "Ikibazo mu Gufungura Urupapuro",
      tryAgain: "Ongera Ugerageze"
    },
    maintenance: {
      title: "Turi mu Gusana",
      description: "Ifishi y'ubusabe ruri mu gusanwa. Nyamuneka ongera ugerageze nyuma."
    },
    branding: {
      title: "Intumwa z'Ikoranabuhanga mu Muryango",
      subtitle: "Injira mu muryango w'intumwa z'ikoranabuhanga zizana impinduka mu miryango y'u Rwanda",
      communityImpact: {
        title: "Zana Impinduka",
        description: "Fasha mu gufasha abaturage kumenya ikoranabuhanga"
      },
      professionalGrowth: {
        title: "Kura mu Bumenyi",
        description: "Bona amahugurwa n'amahirwe yo kwigira imbere"
      },
      networkOpportunities: {
        title: "Injira mu Muryango",
        description: "Bana n'izindi ntumwa mu Rwanda hose"
      }
    }
  }
};

export default function ApplicationFormFixed({ 
  initialApplicationId, 
  isSessionExpired: initialIsSessionExpired = false,
  onSubmitSuccess,
  lang = 'en'
}: ApplicationFormFixedProps) {
  const router = useRouter()
  const navigate = useNavigate()
  const { isConnected } = useDatabaseStatus()

  const [formConfig, setFormConfig] = useState<FormConfig | null>(null)
  const [formData, setFormData] = useState<FormData>({})
  const [currentStep, setCurrentStep] = useState(1)
  const [applicationId, setApplicationId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isSessionExpired, setIsSessionExpired] = useState(initialIsSessionExpired)
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set())
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])
  const [loadingMessage, setLoadingMessage] = useState("Loading Application Form")
  const [loadingDescription, setLoadingDescription] = useState("Please wait while we load the application form...")
  const [currentSection, setCurrentSection] = useState<FormSection | null>(null)
  const [totalSteps, setTotalSteps] = useState(0)
  const [progress, setProgress] = useState(0)

  // Update progress when currentStep or totalSteps change
  useEffect(() => {
    setProgress(totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0)
  }, [currentStep, totalSteps])

  // Initialize form on mount and when language changes
  useEffect(() => {
    console.log("🌐 Language changed to:", lang)
    initializeForm()
  }, [lang, initialApplicationId])

  // Initialize form
  const initializeForm = async () => {
    try {
      setIsLoading(true)
      setLoadError(null)
      
      // Load form configuration with language
      const config = await getFormConfig(undefined, lang)
      setFormConfig(config)
      setTotalSteps(getTotalSteps(lang))

      // Check for active session
      const session = getActiveSession()
      if (session) {
        // Restore session data and update translations
        const translations = formServiceTranslations[lang as keyof typeof formServiceTranslations] || formServiceTranslations.en
        const updatedFormData = { ...session.formData }
        
        // Update translations for option-based questions
        Object.keys(updatedFormData).forEach(key => {
          const question = config.sections
            .flatMap(section => section.questions)
            .find(q => q.id === key)
          
          if (question?.options) {
            // Map the English value to the translated value
            const englishOptions = formServiceTranslations.en.questions[key as keyof typeof formServiceTranslations.en.questions]?.options || []
            const translatedOptions = translations.questions[key as keyof typeof translations.questions]?.options || []
            
            const englishIndex = englishOptions.indexOf(updatedFormData[key])
            if (englishIndex !== -1 && translatedOptions[englishIndex]) {
              updatedFormData[key] = translatedOptions[englishIndex]
            }
          }
        })
        
        setApplicationId(session.applicationId)
        setFormData(updatedFormData)
        setCurrentStep(session.currentStep || 1)
        updateSessionActivity(session.applicationId, updatedFormData)
        setCurrentSection(getFormSectionByStep(session.currentStep || 1, lang))
      } else if (initialApplicationId) {
        // Load existing application
        const application = await getApplicationById(initialApplicationId)
        if (application) {
          setApplicationId(application.id)
          setFormData(application.formData || {})
          setCurrentStep(application.currentStep || 1)
          createSession(application.id, application.formData, application.currentStep)
          setCurrentSection(getFormSectionByStep(application.currentStep || 1, lang))
        } else {
          startFreshApplication()
          setCurrentSection(getFormSectionByStep(1, lang))
        }
      } else {
        startFreshApplication()
        setCurrentSection(getFormSectionByStep(1, lang))
      }
    } catch (error) {
      console.error("Failed to initialize form:", error)
      setLoadError("Failed to load the application form. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Update form data
  const updateFormData = (field: string, value: any) => {
    console.log("Updating form data:", { field, value, lang })
    const newFormData = { ...formData, [field]: value }
    setFormData(newFormData)

    // Update session storage
    if (applicationId) {
      updateSessionActivity(applicationId, newFormData, currentStep)
    }

    console.log("New form data:", JSON.stringify(newFormData, null, 2))
  }

  // Auto-save progress
  const autoSaveProgress = async (updatedData: FormData) => {
    if (!applicationId) return

    try {
      setIsSaving(true)
      const applicationData: ApplicationData = {
        id: applicationId,
        phone: updatedData.q10 || "",
        email: updatedData.q9 || "",
        status: "TEMPORARY",
        formData: updatedData,
        currentStep,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        notes: "",
        dccCreated: false,
        autoCreatedAt: new Date().toISOString(),
        lastActivity: new Date().toISOString()
      }

      await saveApplicationProgress(applicationData)
      
      // Update session storage
      updateSessionActivity(applicationId, updatedData, currentStep)
      
      toast.success("Progress Saved", {
        description: "Your progress has been saved successfully.",
      })
      
      console.log("Auto-saved progress for application:", applicationId)
    } catch (error) {
      console.error("Failed to auto-save progress:", error)
      toast.error("Error", {
        description: "Failed to save progress. Please try again.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Function to handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (isSubmitting) {
      return
    }

    setIsSubmitting(true)

    try {
      // Ensure we have the required contact information
      const phone = formData.q10 || formData.q8 || ""
      const email = formData.q9 || formData.q7 || ""
      
      if (!phone) {
        throw new Error("Phone number is required")
      }

      // Clean and validate phone number
      const cleanPhone = phone.replace(/\s+/g, '').trim()
      if (!/^07\d{8}$/.test(cleanPhone)) {
        throw new Error("Please enter a valid phone number starting with 07 followed by 8 digits")
      }

      // Prepare the final application data with email as is (no validation)
      const finalData: ApplicationData = {
        id: applicationId || generateApplicationId(),
        phone: cleanPhone,
        email: email || undefined,
        status: "SUBMITTED",
        formData: {
          ...formData,
          phone: cleanPhone,
          email: email || undefined,
        },
        currentStep: totalSteps,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        notes: "",
        dccCreated: false
      }

      // First mark the application as submitted if it exists
      if (applicationId) {
        await markApplicationAsSubmitted(applicationId)
      }

      // Submit the application
      const savedApplication = await submitApplication(finalData)
      
      if (!savedApplication || !savedApplication.id) {
        throw new Error("Failed to save application")
      }

      // Notifications (SMS + Email) are handled automatically by the backend API
      // No need to send additional notifications from frontend

      // Clean up storage
      cleanupApplicationStorage(savedApplication.id)
      clearSession()

      // Show success message
      toast.success("Success!", {
        description: "Your application has been submitted successfully.",
        duration: 3000,
      })

      // Handle success
      if (onSubmitSuccess) {
        onSubmitSuccess()
      } else {
        // Delay navigation to allow toast to be visible
        setTimeout(() => {
          navigate.push('/rw')
        }, 1500)
      }
    } catch (error) {
      console.error("Failed to submit application:", error)
      toast.error("Error", {
        description: error instanceof Error ? error.message : "Failed to submit application. Please try again.",
        duration: 5000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Function to handle next step
  const nextStep = async () => {
    if (!validateCurrentSection()) {
      return
    }

    const nextStepNumber = currentStep + 1
    if (nextStepNumber <= totalSteps) {
      setCurrentStep(nextStepNumber)
      setCurrentSection(getFormSectionByStep(nextStepNumber, lang))
      
      // Update session
      if (applicationId) {
        updateSessionActivity(applicationId, formData, nextStepNumber)
      }

      // Auto-save progress
      await autoSaveProgress(formData)

      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // Function to handle previous step
  const prevStep = () => {
    const prevStepNumber = currentStep - 1
    if (prevStepNumber >= 1) {
      setCurrentStep(prevStepNumber)
      setCurrentSection(getFormSectionByStep(prevStepNumber, lang))
      
      // Update session
      if (applicationId) {
        updateSessionActivity(applicationId, formData, prevStepNumber)
      }

      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // Handle session expiration
  const handleSessionExpired = () => {
    setIsSessionExpired(true)
    clearSession()
    toast.error("Session Expired", {
      description: "Your session has expired. Please save your progress and continue.",
    })
  }

  // Validation helpers
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Validate phone number
  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^07\d{8}$/;
    return phoneRegex.test(phone.replace(/\s+/g, ''));
  };

  // Validate field
  const validateField = (question: FormQuestion, value: any): string[] => {
    const errors: string[] = []
    const label = question.label

    try {
      // Required field validation (skip for email fields)
      if (question.required && !value && question.type !== "email") {
        errors.push(`${label} ${getTranslation(lang, 'form.validation.required')}`)
      }

      // Pattern validation
      if (question.validation?.pattern && value) {
        const pattern = new RegExp(question.validation.pattern)
        if (!pattern.test(value)) {
          errors.push(question.validation.message || getTranslation(lang, 'form.validation.invalidFormat') || translations.en.form.validation.invalidFormat)
        }
      }

      // Type-specific validation
      switch (question.type) {
        case "email":
          // Skip all email validation completely
          break

        case "phone":
          if (value) {
            const cleanPhone = value.replace(/\s+/g, '').trim()
            if (!/^07\d{8}$/.test(cleanPhone)) {
              errors.push(getTranslation(lang, 'form.validation.invalidPhone') || translations.en.form.validation.invalidPhone)
            }
          }
          break

        case "text":
          // Name validation
          if ((question.id === "q1" || question.id === "q2") && value.length < 2) {
            const minLength = getTranslation(lang, 'form.validation.minLength') || translations.en.form.validation.minLength
            errors.push(`${label} ${minLength.replace("{0}", "2")}`)
          }
          break

        case "textarea":
          if (question.required && value.length < 10) {
            const minLength = getTranslation(lang, 'form.validation.minLength') || translations.en.form.validation.minLength
            errors.push(`${label} ${minLength.replace("{0}", "10")}`)
          }
          break

        case "date":
          if (question.id === "q3") {
            const date = new Date(value)
            if (!isValid(date)) {
              errors.push(getTranslation(lang, 'form.validation.invalidFormat') || translations.en.form.validation.invalidFormat)
              break
            }
            const today = new Date()
            const age = today.getFullYear() - date.getFullYear()
            if (age < 16 || age > 100) {
              errors.push(getTranslation(lang, 'form.validation.age') || translations.en.form.validation.age)
            }
          }
          break

        case "checkbox":
          // Special validation for disability types
          if (question.id === "q6b" && (safeGetFieldValue(formData, "q6a", "radio") === "Yes" || safeGetFieldValue(formData, "q6a", "radio") === "Yego")) {
            if (!value || (Array.isArray(value) && value.length === 0)) {
              errors.push(getTranslation(lang, 'form.validation.disability') || translations.en.form.validation.disability)
            }
            // Validate "Other" subfield if selected
            if (Array.isArray(value) && (value.includes("Other") || value.includes("Ibindi (sobanura)")) && question.subFields?.other) {
              const otherValue = formData[`${question.id}-other`]
              if (!otherValue && question.subFields.other.required) {
                errors.push(`${question.subFields.other.label} ${getTranslation(lang, 'form.validation.required') || translations.en.form.validation.required}`)
              }
            }
          }
          break

        case "dependent-dropdown":
          if (question.required) {
            const { province, district, sector, cell, village } = value as any
            if (!province || !district || !sector || !cell || !village) {
              errors.push(getTranslation(lang, 'form.validation.address') || translations.en.form.validation.address)
            }
          }
          break
      }
    } catch (error) {
      console.error(`❌ Error validating field ${question.id}:`, error)
      const errorMsg = getTranslation(lang, 'form.validation.error') || translations.en.form.validation.error
      errors.push(errorMsg.replace("{0}", label))
    }

    return errors
  }

  // Validate current section
  const validateCurrentSection = (): boolean => {
    if (!currentSection) return true

    console.log("🚀 Starting validation for section:", currentSection.title)
    console.log("🚀 Current formData:", formData)

    const errors: ValidationError[] = []
    const newTouchedFields = new Set(touchedFields)

    try {
      currentSection.questions.forEach((question) => {
        console.log(`🔄 Processing question: ${question.id} (${question.type})`)

        // Use safe field access
        const value = safeGetFieldValue(formData, question.id, question.type)
        console.log(`🔄 Safe value for ${question.id}:`, value)

        const fieldErrors = validateField(question, value)
        console.log(`🔄 Validation result for ${question.id}:`, fieldErrors)

        if (fieldErrors.length > 0) {
          fieldErrors.forEach((error) => {
            errors.push({
              field: question.id,
              message: error,
            })
            newTouchedFields.add(question.id)
          })
        }
      })
    } catch (error) {
      console.error("❌ Error during section validation:", error)
      toast.error("Error", {
        description: "An error occurred during validation. Please try again.",
      })
      return false
    }

    setValidationErrors(errors)
    setTouchedFields(newTouchedFields)

    if (errors.length > 0) {
      console.log("❌ Validation errors found:", errors)
      const errorMsg = getTranslation(lang, 'form.validation.fixErrors') || translations.en.form.validation.fixErrors
      toast.error("Validation Error", {
        description: errorMsg.replace("{0}", errors.length.toString()),
      })
      return false
    }

    console.log("✅ Validation passed!")
    return true
  }

  // Get field error
  const getFieldError = (fieldId: string): string | null => {
    const error = validationErrors.find((err) => err.field === fieldId)
    return error ? error.message : null
  }

  // Mark field as touched
  const markFieldAsTouched = (fieldId: string) => {
    setTouchedFields((prev) => new Set([...prev, fieldId]))
  }

  // Update form data batch
  const updateFormDataBatch = (updates: Record<string, any>) => {
    console.log(`📝 Batch updating form data:`, updates)
    setFormData((prevData) => {
      const updatedFormData = { ...prevData, ...updates }
      console.log(`📝 Batch updated form data:`, updatedFormData)
      return updatedFormData
    })

    // Mark all fields as touched
    Object.keys(updates).forEach((field) => markFieldAsTouched(field))

    // Auto-save if we have an application ID (but not if starting fresh)
    const urlParams = new URLSearchParams(window.location.search)
    const freshParam = urlParams.get("fresh")

    if (applicationId && freshParam !== "true") {
      // Use setTimeout to batch the auto-save after all updates
      setTimeout(() => {
        setFormData((currentData) => {
          autoSaveProgress(currentData)
          return currentData
        })
      }, 100)
    }
  }

  // Handle file upload
  const handleFileUpload = async (field: string, file: File | null) => {
    if (!file) {
      setFormData((prev) => ({ ...prev, [field]: null }))
      return
    }

    try {
      const data = new FormData()
      data.append('file', file)

      const res = await fetch('/api/public-upload', {
        method: 'POST',
        body: data
      })

      const json = await res.json()
      if (res.ok && json?.url) {
        setFormData((prev) => ({ ...prev, [field]: json.url }))
      } else {
        console.error('Upload failed:', json)
        setFormData((prev) => ({ ...prev, [field]: file.name }))
      }
    } catch (e) {
      console.error('Upload error:', e)
      setFormData((prev) => ({ ...prev, [field]: file.name }))
    }
    markFieldAsTouched(field)

    // Validate file upload
    if (file) {
      const question = currentSection?.questions.find((q) => q.id === field)
      if (question?.required || file) {
        setValidationErrors((prev) => prev.filter((err) => err.field !== field))
      }
    }

    const urlParams = new URLSearchParams(window.location.search)
    const freshParam = urlParams.get("fresh")

    if (applicationId && freshParam !== "true") {
      const updatedData = { ...formData, [field]: formData[field] }
      autoSaveProgress(updatedData)
    }
  }

  // Helper function to get translated value for comparison
  const getTranslatedValue = (value: string): string => {
    // Map of English to Kinyarwanda translations for common values
    const translations: Record<string, string> = {
      'Yes': 'Yego',
      'No': 'Oya',
      'Other': 'Ibindi'
    }
    
    return lang === 'rw' ? (translations[value] || value) : value
  }

  // Should show question
  const shouldShowQuestion = (question: FormQuestion): boolean => {
    if (!question.dependsOn) {
      return true
    }

    const { questionId, value } = question.dependsOn
    const dependentValue = formData[questionId]

    // Debug logging
    console.log(`Checking dependency for question ${question.id}:`, {
      questionId,
      expectedValue: value,
      actualValue: dependentValue,
      formData: formData
    })

    // Handle includes: dependencies
    if (value.startsWith('includes:')) {
      const targetValue = value.replace('includes:', '')
      const translatedTargetValue = getTranslatedValue(targetValue)
      const selectedValues = Array.isArray(dependentValue) ? dependentValue : [dependentValue]
      const result = selectedValues.includes(translatedTargetValue)
      console.log('Includes check result:', { targetValue, translatedTargetValue, selectedValues, result })
      return result
    }

    // Handle exact match dependencies
    const translatedExpectedValue = getTranslatedValue(value)
    const result = dependentValue === translatedExpectedValue
    console.log('Exact match result:', { 
      expected: value,
      translatedExpected: translatedExpectedValue,
      actual: dependentValue,
      result 
    })
    return result
  }

  // Clear all local data
  const clearAllLocalData = () => {
    setFormData({})
    setTouchedFields(new Set())
    setValidationErrors([])
    setCurrentStep(1)
    setApplicationId(null)
    clearSession()
  }

  // Start fresh application
  const startFreshApplication = () => {
    clearAllLocalData()
    const newApplicationId = `APP-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    setApplicationId(newApplicationId)
    createSession(newApplicationId) // Create new session
  }

  // Show loading states
  if (isLoading) {
    return <LoadingComponent message={loadingMessage} description={loadingDescription} lang={lang} />
  }

  if (isSubmitting) {
    return <LoadingComponent message="Submitting Application" description="Please wait while we submit your application..." lang={lang} />
  }

  if (loadError) {
    return <ErrorComponent error={new Error(loadError)} reset={() => {
      setLoadError(null)
      setIsLoading(true)
      initializeForm()
    }} />
  }

  // Render form content
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container w-full mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{getTranslation(lang, 'form.title') || translations.en.form.title}</span>
              {isSaving && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {getTranslation(lang, 'form.saving') || translations.en.form.saving}
                </div>
              )}
            </CardTitle>
            <CardDescription>
              {currentSection?.description || getTranslation(lang, 'form.description') || translations.en.form.description}
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent>
              {/* Progress bar */}
              <div className="mb-8">
                <Progress value={progress} className="h-2" />
                <p className="text-sm text-muted-foreground mt-2">
                  {lang === 'rw' ? `Intambwe ya ${currentStep} kuri ${totalSteps}` : `Step ${currentStep} of ${totalSteps}`}
                </p>
              </div>

              {/* Form section */}
              <div className="space-y-6">
                {currentSection?.questions.map((question) => (
                  shouldShowQuestion(question) && (
                    <div key={question.id} className="space-y-4">
                      <QuestionRenderer
                        question={question}
                        value={safeGetFieldValue(formData, question.id, question.type)}
                        formData={formData}
                        onChange={updateFormData}
                        onBlur={() => markFieldAsTouched(question.id)}
                        error={getFieldError(question.id)}
                        onFileUpload={handleFileUpload}
                        onBatchUpdate={updateFormDataBatch}
                        lang={lang}
                      />
                    </div>
                  )
                ))}
              </div>
            </CardContent>

            <CardFooter className="flex justify-between">
              {/* Navigation buttons */}
              <div className="flex gap-4">
                {currentStep > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    disabled={isSubmitting || isSaving}
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    {getTranslation(lang, 'navigation.previous') || translations.en.navigation.previous}
                  </Button>
                )}
                {currentStep < totalSteps && (
                  <Button
                    type="button"
                    onClick={nextStep}
                    disabled={isSubmitting || isSaving}
                    className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {getTranslation(lang, 'navigation.next') || translations.en.navigation.next}
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
                {currentStep === totalSteps && (
                  <Button
                    type="submit"
                    disabled={isSubmitting || isSaving}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {getTranslation(lang, 'navigation.submitting') || translations.en.navigation.submitting}
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        {getTranslation(lang, 'navigation.submit') || translations.en.navigation.submit}
                      </>
                    )}
                  </Button>
                )}
              </div>

              {/* Save progress button */}
              <Button
                type="button"
                variant="outline"
                onClick={() => autoSaveProgress(formData)}
                disabled={isSubmitting || isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {getTranslation(lang, 'form.saving') || translations.en.form.saving}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {lang === 'rw' ? "Kubika Ibyo Wanditse" : "Save Progress"}
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}