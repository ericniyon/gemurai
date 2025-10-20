"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  MapPin,
  Calendar,
  Users,
  Briefcase,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function JobsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  // Mock job data
  const jobs = [
    {
      id: "JOB-001",
      title: "Digital Community Champion - Kigali",
      location: "Kigali, Rwanda",
      type: "Full-time",
      status: "active",
      applications: 45,
      posted: "2024-01-15",
      deadline: "2024-02-15",
      description: "Looking for passionate individuals to serve as Digital Community Champions in Kigali area.",
    },
    {
      id: "JOB-002",
      title: "DCC Supervisor - Northern Province",
      location: "Musanze, Rwanda",
      type: "Full-time",
      status: "active",
      applications: 23,
      posted: "2024-01-20",
      deadline: "2024-02-20",
      description: "Seeking experienced DCC to supervise and mentor new community champions.",
    },
    {
      id: "JOB-003",
      title: "Digital Community Champion - Rural Areas",
      location: "Nyagatare, Rwanda",
      type: "Part-time",
      status: "draft",
      applications: 0,
      posted: "2024-01-25",
      deadline: "2024-03-01",
      description: "Expanding our reach to rural communities with dedicated DCCs.",
    },
    {
      id: "JOB-004",
      title: "Senior DCC - Western Province",
      location: "Karongi, Rwanda",
      type: "Full-time",
      status: "closed",
      applications: 67,
      posted: "2023-12-01",
      deadline: "2024-01-01",
      description: "Senior position for experienced community champion in Western Province.",
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>
      case "draft":
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Draft</Badge>
      case "closed":
        return <Badge className="bg-red-100 text-red-800 border-red-200">Closed</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Unknown</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "draft":
        return <Clock className="h-5 w-5 text-gray-500" />
      case "closed":
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      {/* Page Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Job Postings
            </h1>
            <p className="text-gray-600 text-lg mt-2">Manage your DCC job postings and recruitment</p>
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>{jobs.filter((job) => job.status === "active").length} Active</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                <span>{jobs.filter((job) => job.status === "draft").length} Draft</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>{jobs.filter((job) => job.status === "closed").length} Closed</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button size="sm" className="h-10 px-4 rounded-xl bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Post New Job
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="border border-gray-100 shadow-sm rounded-2xl p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search job postings..."
              className="pl-12 h-12 rounded-xl border-gray-200 focus:border-primary transition-all duration-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[200px] h-12 rounded-xl border-gray-200">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Job Listings */}
      <div className="grid gap-6">
        {jobs.map((job) => (
          <Card
            key={job.id}
            className="border border-gray-100 shadow-sm rounded-2xl hover:shadow-md transition-shadow duration-200"
          >
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <CardTitle className="text-xl font-bold">{job.title}</CardTitle>
                    {getStatusBadge(job.status)}
                  </div>
                  <CardDescription className="text-gray-600">{job.description}</CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Job
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Job
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{job.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{job.type}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{job.applications} applications</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Deadline: {job.deadline}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  {getStatusIcon(job.status)}
                  <span>Posted on {job.posted}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="rounded-xl">
                    <Eye className="h-4 w-4 mr-2" />
                    View Applications
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-xl">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
