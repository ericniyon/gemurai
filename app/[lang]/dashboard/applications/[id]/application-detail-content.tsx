"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Loader2, AlertCircle, User, Mail, Phone, MapPin, Calendar, Brain, 
  FileText, CheckCircle, XCircle, AlertTriangle, ChevronRight, Download, 
  Clock, Shield, ShieldAlert, ShieldCheck, ShieldQuestion, ChevronDown, 
  Briefcase, InfoIcon, Laptop, Users, Home, Heart, Building, Network,
  GraduationCap
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { SCORING_CRITERIA } from "@/lib/constants"
import { VulnerabilityAssessment } from "./vulnerability-assessment"
import { ManualEvaluation } from "@/components/manual-evaluation"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { smartSchoolTheme as theme } from "@/lib/styles/smart-school-theme"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface ApplicationEvaluation {
  id: string;
  type: string;
  score: number;
  questionScores: Record<string, any>;
  feedback: string;
  metadata?: {
    vulnerabilityScore?: number;
    aiScore?: number;
    strengths?: string[];
    improvements?: string[];
    recommendations?: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

interface MetricScore {
  score: number;
  comment: string;
  lastUpdated: string;
}

interface EmployerEvaluation {
  id?: string;
  metrics: {
    [key in keyof typeof SCORING_CRITERIA]: {
      score: number;
      comment: string;
    };
  };
  overallComment: string;
  totalScore?: number;
  evaluatedBy?: string;
  evaluatedAt: string;
}

interface Evaluation {
  // Income & Employment (20pts)
  incomeRange: string;
  employmentStability: string;
  additionalIncome: string;
  // Digital Access (15pts)
  deviceOwnership: string;
  internetAccess: string;
  digitalLiteracy: string;
  // Family Status (10pts)
  maritalStatus: string;
  dependents: string;
  familySupport: string;
  // Female-Headed Household (10pts)
  primaryIncomeProvider: string;
  householdResponsibilities: string;
  communityEngagement: string;
  // Disability/Chronic Illness (10pts)
  healthCondition: string;
  adaptability: string;
  supportNeeds: string;
  // Housing Conditions (10pts)
  housingType: string;
  housingStability: string;
  livingConditions: string;
  // Social Capital (10pts)
  communityInvolvement: string;
  networkStrength: string;
  leadershipRole: string;
  // Education & Skills (10pts)
  educationLevel: string;
  relevantTraining: string;
  skillsAssessment: string;
  recommendations: string;
}

interface FormDataStructure {
  q1: string | null; // First Name
  q2: string | null; // Last Name
  q7?: string | null; // Email
  q8?: string | null; // Phone
  q9?: string | null; // Alternative Email
  q10?: string | null; // Alternative Phone
  sector: string | null;
  district: string | null;
  yearsExperience: number | null;
  skills: string[];
  education: string | null;
  status: string | null;
  currentPosition: string | null;
  employer: string | null;
  other: Record<string, any>;
}

interface ApplicationData {
  id: string;
  formData: any;
  status: ApplicationStatus;
  evaluations: ApplicationEvaluation[];
  createdAt: string;
  updatedAt: string;
}

interface ApplicationDetailContentProps {
  initialData: ApplicationData;
  user: {
    id: string;
    role: string;
    permissions: string[];
  };
  permissions: {
    canView: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canEvaluate: boolean;
  };
}

interface AverageScores {
  totalScore: number;
  metrics: {
    [key in keyof typeof SCORING_CRITERIA]: number;
  };
}

// Vulnerability assessment metrics with descriptions and weights
const VULNERABILITY_METRICS = [
  {
    id: "personal_info",
    title: "Personal Info",
    weight: 0,
    description: "Basic personal information and contact details",
    icon: "👤"
  }
]

interface ScoreResult {
  score: number;
  percentage: number;
}

// Function to calculate total score
function calculateTotalScore(formData: any): ScoreResult {
  let totalScore = 0;

  Object.entries(SCORING_CRITERIA).forEach(([field, criteria]) => {
    const value = formData[field];
    if (value) {
      totalScore += criteria.calculate(value);
    }
  });

  return {
    score: totalScore,
    percentage: totalScore // Score is already out of 100
  };
}

// Function to get score level
function getScoreLevel(score: number): "HIGH" | "MEDIUM" | "LOW" {
  if (score >= 75) return "HIGH";
  if (score >= 50) return "MEDIUM";
  return "LOW";
}

type ApplicationStatus = 'TEMPORARY' | 'SUBMITTED' | 'UNDER_REVIEW' | 'PENDING_DOCUMENTS' | 'APPROVED' | 'REJECTED';

// Add comprehensive style system at the top of the file
const smartSchoolStyles = {
  // Font Families
  fonts: {
    primary: "font-['Roboto',_'Nunito',_system-ui,_-apple-system]",
    secondary: "font-['Open_Sans',_'Poppins',_sans-serif]",
    heading: "font-['Montserrat',_'Roboto',_sans-serif]",
  },

  // Font Sizes
  text: {
    xs: "text-xs", // 12px
    sm: "text-sm", // 14px
    base: "text-base", // 16px
    lg: "text-lg", // 18px
    xl: "text-xl", // 20px
    "2xl": "text-2xl", // 24px
    "3xl": "text-3xl", // 30px
    "4xl": "text-4xl", // 36px
  },

  // Font Weights
  fontWeight: {
    normal: "font-normal",
    medium: "font-medium",
    semibold: "font-semibold",
    bold: "font-bold",
  },

  // Colors
  colors: {
    primary: {
      light: "#0d6efd",
      DEFAULT: "#0a58ca",
      dark: "#084298",
    },
    secondary: {
      light: "#6c757d",
      DEFAULT: "#5c636a",
      dark: "#4d5154",
    },
    success: {
      light: "#198754",
      DEFAULT: "#146c43",
      dark: "#0f5132",
    },
    info: {
      light: "#0dcaf0",
      DEFAULT: "#087990",
      dark: "#055160",
    },
    warning: {
      light: "#ffc107",
      DEFAULT: "#cc9a06",
      dark: "#997404",
    },
    danger: {
      light: "#dc3545",
      DEFAULT: "#b02a37",
      dark: "#842029",
    },
    background: {
      light: "#f8f9fa",
      DEFAULT: "#f0f2f5",
      dark: "#e9ecef",
    },
  },

  // Gradients
  gradients: {
    primary: "bg-gradient-to-r from-[#0a58ca] to-[#0d6efd]",
    secondary: "bg-gradient-to-r from-[#5c636a] to-[#6c757d]",
    card: "bg-gradient-to-r from-[#f8f9fa] to-white",
    cardHover: "hover:bg-gradient-to-r hover:from-white hover:to-[#f8f9fa]",
  },

  // Shadows
  shadows: {
    sm: "shadow-[0_1px_2px_rgba(15,_34,_58,_0.12)]",
    DEFAULT: "shadow-[0_2px_4px_rgba(15,_34,_58,_0.12)]",
    md: "shadow-[0_4px_6px_rgba(15,_34,_58,_0.12)]",
    lg: "shadow-[0_8px_12px_rgba(15,_34,_58,_0.12)]",
    hover: "hover:shadow-[0_4px_8px_rgba(15,_34,_58,_0.2)]",
  },

  // Border Radius
  rounded: {
    sm: "rounded",
    DEFAULT: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
    full: "rounded-full",
  },

  // Spacing
  spacing: {
    px: "p-px",
    0: "p-0",
    1: "p-1",
    2: "p-2",
    3: "p-3",
    4: "p-4",
    5: "p-5",
    6: "p-6",
    8: "p-8",
    10: "p-10",
    12: "p-12",
  },

  // Layout
  layout: {
    container: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
    section: "py-12 sm:py-16 lg:py-20",
    card: "bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200",
  },

  // Transitions
  transitions: {
    DEFAULT: "transition-all duration-200",
    fast: "transition-all duration-150",
    slow: "transition-all duration-300",
  },

  // Component Specific
  components: {
    // Button Styles
    button: {
      base: "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
      primary: "bg-[#0a58ca] text-white hover:bg-[#084298]",
      secondary: "bg-[#6c757d] text-white hover:bg-[#5c636a]",
      outline: "border-2 border-[#0a58ca] text-[#0a58ca] hover:bg-[#0a58ca] hover:text-white",
      sizes: {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4",
        lg: "h-12 px-6 text-lg",
      },
    },
    
    // Card Styles
    card: {
      base: "bg-white rounded-lg overflow-hidden",
      header: "px-6 py-4 border-b border-gray-200",
      body: "p-6",
      footer: "px-6 py-4 bg-gray-50",
      hover: "hover:shadow-lg transition-shadow duration-200",
    },

    // Input Styles
    input: {
      base: "block w-full rounded-md border-gray-300 shadow-sm focus:border-[#0a58ca] focus:ring focus:ring-[#0a58ca] focus:ring-opacity-50",
      sizes: {
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2",
        lg: "px-4 py-2.5 text-lg",
      },
    },

    // Table Styles
    table: {
      base: "min-w-full divide-y divide-gray-200",
      header: "bg-gray-50",
      headerCell: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
      cell: "px-6 py-4 whitespace-nowrap text-sm text-gray-900",
      row: "hover:bg-gray-50",
    },

    // Badge Styles
    badge: {
      base: "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
      primary: "bg-[#0a58ca]/10 text-[#0a58ca]",
      success: "bg-[#198754]/10 text-[#198754]",
      warning: "bg-[#ffc107]/10 text-[#997404]",
      danger: "bg-[#dc3545]/10 text-[#842029]",
    },

    // Tab Styles
    tabs: {
      base: "border-b border-gray-200",
      tab: "px-4 py-2 text-sm font-medium text-gray-500 hover:text-[#0a58ca] hover:border-[#0a58ca]",
      selected: "text-[#0a58ca] border-b-2 border-[#0a58ca]",
    },
  },
};

// Add vulnerability assessment types
interface VulnerabilityMetrics {
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  score: number;
  category: string;
  description: string;
  recommendations: string[];
}

interface SecurityMetrics {
  overallScore: number;
  categories: {
    [key: string]: number;
  };
  vulnerabilities: VulnerabilityMetrics[];
}

// Helper function to format form data for display
const formatFormData = (formData: any): FormDataStructure => {
  return {
    q1: formData.q1 || null,
    q2: formData.q2 || null,
    q7: formData.q7 || null,
    q8: formData.q8 || null,
    q9: formData.q9 || null,
    q10: formData.q10 || null,
    sector: formData.sector || null,
    district: formData.district || null,
    yearsExperience: formData.yearsExperience ? Number(formData.yearsExperience) : null,
    skills: Array.isArray(formData.skills) ? formData.skills : [],
    education: formData.education || null,
    status: formData.status || null,
    currentPosition: formData.currentPosition || null,
    employer: formData.employer || null,
    other: formData.other || {}
  };
};

export function ApplicationDetailContent({ 
  initialData, 
  user,
  permissions 
}: ApplicationDetailContentProps) {
  const router = useRouter()
  const params = useParams() as { lang: string; id: string }
  const { toast } = useToast()
  const [data, setData] = useState<ApplicationData>(initialData)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [employerEvaluation, setEmployerEvaluation] = useState<EmployerEvaluation>({
    metrics: Object.fromEntries(
      Object.entries(SCORING_CRITERIA).map(([key]) => [
        key,
        { score: 0, comment: "" }
      ])
    ) as EmployerEvaluation['metrics'],
    overallComment: "",
    evaluatedAt: new Date().toISOString()
  });
  const [evaluation, setEvaluation] = useState<Evaluation>({
    incomeRange: "",
    employmentStability: "",
    additionalIncome: "",
    deviceOwnership: "",
    internetAccess: "",
    digitalLiteracy: "",
    maritalStatus: "",
    dependents: "",
    familySupport: "",
    primaryIncomeProvider: "",
    householdResponsibilities: "",
    communityEngagement: "",
    healthCondition: "",
    adaptability: "",
    supportNeeds: "",
    housingType: "",
    housingStability: "",
    livingConditions: "",
    communityInvolvement: "",
    networkStrength: "",
    leadershipRole: "",
    educationLevel: "",
    relevantTraining: "",
    skillsAssessment: "",
    recommendations: "",
  });

  const formattedData = formatFormData(data.formData)

  // Get the latest evaluation
  const latestEvaluation = data.evaluations[data.evaluations.length - 1]

  // Calculate average score from all evaluations
  const averageScore = data.evaluations.length > 0
    ? Math.round(data.evaluations.reduce((acc, evaluation) => acc + evaluation.score, 0) / data.evaluations.length)
    : null

  // Helper function to get status badge variant
  const getStatusVariant = (status: ApplicationStatus): "default" | "destructive" | "secondary" | "outline" => {
    switch (status.toLowerCase()) {
      case "approved":
        return "default"
      case "rejected":
        return "destructive"
      case "under_review":
      case "pending_documents":
        return "secondary"
      case "submitted":
      case "temporary":
      default:
        return "outline"
    }
  }

  // Helper function to safely extract score value
  const getScoreValue = (score: any): number => {
    if (typeof score === 'number') return score
    if (typeof score === 'object' && score !== null) {
      return score.score || score.level || 0
    }
    return 0
  }

  const handleEvaluationChange = (field: keyof Evaluation, value: string) => {
    setEvaluation(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateIncomeEmploymentScore = (): number => {
    let score = 0;
    
    // Income Range scoring (8pts)
    switch (evaluation.incomeRange) {
      case "high": score += 8; break;
      case "medium": score += 6; break;
      case "low": score += 4; break;
      case "very_low": score += 2; break;
    }

    // Employment Stability scoring (6pts)
    switch (evaluation.employmentStability) {
      case "very_stable": score += 6; break;
      case "stable": score += 4; break;
      case "moderate": score += 2; break;
      case "unstable": score += 1; break;
    }

    // Additional Income scoring (6pts)
    switch (evaluation.additionalIncome) {
      case "multiple": score += 6; break;
      case "single": score += 4; break;
      case "potential": score += 2; break;
      case "none": score += 0; break;
    }

    return score;
  };

  const calculateDigitalAccessScore = (): number => {
    let score = 0;

    // Device Ownership scoring (5pts)
    switch (evaluation.deviceOwnership) {
      case "multiple": score += 5; break;
      case "smartphone": score += 4; break;
      case "basic": score += 2; break;
      case "none": score += 0; break;
    }

    // Internet Access scoring (5pts)
    switch (evaluation.internetAccess) {
      case "broadband": score += 5; break;
      case "mobile_data": score += 4; break;
      case "limited": score += 2; break;
      case "none": score += 0; break;
    }

    // Digital Literacy scoring (5pts)
    switch (evaluation.digitalLiteracy) {
      case "advanced": score += 5; break;
      case "intermediate": score += 3; break;
      case "basic": score += 2; break;
      case "none": score += 0; break;
    }

    return score;
  };

  const calculateFamilyStatusScore = (): number => {
    let score = 0;

    // Marital Status scoring (3pts)
    switch (evaluation.maritalStatus) {
      case "married": score += 3; break;
      case "single": score += 2; break;
      case "other": score += 1; break;
    }

    // Dependents scoring (4pts)
    switch (evaluation.dependents) {
      case "none": score += 4; break;
      case "1_2": score += 3; break;
      case "3_4": score += 2; break;
      case "5_plus": score += 1; break;
    }

    // Family Support scoring (3pts)
    switch (evaluation.familySupport) {
      case "strong": score += 3; break;
      case "moderate": score += 2; break;
      case "limited": score += 1; break;
      case "none": score += 0; break;
    }

    return score;
  };

  const calculateFemaleHeadedHouseholdScore = (): number => {
    let score = 0;

    // Primary Income Provider scoring (4pts)
    switch (evaluation.primaryIncomeProvider) {
      case "sole_provider": score += 4; break;
      case "main_provider": score += 3; break;
      case "shared_responsibility": score += 2; break;
      case "not_applicable": score += 0; break;
    }

    // Household Responsibilities scoring (3pts)
    switch (evaluation.householdResponsibilities) {
      case "full": score += 3; break;
      case "major": score += 2; break;
      case "shared": score += 1; break;
      case "minimal": score += 0; break;
    }

    // Community Engagement scoring (3pts)
    switch (evaluation.communityEngagement) {
      case "very_active": score += 3; break;
      case "active": score += 2; break;
      case "occasional": score += 1; break;
      case "none": score += 0; break;
    }

    return score;
  };

  const calculateDisabilityScore = (): number => {
    let score = 0;

    // Health Condition Impact scoring (4pts)
    switch (evaluation.healthCondition) {
      case "minimal_impact": score += 4; break;
      case "moderate_impact": score += 3; break;
      case "significant_impact": score += 2; break;
      case "severe_impact": score += 1; break;
    }

    // Adaptability scoring (3pts)
    switch (evaluation.adaptability) {
      case "highly_adaptable": score += 3; break;
      case "moderately_adaptable": score += 2; break;
      case "needs_support": score += 1; break;
      case "requires_assistance": score += 0; break;
    }

    // Support Needs scoring (3pts)
    switch (evaluation.supportNeeds) {
      case "self_sufficient": score += 3; break;
      case "minimal_support": score += 2; break;
      case "regular_support": score += 1; break;
      case "constant_support": score += 0; break;
    }

    return score;
  };

  const calculateHousingScore = (): number => {
    let score = 0;

    // Housing Type scoring (3pts)
    switch (evaluation.housingType) {
      case "owned": score += 3; break;
      case "rented_stable": score += 2; break;
      case "rented_temporary": score += 1; break;
      case "unstable": score += 0; break;
    }

    // Housing Stability scoring (4pts)
    switch (evaluation.housingStability) {
      case "very_stable": score += 4; break;
      case "stable": score += 3; break;
      case "at_risk": score += 2; break;
      case "unstable": score += 1; break;
    }

    // Living Conditions scoring (3pts)
    switch (evaluation.livingConditions) {
      case "excellent": score += 3; break;
      case "good": score += 2; break;
      case "fair": score += 1; break;
      case "poor": score += 0; break;
    }

    return score;
  };

  const calculateSocialCapitalScore = (): number => {
    let score = 0;

    // Community Involvement scoring (4pts)
    switch (evaluation.communityInvolvement) {
      case "very_active": score += 4; break;
      case "active": score += 3; break;
      case "occasional": score += 2; break;
      case "minimal": score += 1; break;
    }

    // Network Strength scoring (3pts)
    switch (evaluation.networkStrength) {
      case "extensive": score += 3; break;
      case "moderate": score += 2; break;
      case "limited": score += 1; break;
      case "minimal": score += 0; break;
    }

    // Leadership Role scoring (3pts)
    switch (evaluation.leadershipRole) {
      case "current_leader": score += 3; break;
      case "past_leader": score += 2; break;
      case "potential_leader": score += 1; break;
      case "no_experience": score += 0; break;
    }

    return score;
  };

  const calculateEducationSkillsScore = (): number => {
    let score = 0;

    // Education Level scoring (4pts)
    switch (evaluation.educationLevel) {
      case "tertiary": score += 4; break;
      case "secondary": score += 3; break;
      case "primary": score += 2; break;
      case "informal": score += 1; break;
    }

    // Relevant Training scoring (3pts)
    switch (evaluation.relevantTraining) {
      case "extensive": score += 3; break;
      case "moderate": score += 2; break;
      case "basic": score += 1; break;
      case "none": score += 0; break;
    }

    // Skills Assessment scoring (3pts)
    switch (evaluation.skillsAssessment) {
      case "advanced": score += 3; break;
      case "intermediate": score += 2; break;
      case "basic": score += 1; break;
      case "limited": score += 0; break;
    }

    return score;
  };

  const calculateTotalScore = (): number => {
    return (
      calculateIncomeEmploymentScore() + 
      calculateDigitalAccessScore() + 
      calculateFamilyStatusScore() + 
      calculateFemaleHeadedHouseholdScore() +
      calculateDisabilityScore() +
      calculateHousingScore() +
      calculateSocialCapitalScore() +
      calculateEducationSkillsScore()
    );
  };

  return (
    <div className={cn(
      "space-y-6",
      theme.fonts.primary,
      theme.layout.container
    )}>
      {/* Header Section */}
      <div className={cn(
        theme.rounded.xl,
        theme.shadows.DEFAULT,
        theme.gradients.primary,
        "relative overflow-hidden border"
      )}>
        <div className={cn(theme.spacing[8], "relative")}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-2">
              <h1 className={cn(
                theme.text["4xl"],
                theme.fontWeight.bold,
                theme.fonts.heading,
                "tracking-tight text-white"
              )}>
                Digital Community Champion Review
              </h1>
              <div className="flex flex-wrap items-center gap-4">
                <Badge 
                  variant="outline"
                  className={cn(
                    theme.components.badge.base,
                    "bg-white/10 text-white border-white/20",
                    theme.transitions.DEFAULT
                  )}
                >
                  {data.formData.status}
                </Badge>
                <div className="flex items-center gap-6 text-sm text-white/80">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Submitted: {format(new Date(data.formData.createdAt || new Date()), "PPP")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Last Updated: {format(new Date(data.formData.updatedAt || new Date()), "PPP")}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                size="sm"
                className={cn(
                  theme.components.button.outline,
                  theme.components.button.sizes.sm,
                  "bg-white/10 text-white border-white/20"
                )}
              >
                <Download className="h-4 w-4 mr-2" />
                Export DCC Profile
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Champion Info */}
        <div className="space-y-6">
          {/* Champion Profile Card */}
          <Card className={cn(
            theme.components.card.base,
            theme.components.card.hover,
            theme.gradients.card
          )}>
            <CardHeader className={theme.components.card.header}>
              <CardTitle className={cn(
                theme.text.xl,
                theme.fontWeight.semibold,
                theme.fonts.secondary,
                "flex items-center gap-2"
              )}>
                <User className={`h-5 w-5 text-[${theme.colors.primary.DEFAULT}]`} />
                Champion Profile
              </CardTitle>
            </CardHeader>
            <CardContent className={cn(theme.components.card.body, "space-y-6")}>
              <div className="flex flex-col gap-4">
                <div className={cn(
                  theme.rounded.lg,
                  theme.gradients.card,
                  "p-6"
                )}>
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      theme.rounded.full,
                      "h-16 w-16 bg-[#0a58ca] text-white",
                      "flex items-center justify-center",
                      "ring-2 ring-white shadow-xl"
                    )}>
                      <User className="h-8 w-8" />
                    </div>
                    <div>
                      <p className={cn(
                        theme.text.xl,
                        theme.fontWeight.semibold,
                        theme.fonts.secondary
                      )}>
                        {[data.formData.q1, data.formData.q2]
                          .filter(Boolean)
                          .join(" ")}
                      </p>
                      <p className={cn(
                        theme.text.sm,
                        "text-muted-foreground"
                      )}>
                        DCC ID: {data.id.slice(0, 8)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3">
                  {[
                    {
                      icon: <Mail className="h-5 w-5" />,
                      label: "Email Address",
                      value: formattedData.q7 || "No email provided"
                    },
                    {
                      icon: <Phone className="h-5 w-5" />,
                      label: "Phone Number",
                      value: formattedData.q8 || "No phone provided"
                    },
                    {
                      icon: <MapPin className="h-5 w-5" />,
                      label: "Community Location",
                      value: [formattedData.sector, formattedData.district]
                        .filter(Boolean)
                        .join(", ") || "No location provided"
                    },
                    {
                      icon: <Calendar className="h-5 w-5" />,
                      label: "Experience Level",
                      value: formattedData.yearsExperience 
                        ? `${formattedData.yearsExperience} years`
                        : "Not specified"
                    }
                  ].map((item, index) => (
                    <div 
                      key={index}
                      className={cn(
                        theme.rounded.lg,
                        theme.shadows.sm,
                        "flex items-center gap-3 p-4",
                        "bg-[#f8f9fa] hover:bg-white",
                        theme.transitions.DEFAULT,
                        "group/item"
                      )}
                    >
                      <div className={cn(
                        theme.rounded.full,
                        "h-10 w-10 bg-[#0a58ca]/10",
                        "flex items-center justify-center text-[#0a58ca]"
                      )}>
                        {item.icon}
                      </div>
                      <div>
                        <p className={cn(
                          theme.fontWeight.medium,
                          "group-hover/item:text-[#0a58ca]",
                          theme.transitions.DEFAULT
                        )}>
                          {item.value}
                        </p>
                        <p className={cn(
                          theme.text.sm,
                          "text-muted-foreground"
                        )}>
                          {item.label}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Skills & Expertise */}
          <Card className={cn(
            theme.components.card.base,
            theme.components.card.hover,
            theme.gradients.card
          )}>
            <CardHeader className={theme.components.card.header}>
              <CardTitle className={cn(
                theme.text.xl,
                theme.fontWeight.semibold,
                theme.fonts.secondary,
                "flex items-center gap-2"
              )}>
                <Brain className={`h-5 w-5 text-[${theme.colors.primary.DEFAULT}]`} />
                Skills & Expertise
              </CardTitle>
            </CardHeader>
            <CardContent className={cn(theme.components.card.body, "space-y-4")}>
              <div className="flex flex-wrap gap-2">
                {(() => {
                  const skills = formattedData.skills;
                  if (Array.isArray(skills) && skills.length > 0) {
                    return skills.map((skill: string, index: number) => (
                      <Badge 
                        key={index} 
                        variant="secondary"
                        className={cn(
                          "px-3 py-1.5",
                          "bg-[#0a58ca]/10 text-[#0a58ca]",
                          "hover:bg-[#0a58ca]/20",
                          theme.transitions.DEFAULT
                        )}
                      >
                        {skill}
                      </Badge>
                    ));
                  }
                  return (
                    <div className="w-full p-4 text-center text-muted-foreground bg-muted/50 rounded-lg">
                      No skills listed
                    </div>
                  );
                })()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Evaluation Content */}
        <div className="lg:col-span-2">
          <Card className={cn(
            theme.components.card.base,
            theme.shadows.DEFAULT,
            theme.gradients.card
          )}>
            <CardContent className="pt-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className={cn(
                  theme.components.tabs.base,
                  "w-full justify-start h-12 bg-transparent mb-6 space-x-8"
                )}>
                  <TabsTrigger
                    value="overview"
                    className={cn(
                      "relative h-12 rounded-none capitalize",
                      "border-b-2 border-transparent",
                      theme.components.tabs.tab,
                      "data-[state=active]:" + theme.components.tabs.selected
                    )}
                  >
                    <span className="relative z-10">Overview</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="community-impact"
                    className={cn(
                      "relative h-12 rounded-none capitalize",
                      "border-b-2 border-transparent",
                      theme.components.tabs.tab,
                      "data-[state=active]:" + theme.components.tabs.selected
                    )}
                  >
                    <span className="relative z-10">Community Impact</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="evaluations"
                    className={cn(
                      "relative h-12 rounded-none capitalize",
                      "border-b-2 border-transparent",
                      theme.components.tabs.tab,
                      "data-[state=active]:" + theme.components.tabs.selected
                    )}
                  >
                    <span className="relative z-10">
                      Evaluations ({data.evaluations.length})
                    </span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="form-data"
                    className={cn(
                      "relative h-12 rounded-none capitalize",
                      "border-b-2 border-transparent",
                      theme.components.tabs.tab,
                      "data-[state=active]:" + theme.components.tabs.selected
                    )}
                  >
                    <span className="relative z-10">Form Data</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  {/* Education & Experience */}
                  <div className="grid gap-6 md:grid-cols-2">
                    <Card className="border shadow-sm hover:shadow-md transition-all duration-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                          <FileText className="h-5 w-5 text-primary" />
                          Education
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="p-3 bg-muted/50 rounded-lg">
                            <p className="text-sm text-muted-foreground">Education Level</p>
                            <p className="font-medium mt-1">{formattedData.education || "Not specified"}</p>
                          </div>
                          <div className="p-3 bg-muted/50 rounded-lg">
                            <p className="text-sm text-muted-foreground">Years of Experience</p>
                            <p className="font-medium mt-1">{formattedData.yearsExperience || "Not specified"}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border shadow-sm hover:shadow-md transition-all duration-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                          <Brain className="h-5 w-5 text-primary" />
                          Skills
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {(() => {
                            const skills = formattedData.skills;
                            if (Array.isArray(skills) && skills.length > 0) {
                              return skills.map((skill: string, index: number) => (
                                <Badge 
                                  key={index} 
                                  variant="secondary"
                                  className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 transition-colors"
                                >
                                  {skill}
                                </Badge>
                              ));
                            } else if (typeof skills === 'string') {
                              return (
                                <Badge 
                                  variant="secondary"
                                  className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 transition-colors"
                                >
                                  {skills}
                                </Badge>
                              );
                            }
                            return (
                              <div className="w-full p-4 text-center text-muted-foreground bg-muted/50 rounded-lg">
                                No skills listed
                              </div>
                            );
                          })()}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* AI Evaluation Summary */}
                  {data.evaluations.length > 0 && (
                    <Card className="border shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                          <Brain className="h-5 w-5 text-primary" />
                          AI Evaluation Summary
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Score Distribution */}
                        <div className="grid gap-4 md:grid-cols-2">
                          {latestEvaluation && latestEvaluation.questionScores && Object.entries(latestEvaluation.questionScores).map(([category, score], index) => (
                            <div 
                              key={category} 
                              className="p-4 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors"
                            >
                              <div className="flex justify-between items-center mb-3">
                                <p className="text-sm font-medium">{category}</p>
                                <Badge variant="outline" className="bg-primary/5">
                                  {getScoreValue(score)}/20
                                </Badge>
                              </div>
                              <Progress 
                                value={(getScoreValue(score) / 20) * 100} 
                                className="h-2 bg-primary/10" 
                              />
                              <div 
                                className="mt-2 text-xs text-muted-foreground"
                                style={{
                                  color: 
                                    getScoreValue(score) >= 16 ? '#10b981' :
                                    getScoreValue(score) >= 12 ? '#f59e0b' :
                                    '#ef4444'
                                }}
                              >
                                {getScoreValue(score) >= 16 ? 'Excellent' :
                                 getScoreValue(score) >= 12 ? 'Good' :
                                 getScoreValue(score) >= 8 ? 'Fair' :
                                 'Needs Improvement'}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Recommendations */}
                        <div className="space-y-4 bg-muted/50 p-6 rounded-lg">
                          <h4 className="font-medium flex items-center gap-2">
                            <ChevronRight className="h-5 w-5 text-primary" />
                            Recommendations
                          </h4>
                          <div className="space-y-3">
                            {latestEvaluation?.metadata?.recommendations?.map((rec, index) => (
                              <div 
                                key={index} 
                                className="flex items-start gap-3 p-4 rounded-lg bg-background hover:bg-muted/30 transition-colors"
                              >
                                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                  <span className="text-xs font-medium text-primary">{index + 1}</span>
                                </div>
                                <p className="text-sm">{rec}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
                
                <TabsContent value="community-impact" className="space-y-6">
                  {/* Community Impact Content */}
                  {/* Implementation needed */}
                </TabsContent>

                <TabsContent value="evaluations" className="space-y-6">
                  <Card className={cn(
                    theme.components.card.base,
                    theme.shadows.sm,
                    theme.gradients.card
                  )}>
                    <CardHeader className={theme.components.card.header}>
                      <CardTitle className={cn(
                        theme.text.xl,
                        theme.fontWeight.semibold,
                        theme.fonts.secondary,
                        "flex items-center justify-between"
                      )}>
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-5 w-5 text-[#0a58ca]" />
                          Income & Employment Assessment
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            theme.text.sm,
                            "text-muted-foreground"
                          )}>
                            Maximum Score:
                          </span>
                          <Badge variant="secondary" className="bg-[#0a58ca]/10 text-[#0a58ca]">
                            20 pts
                          </Badge>
                        </div>
                      </CardTitle>
                      <CardDescription>
                        Evaluate the champion's income stability and employment history
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Current Employment Status */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className={cn(
                            theme.text.lg,
                            theme.fontWeight.medium
                          )}>
                            Current Employment Status
                          </h3>
                          <Badge variant="outline" className={cn(
                            "bg-[#0a58ca]/5",
                            formattedData.status === "Employed" 
                              ? "text-green-600 border-green-200"
                              : "text-yellow-600 border-yellow-200"
                          )}>
                            {formattedData.status || "Not Specified"}
                          </Badge>
                        </div>
                        
                        <div className="grid gap-4">
                          <div className={cn(
                            theme.rounded.lg,
                            "p-4 bg-muted/30",
                            "border border-border"
                          )}>
                            <div className="space-y-2">
                              <Label className="text-sm text-muted-foreground">Monthly Income Range</Label>
                              <Select 
                                value={evaluation.incomeRange || ""}
                                onValueChange={(value) => handleEvaluationChange("incomeRange", value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select income range" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="high">Above 500,000 RWF (8 pts)</SelectItem>
                                  <SelectItem value="medium">300,000 - 500,000 RWF (6 pts)</SelectItem>
                                  <SelectItem value="low">150,000 - 300,000 RWF (4 pts)</SelectItem>
                                  <SelectItem value="very_low">Below 150,000 RWF (2 pts)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className={cn(
                            theme.rounded.lg,
                            "p-4 bg-muted/30",
                            "border border-border"
                          )}>
                            <div className="space-y-2">
                              <Label className="text-sm text-muted-foreground">Employment Stability</Label>
                              <Select 
                                value={evaluation.employmentStability || ""}
                                onValueChange={(value) => handleEvaluationChange("employmentStability", value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select stability level" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="very_stable">More than 3 years (6 pts)</SelectItem>
                                  <SelectItem value="stable">1-3 years (4 pts)</SelectItem>
                                  <SelectItem value="moderate">6-12 months (2 pts)</SelectItem>
                                  <SelectItem value="unstable">Less than 6 months (1 pt)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className={cn(
                            theme.rounded.lg,
                            "p-4 bg-muted/30",
                            "border border-border"
                          )}>
                            <div className="space-y-2">
                              <Label className="text-sm text-muted-foreground">Additional Income Sources</Label>
                              <Select 
                                value={evaluation.additionalIncome || ""}
                                onValueChange={(value) => handleEvaluationChange("additionalIncome", value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select additional income" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="multiple">Multiple sources (6 pts)</SelectItem>
                                  <SelectItem value="single">Single additional source (4 pts)</SelectItem>
                                  <SelectItem value="potential">Potential sources identified (2 pts)</SelectItem>
                                  <SelectItem value="none">No additional sources (0 pts)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Income & Employment Score Summary */}
                      <div className={cn(
                        theme.rounded.lg,
                        "p-6 bg-[#0a58ca]/5 border border-[#0a58ca]/10"
                      )}>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className={cn(
                              theme.text.lg,
                              theme.fontWeight.medium
                            )}>
                              Income & Employment Score
                            </h4>
                            <div className="flex items-center gap-2">
                              <span className={cn(
                                theme.text["2xl"],
                                theme.fontWeight.bold,
                                "text-[#0a58ca]"
                              )}>
                                {`${calculateIncomeEmploymentScore()}/20`}
                              </span>
                            </div>
                          </div>
                          <Progress 
                            value={calculateIncomeEmploymentScore() * 10}
                            className="h-2"
                          />
                        </div>
                      </div>

                      {/* Recommendations */}
                      <div className="space-y-4">
                        <h4 className={cn(
                          theme.text.lg,
                          theme.fontWeight.medium
                        )}>
                          Recommendations
                        </h4>
                        <Textarea 
                          placeholder="Enter recommendations based on the income and employment evaluation..."
                          value={evaluation.recommendations || ""}
                          onChange={(e) => handleEvaluationChange("recommendations", e.target.value)}
                          className="min-h-[100px]"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Digital Access Assessment Card */}
                  <Card className={cn(
                    theme.components.card.base,
                    theme.shadows.sm,
                    theme.gradients.card
                  )}>
                    <CardHeader className={theme.components.card.header}>
                      <CardTitle className={cn(
                        theme.text.xl,
                        theme.fontWeight.semibold,
                        theme.fonts.secondary,
                        "flex items-center justify-between"
                      )}>
                        <div className="flex items-center gap-2">
                          <Laptop className="h-5 w-5 text-[#0a58ca]" />
                          Digital Access Assessment
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            theme.text.sm,
                            "text-muted-foreground"
                          )}>
                            Maximum Score:
                          </span>
                          <Badge variant="secondary" className="bg-[#0a58ca]/10 text-[#0a58ca]">
                            15 pts
                          </Badge>
                        </div>
                      </CardTitle>
                      <CardDescription>
                        Evaluate the champion's digital access capabilities and resources
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Device Ownership */}
                      <div className={cn(
                        theme.rounded.lg,
                        "p-4 bg-muted/30",
                        "border border-border"
                      )}>
                        <div className="space-y-2">
                          <Label className="text-sm text-muted-foreground">Device Ownership (5 pts)</Label>
                          <Select 
                            value={evaluation.deviceOwnership}
                            onValueChange={(value) => handleEvaluationChange("deviceOwnership", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select device ownership" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="multiple">Multiple Devices (5 pts)</SelectItem>
                              <SelectItem value="smartphone">Smartphone Only (4 pts)</SelectItem>
                              <SelectItem value="basic">Basic Phone (2 pts)</SelectItem>
                              <SelectItem value="none">No Device (0 pts)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Internet Access */}
                      <div className={cn(
                        theme.rounded.lg,
                        "p-4 bg-muted/30",
                        "border border-border"
                      )}>
                        <div className="space-y-2">
                          <Label className="text-sm text-muted-foreground">Internet Access (5 pts)</Label>
                          <Select 
                            value={evaluation.internetAccess}
                            onValueChange={(value) => handleEvaluationChange("internetAccess", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select internet access type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="broadband">Broadband/WiFi (5 pts)</SelectItem>
                              <SelectItem value="mobile_data">Mobile Data (4 pts)</SelectItem>
                              <SelectItem value="limited">Limited Access (2 pts)</SelectItem>
                              <SelectItem value="none">No Access (0 pts)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Digital Literacy */}
                      <div className={cn(
                        theme.rounded.lg,
                        "p-4 bg-muted/30",
                        "border border-border"
                      )}>
                        <div className="space-y-2">
                          <Label className="text-sm text-muted-foreground">Digital Literacy (5 pts)</Label>
                          <Select 
                            value={evaluation.digitalLiteracy}
                            onValueChange={(value) => handleEvaluationChange("digitalLiteracy", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select digital literacy level" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="advanced">Advanced (5 pts)</SelectItem>
                              <SelectItem value="intermediate">Intermediate (3 pts)</SelectItem>
                              <SelectItem value="basic">Basic (2 pts)</SelectItem>
                              <SelectItem value="none">None (0 pts)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Digital Access Score Summary */}
                      <div className={cn(
                        theme.rounded.lg,
                        "p-6 bg-[#0a58ca]/5 border border-[#0a58ca]/10"
                      )}>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className={cn(
                              theme.text.lg,
                              theme.fontWeight.medium
                            )}>
                              Digital Access Score
                            </h4>
                            <div className="flex items-center gap-2">
                              <span className={cn(
                                theme.text["2xl"],
                                theme.fontWeight.bold,
                                "text-[#0a58ca]"
                              )}>
                                {`${calculateDigitalAccessScore()}/15`}
                              </span>
                            </div>
                          </div>
                          <Progress 
                            value={calculateDigitalAccessScore() * 10}
                            className="h-2"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Family Status Assessment Card */}
                  <Card className={cn(
                    theme.components.card.base,
                    theme.shadows.sm,
                    theme.gradients.card
                  )}>
                    <CardHeader className={theme.components.card.header}>
                      <CardTitle className={cn(
                        theme.text.xl,
                        theme.fontWeight.semibold,
                        theme.fonts.secondary,
                        "flex items-center justify-between"
                      )}>
                        <div className="flex items-center gap-2">
                          <Users className="h-5 w-5 text-[#0a58ca]" />
                          Family Status Assessment
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            theme.text.sm,
                            "text-muted-foreground"
                          )}>
                            Maximum Score:
                          </span>
                          <Badge variant="secondary" className="bg-[#0a58ca]/10 text-[#0a58ca]">
                            10 pts
                          </Badge>
                        </div>
                      </CardTitle>
                      <CardDescription>
                        Evaluate the champion's family stability and support system
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Marital Status */}
                      <div className={cn(
                        theme.rounded.lg,
                        "p-4 bg-muted/30",
                        "border border-border"
                      )}>
                        <div className="space-y-2">
                          <Label className="text-sm text-muted-foreground">Marital Status (3 pts)</Label>
                          <Select 
                            value={evaluation.maritalStatus}
                            onValueChange={(value) => handleEvaluationChange("maritalStatus", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select marital status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="married">Married (3 pts)</SelectItem>
                              <SelectItem value="single">Single (2 pts)</SelectItem>
                              <SelectItem value="other">Other (1 pt)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Dependents */}
                      <div className={cn(
                        theme.rounded.lg,
                        "p-4 bg-muted/30",
                        "border border-border"
                      )}>
                        <div className="space-y-2">
                          <Label className="text-sm text-muted-foreground">Number of Dependents (4 pts)</Label>
                          <Select 
                            value={evaluation.dependents}
                            onValueChange={(value) => handleEvaluationChange("dependents", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select number of dependents" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">No Dependents (4 pts)</SelectItem>
                              <SelectItem value="1_2">1-2 Dependents (3 pts)</SelectItem>
                              <SelectItem value="3_4">3-4 Dependents (2 pts)</SelectItem>
                              <SelectItem value="5_plus">5+ Dependents (1 pt)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Family Support */}
                      <div className={cn(
                        theme.rounded.lg,
                        "p-4 bg-muted/30",
                        "border border-border"
                      )}>
                        <div className="space-y-2">
                          <Label className="text-sm text-muted-foreground">Family Support System (3 pts)</Label>
                          <Select 
                            value={evaluation.familySupport}
                            onValueChange={(value) => handleEvaluationChange("familySupport", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select level of family support" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="strong">Strong Support Network (3 pts)</SelectItem>
                              <SelectItem value="moderate">Moderate Support (2 pts)</SelectItem>
                              <SelectItem value="limited">Limited Support (1 pt)</SelectItem>
                              <SelectItem value="none">No Support (0 pts)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Family Status Score Summary */}
                      <div className={cn(
                        theme.rounded.lg,
                        "p-6 bg-[#0a58ca]/5 border border-[#0a58ca]/10"
                      )}>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className={cn(
                              theme.text.lg,
                              theme.fontWeight.medium
                            )}>
                              Family Status Score
                            </h4>
                            <div className="flex items-center gap-2">
                              <span className={cn(
                                theme.text["2xl"],
                                theme.fontWeight.bold,
                                "text-[#0a58ca]"
                              )}>
                                {`${calculateFamilyStatusScore()}/10`}
                              </span>
                            </div>
                          </div>
                          <Progress 
                            value={calculateFamilyStatusScore() * 10}
                            className="h-2"
                          />
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <InfoIcon className="h-4 w-4" />
                            <span>Score is calculated based on marital status (3pts), dependents (4pts), and family support (3pts)</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Disability/Chronic Illness Assessment Card */}
                  <Card className={cn(
                    theme.components.card.base,
                    theme.shadows.sm,
                    theme.gradients.card
                  )}>
                    <CardHeader className={theme.components.card.header}>
                      <CardTitle className={cn(
                        theme.text.xl,
                        theme.fontWeight.semibold,
                        theme.fonts.secondary,
                        "flex items-center justify-between"
                      )}>
                        <div className="flex items-center gap-2">
                          <Heart className="h-5 w-5 text-[#0a58ca]" />
                          Disability/Chronic Illness Assessment
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            theme.text.sm,
                            "text-muted-foreground"
                          )}>
                            Maximum Score:
                          </span>
                          <Badge variant="secondary" className="bg-[#0a58ca]/10 text-[#0a58ca]">
                            10 pts
                          </Badge>
                        </div>
                      </CardTitle>
                      <CardDescription>
                        Evaluate the champion's health challenges and adaptability
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Health Condition Impact */}
                      <div className={cn(
                        theme.rounded.lg,
                        "p-4 bg-muted/30",
                        "border border-border"
                      )}>
                        <div className="space-y-2">
                          <Label className="text-sm text-muted-foreground">Health Condition Impact (4 pts)</Label>
                          <Select 
                            value={evaluation.healthCondition}
                            onValueChange={(value) => handleEvaluationChange("healthCondition", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select impact level" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="minimal_impact">Minimal Impact (4 pts)</SelectItem>
                              <SelectItem value="moderate_impact">Moderate Impact (3 pts)</SelectItem>
                              <SelectItem value="significant_impact">Significant Impact (2 pts)</SelectItem>
                              <SelectItem value="severe_impact">Severe Impact (1 pt)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Adaptability */}
                      <div className={cn(
                        theme.rounded.lg,
                        "p-4 bg-muted/30",
                        "border border-border"
                      )}>
                        <div className="space-y-2">
                          <Label className="text-sm text-muted-foreground">Adaptability Level (3 pts)</Label>
                          <Select 
                            value={evaluation.adaptability}
                            onValueChange={(value) => handleEvaluationChange("adaptability", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select adaptability level" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="highly_adaptable">Highly Adaptable (3 pts)</SelectItem>
                              <SelectItem value="moderately_adaptable">Moderately Adaptable (2 pts)</SelectItem>
                              <SelectItem value="needs_support">Needs Support (1 pt)</SelectItem>
                              <SelectItem value="requires_assistance">Requires Assistance (0 pts)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Support Needs */}
                      <div className={cn(
                        theme.rounded.lg,
                        "p-4 bg-muted/30",
                        "border border-border"
                      )}>
                        <div className="space-y-2">
                          <Label className="text-sm text-muted-foreground">Support Needs (3 pts)</Label>
                          <Select 
                            value={evaluation.supportNeeds}
                            onValueChange={(value) => handleEvaluationChange("supportNeeds", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select support needs level" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="self_sufficient">Self-Sufficient (3 pts)</SelectItem>
                              <SelectItem value="minimal_support">Minimal Support (2 pts)</SelectItem>
                              <SelectItem value="regular_support">Regular Support (1 pt)</SelectItem>
                              <SelectItem value="constant_support">Constant Support (0 pts)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Disability Score Summary */}
                      <div className={cn(
                        theme.rounded.lg,
                        "p-6 bg-[#0a58ca]/5 border border-[#0a58ca]/10"
                      )}>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className={cn(
                              theme.text.lg,
                              theme.fontWeight.medium
                            )}>
                              Disability/Chronic Illness Score
                            </h4>
                            <div className="flex items-center gap-2">
                              <span className={cn(
                                theme.text["2xl"],
                                theme.fontWeight.bold,
                                "text-[#0a58ca]"
                              )}>
                                {`${calculateDisabilityScore()}/10`}
                              </span>
                            </div>
                          </div>
                          <Progress 
                            value={calculateDisabilityScore() * 10}
                            className="h-2"
                          />
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <InfoIcon className="h-4 w-4" />
                            <span>Score is calculated based on health condition impact (4pts), adaptability (3pts), and support needs (3pts)</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Housing Conditions Assessment Card */}
                  <Card className={cn(
                    theme.components.card.base,
                    theme.shadows.sm,
                    theme.gradients.card
                  )}>
                    <CardHeader className={theme.components.card.header}>
                      <CardTitle className={cn(
                        theme.text.xl,
                        theme.fontWeight.semibold,
                        theme.fonts.secondary,
                        "flex items-center justify-between"
                      )}>
                        <div className="flex items-center gap-2">
                          <Building className="h-5 w-5 text-[#0a58ca]" />
                          Housing Conditions Assessment
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            theme.text.sm,
                            "text-muted-foreground"
                          )}>
                            Maximum Score:
                          </span>
                          <Badge variant="secondary" className="bg-[#0a58ca]/10 text-[#0a58ca]">
                            10 pts
                          </Badge>
                        </div>
                      </CardTitle>
                      <CardDescription>
                        Evaluate the champion's housing stability and living conditions
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Housing Type */}
                      <div className={cn(
                        theme.rounded.lg,
                        "p-4 bg-muted/30",
                        "border border-border"
                      )}>
                        <div className="space-y-2">
                          <Label className="text-sm text-muted-foreground">Housing Type (3 pts)</Label>
                          <Select 
                            value={evaluation.housingType}
                            onValueChange={(value) => handleEvaluationChange("housingType", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select housing type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="owned">Owned Property (3 pts)</SelectItem>
                              <SelectItem value="rented_stable">Stable Rental (2 pts)</SelectItem>
                              <SelectItem value="rented_temporary">Temporary Rental (1 pt)</SelectItem>
                              <SelectItem value="unstable">Unstable Housing (0 pts)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Housing Stability */}
                      <div className={cn(
                        theme.rounded.lg,
                        "p-4 bg-muted/30",
                        "border border-border"
                      )}>
                        <div className="space-y-2">
                          <Label className="text-sm text-muted-foreground">Housing Stability (4 pts)</Label>
                          <Select 
                            value={evaluation.housingStability}
                            onValueChange={(value) => handleEvaluationChange("housingStability", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select stability level" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="very_stable">Very Stable (4 pts)</SelectItem>
                              <SelectItem value="stable">Stable (3 pts)</SelectItem>
                              <SelectItem value="at_risk">At Risk (2 pts)</SelectItem>
                              <SelectItem value="unstable">Unstable (1 pt)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Living Conditions */}
                      <div className={cn(
                        theme.rounded.lg,
                        "p-4 bg-muted/30",
                        "border border-border"
                      )}>
                        <div className="space-y-2">
                          <Label className="text-sm text-muted-foreground">Living Conditions (3 pts)</Label>
                          <Select 
                            value={evaluation.livingConditions}
                            onValueChange={(value) => handleEvaluationChange("livingConditions", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select living conditions" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="excellent">Excellent (3 pts)</SelectItem>
                              <SelectItem value="good">Good (2 pts)</SelectItem>
                              <SelectItem value="fair">Fair (1 pt)</SelectItem>
                              <SelectItem value="poor">Poor (0 pts)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Housing Score Summary */}
                      <div className={cn(
                        theme.rounded.lg,
                        "p-6 bg-[#0a58ca]/5 border border-[#0a58ca]/10"
                      )}>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className={cn(
                              theme.text.lg,
                              theme.fontWeight.medium
                            )}>
                              Housing Conditions Score
                            </h4>
                            <div className="flex items-center gap-2">
                              <span className={cn(
                                theme.text["2xl"],
                                theme.fontWeight.bold,
                                "text-[#0a58ca]"
                              )}>
                                {`${calculateHousingScore()}/10`}
                              </span>
                            </div>
                          </div>
                          <Progress 
                            value={calculateHousingScore() * 10}
                            className="h-2"
                          />
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <InfoIcon className="h-4 w-4" />
                            <span>Score is calculated based on housing type (3pts), housing stability (4pts), and living conditions (3pts)</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Social Capital Assessment Card */}
                  <Card className={cn(
                    theme.components.card.base,
                    theme.shadows.sm,
                    theme.gradients.card
                  )}>
                    <CardHeader className={theme.components.card.header}>
                      <CardTitle className={cn(
                        theme.text.xl,
                        theme.fontWeight.semibold,
                        theme.fonts.secondary,
                        "flex items-center justify-between"
                      )}>
                        <div className="flex items-center gap-2">
                          <Network className="h-5 w-5 text-[#0a58ca]" />
                          Social Capital Assessment
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            theme.text.sm,
                            "text-muted-foreground"
                          )}>
                            Maximum Score:
                          </span>
                          <Badge variant="secondary" className="bg-[#0a58ca]/10 text-[#0a58ca]">
                            10 pts
                          </Badge>
                        </div>
                      </CardTitle>
                      <CardDescription>
                        Evaluate the champion's community connections and social influence
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Community Involvement */}
                      <div className={cn(
                        theme.rounded.lg,
                        "p-4 bg-muted/30",
                        "border border-border"
                      )}>
                        <div className="space-y-2">
                          <Label className="text-sm text-muted-foreground">Community Involvement (4 pts)</Label>
                          <Select 
                            value={evaluation.communityInvolvement}
                            onValueChange={(value) => handleEvaluationChange("communityInvolvement", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select involvement level" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="very_active">Very Active Participation (4 pts)</SelectItem>
                              <SelectItem value="active">Regular Participation (3 pts)</SelectItem>
                              <SelectItem value="occasional">Occasional Participation (2 pts)</SelectItem>
                              <SelectItem value="minimal">Minimal Participation (1 pt)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Network Strength */}
                      <div className={cn(
                        theme.rounded.lg,
                        "p-4 bg-muted/30",
                        "border border-border"
                      )}>
                        <div className="space-y-2">
                          <Label className="text-sm text-muted-foreground">Network Strength (3 pts)</Label>
                          <Select 
                            value={evaluation.networkStrength}
                            onValueChange={(value) => handleEvaluationChange("networkStrength", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select network strength" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="extensive">Extensive Network (3 pts)</SelectItem>
                              <SelectItem value="moderate">Moderate Network (2 pts)</SelectItem>
                              <SelectItem value="limited">Limited Network (1 pt)</SelectItem>
                              <SelectItem value="minimal">Minimal Network (0 pts)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Leadership Role */}
                      <div className={cn(
                        theme.rounded.lg,
                        "p-4 bg-muted/30",
                        "border border-border"
                      )}>
                        <div className="space-y-2">
                          <Label className="text-sm text-muted-foreground">Leadership Role (3 pts)</Label>
                          <Select 
                            value={evaluation.leadershipRole}
                            onValueChange={(value) => handleEvaluationChange("leadershipRole", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select leadership experience" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="current_leader">Current Leadership Role (3 pts)</SelectItem>
                              <SelectItem value="past_leader">Past Leadership Experience (2 pts)</SelectItem>
                              <SelectItem value="potential_leader">Potential for Leadership (1 pt)</SelectItem>
                              <SelectItem value="no_experience">No Leadership Experience (0 pts)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Social Capital Score Summary */}
                      <div className={cn(
                        theme.rounded.lg,
                        "p-6 bg-[#0a58ca]/5 border border-[#0a58ca]/10"
                      )}>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className={cn(
                              theme.text.lg,
                              theme.fontWeight.medium
                            )}>
                              Social Capital Score
                            </h4>
                            <div className="flex items-center gap-2">
                              <span className={cn(
                                theme.text["2xl"],
                                theme.fontWeight.bold,
                                "text-[#0a58ca]"
                              )}>
                                {`${calculateSocialCapitalScore()}/10`}
                              </span>
                            </div>
                          </div>
                          <Progress 
                            value={calculateSocialCapitalScore() * 10}
                            className="h-2"
                          />
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <InfoIcon className="h-4 w-4" />
                            <span>Score is calculated based on community involvement (4pts), network strength (3pts), and leadership role (3pts)</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Education & Skills Assessment Card */}
                  <Card className={cn(
                    theme.components.card.base,
                    theme.shadows.sm,
                    theme.gradients.card
                  )}>
                    <CardHeader className={theme.components.card.header}>
                      <CardTitle className={cn(
                        theme.text.xl,
                        theme.fontWeight.semibold,
                        theme.fonts.secondary,
                        "flex items-center justify-between"
                      )}>
                        <div className="flex items-center gap-2">
                          <GraduationCap className="h-5 w-5 text-[#0a58ca]" />
                          Education & Skills Assessment
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            theme.text.sm,
                            "text-muted-foreground"
                          )}>
                            Maximum Score:
                          </span>
                          <Badge variant="secondary" className="bg-[#0a58ca]/10 text-[#0a58ca]">
                            10 pts
                          </Badge>
                        </div>
                      </CardTitle>
                      <CardDescription>
                        Evaluate the champion's educational background and relevant skills
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Education Level */}
                      <div className={cn(
                        theme.rounded.lg,
                        "p-4 bg-muted/30",
                        "border border-border"
                      )}>
                        <div className="space-y-2">
                          <Label className="text-sm text-muted-foreground">Education Level (4 pts)</Label>
                          <Select 
                            value={evaluation.educationLevel}
                            onValueChange={(value) => handleEvaluationChange("educationLevel", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select education level" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="tertiary">Tertiary Education (4 pts)</SelectItem>
                              <SelectItem value="secondary">Secondary Education (3 pts)</SelectItem>
                              <SelectItem value="primary">Primary Education (2 pts)</SelectItem>
                              <SelectItem value="informal">Informal Education (1 pt)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Relevant Training */}
                      <div className={cn(
                        theme.rounded.lg,
                        "p-4 bg-muted/30",
                        "border border-border"
                      )}>
                        <div className="space-y-2">
                          <Label className="text-sm text-muted-foreground">Relevant Training (3 pts)</Label>
                          <Select 
                            value={evaluation.relevantTraining}
                            onValueChange={(value) => handleEvaluationChange("relevantTraining", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select training level" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="extensive">Extensive Training (3 pts)</SelectItem>
                              <SelectItem value="moderate">Moderate Training (2 pts)</SelectItem>
                              <SelectItem value="basic">Basic Training (1 pt)</SelectItem>
                              <SelectItem value="none">No Relevant Training (0 pts)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Skills Assessment */}
                      <div className={cn(
                        theme.rounded.lg,
                        "p-4 bg-muted/30",
                        "border border-border"
                      )}>
                        <div className="space-y-2">
                          <Label className="text-sm text-muted-foreground">Skills Assessment (3 pts)</Label>
                          <Select 
                            value={evaluation.skillsAssessment}
                            onValueChange={(value) => handleEvaluationChange("skillsAssessment", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select skills level" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="advanced">Advanced Skills (3 pts)</SelectItem>
                              <SelectItem value="intermediate">Intermediate Skills (2 pts)</SelectItem>
                              <SelectItem value="basic">Basic Skills (1 pt)</SelectItem>
                              <SelectItem value="limited">Limited Skills (0 pts)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Education & Skills Score Summary */}
                      <div className={cn(
                        theme.rounded.lg,
                        "p-6 bg-[#0a58ca]/5 border border-[#0a58ca]/10"
                      )}>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className={cn(
                              theme.text.lg,
                              theme.fontWeight.medium
                            )}>
                              Education & Skills Score
                            </h4>
                            <div className="flex items-center gap-2">
                              <span className={cn(
                                theme.text["2xl"],
                                theme.fontWeight.bold,
                                "text-[#0a58ca]"
                              )}>
                                {`${calculateEducationSkillsScore()}/10`}
                              </span>
                            </div>
                          </div>
                          <Progress 
                            value={calculateEducationSkillsScore() * 10}
                            className="h-2"
                          />
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <InfoIcon className="h-4 w-4" />
                            <span>Score is calculated based on education level (4pts), relevant training (3pts), and skills assessment (3pts)</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Updated Total Score Summary Card */}
                  <Card className={cn(
                    theme.components.card.base,
                    theme.shadows.sm,
                    theme.gradients.card,
                    "bg-[#0a58ca]/5"
                  )}>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className={cn(
                            theme.text.xl,
                            theme.fontWeight.semibold
                          )}>
                            Total Evaluation Score
                          </h4>
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              theme.text["3xl"],
                              theme.fontWeight.bold,
                              "text-[#0a58ca]"
                            )}>
                              {`${calculateTotalScore()}/95`}
                            </span>
                          </div>
                        </div>
                        <Progress 
                          value={calculateTotalScore() * (100/95)}
                          className="h-3"
                        />
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <InfoIcon className="h-4 w-4" />
                          <span>Total score combines Income & Employment (20pts), Digital Access (15pts), Family Status (10pts), Female-Headed Household (10pts), Disability/Chronic Illness (10pts), Housing Conditions (10pts), Social Capital (10pts), and Education & Skills (10pts)</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="form-data" className="space-y-6">
                  <Card className={cn(
                    theme.components.card.base,
                    theme.shadows.sm,
                    theme.gradients.card
                  )}>
                    <CardHeader className={theme.components.card.header}>
                      <CardTitle className={cn(
                        theme.text.xl,
                        theme.fontWeight.semibold,
                        theme.fonts.secondary,
                        "flex items-center gap-2"
                      )}>
                        <FileText className="h-5 w-5 text-[#0a58ca]" />
                        Application Form Data
                      </CardTitle>
                      <CardDescription>
                        Complete form data submitted by the applicant
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {(() => {
                          const formData = data.formData || {};
                          const sections = [
                            {
                              title: "Personal Information",
                              icon: "👤",
                              fields: [
                                { key: "q1", label: "First Name", type: "text" },
                                { key: "q2", label: "Last Name", type: "text" },
                                { key: "q3", label: "Date of Birth", type: "date" },
                                { key: "q4", label: "Gender", type: "text" },
                                { key: "q5", label: "National ID", type: "text" }
                              ]
                            },
                            {
                              title: "Contact Information",
                              icon: "📞",
                              fields: [
                                { key: "q7", label: "Email", type: "email" },
                                { key: "q8", label: "Phone", type: "phone" },
                                { key: "q9", label: "Alternative Email", type: "email" },
                                { key: "q10", label: "Alternative Phone", type: "phone" }
                              ]
                            },
                            {
                              title: "Location",
                              icon: "📍",
                              fields: [
                                { key: "q11", label: "Address", type: "object" },
                                { key: "province", label: "Province", type: "text" },
                                { key: "district", label: "District", type: "text" },
                                { key: "sector", label: "Sector", type: "text" },
                                { key: "cell", label: "Cell", type: "text" },
                                { key: "village", label: "Village", type: "text" }
                              ]
                            },
                            {
                              title: "Education & Skills",
                              icon: "🎓",
                              fields: [
                                { key: "q12", label: "Education Level", type: "text" },
                                { key: "q13", label: "Years of Education", type: "number" },
                                { key: "q14", label: "Skills", type: "array" },
                                { key: "q20", label: "Languages", type: "array" },
                                { key: "education", label: "Education", type: "text" },
                                { key: "skills", label: "Skills", type: "array" }
                              ]
                            },
                            {
                              title: "Employment",
                              icon: "💼",
                              fields: [
                                { key: "q15", label: "Employment Status", type: "text" },
                                { key: "q16", label: "Current Position", type: "text" },
                                { key: "q17", label: "Employer", type: "text" },
                                { key: "q18", label: "Years of Experience", type: "number" },
                                { key: "q19", label: "Monthly Income", type: "number" },
                                { key: "yearsExperience", label: "Years Experience", type: "number" },
                                { key: "currentPosition", label: "Current Position", type: "text" },
                                { key: "employer", label: "Employer", type: "text" }
                              ]
                            },
                            {
                              title: "Digital Access",
                              icon: "💻",
                              fields: [
                                { key: "hasSmartphone", label: "Has Smartphone", type: "boolean" },
                                { key: "hasInternet", label: "Has Internet", type: "boolean" },
                                { key: "digitalSkills", label: "Digital Skills", type: "array" }
                              ]
                            },
                            {
                              title: "Family & Health",
                              icon: "👨‍👩‍👧‍👦",
                              fields: [
                                { key: "maritalStatus", label: "Marital Status", type: "text" },
                                { key: "dependents", label: "Dependents", type: "number" },
                                { key: "isHouseholdHead", label: "Is Household Head", type: "boolean" },
                                { key: "hasDisability", label: "Has Disability", type: "boolean" },
                                { key: "hasChronicIllness", label: "Has Chronic Illness", type: "boolean" },
                                { key: "healthIssues", label: "Health Issues", type: "text" }
                              ]
                            },
                            {
                              title: "Housing & Community",
                              icon: "🏠",
                              fields: [
                                { key: "housingType", label: "Housing Type", type: "text" },
                                { key: "hasUtilities", label: "Has Utilities", type: "boolean" },
                                { key: "communityInvolvement", label: "Community Involvement", type: "text" },
                                { key: "supportNetwork", label: "Support Network", type: "boolean" }
                              ]
                            },
                            {
                              title: "Documents",
                              icon: "📄",
                              fields: [
                                { key: "educationCertificate", label: "Education Certificate", type: "file" },
                                { key: "nationalIdCopy", label: "National ID Copy", type: "file" },
                                { key: "cv", label: "CV/Resume", type: "file" },
                                { key: "photo", label: "Photo", type: "file" }
                              ]
                            }
                          ];

                          return sections.map((section, sectionIndex) => {
                            const hasData = section.fields.some(field => {
                              const value = formData[field.key];
                              return value !== undefined && value !== null && value !== "";
                            });

                            if (!hasData) return null;

                            return (
                              <div key={sectionIndex} className="border rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-4">
                                  <span className="text-xl">{section.icon}</span>
                                  <h3 className="text-lg font-semibold">{section.title}</h3>
                                </div>
                                <div className="grid gap-3 md:grid-cols-2">
                                  {section.fields.map((field, fieldIndex) => {
                                    const value = formData[field.key];
                                    
                                    if (value === undefined || value === null || value === "") {
                                      return null;
                                    }

                                    const renderValue = () => {
                                      switch (field.type) {
                                        case "boolean":
                                          return (
                                            <Badge variant={value === "yes" || value === true ? "default" : "secondary"}>
                                              {value === "yes" || value === true ? "Yes" : "No"}
                                            </Badge>
                                          );
                                        case "array":
                                          if (Array.isArray(value)) {
                                            return (
                                              <div className="flex flex-wrap gap-1">
                                                {value.map((item, index) => (
                                                  <Badge key={index} variant="outline" className="text-xs">
                                                    {item}
                                                  </Badge>
                                                ))}
                                              </div>
                                            );
                                          }
                                          return <span>{String(value)}</span>;
                                        case "object":
                                          if (typeof value === "object" && value !== null) {
                                            return (
                                              <div className="space-y-1">
                                                {Object.entries(value).map(([key, val]) => (
                                                  <div key={key} className="text-sm">
                                                    <span className="font-medium">{key}:</span> {String(val)}
                                                  </div>
                                                ))}
                                              </div>
                                            );
                                          }
                                          return <span>{String(value)}</span>;
                                        case "file":
                                          if (value && typeof value === "string" && value.trim() !== "") {
                                            // Handle different file path formats
                                            let fileUrl = value;
                                            let fileName = value.split('/').pop() || 'document';
                                            
                                            // If it's not a full URL, assume it's a local file
                                            if (!value.startsWith('http')) {
                                              fileUrl = `/uploads/${value}`;
                                            }
                                            
                                            // Determine file type for better UX
                                            const fileExtension = fileName.split('.').pop()?.toLowerCase();
                                            const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension || '');
                                            const isPDF = fileExtension === 'pdf';
                                            
                                            return (
                                              <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-2">
                                                  <FileText className="h-4 w-4 text-blue-600" />
                                                  <span className="text-sm font-medium text-gray-700">{fileName}</span>
                                                </div>
                                                <div className="flex gap-2">
                                                  <a
                                                    href={fileUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:text-blue-800 underline text-xs px-2 py-1 border border-blue-200 rounded hover:bg-blue-50"
                                                  >
                                                    {isImage ? 'View Image' : isPDF ? 'View PDF' : 'View Document'}
                                                  </a>
                                                  <a
                                                    href={fileUrl}
                                                    download={fileName}
                                                    className="text-green-600 hover:text-green-800 underline text-xs px-2 py-1 border border-green-200 rounded hover:bg-green-50"
                                                  >
                                                    Download
                                                  </a>
                                                </div>
                                              </div>
                                            );
                                          }
                                          return <span className="text-gray-500">No file uploaded</span>;
                                        case "date":
                                          return <span>{new Date(value).toLocaleDateString()}</span>;
                                        case "number":
                                          return <span>{Number(value).toLocaleString()}</span>;
                                        case "email":
                                          return (
                                            <a href={`mailto:${value}`} className="text-blue-600 hover:text-blue-800 underline">
                                              {value}
                                            </a>
                                          );
                                        case "phone":
                                          return (
                                            <a href={`tel:${value}`} className="text-blue-600 hover:text-blue-800 underline">
                                              {value}
                                            </a>
                                          );
                                        default:
                                          return <span>{String(value)}</span>;
                                      }
                                    };

                                    return (
                                      <div key={fieldIndex} className="p-3 bg-gray-50 rounded-lg">
                                        <p className="text-sm font-medium text-gray-600 mb-1">{field.label}</p>
                                        <div className="text-sm">{renderValue()}</div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          });
                        })()}

                        {/* Raw Form Data (for debugging) */}
                        <details className="mt-6">
                          <summary className="cursor-pointer text-sm font-medium text-gray-600 hover:text-gray-800">
                            Raw Form Data (JSON)
                          </summary>
                          <pre className="text-xs bg-gray-50 p-4 rounded overflow-auto max-h-96 border mt-2">
                            {JSON.stringify(data.formData, null, 2)}
                          </pre>
                        </details>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}