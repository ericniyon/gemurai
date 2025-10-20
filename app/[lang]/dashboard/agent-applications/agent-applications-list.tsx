"use client"

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, ArrowUpDown } from 'lucide-react'
import { Input } from "@/components/ui/input"
import { Application } from "@prisma/client"
import { ApplicationStatus } from "@/types/application"
import { formatDate } from "@/lib/utils"

interface AgentApplicationsListProps {
  applications: Application[]
}

export default function AgentApplicationsList({ applications }: AgentApplicationsListProps) {
  const router = useRouter()
  const params = useParams()
  const lang = (params?.lang as string) === 'rw' ? 'rw' : 'en'
  const [searchTerm, setSearchTerm] = useState("")
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Application | null
    direction: 'asc' | 'desc'
  }>({
    key: 'createdAt',
    direction: 'desc'
  })

  // Filter applications based on search term
  const filteredApplications = applications.filter(app => 
    app.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (app.email && app.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    app.phone.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Sort applications
  const sortedApplications = [...filteredApplications].sort((a, b) => {
    if (!sortConfig.key) return 0

    const aValue = a[sortConfig.key]
    const bValue = b[sortConfig.key]

    if (aValue === bValue) return 0
    if (aValue === null) return 1
    if (bValue === null) return -1

    const result = aValue < bValue ? -1 : 1
    return sortConfig.direction === 'asc' ? result : -result
  })

  // Handle sort
  const handleSort = (key: keyof Application) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  // Get status badge color
  const getStatusColor = (status: ApplicationStatus) => {
    switch (status) {
      case "SUBMITTED":
        return "bg-blue-100 text-blue-800"
      case "UNDER_REVIEW":
        return "bg-yellow-100 text-yellow-800"
      case "PENDING_DOCUMENTS":
        return "bg-orange-100 text-orange-800"
      case "APPROVED":
        return "bg-green-100 text-green-800"
      case "REJECTED":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (!applications?.length) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p>{lang === 'rw' ? 'Nta busabe bubonetse.' : 'No applications found.'}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder={lang === 'rw' ? 'Shakisha ubusabe...' : 'Search applications...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort('id')} className="h-8 flex items-center gap-1">
                      ID <ArrowUpDown className="h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort('status')} className="h-8 flex items-center gap-1">
                      {lang === 'rw' ? 'Imiterere' : 'Status'} <ArrowUpDown className="h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort('createdAt')} className="h-8 flex items-center gap-1">
                      {lang === 'rw' ? 'Yoherejwe Kuva' : 'Submitted On'} <ArrowUpDown className="h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>{lang === 'rw' ? 'Amakuru yo Kuvugana' : 'Contact'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedApplications.map((application) => (
                  <TableRow key={application.id}>
                    <TableCell className="font-medium">{application.id}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={getStatusColor(application.status as ApplicationStatus)}>
                        {(application.status as ApplicationStatus).replace(/_/g, ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(application.createdAt)}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {application.email && (
                          <div className="text-gray-600">{application.email}</div>
                        )}
                        <div className="text-gray-600">{application.phone}</div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="text-sm text-gray-500">
            {lang === 'rw' ? `Igaragaza ${sortedApplications.length} muri ${applications.length} z'ubusabe` : `Showing ${sortedApplications.length} of ${applications.length} applications`}
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 