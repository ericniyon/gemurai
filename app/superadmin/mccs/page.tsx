"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Milk,
  Plus,
  Search,
  Eye,
  Edit,
  TrendingUp,
  Users,
  MapPin,
  Building2,
  Activity,
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"

const pageBackgroundClasses = "bg-gradient-to-br from-slate-50 via-white to-blue-50/40"
const cardBaseClasses =
  "relative overflow-hidden rounded-2xl border border-white/60 bg-white/80 backdrop-blur-md shadow-xl shadow-blue-100/60"
const sectionCardClasses =
  "rounded-[32px] border-2 border-blue-100/70 bg-white/80 backdrop-blur-xl shadow-[0_25px_70px_rgba(15,23,42,0.08)] p-4 sm:p-6 space-y-4"

interface MCC {
  id: string
  name: string
  code: string
  region: string
  address: string
  manager?: {
    id: string
    name: string
    email: string
  }
  _count?: {
    staff: number
    farmers: number
  }
}

export default function MCCsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [mccs, setMccs] = useState<MCC[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchMCCs()
  }, [])

  const fetchMCCs = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("Gemurai_token")
      if (!token) {
        toast.error("Authentication required")
        router.push("/superadmin/login")
        return
      }

      const response = await fetch("/api/v1/mcc/setup", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || errorData.details || "Failed to fetch MCCs")
      }

      const data = await response.json()
      if (!data.success) {
        throw new Error(data.error || "Failed to fetch MCCs")
      }
      setMccs(data.data || [])
    } catch (error) {
      console.error("Error fetching MCCs:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to load MCCs"
      toast.error(errorMessage)
      // Set empty array on error so UI doesn't break
      setMccs([])
    } finally {
      setLoading(false)
    }
  }

  const filteredMCCs = mccs.filter(
    (mcc) =>
      mcc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mcc.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mcc.region?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className={`relative min-h-screen overflow-hidden ${pageBackgroundClasses}`}>
      <div className="pointer-events-none absolute top-[-180px] right-[-120px] h-[420px] w-[420px] rounded-full bg-gradient-to-br from-blue-500/20 via-indigo-400/10 to-purple-400/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-160px] left-[-160px] h-[380px] w-[380px] rounded-full bg-gradient-to-tr from-emerald-400/15 via-sky-400/10 to-blue-400/5 blur-3xl" />
      <div className="relative z-10 flex-1 p-2 sm:p-4 md:p-6 lg:p-8 max-w-[2000px] mx-auto">
      {/* Header Section */}
      <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mb-4 sm:mb-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-gray-900 break-words">
            Milk Collection Centers
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-500">
            Manage all Milk Collection Centers
          </p>
        </div>
        <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
          <Button
            onClick={() => router.push("/superadmin/mccs/new")}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20 transition hover:shadow-blue-500/40 disabled:opacity-60"
          >
            <Plus className="h-4 w-4" />
            <span>New MCC</span>
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className={`${cardBaseClasses} mb-4 sm:mb-6`}>
        <CardContent className="p-3 sm:p-4 md:p-5">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search MCCs by name, code, or region..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 rounded-xl border border-blue-100 bg-white/80 backdrop-blur-sm"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* MCCs Table */}
      <Card className={cardBaseClasses}>
        <CardHeader className="p-3 sm:p-4 md:p-5 lg:p-6 border-b border-white/50">
          <CardTitle className="text-lg sm:text-xl md:text-2xl">All MCCs</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            {filteredMCCs.length} MCC{filteredMCCs.length !== 1 ? "s" : ""} found
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Activity className="h-6 w-6 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-500">Loading MCCs...</span>
            </div>
          ) : filteredMCCs.length === 0 ? (
            <div className="text-center py-12">
              <Milk className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No MCCs found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Region</TableHead>
                    <TableHead>Manager</TableHead>
                    <TableHead>Staff</TableHead>
                    <TableHead>Farmers</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMCCs.map((mcc) => (
                    <TableRow key={mcc.id}>
                      <TableCell className="font-medium">{mcc.name}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium">
                          {mcc.code}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-gray-600">
                          <MapPin className="h-3 w-3" />
                          <span>{mcc.region || "N/A"}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {mcc.manager ? (
                          <div>
                            <div className="font-medium">{mcc.manager.name}</div>
                            <div className="text-xs text-gray-500">{mcc.manager.email}</div>
                          </div>
                        ) : (
                          <span className="text-gray-400">No manager</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span>{mcc._count?.staff || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span>{mcc._count?.farmers || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/superadmin/mccs/${mcc.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/superadmin/mccs/${mcc.id}/edit`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  )
}

