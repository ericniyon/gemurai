"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { 
  FileText, 
  Download, 
  Calendar,
  AlertCircle,
  CheckCircle,
  Loader2,
  BarChart3,
  PieChart,
  TrendingUp,
  Users,
  Droplets,
  DollarSign,
  Filter,
  Settings,
  Minus
} from "lucide-react"

interface GenerateReportFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

interface ReportFormData {
  reportType: 'period' | 'farmer' | 'financial' | 'summary' | 'analytics'
  periodId?: string
  farmerId?: string
  startDate: string
  endDate: string
  format: 'pdf' | 'excel' | 'csv'
  includeCharts: boolean
  includeDetails: boolean
  includeDeductions: boolean
  includePayments: boolean
  groupBy?: 'farmer' | 'period' | 'district' | 'sector'
  sortBy?: 'name' | 'amount' | 'quantity' | 'date'
  sortOrder: 'asc' | 'desc'
  filters: {
    minAmount?: number
    maxAmount?: number
    minQuantity?: number
    maxQuantity?: number
    status?: string[]
    districts?: string[]
  }
}

export function GenerateReportForm({ open, onOpenChange, onSuccess }: GenerateReportFormProps) {
  const [formData, setFormData] = useState<ReportFormData>({
    reportType: 'summary',
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10), // 30 days ago
    endDate: new Date().toISOString().slice(0, 10),
    format: 'pdf',
    includeCharts: true,
    includeDetails: true,
    includeDeductions: true,
    includePayments: true,
    groupBy: 'farmer',
    sortBy: 'name',
    sortOrder: 'asc',
    filters: {}
  })
  
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Partial<ReportFormData>>({})

  const reportTypes = [
    { value: 'summary', label: 'Summary Report', description: 'Overall MCC performance summary' },
    { value: 'period', label: 'Period Report', description: 'Detailed report for specific period' },
    { value: 'farmer', label: 'Farmer Report', description: 'Individual farmer performance' },
    { value: 'financial', label: 'Financial Report', description: 'Financial transactions and payments' },
    { value: 'analytics', label: 'Analytics Report', description: 'Trends and performance analytics' }
  ]

  const formats = [
    { value: 'pdf', label: 'PDF Document', description: 'Professional formatted document' },
    { value: 'excel', label: 'Excel Spreadsheet', description: 'Data analysis and calculations' },
    { value: 'csv', label: 'CSV File', description: 'Raw data for import/export' }
  ]

  const groupByOptions = [
    { value: 'farmer', label: 'By Farmer' },
    { value: 'period', label: 'By Period' },
    { value: 'district', label: 'By District' },
    { value: 'sector', label: 'By Sector' }
  ]

  const sortByOptions = [
    { value: 'name', label: 'Farmer Name' },
    { value: 'amount', label: 'Total Amount' },
    { value: 'quantity', label: 'Milk Quantity' },
    { value: 'date', label: 'Collection Date' }
  ]

  const districts = [
    'Kicukiro', 'Gasabo', 'Nyarugenge', 'Bugesera', 'Gatsibo', 'Kayonza', 'Kirehe', 'Ngoma', 'Nyagatare', 'Rwamagana'
  ]

  const validateForm = (): boolean => {
    const newErrors: Partial<ReportFormData> = {}
    
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required'
    }
    
    if (!formData.endDate) {
      newErrors.endDate = 'End date is required'
    }
    
    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
      newErrors.endDate = 'End date must be after start date'
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
      
    } catch (error) {
      toast.error("Failed to generate report. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const updateFilter = (key: keyof ReportFormData['filters'], value: any) => {
    setFormData(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        [key]: value
      }
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-white border-2 border-gray-200 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generate MCC Report
          </DialogTitle>
          <DialogDescription>
            Create comprehensive reports for the Milk Collection Cooperative with various options and filters.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Report Type Selection */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Report Type</CardTitle>
              <CardDescription>Choose the type of report to generate</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reportTypes.map((type) => (
                  <div
                    key={type.value}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      formData.reportType === type.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, reportType: type.value as any }))}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        formData.reportType === type.value
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300'
                      }`}>
                        {formData.reportType === type.value && (
                          <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium">{type.label}</h3>
                        <p className="text-sm text-gray-500">{type.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Date Range */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Date Range</CardTitle>
              <CardDescription>Select the period for the report</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date *</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                      className={`pl-10 ${errors.startDate ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.startDate && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.startDate}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date *</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                      className={`pl-10 ${errors.endDate ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.endDate && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.endDate}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Output Format */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Output Format</CardTitle>
              <CardDescription>Choose the format for the generated report</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {formats.map((format) => (
                  <div
                    key={format.value}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      formData.format === format.value
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, format: format.value as any }))}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        formData.format === format.value
                          ? 'border-green-500 bg-green-500'
                          : 'border-gray-300'
                      }`}>
                        {formData.format === format.value && (
                          <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium">{format.label}</h3>
                        <p className="text-sm text-gray-500">{format.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Report Options */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Report Options</CardTitle>
              <CardDescription>Customize what to include in the report</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeCharts"
                      checked={formData.includeCharts}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, includeCharts: !!checked }))}
                    />
                    <Label htmlFor="includeCharts" className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Include Charts & Graphs
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeDetails"
                      checked={formData.includeDetails}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, includeDetails: !!checked }))}
                    />
                    <Label htmlFor="includeDetails" className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Include Detailed Data
                    </Label>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeDeductions"
                      checked={formData.includeDeductions}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, includeDeductions: !!checked }))}
                    />
                    <Label htmlFor="includeDeductions" className="flex items-center gap-2">
                      <Minus className="h-4 w-4" />
                      Include Deductions
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includePayments"
                      checked={formData.includePayments}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, includePayments: !!checked }))}
                    />
                    <Label htmlFor="includePayments" className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Include Payment Details
                    </Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sorting & Grouping */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Sorting & Grouping</CardTitle>
              <CardDescription>Organize the report data</CardDescription>
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
                  <Select value={formData.sortOrder} onValueChange={(value: any) => setFormData(prev => ({ ...prev, sortOrder: value }))}>
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
            </CardContent>
          </Card>

          {/* Filters */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Filters</CardTitle>
              <CardDescription>Apply filters to narrow down the data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minAmount">Minimum Amount (Frw)</Label>
                  <Input
                    id="minAmount"
                    type="number"
                    value={formData.filters.minAmount || ''}
                    onChange={(e) => updateFilter('minAmount', parseFloat(e.target.value) || undefined)}
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxAmount">Maximum Amount (Frw)</Label>
                  <Input
                    id="maxAmount"
                    type="number"
                    value={formData.filters.maxAmount || ''}
                    onChange={(e) => updateFilter('maxAmount', parseFloat(e.target.value) || undefined)}
                    placeholder="No limit"
                    min="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minQuantity">Minimum Quantity (L)</Label>
                  <Input
                    id="minQuantity"
                    type="number"
                    value={formData.filters.minQuantity || ''}
                    onChange={(e) => updateFilter('minQuantity', parseFloat(e.target.value) || undefined)}
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxQuantity">Maximum Quantity (L)</Label>
                  <Input
                    id="maxQuantity"
                    type="number"
                    value={formData.filters.maxQuantity || ''}
                    onChange={(e) => updateFilter('maxQuantity', parseFloat(e.target.value) || undefined)}
                    placeholder="No limit"
                    min="0"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Report Preview */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Report Preview</CardTitle>
              <CardDescription>Summary of selected options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">Report Type:</span>
                  </div>
                  <Badge variant="secondary">{reportTypes.find(t => t.value === formData.reportType)?.label}</Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Download className="h-4 w-4 text-green-600" />
                    <span className="font-medium">Format:</span>
                  </div>
                  <Badge variant="secondary">{formats.find(f => f.value === formData.format)?.label}</Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-purple-600" />
                    <span className="font-medium">Date Range:</span>
                  </div>
                  <Badge variant="secondary">{formData.startDate} to {formData.endDate}</Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-orange-600" />
                    <span className="font-medium">Group By:</span>
                  </div>
                  <Badge variant="secondary">{groupByOptions.find(g => g.value === formData.groupBy)?.label}</Badge>
                </div>
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
