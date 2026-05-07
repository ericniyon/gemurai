"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, RefreshCw, Search, FileText, Clock3, CheckCircle2, Eye, Download, AlertCircle, Inbox } from "lucide-react"

type ValueChainItem = {
  key?: string
  label?: string
  details?: string
}

type ValueChainSelection = {
  selected?: boolean
  details?: string
}

const VALUE_CHAIN_LABELS: Record<string, string> = {
  cropProduction: "Crop production",
  livestock: "Livestock",
  agroProcessing: "Agro-processing",
  inputSupply: "Input supply",
  agriTech: "Agri-tech / digital solutions",
  other: "Other",
}

const QUESTION_LABELS: Record<string, string> = {
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
  selectedValueChains: "Which value chains are you involved in?",
}

type NexgenApplication = {
  id: string
  status: string
  createdAt: string
  updatedAt: string
  applicantName: string
  applicantEmail: string
  applicantPhone: string
  companyName: string
  formData: {
    selectedValueChains?: ValueChainItem[]
    [key: string]: unknown
  }
}

type DashboardResponse = {
  success: boolean
  data: NexgenApplication[]
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
  message?: string
}

export default function ApplicationsPage() {
  const params = useParams()
  const lang = (params?.lang as string) || "en"
  const { isAuthenticated, isLoading } = useAuth()

  const [items, setItems] = useState<NexgenApplication[]>([])
  const [searchInput, setSearchInput] = useState("")
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState<DashboardResponse["pagination"]>()

  const fetchApplications = useCallback(async () => {
    if (!isAuthenticated) return
    setLoading(true)
    setError(null)

    try {
      const paramsObj = new URLSearchParams({
        page: String(page),
        limit: "20",
      })
      if (search.trim()) paramsObj.set("search", search.trim())

      const res = await fetch(`/api/v1/applications/dashboard?${paramsObj.toString()}`, {
        credentials: "include",
      })
      const result = (await res.json()) as DashboardResponse
      if (!res.ok || !result.success) {
        throw new Error(result.message || "Failed to load applications")
      }

      setItems(result.data || [])
      setPagination(result.pagination)
    } catch (e: any) {
      setItems([])
      setPagination(undefined)
      setError(e?.message || "Failed to load applications")
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, page, search])

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      fetchApplications()
    }
  }, [isLoading, isAuthenticated, fetchApplications])

  const totalShown = useMemo(() => items.length, [items])
  const totalRecords = pagination?.total ?? 0
  const stats = useMemo(() => {
    const submitted = items.filter((item) => item.status === "SUBMITTED").length
    const inReview = items.filter((item) => item.status === "UNDER_REVIEW").length
    const approved = items.filter((item) => item.status === "APPROVED").length
    const rejected = items.filter((item) => item.status === "REJECTED").length
    return {
      submitted,
      inReview,
      approved,
      rejected,
    }
  }, [items])

  const getStatusTone = (status: string) => {
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

  const applySearch = () => {
    setPage(1)
    setSearch(searchInput)
  }

  const clearSearch = () => {
    setSearchInput("")
    setSearch("")
    setPage(1)
  }

  const formatStatusLabel = (status: string) => status.replaceAll("_", " ")

  const escapeCsvValue = (value: string) => `"${value.replaceAll(`"`, `""`)}"`
  const prettify = (value: string) => value.replaceAll("_", " ")
  const getQuestionLabel = (key: string) =>
    QUESTION_LABELS[key] || prettify(key.replace(/([A-Z])/g, " $1")).replace(/^./, (s) => s.toUpperCase())

  const formatAnswer = (key: string, value: unknown): string => {
    if (value === null || value === undefined) return ""
    const normalizedKey = key.toLowerCase()

    if ((normalizedKey.includes("valuechains") || normalizedKey.includes("value_chains")) && value && typeof value === "object" && !Array.isArray(value)) {
      const selectedChains = Object.entries(value as Record<string, unknown>)
        .map(([chainKey, chainValue]) => {
          if (!chainValue || typeof chainValue !== "object") return ""
          const selection = chainValue as ValueChainSelection
          if (selection.selected !== true) return ""
          const chainLabel = VALUE_CHAIN_LABELS[chainKey] || prettify(chainKey)
          const chainDetails = typeof selection.details === "string" ? selection.details.trim() : ""
          return chainDetails ? `${chainLabel} (${chainDetails})` : chainLabel
        })
        .filter(Boolean)

      if (selectedChains.length > 0) {
        return selectedChains.join("; ")
      }
    }

    if ((normalizedKey.includes("valuechains") || normalizedKey.includes("value_chains")) && Array.isArray(value)) {
      return value
        .map((item) => {
          if (typeof item === "string") return prettify(item)
          if (item && typeof item === "object") {
            const chain = item as ValueChainItem
            if (chain.label || chain.key) {
              return prettify(chain.label || chain.key || "")
            }

            const selectedKeys = Object.entries(item as Record<string, unknown>)
              .filter(([, itemValue]) => itemValue === true)
              .map(([itemKey]) => prettify(itemKey))

            if (selectedKeys.length > 0) {
              return selectedKeys.join("; ")
            }
          }
          return ""
        })
        .filter(Boolean)
        .join("; ")
    }

    if (typeof value === "string") return prettify(value)
    if (typeof value === "number" || typeof value === "boolean") return String(value)
    if (Array.isArray(value)) {
      return value
        .map((item) => {
          if (typeof item === "string") return prettify(item)
          if (item && typeof item === "object") {
            const maybeLabel = (item as ValueChainItem).label || (item as ValueChainItem).key
            if (maybeLabel) return prettify(maybeLabel)
          }
          return prettify(JSON.stringify(item))
        })
        .join("; ")
    }
    return prettify(JSON.stringify(value))
  }

  const exportAllApplicationsWithAnswers = async () => {
    if (!isAuthenticated || exporting) return
    setExporting(true)
    setError(null)

    try {
      const allItems: NexgenApplication[] = []
      let nextPage = 1
      let hasNext = true

      while (hasNext) {
        const paramsObj = new URLSearchParams({
          page: String(nextPage),
          limit: "200",
        })
        if (search.trim()) paramsObj.set("search", search.trim())

        const res = await fetch(`/api/v1/applications/dashboard?${paramsObj.toString()}`, {
          credentials: "include",
        })
        const result = (await res.json()) as DashboardResponse
        if (!res.ok || !result.success) {
          throw new Error(result.message || "Failed to export applications")
        }

        allItems.push(...(result.data || []))
        hasNext = Boolean(result.pagination?.hasNextPage)
        nextPage += 1
      }

      const excludedQuestionKeys = new Set([
        "applicantName",
        "applicant_name",
        "companyName",
        "company_name",
        "email",
        "applicantEmail",
        "applicant_email",
        "phone",
        "applicantPhone",
        "applicant_phone",
      ])

      const questionKeys = Array.from(
        new Set(
          allItems.flatMap((app) =>
            app.formData && typeof app.formData === "object" ? Object.keys(app.formData) : []
          )
        )
      ).filter((key) => !excludedQuestionKeys.has(key))

      const headers = [
        "Application ID",
        "Company",
        "Email",
        "Status",
        "Submitted",
        ...questionKeys.map((key) => `Q: ${getQuestionLabel(key)}`),
      ]

      const rows = allItems.map((app) => {
        const base = [
          app.id,
          app.companyName || "Untitled company",
          app.applicantEmail || "",
          prettify(app.status),
          new Date(app.createdAt).toLocaleString(),
        ]

        const answers = questionKeys.map((key) => formatAnswer(key, app.formData?.[key]))
        return [...base, ...answers]
      })

      const csv = [headers, ...rows]
        .map((row) => row.map((cell) => escapeCsvValue(String(cell))).join(","))
        .join("\n")

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `nexgen-forum-applications-all-${new Date().toISOString().slice(0, 10)}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (e: any) {
      setError(e?.message || "Failed to export applications")
    } finally {
      setExporting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="py-10 flex items-center justify-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading...</span>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            Please sign in to view applications.
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardContent className="flex flex-col gap-4 py-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
                {lang === "rw" ? "Ubusabe bwa NexGen Forum" : "NexGen Forum Applications"}
              </h1>
              <p className="text-sm text-slate-600 md:text-base">
                {lang === "rw"
                  ? `Yerekana ubusabe bwoherejwe kuri /nexgen-forum (${totalRecords} byose)`
                  : `Live submissions from /nexgen-forum (${totalRecords} total)`}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                onClick={exportAllApplicationsWithAnswers}
                variant="outline"
                disabled={loading || exporting}
              >
                <Download className="mr-2 h-4 w-4" />
                {exporting ? "Exporting..." : "Export CSV"}
              </Button>
              <Button onClick={fetchApplications} disabled={loading}>
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardContent className="flex items-center justify-between py-6">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Total loaded</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">{totalShown}</p>
              </div>
              <FileText className="h-5 w-5 text-slate-500" />
            </CardContent>
          </Card>
          <Card className="border-amber-200 bg-amber-50/50 shadow-sm">
            <CardContent className="flex items-center justify-between py-6">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-amber-700">Submitted / Review</p>
                <p className="mt-1 text-2xl font-semibold text-amber-900">{stats.submitted + stats.inReview}</p>
              </div>
              <Clock3 className="h-5 w-5 text-amber-700" />
            </CardContent>
          </Card>
          <Card className="border-green-200 bg-green-50/50 shadow-sm">
            <CardContent className="flex items-center justify-between py-6">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-green-700">Approved</p>
                <p className="mt-1 text-2xl font-semibold text-green-900">{stats.approved}</p>
              </div>
              <CheckCircle2 className="h-5 w-5 text-green-700" />
            </CardContent>
          </Card>
          <Card className="border-red-200 bg-red-50/50 shadow-sm">
            <CardContent className="flex items-center justify-between py-6">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-red-700">Rejected</p>
                <p className="mt-1 text-2xl font-semibold text-red-900">{stats.rejected}</p>
              </div>
              <AlertCircle className="h-5 w-5 text-red-700" />
            </CardContent>
          </Card>
        </div>

        <Card className="border-slate-200 bg-white shadow-sm">
          <CardContent className="space-y-3 py-6">
            <div className="flex flex-col gap-2 md:flex-row">
              <Input
                className="bg-white"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by company, applicant, email, or phone"
                onKeyDown={(e) => {
                  if (e.key === "Enter") applySearch()
                }}
              />
              <div className="flex gap-2">
                <Button onClick={applySearch} disabled={loading}>
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </Button>
                <Button onClick={clearSearch} disabled={loading || (!search && !searchInput)} variant="outline">
                  Clear
                </Button>
              </div>
            </div>
            <p className="text-xs text-slate-500">
              Showing {totalShown} records on this page {search ? `for "${search}"` : "with no active filters"}.
            </p>
          </CardContent>
        </Card>

        {error && (
          <Card className="border-red-200 bg-red-50/60 shadow-sm">
            <CardContent className="flex items-start gap-2 py-4 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </CardContent>
          </Card>
        )}

        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-slate-900">Applications ({totalShown})</CardTitle>
          </CardHeader>
          <CardContent>
            {!loading && totalShown === 0 && !error ? (
              <div className="flex min-h-[220px] flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                <Inbox className="mb-3 h-8 w-8 text-slate-500" />
                <p className="text-sm font-medium text-slate-900">No applications found</p>
                <p className="mt-1 text-sm text-slate-600">Try a different search term or clear filters.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <Table>
                  <TableHeader className="bg-slate-100/80">
                    <TableRow>
                      <TableHead>Company</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Value Chains</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((app) => {
                      const valueChains = Array.isArray(app.formData?.selectedValueChains)
                        ? app.formData.selectedValueChains
                        : []
                      return (
                        <TableRow key={app.id} className="hover:bg-slate-50">
                          <TableCell className="font-medium">{app.companyName || "Untitled company"}</TableCell>
                          <TableCell>{app.applicantEmail || "-"}</TableCell>
                          <TableCell>{app.applicantPhone || "-"}</TableCell>
                          <TableCell>
                            <Badge className={getStatusTone(app.status)}>{formatStatusLabel(app.status)}</Badge>
                          </TableCell>
                          <TableCell>{new Date(app.createdAt).toLocaleString()}</TableCell>
                          <TableCell className="max-w-[320px]">
                            {valueChains.length === 0
                              ? "-"
                              : valueChains
                                  .slice(0, 3)
                                  .map((chain) => chain.label || chain.key || "Value chain")
                                  .join(", ")}
                            {valueChains.length > 3 ? ` +${valueChains.length - 3} more` : ""}
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-end">
                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/${lang}/dashboard/applications/${app.id}`}>
                                  <Eye className="mr-1.5 h-4 w-4" />
                                  View
                                </Link>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-600">
            Page {pagination?.page ?? 1} of {Math.max(pagination?.totalPages ?? 1, 1)}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={!pagination?.hasPrevPage || loading}
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              disabled={!pagination?.hasNextPage || loading}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
