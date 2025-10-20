"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Search,
  Eye,
  MessageSquare,
  Mail,
  Phone,
  MapPin,
  Star,
  TrendingUp,
  Package,
  DollarSign,
  Users,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { getAllDCCs } from "@/lib/dcc-storage"

type DCC = {
  id: string
  name: string
  location: string
  email: string
  status: string
  level: string
  phone: string
  avatar?: string
  rating?: number
  communitiesServed?: number
  performance?: number
  projectsCompleted?: number
  // Add other fields as needed
}

export default function DCCManagement() {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [locationFilter, setLocationFilter] = useState("all")
  const [levelFilter, setLevelFilter] = useState("all")
  const [selectedDCC, setSelectedDCC] = useState<DCC | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isSMSDialogOpen, setIsSMSDialogOpen] = useState(false)
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false)
  const [smsMessage, setSmsMessage] = useState("")
  const [emailSubject, setEmailSubject] = useState("")
  const [emailMessage, setEmailMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [allDCCs, setAllDCCs] = useState<DCC[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load DCCs on component mount and refresh periodically
  useEffect(() => {
    const loadDCCs = () => {
      try {
        setIsLoading(true)
        // Get only DCCs created from approved applications
        const approvedDCCs = getAllDCCs()
        setAllDCCs(
          approvedDCCs.map(dccData => ({
            ...dccData,
            performance: dccData.performance
              ? (
                  dccData.performance.salesTarget +
                  dccData.performance.currentSales +
                  dccData.performance.customerSatisfaction +
                  dccData.performance.deliveryRate
                ) / 4
              : undefined,
          }))
        )
      } catch (error) {
        console.error("Failed to load DCCs:", error)
        setAllDCCs([])
      } finally {
        setIsLoading(false)
      }
    }

    loadDCCs()

    // Refresh DCCs every 5 seconds to show newly approved applications
    const interval = setInterval(loadDCCs, 5000)

    return () => clearInterval(interval)
  }, [])

  // Filter DCCs based on search and filters
  const filteredDCCs = allDCCs.filter((dcc) => {
    const matchesSearch =
      dcc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dcc.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dcc.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || dcc.status === statusFilter
    const matchesLocation =
      locationFilter === "all" || dcc.location.toLowerCase().includes(locationFilter.toLowerCase())
    const matchesLevel = levelFilter === "all" || dcc.level === levelFilter

    return matchesSearch && matchesStatus && matchesLocation && matchesLevel
  })

  const handleViewDCC = (dcc: DCC) => {
    setSelectedDCC(dcc)
    setIsViewDialogOpen(true)
  }

  const handleSendSMS = (dcc: DCC) => {
    setSelectedDCC(dcc)
    setIsSMSDialogOpen(true)
  }

  const handleSendEmail = (dcc: DCC) => {
    setSelectedDCC(dcc)
    setIsEmailDialogOpen(true)
  }

  const handleSubmitSMS = async () => {
    if (!smsMessage.trim()) {
      toast({
        title: "Message Required",
        description: "Please enter a message to send.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      toast({
        title: "SMS Sent Successfully",
        description: `SMS sent to ${selectedDCC?.name} at ${selectedDCC?.phone}`,
      })

      setIsSMSDialogOpen(false)
      setSmsMessage("")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send SMS. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmitEmail = async () => {
    if (!emailSubject.trim() || !emailMessage.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in both subject and message.",
        variant: "destructive",
      })
    }

    setIsSubmitting(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      toast({
        title: "Email Sent Successfully",
        description: `Email sent to ${selectedDCC?.name} at ${selectedDCC?.email}`,
      })

      setIsEmailDialogOpen(false)
      setEmailSubject("")
      setEmailMessage("")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send email. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Level A":
        return "bg-green-100 text-green-800 border-green-200"
      case "Level B":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "Level C":
        return "bg-purple-100 text-purple-800 border-purple-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusColor = (status: string) => {
    return status === "active"
      ? "bg-green-100 text-green-800 border-green-200"
      : "bg-red-100 text-red-800 border-red-200"
  }

  // Empty state component
  const EmptyState = () => (
    <div className="text-center py-12">
      <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Users className="h-12 w-12 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">No DCCs Yet</h3>
      <p className="text-gray-500 mb-4 max-w-md mx-auto">
        DCCs will appear here automatically when applications are approved. Start by reviewing and approving
        applications to build your DCC network.
      </p>
      <Button variant="outline" onClick={() => (window.location.href = "/dashboard/applications")}>
        Review Applications
      </Button>
    </div>
  )

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300 p-6 max-w-[1600px] mx-auto">
      {/* Page Header */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-6 backdrop-blur-sm bg-white/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Digital Community Champions
            </h1>
            <p className="text-gray-600 text-base mt-3">
              Manage and monitor Digital Community Champions across regions
            </p>
            <div className="flex flex-wrap items-center gap-6 mt-6">
              <div className="flex items-center gap-2 text-sm bg-green-50 px-4 py-2 rounded-lg">
                <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
                <span className="font-medium text-green-700">
                  {filteredDCCs.filter((dcc) => dcc.status === "active").length} Active
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm bg-yellow-50 px-4 py-2 rounded-lg">
                <div className="w-2.5 h-2.5 bg-yellow-500 rounded-full"></div>
                <span className="font-medium text-yellow-700">
                  {filteredDCCs.filter((dcc) => dcc.level === "Level A").length} Level A
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm bg-blue-50 px-4 py-2 rounded-lg">
                <div className="w-2.5 h-2.5 bg-blue-500 rounded-full"></div>
                <span className="font-medium text-blue-700">
                  {filteredDCCs.filter((dcc) => dcc.level === "Level B").length} Level B
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm bg-purple-50 px-4 py-2 rounded-lg">
                <div className="w-2.5 h-2.5 bg-purple-500 rounded-full"></div>
                <span className="font-medium text-purple-700">
                  {filteredDCCs.filter((dcc) => dcc.level === "Level C").length} Level C
                </span>
              </div>
          </div>
          </div>
        </div>
      </div>

      {/* Enhanced Filters and Search */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6 backdrop-blur-sm bg-white/50">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search by name, location, or email..."
              className="pl-12 h-12 rounded-xl border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-12 rounded-xl border-gray-200 focus:ring-2 focus:ring-primary/20 transition-all duration-200">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-gray-200">
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <Select value={locationFilter} onValueChange={setLocationFilter}>
            <SelectTrigger className="h-12 rounded-xl border-gray-200 focus:ring-2 focus:ring-primary/20 transition-all duration-200">
              <SelectValue placeholder="Filter by location" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-gray-200">
              <SelectItem value="all">All Locations</SelectItem>
              <SelectItem value="kigali">Kigali</SelectItem>
              <SelectItem value="eastern">Eastern</SelectItem>
              <SelectItem value="western">Western Province</SelectItem>
              <SelectItem value="northern">Northern Province</SelectItem>
              <SelectItem value="southern">Southern Province</SelectItem>
            </SelectContent>
          </Select>
          <Select value={levelFilter} onValueChange={setLevelFilter}>
            <SelectTrigger className="h-12 rounded-xl border-gray-200 focus:ring-2 focus:ring-primary/20 transition-all duration-200">
              <SelectValue placeholder="Filter by level" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-gray-200">
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="Level A">Level A</SelectItem>
              <SelectItem value="Level B">Level B</SelectItem>
              <SelectItem value="Level C">Level C</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* DCCs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDCCs.map((dcc) => (
          <div
            key={dcc.id}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all duration-200"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={dcc.avatar} alt={dcc.name} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getInitials(dcc.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-gray-900">{dcc.name}</h3>
                    <p className="text-sm text-gray-500">{dcc.email}</p>
                  </div>
            </div>
                <Badge className={getLevelColor(dcc.level)}>{dcc.level}</Badge>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  {dcc.location}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4" />
                  {dcc.phone}
            </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Star className="h-4 w-4" />
                  {dcc.rating} Rating
                          </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="h-4 w-4" />
                  {dcc.communitiesServed} Communities
                        </div>
                      </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Performance</span>
                  <span className="text-sm text-gray-600">{dcc.performance}%</span>
                      </div>
                <Progress value={dcc.performance} className="h-2" />
                      </div>

              <div className="mt-6 flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                  className="flex-1 h-9 rounded-lg hover:bg-gray-50 transition-all duration-200"
                          onClick={() => handleViewDCC(dcc)}
                        >
                  <Eye className="h-4 w-4 mr-2" />
                  View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                  className="flex-1 h-9 rounded-lg hover:bg-gray-50 transition-all duration-200"
                          onClick={() => handleSendSMS(dcc)}
                        >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  SMS
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                  className="flex-1 h-9 rounded-lg hover:bg-gray-50 transition-all duration-200"
                          onClick={() => handleSendEmail(dcc)}
                        >
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                        </Button>
                      </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredDCCs.length === 0 && !isLoading && (
        <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
          <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No DCCs Found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || statusFilter !== "all" || locationFilter !== "all" || levelFilter !== "all"
              ? "Try adjusting your filters or search terms"
              : "No Digital Community Champions have been registered yet"}
          </p>
        </div>
          )}

      {/* Loading State */}
      {isLoading && (
        <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading DCCs...</p>
        </div>
      )}

      {/* View DCC Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px] rounded-2xl">
          <DialogHeader>
            <DialogTitle>DCC Details</DialogTitle>
            <DialogDescription>Detailed information about the Digital Community Champion</DialogDescription>
          </DialogHeader>
          {selectedDCC && (
            <div className="space-y-6 py-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedDCC.avatar} alt={selectedDCC.name} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xl">
                    {getInitials(selectedDCC.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{selectedDCC.name}</h3>
                  <p className="text-gray-500">{selectedDCC.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-gray-500">Location</Label>
                  <p className="font-medium text-gray-900">{selectedDCC.location}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-gray-500">Phone</Label>
                  <p className="font-medium text-gray-900">{selectedDCC.phone}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-gray-500">Level</Label>
                          <Badge className={getLevelColor(selectedDCC.level)}>{selectedDCC.level}</Badge>
                </div>
                <div className="space-y-1">
                  <Label className="text-gray-500">Status</Label>
                          <Badge className={getStatusColor(selectedDCC.status)}>
                    {selectedDCC.status.charAt(0).toUpperCase() + selectedDCC.status.slice(1)}
                          </Badge>
                        </div>
                      </div>

              <div className="space-y-4">
                      <div>
                  <Label className="text-gray-500">Performance Metrics</Label>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                        <Users className="h-4 w-4 text-gray-500" />
                        {selectedDCC.communitiesServed} Communities
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                        <Star className="h-4 w-4 text-gray-500" />
                        {selectedDCC.rating} Rating
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                        <TrendingUp className="h-4 w-4 text-gray-500" />
                        {selectedDCC.performance}% Performance
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                        <Package className="h-4 w-4 text-gray-500" />
                        {selectedDCC.projectsCompleted} Projects
                      </div>
                    </div>
                  </div>
                          </div>
                        </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* SMS Dialog */}
      <Dialog open={isSMSDialogOpen} onOpenChange={setIsSMSDialogOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-2xl">
          <DialogHeader>
            <DialogTitle>Send SMS</DialogTitle>
            <DialogDescription>Send an SMS message to {selectedDCC?.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea
                placeholder="Type your message here..."
                value={smsMessage}
                onChange={(e) => setSmsMessage(e.target.value)}
                className="h-32 resize-none rounded-xl border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsSMSDialogOpen(false)}
              className="rounded-lg hover:bg-gray-50 transition-all duration-200"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitSMS}
              disabled={isSubmitting}
              className="rounded-lg bg-primary hover:bg-primary/90 transition-all duration-200"
            >
              {isSubmitting ? "Sending..." : "Send SMS"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Email Dialog */}
      <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-2xl">
          <DialogHeader>
            <DialogTitle>Send Email</DialogTitle>
            <DialogDescription>Send an email to {selectedDCC?.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Subject</Label>
              <Input
                placeholder="Email subject"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                className="rounded-xl border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
              />
            </div>
            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea
                placeholder="Type your message here..."
                value={emailMessage}
                onChange={(e) => setEmailMessage(e.target.value)}
                className="h-32 resize-none rounded-xl border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEmailDialogOpen(false)}
              className="rounded-lg hover:bg-gray-50 transition-all duration-200"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitEmail}
              disabled={isSubmitting}
              className="rounded-lg bg-primary hover:bg-primary/90 transition-all duration-200"
            >
              {isSubmitting ? "Sending..." : "Send Email"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
