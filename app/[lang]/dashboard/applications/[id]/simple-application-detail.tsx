"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, Building2, CalendarClock, CheckCircle2, Clock3, FileText, Mail, Phone, User2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

type ValueChainItem = {
  key?: string
  label?: string
  details?: string
}

interface ApplicationData {
  id: string
  status?: string
  formData: Record<string, unknown>
  evaluations: unknown[]
  createdAt?: string
  updatedAt?: string
}

interface SimpleApplicationDetailProps {
  application: ApplicationData
  user: {
    id: string
    role: string
    permissions: string[]
  }
  permissions: {
    canView: boolean
    canEdit: boolean
    canDelete: boolean
    canEvaluate: boolean
  }
}

function statusTone(status: string) {
  const tones: Record<string, string> = {
    SUBMITTED: "bg-blue-100 text-blue-800",
    UNDER_REVIEW: "bg-amber-100 text-amber-800",
    APPROVED: "bg-green-100 text-green-800",
    REJECTED: "bg-red-100 text-red-800",
    INTERVIEW_INVITED: "bg-purple-100 text-purple-800",
    INTERVIEWED: "bg-indigo-100 text-indigo-800",
  }
  return tones[status] || "bg-slate-100 text-slate-800"
}

function asText(value: unknown): string {
  const prettify = (input: string) => {
    if (input.includes("@") || input.includes("://")) return input
    return input.replaceAll("_", " ")
  }

  if (value === null || value === undefined || value === "") return "-"
  if (typeof value === "string") return prettify(value)
  if (typeof value === "number" || typeof value === "boolean") return String(value)
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === "string") return prettify(item)
        if (item && typeof item === "object") {
          const label = (item as ValueChainItem).label || (item as ValueChainItem).key
          return label ? prettify(label) : JSON.stringify(item).replaceAll("_", " ")
        }
        return String(item)
      })
      .join(", ")
  }
  return JSON.stringify(value).replaceAll("_", " ")
}

function getString(formData: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = formData[key]
    if (typeof value === "string" && value.trim()) {
      return value.trim()
    }
  }
  return ""
}

function getValueChains(formData: Record<string, unknown>): ValueChainItem[] {
  const raw = formData.selectedValueChains
  if (!Array.isArray(raw)) return []
  return raw.filter((item): item is ValueChainItem => !!item && typeof item === "object")
}

function getDetailRows(formData: Record<string, unknown>) {
  const preferredOrder = [
    "companyDescription",
    "ageGroup",
    "currentSituation",
    "engagementLevel",
    "experienceDuration",
    "businessStatus",
    "teamSize",
    "monthlyCustomers",
    "monthlyRevenue",
    "decisionStyle",
    "innovationStage",
    "leadershipLevel",
    "groupType",
    "primaryReason",
    "postForumAction",
    "weeklyCommitment",
    "nyagatareConnection",
    "growthPriorities",
    "toolsUsed",
  ]

  const questionMap: Record<string, string> = {
    companyDescription: "Tell us about your company",
    ageGroup: "What is your age group?",
    currentSituation: "What is your current business situation?",
    engagementLevel: "How engaged are you in your business journey?",
    experienceDuration: "How long have you been in this space?",
    businessStatus: "What is your business status?",
    teamSize: "How big is your team?",
    monthlyCustomers: "How many monthly customers do you serve?",
    monthlyRevenue: "What is your monthly revenue range?",
    decisionStyle: "How do you make decisions?",
    innovationStage: "What is your innovation stage?",
    leadershipLevel: "How would you describe your leadership level?",
    groupType: "What type of group do you belong to?",
    primaryReason: "What is your primary reason for joining?",
    postForumAction: "What action will you take after the forum?",
    weeklyCommitment: "How much time can you commit weekly?",
    nyagatareConnection: "What is your connection to Nyagatare?",
    growthPriorities: "What are your growth priorities?",
    toolsUsed: "Which tools are you currently using?",
  }

  return preferredOrder
    .filter((key) => key in formData)
    .map((key) => ({
      label: questionMap[key] || key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase()),
      value: asText(formData[key]),
    }))
}

export function SimpleApplicationDetail({ application }: SimpleApplicationDetailProps) {
  const params = useParams()
  const lang = (params?.lang as string) || "en"
  const formData = (application.formData ?? {}) as Record<string, unknown>

  const companyName = getString(formData, ["companyName", "company_name"]) || "Untitled company"
  const applicantName = getString(formData, ["applicantName", "applicant_name", "name"]) || "Unknown applicant"
  const applicantEmail =
    getString(formData, ["email", "applicantEmail", "applicant_email", "Applicant email"]) || "-"
  const applicantPhone =
    getString(formData, ["phone", "applicantPhone", "applicant_phone", "Applicant Phone number"]) || "-"
  const valueChains = getValueChains(formData)
  const detailRows = getDetailRows(formData)
  const currentStatus = application.status || "SUBMITTED"

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full py-6 px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-gray-900">NexGen Forum Application</h1>
            <p className="text-gray-600">Detailed submission view aligned with dashboard records</p>
          </div>
          <Button variant="outline" asChild>
            <Link href={`/${lang}/dashboard/applications`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to applications
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-2 border-blue-200">
            <CardContent className="pt-6 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Status</p>
                <Badge className={statusTone(currentStatus)}>{currentStatus.replaceAll("_", " ")}</Badge>
              </div>
              <Clock3 className="h-5 w-5 text-blue-600" />
            </CardContent>
          </Card>
          <Card className="border-2 border-amber-200">
            <CardContent className="pt-6 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Submitted</p>
                <p className="font-semibold text-amber-900">
                  {application.createdAt ? new Date(application.createdAt).toLocaleString() : "-"}
                </p>
              </div>
              <CalendarClock className="h-5 w-5 text-amber-600" />
            </CardContent>
          </Card>
          <Card className="border-2 border-green-200">
            <CardContent className="pt-6 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Evaluations</p>
                <p className="text-2xl font-bold text-green-900">{application.evaluations?.length ?? 0}</p>
              </div>
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </CardContent>
          </Card>
        </div>

        <Card className="border-2 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl font-bold text-blue-900">Primary Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-md border p-4 bg-white">
              <p className="text-xs text-gray-500 mb-1 flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Company
              </p>
              <p className="font-medium">{companyName}</p>
            </div>
            <div className="rounded-md border p-4 bg-white">
              <p className="text-xs text-gray-500 mb-1 flex items-center gap-2">
                <User2 className="h-4 w-4" />
                Applicant
              </p>
              <p className="font-medium">{applicantName}</p>
            </div>
            <div className="rounded-md border p-4 bg-white">
              <p className="text-xs text-gray-500 mb-1 flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </p>
              <p className="font-medium break-all">{applicantEmail}</p>
            </div>
            <div className="rounded-md border p-4 bg-white">
              <p className="text-xs text-gray-500 mb-1 flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone
              </p>
              <p className="font-medium">{applicantPhone}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl font-bold text-blue-900">Selected Value Chains</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {valueChains.length === 0 && <p className="text-sm text-muted-foreground">No value chains provided.</p>}
            {valueChains.map((chain, index) => (
              <div key={`${chain.key || chain.label || "chain"}-${index}`} className="rounded-md border p-4 bg-white">
                <p className="font-medium">{chain.label || chain.key || "Value chain"}</p>
                <p className="text-sm text-muted-foreground mt-1">{chain.details || "-"}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl font-bold text-blue-900">Questions & Answers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {detailRows.length === 0 ? (
              <p className="text-sm text-muted-foreground">No submitted answers available.</p>
            ) : (
              detailRows.map((row, index) => (
                <div key={row.label}>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Question</p>
                    <p className="text-sm font-medium">{row.label}</p>
                    <p className="text-xs text-gray-500 uppercase tracking-wide pt-2">Answer</p>
                    <p className="text-sm">{row.value}</p>
                  </div>
                  {index !== detailRows.length - 1 && <Separator className="mt-4" />}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-2 border-slate-200">
          <CardContent className="py-4 text-xs text-muted-foreground flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Application ID: {application.id}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}