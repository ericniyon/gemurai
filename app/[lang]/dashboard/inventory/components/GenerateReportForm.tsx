"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { 
  FileText, 
  Download, 
  X, 
  Calendar,
  BarChart3,
  Package,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Loader2,
  Filter,
  Settings,
  Mail,
  Printer
} from "lucide-react"

interface GenerateReportFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

interface ReportFormData {
  reportType: 'inventory' | 'movement' | 'valuation' | 'lowstock' | 'custom'
  title: string
  dateRange: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom'
  startDate: string
  endDate: string
  location: string
  category: string
  format: 'pdf' | 'excel' | 'csv'
  includeCharts: boolean
  includeDetails: boolean
  groupBy: 'category' | 'location' | 'supplier' | 'none'
  sortBy: 'name' | 'sku' | 'quantity' | 'value' | 'date'
  sortOrder: 'asc' | 'desc'
  emailTo: string
  schedule: 'once' | 'daily' | 'weekly' | 'monthly'
}

export function GenerateReportForm({ open, onOpenChange, onSuccess }: GenerateReportFormProps) {
  const [formData, setFormData] = useState<ReportFormData>({
    reportType: 'inventory',
    title: '',
    dateRange: 'month',
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date().toISOString().slice(0, 10),
    location: '',
    category: '',
    format: 'pdf',
    includeCharts: true,
    includeDetails: true,
    groupBy: 'category',
    sortBy: 'name',
    sortOrder: 'asc',
    emailTo: '',
    schedule: 'once'
  })
  
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Partial<ReportFormData>>({})
  const [selectedSections, setSelectedSections] = useState<string[]>([
    'summary', 'inventory', 'movements', 'valuations'
  ])

  const reportTypes = [
    { 
      value: 'inventory', 
      label: 'Inventory Report', 
      description: 'Current stock levels and product details',
      icon: Package,
      color: 'text-blue-600'
    },
    { 
      value: 'movement', 
      label: 'Movement Report', 
      description: 'Stock movements and transfers',
      icon: TrendingUp,
      color: 'text-green-600'
    },
    { 
      value: 'valuation', 
      label: 'Valuation Report', 
      description: 'Inventory value and cost analysis',
      icon: BarChart3,
      color: 'text-purple-600'
    },
    { 
      value: 'lowstock', 
      label: 'Low Stock Report', 
      description: 'Products below reorder point',
      icon: AlertCircle,
      color: 'text-red-600'
    },
    { 
      value: 'custom', 
      label: 'Custom Report', 
      description: 'Create a custom report with specific criteria',
      icon: Settings,
      color: 'text-gray-600'
    }
  ]

  const dateRanges = [
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'year', label: 'This Year' },
    { value: 'custom', label: 'Custom Range' }
  ]

  const formats = [
    { value: 'pdf', label: 'PDF', description: 'Portable Document Format' },
    { value: 'excel', label: 'Excel', description: 'Microsoft Excel Spreadsheet' },
    { value: 'csv', label: 'CSV', description: 'Comma Separated Values' }
  ]

  const groupByOptions = [
    { value: 'category', label: 'Category' },
    { value: 'location', label: 'Location' },
    { value: 'supplier', label: 'Supplier' },
    { value: 'none', label: 'No Grouping' }
  ]

  const sortByOptions = [
    { value: 'name', label: 'Product Name' },
    { value: 'sku', label: 'SKU' },
    { value: 'quantity', label: 'Quantity' },
    { value: 'value', label: 'Value' },
    { value: 'date', label: 'Date' }
  ]

  const reportSections = [
    { id: 'summary', label: 'Executive Summary', description: 'Key metrics and overview' },
    { id: 'inventory', label: 'Inventory Details', description: 'Current stock levels' },
    { id: 'movements', label: 'Stock Movements', description: 'Recent transfers and adjustments' },
    { id: 'valuations', label: 'Valuations', description: 'Cost and value analysis' },
    { id: 'trends', label: 'Trends', description: 'Historical data and patterns' },
    { id: 'alerts', label: 'Alerts', description: 'Low stock and reorder notifications' }
  ]

  const validateForm = (): boolean => {
    const newErrors: Partial<ReportFormData> = {}
    
    if (!formData.reportType) {
      newErrors.reportType = 'Report type is required'
    }
    
    if (!formData.title.trim()) {
      newErrors.title = 'Report title is required'
    }
    
    if (formData.dateRange === 'custom') {
      if (!formData.startDate) {
        newErrors.startDate = 'Start date is required'
      }
      if (!formData.endDate) {
        newErrors.endDate = 'End date is required'
      }
      if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
        newErrors.endDate = 'End date must be after start date'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error("Please fix the errors before submitting")
      return
    }

    setIsLoading(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      toast.success("Report generated successfully!")
      onSuccess?.()
      onOpenChange(false)
      
      // Reset form
      setFormData({
        reportType: 'inventory',
        title: '',
        dateRange: 'month',
        startDate: new Date().toISOString().slice(0, 10),
        endDate: new Date().toISOString().slice(0, 10),
        location: '',
        category: '',
        format: 'pdf',
        includeCharts: true,
        includeDetails: true,
        groupBy: 'category',
        sortBy: 'name',
        sortOrder: 'asc',
        emailTo: '',
        schedule: 'once'
      })
      setErrors({})
      
    } catch (error) {
      toast.error("Failed to generate report. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const toggleSection = (sectionId: string) => {
    setSelectedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    )
  }

  const generateTitle = () => {
    const type = reportTypes.find(t => t.value === formData.reportType)?.label || 'Report'
    const date = formData.dateRange === 'custom' 
      ? `${formData.startDate} to ${formData.endDate}`
      : dateRanges.find(d => d.value === formData.dateRange)?.label || 'Period'
    
    setFormData(prev => ({ ...prev, title: `${type} - ${date}` }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white border-2 border-gray-200 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generate Report
          </DialogTitle>
          <DialogDescription>
            Create comprehensive inventory reports with customizable options.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Report Type & Title */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Report Configuration</CardTitle>
              <CardDescription>Select report type and basic settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Report Type *</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {reportTypes.map(type => (
                    <div
                      key={type.value}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        formData.reportType === type.value 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setFormData(prev => ({ ...prev, reportType: type.value as any }))}
                    >
                      <div className="flex items-center gap-3">
                        <type.icon className={`h-5 w-5 ${type.color}`} />
                        <div>
                          <div className="font-medium">{type.label}</div>
                          <div className="text-sm text-gray-500">{type.description}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {errors.reportType && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.reportType}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Report Title *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter report title"
                      className={errors.title ? 'border-red-500' : ''}
                    />
                    <Button type="button" variant="outline" onClick={generateTitle}>
                      Auto
                    </Button>
                  </div>
                  {errors.title && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.title}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="format">Output Format</Label>
                  <Select value={formData.format} onValueChange={(value: 'pdf' | 'excel' | 'csv') => setFormData(prev => ({ ...prev, format: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {formats.map(format => (
                        <SelectItem key={format.value} value={format.value}>
                          <div>
                            <div className="font-medium">{format.label}</div>
                            <div className="text-sm text-gray-500">{format.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Date Range */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Date Range</CardTitle>
              <CardDescription>Select the time period for the report</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Period</Label>
                <Select value={formData.dateRange} onValueChange={(value: any) => setFormData(prev => ({ ...prev, dateRange: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {dateRanges.map(range => (
                      <SelectItem key={range.value} value={range.value}>{range.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formData.dateRange === 'custom' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date *</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                      className={errors.startDate ? 'border-red-500' : ''}
                    />
                    {errors.startDate && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.startDate}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date *</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                      className={errors.endDate ? 'border-red-500' : ''}
                    />
                    {errors.endDate && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.endDate}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Report Sections */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Report Sections</CardTitle>
              <CardDescription>Choose which sections to include in the report</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {reportSections.map(section => (
                  <div key={section.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                    <Checkbox
                      id={section.id}
                      checked={selectedSections.includes(section.id)}
                      onCheckedChange={() => toggleSection(section.id)}
                    />
                    <div className="flex-1">
                      <Label htmlFor={section.id} className="font-medium">{section.label}</Label>
                      <div className="text-sm text-gray-500">{section.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Advanced Options */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Advanced Options</CardTitle>
              <CardDescription>Customize report formatting and organization</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="groupBy">Group By</Label>
                  <Select value={formData.groupBy} onValueChange={(value: any) => setFormData(prev => ({ ...prev, groupBy: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {groupByOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sortBy">Sort By</Label>
                  <Select value={formData.sortBy} onValueChange={(value: any) => setFormData(prev => ({ ...prev, sortBy: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sortByOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sortOrder">Sort Order</Label>
                  <Select value={formData.sortOrder} onValueChange={(value: 'asc' | 'desc') => setFormData(prev => ({ ...prev, sortOrder: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asc">Ascending</SelectItem>
                      <SelectItem value="desc">Descending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeCharts"
                    checked={formData.includeCharts}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, includeCharts: !!checked }))}
                  />
                  <Label htmlFor="includeCharts">Include Charts and Graphs</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeDetails"
                    checked={formData.includeDetails}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, includeDetails: !!checked }))}
                  />
                  <Label htmlFor="includeDetails">Include Detailed Item List</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Options */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Delivery Options</CardTitle>
              <CardDescription>Choose how to receive the report</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="emailTo">Email To</Label>
                <div className="flex gap-2">
                  <Mail className="h-4 w-4 text-gray-400 mt-3" />
                  <Input
                    id="emailTo"
                    type="email"
                    value={formData.emailTo}
                    onChange={(e) => setFormData(prev => ({ ...prev, emailTo: e.target.value }))}
                    placeholder="Enter email address"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="schedule">Schedule</Label>
                <Select value={formData.schedule} onValueChange={(value: any) => setFormData(prev => ({ ...prev, schedule: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="once">Generate Once</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <DialogFooter className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating Report...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Generate Report
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
