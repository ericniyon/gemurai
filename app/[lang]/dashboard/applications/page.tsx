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
import { Loader2, RefreshCw, Search, FileText, Clock3, CheckCircle2, Eye, Download } from "lucide-react"

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
    return {
      submitted,
      inReview,
      approved,
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

  const escapeCsvValue = (value: string) => `"${value.replaceAll(`"`, `""`)}"`
  const prettify = (value: string) => value.replaceAll("_", " ")

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
        "Applicant",
        "Email",
        "Phone",
        "Status",
        "Submitted",
        ...questionKeys.map((key) => `Q: ${key}`),
      ]

      const rows = allItems.map((app) => {
        const base = [
          app.id,
          app.companyName || "Untitled company",
          app.applicantName || "Unknown applicant",
          app.applicantEmail || "",
          app.applicantPhone || "",
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
    <div className="min-h-screen bg-gray-50">
      <div className="w-full py-6 px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {lang === "rw" ? "Ubusabe bwa NexGen Forum" : "NexGen Forum Applications"}
            </h1>
            <p className="text-gray-600 mt-1">
              {lang === "rw"
                ? `Yerekana ubusabe bwoherejwe kuri /nexgen-forum (${totalRecords} byose)`
                : `Shows submissions from /nexgen-forum (${totalRecords} total)`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={exportAllApplicationsWithAnswers}
              variant="outline"
              disabled={loading || exporting}
            >
              <Download className="h-4 w-4 mr-2" />
              {exporting ? "Exporting..." : "Export All CSV"}
            </Button>
            <Button
              onClick={fetchApplications}
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh Data
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-2 border-blue-200 hover:border-blue-400 transition-all shadow-sm hover:shadow-md">
            <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                  <p className="text-xs text-gray-500">Total Loaded</p>
                  <p className="text-2xl font-bold text-blue-900">{totalShown}</p>
              </div>
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            </CardContent>
          </Card>
          <Card className="border-2 border-amber-200 hover:border-amber-400 transition-all shadow-sm hover:shadow-md">
            <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                  <p className="text-xs text-gray-500">Submitted</p>
                  <p className="text-2xl font-bold text-amber-900">{stats.submitted + stats.inReview}</p>
              </div>
              <Clock3 className="h-5 w-5 text-amber-600" />
            </div>
            </CardContent>
          </Card>
          <Card className="border-2 border-green-200 hover:border-green-400 transition-all shadow-sm hover:shadow-md">
            <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                  <p className="text-xs text-gray-500">Approved</p>
                  <p className="text-2xl font-bold text-green-900">{stats.approved}</p>
              </div>
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-2 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-2 items-stretch md:items-center">
              <Input
                className="border-slate-200 bg-white focus-visible:ring-2 focus-visible:ring-slate-400"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by company, applicant, email, or phone"
                onKeyDown={(e) => {
                  if (e.key === "Enter") applySearch()
                }}
              />
              <Button onClick={applySearch} disabled={loading}>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
          </CardContent>
        </Card>

        {error && (
          <Card className="border-2 border-red-200">
            <CardContent className="py-6 text-sm text-red-600">{error}</CardContent>
          </Card>
        )}

        <Card className="border-2 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl font-bold text-blue-900">Applications ({totalShown})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-slate-200 overflow-x-auto bg-white">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Applicant</TableHead>
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
                      <TableRow key={app.id} className="hover:bg-slate-50/70">
                        <TableCell className="font-medium">{app.companyName || "Untitled company"}</TableCell>
                        <TableCell>{app.applicantName || "Unknown applicant"}</TableCell>
                        <TableCell>{app.applicantEmail || "-"}</TableCell>
                        <TableCell>{app.applicantPhone || "-"}</TableCell>
                        <TableCell>
                          <Badge className={getStatusTone(app.status)}>{app.status.replaceAll("_", " ")}</Badge>
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
                              <Eye className="h-4 w-4 mr-1.5" />
                              View details
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
          </CardContent>
        </Card>

        {!loading && totalShown === 0 && !error && (
          <Card className="border-2 border-slate-200">
            <CardContent className="py-8 text-center text-muted-foreground">
              No applications found.
            </CardContent>
          </Card>
        )}

        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
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
