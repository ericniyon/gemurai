"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
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
  ArrowLeft,
  Search,
  Eye,
  Activity,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"

interface Collection {
  id: string
  collectionDate: string
  totalLiters: number
  unitPrice: number
  totalAmount: number
  qualityStatus: string
  status: string
  farmers: {
    id: string
    name: string
    farmerCode: string
  }
  agent?: {
    id: string
    name: string
  }
}

export default function MCCCollectionsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const mccId = params.id as string

  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    if (mccId) {
      fetchCollections()
    }
  }, [mccId, page])

  const fetchCollections = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("Gemurai_token")
      if (!token) {
        toast.error("Authentication required")
        router.push("/superadmin/login")
        return
      }

      const response = await fetch(
        `/api/v1/mcc/collections?mccId=${mccId}&page=${page}&limit=20`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error("Failed to fetch collections")
      }

      const data = await response.json()
      setCollections(data.data || [])
      setTotalPages(data.meta?.totalPages || 1)
    } catch (error) {
      console.error("Error fetching collections:", error)
      toast.error("Failed to load collections")
    } finally {
      setLoading(false)
    }
  }

  const getQualityStatusBadge = (status: string) => {
    switch (status) {
      case "accepted":
        return <Badge className="bg-green-500">Accepted</Badge>
      case "rejected":
        return <Badge className="bg-red-500">Rejected</Badge>
      default:
        return <Badge className="bg-yellow-500">Pending</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return <Badge className="bg-green-500">Paid</Badge>
      case "APPROVED":
        return <Badge className="bg-blue-500">Approved</Badge>
      default:
        return <Badge className="bg-yellow-500">Pending</Badge>
    }
  }

  const filteredCollections = collections.filter(
    (collection) =>
      collection.farmers.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      collection.farmers.farmerCode.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="flex-1 p-2 sm:p-4 md:p-6 lg:p-8 bg-gray-50 max-w-[2000px] mx-auto min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mb-4 sm:mb-6">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/superadmin/mccs/${mccId}`)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-gray-900 break-words">
            Milk Collections
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-500">
            View all milk collections for this MCC
          </p>
        </div>
      </div>

      {/* Search */}
      <Card className="mb-4 sm:mb-6">
        <CardContent className="p-3 sm:p-4 md:p-5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by farmer name or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Collections Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Collections</CardTitle>
          <CardDescription>
            {filteredCollections.length} collection{filteredCollections.length !== 1 ? "s" : ""} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Activity className="h-6 w-6 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-500">Loading collections...</span>
            </div>
          ) : filteredCollections.length === 0 ? (
            <div className="text-center py-12">
              <Milk className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No collections found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Farmer</TableHead>
                    <TableHead>Liters</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Quality</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCollections.map((collection) => (
                    <TableRow key={collection.id}>
                      <TableCell>
                        {new Date(collection.collectionDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{collection.farmers.name}</div>
                          <div className="text-xs text-gray-500">
                            {collection.farmers.farmerCode}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{collection.totalLiters.toFixed(2)}L</TableCell>
                      <TableCell>RWF {collection.unitPrice.toLocaleString()}</TableCell>
                      <TableCell>RWF {collection.totalAmount.toLocaleString()}</TableCell>
                      <TableCell>{getQualityStatusBadge(collection.qualityStatus)}</TableCell>
                      <TableCell>{getStatusBadge(collection.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/superadmin/mccs/${mccId}/collections/${collection.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-500">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

