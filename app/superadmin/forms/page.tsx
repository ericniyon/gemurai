"use client"

import { useState, useEffect } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { 
  MoreHorizontal, 
  Search, 
  Plus, 
  Eye, 
  Edit2, 
  Trash2, 
  FileText,
  Settings,
  Copy,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  Download,
  Loader2,
  FormInput,
  Layers,
  Code,
  Save,
  Play,
  EyeOff,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"

interface FormQuestion {
  id: string
  type: string
  label: string
  placeholder: string
  required: boolean
  order: number
  options?: string[]
  dependsOn?: {
    questionId: string
    value: string
  }
  validation?: {
    pattern?: string
    message?: string
    maxSize?: number
    acceptedTypes?: string[]
    minSelected?: number
  }
  subFields?: {
    [key: string]: {
      label: string
      placeholder: string
      required: boolean
    }
  }
}

interface FormSection {
  id: string
  title: string
  description: string
  order: number
  questions: FormQuestion[]
}

interface FormConfig {
  id: string
  title: string
  description: string
  sections: FormSection[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function FormsPage() {
  const [formConfigs, setFormConfigs] = useState<FormConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedForm, setSelectedForm] = useState<FormConfig | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isQuestionEditDialogOpen, setIsQuestionEditDialogOpen] = useState(false)
  const [isSectionEditDialogOpen, setIsSectionEditDialogOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    sections: [] as FormSection[]
  })
  const [editingQuestion, setEditingQuestion] = useState<FormQuestion | null>(null)
  const [editingSection, setEditingSection] = useState<FormSection | null>(null)
  const [editingSectionIndex, setEditingSectionIndex] = useState<number>(-1)
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<number>(-1)
  const { toast } = useToast()

  const fetchFormConfigs = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch("/api/v1/superadmin/form-configs", {
        credentials: "include"
      })
      const data = await response.json()
      if (data.success) {
        setFormConfigs(data.configs || [])
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      console.error("Error fetching form configs:", error)
      setError(error instanceof Error ? error.message : "Failed to fetch form configurations")
      toast({
        title: "Error",
        description: "Failed to fetch form configurations",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFormConfigs()
  }, [])

  const handleCreateForm = async () => {
    try {
      setIsUpdating(true)
      const response = await fetch("/api/v1/superadmin/form-configs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
        credentials: "include"
      })

      const data = await response.json()
      if (data.success) {
        toast({
          title: "Success",
          description: "Form configuration created successfully",
        })
        fetchFormConfigs()
        setIsCreateDialogOpen(false)
        setFormData({
          title: "",
          description: "",
          sections: [] as FormSection[]
        })
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create form configuration",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleUpdateForm = async () => {
    if (!selectedForm) return

    try {
      setIsUpdating(true)
      const response = await fetch(`/api/v1/superadmin/form-configs/${selectedForm.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
        credentials: "include"
      })

      const data = await response.json()
      if (data.success) {
        toast({
          title: "Success",
          description: "Form configuration updated successfully",
        })
        fetchFormConfigs()
        setIsEditDialogOpen(false)
        setSelectedForm(null)
        setFormData({
          title: "",
          description: "",
          sections: [] as FormSection[]
        })
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update form configuration",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleToggleActive = async (formId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/v1/superadmin/form-configs/${formId}/toggle`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive }),
        credentials: "include"
      })

      const data = await response.json()
      if (data.success) {
        toast({
          title: "Success",
          description: `Form ${isActive ? "activated" : "deactivated"} successfully`,
        })
        fetchFormConfigs()
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update form status",
        variant: "destructive",
      })
    }
  }

  const handleDeleteForm = async (formId: string) => {
    if (!confirm("Are you sure you want to delete this form configuration?")) return

    try {
      const response = await fetch(`/api/v1/superadmin/form-configs/${formId}`, {
        method: "DELETE",
        credentials: "include"
      })

      const data = await response.json()
      if (data.success) {
        toast({
          title: "Success",
          description: "Form configuration deleted successfully",
        })
        fetchFormConfigs()
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete form configuration",
        variant: "destructive",
      })
    }
  }

  const handleExportForm = (formConfig: FormConfig) => {
    const jsonContent = JSON.stringify(formConfig, null, 2)
    const blob = new Blob([jsonContent], { type: "application/json" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${formConfig.title.replace(/\s+/g, '-').toLowerCase()}-config.json`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleDuplicateForm = async (formConfig: FormConfig) => {
    const duplicatedForm = {
      ...formConfig,
      title: `${formConfig.title} (Copy)`,
      isActive: false
    }
    const { id, createdAt, updatedAt, ...formWithoutSystemFields } = duplicatedForm

    try {
      const response = await fetch("/api/v1/superadmin/form-configs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formWithoutSystemFields),
        credentials: "include"
      })

      const data = await response.json()
      if (data.success) {
        toast({
          title: "Success",
          description: "Form configuration duplicated successfully",
        })
        fetchFormConfigs()
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to duplicate form configuration",
        variant: "destructive",
      })
    }
  }

  const handleEditQuestion = (sectionIndex: number, questionIndex: number, question: FormQuestion) => {
    setEditingQuestion({ ...question })
    setEditingSectionIndex(sectionIndex)
    setEditingQuestionIndex(questionIndex)
    setIsQuestionEditDialogOpen(true)
  }

  const handleEditSection = (sectionIndex: number, section: FormSection) => {
    setEditingSection({ ...section })
    setEditingSectionIndex(sectionIndex)
    setIsSectionEditDialogOpen(true)
  }

  const handleSaveQuestion = () => {
    if (!editingQuestion || editingSectionIndex === -1 || editingQuestionIndex === -1) return

    const updatedSections = [...formData.sections]
    updatedSections[editingSectionIndex].questions[editingQuestionIndex] = { ...editingQuestion }
    
    setFormData({
      ...formData,
      sections: updatedSections
    })
    
    setIsQuestionEditDialogOpen(false)
    setEditingQuestion(null)
    setEditingSectionIndex(-1)
    setEditingQuestionIndex(-1)
  }

  const handleSaveSection = () => {
    if (!editingSection || editingSectionIndex === -1) return

    const updatedSections = [...formData.sections]
    updatedSections[editingSectionIndex] = { ...editingSection }
    
    setFormData({
      ...formData,
      sections: updatedSections
    })
    
    setIsSectionEditDialogOpen(false)
    setEditingSection(null)
    setEditingSectionIndex(-1)
  }

  const handleAddQuestion = (sectionIndex: number) => {
    const newQuestion: FormQuestion = {
      id: `q${Date.now()}`,
      type: "text",
      label: "New Question",
      placeholder: "Enter question placeholder",
      required: false,
      order: formData.sections[sectionIndex].questions.length + 1
    }

    const updatedSections = [...formData.sections]
    updatedSections[sectionIndex].questions.push(newQuestion)
    
    setFormData({
      ...formData,
      sections: updatedSections
    })
  }

  const handleAddSection = () => {
    const newSection: FormSection = {
      id: `section-${Date.now()}`,
      title: "New Section",
      description: "Section description",
      order: formData.sections.length + 1,
      questions: []
    }

    setFormData({
      ...formData,
      sections: [...formData.sections, newSection]
    })
  }

  const handleDeleteQuestion = (sectionIndex: number, questionIndex: number) => {
    if (!confirm("Are you sure you want to delete this question?")) return

    const updatedSections = [...formData.sections]
    updatedSections[sectionIndex].questions.splice(questionIndex, 1)
    
    // Reorder remaining questions
    updatedSections[sectionIndex].questions.forEach((q, index) => {
      q.order = index + 1
    })
    
    setFormData({
      ...formData,
      sections: updatedSections
    })
  }

  const handleDeleteSection = (sectionIndex: number) => {
    if (!confirm("Are you sure you want to delete this section?")) return

    const updatedSections = [...formData.sections]
    updatedSections.splice(sectionIndex, 1)
    
    // Reorder remaining sections
    updatedSections.forEach((s, index) => {
      s.order = index + 1
    })
    
    setFormData({
      ...formData,
      sections: updatedSections
    })
  }

  const filteredFormConfigs = formConfigs.filter((formConfig) => {
    const searchString = searchTerm.toLowerCase()
    return (
      formConfig.title.toLowerCase().includes(searchString) ||
      formConfig.description.toLowerCase().includes(searchString)
    )
  })

  const stats = {
    total: formConfigs.length,
    active: formConfigs.filter(form => form.isActive).length,
    inactive: formConfigs.filter(form => !form.isActive).length,
    sections: formConfigs.reduce((total, form) => total + form.sections.length, 0),
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <p className="text-gray-600">Loading form configurations...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchFormConfigs} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-gray-900 break-words">
            Form Management
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-500">
            Create and manage application forms
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 px-6 py-3 rounded-lg font-semibold"
          >
            <Plus className="h-5 w-5 mr-2" />
            <span className="hidden sm:inline">Create Form</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <Card>
          <CardContent className="p-3 sm:p-4 md:p-5">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1 pr-2">
                <p className="text-sm font-medium text-gray-500">Total Forms</p>
                <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mt-1">
                  {stats.total}
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-blue-50 rounded-full shrink-0">
                <FormInput className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-3 sm:p-4 md:p-5">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1 pr-2">
                <p className="text-sm font-medium text-gray-500">Active</p>
                <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mt-1">
                  {stats.active}
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-green-50 rounded-full shrink-0">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-3 sm:p-4 md:p-5">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1 pr-2">
                <p className="text-sm font-medium text-gray-500">Inactive</p>
                <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mt-1">
                  {stats.inactive}
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-gray-50 rounded-full shrink-0">
                <EyeOff className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-3 sm:p-4 md:p-5">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1 pr-2">
                <p className="text-sm font-medium text-gray-500">Sections</p>
                <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mt-1">
                  {stats.sections}
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-purple-50 rounded-full shrink-0">
                <Layers className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* DCC Application Form Section */}
      {(() => {
        const dccForm = formConfigs.find(form => form.title === "DCC Application Form")
        if (dccForm) {
          return (
            <Card className="mb-6 border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500 rounded-lg">
                      <FileText className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold text-blue-900">
                        DCC Application Form
                      </CardTitle>
                      <CardDescription className="text-blue-700 mt-1">
                        Digital Community Champion Application Form - {dccForm.sections.length} sections, {dccForm.sections.reduce((sum, section) => sum + section.questions.length, 0)} questions
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`${dccForm.isActive ? "bg-green-500" : "bg-gray-500"} text-white flex items-center gap-1 px-3 py-1`}>
                      {dccForm.isActive ? <CheckCircle className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      {dccForm.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <Button
                      onClick={() => setSelectedForm(dccForm)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:shadow-md"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Form
                    </Button>
                    <Button
                      onClick={() => {
                        setFormData({
                          title: dccForm.title,
                          description: dccForm.description,
                          sections: dccForm.sections
                        })
                        setSelectedForm(dccForm)
                        setIsEditDialogOpen(true)
                      }}
                      className="bg-white hover:bg-gray-50 text-blue-600 border border-blue-200 px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:shadow-md"
                    >
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit Form
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white rounded-lg p-4 border border-blue-100">
                    <div className="flex items-center gap-2 mb-2">
                      <Layers className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-gray-700">Sections</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-900">{dccForm.sections.length}</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-blue-100">
                    <div className="flex items-center gap-2 mb-2">
                      <FormInput className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-gray-700">Questions</span>
                    </div>
                    <div className="text-2xl font-bold text-green-900">{dccForm.sections.reduce((sum, section) => sum + section.questions.length, 0)}</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-blue-100">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-medium text-gray-700">Created</span>
                    </div>
                    <div className="text-sm font-medium text-purple-900">{new Date(dccForm.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-blue-100">
                    <div className="flex items-center gap-2 mb-2">
                      <Settings className="h-4 w-4 text-orange-600" />
                      <span className="text-sm font-medium text-gray-700">Last Updated</span>
                    </div>
                    <div className="text-sm font-medium text-orange-900">{new Date(dccForm.updatedAt).toLocaleDateString()}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        }
        return null
      })()}

      <Card className="mb-4 sm:mb-6">
        <CardContent className="p-3 sm:p-4 md:p-5">
          <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
            <div className="flex-1 min-w-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search forms..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 sm:h-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-3 sm:p-4 md:p-5">
          <CardTitle className="text-base sm:text-lg md:text-xl">
            Form Configurations ({filteredFormConfigs.length})
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Manage and configure application forms
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="hidden lg:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Form</TableHead>
                  <TableHead className="w-[100px]">Sections</TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead className="w-[120px]">Created</TableHead>
                  <TableHead className="w-[120px]">Updated</TableHead>
                  <TableHead className="w-[150px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFormConfigs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <FormInput className="h-8 w-8 text-gray-400" />
                        <p className="text-gray-500">No form configurations found</p>
                        {searchTerm && <p className="text-sm text-gray-400">Try adjusting your search</p>}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredFormConfigs.map((formConfig) => (
                    <TableRow key={formConfig.id}>
                      <TableCell>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {formConfig.title}
                          </p>
                          <p className="text-sm text-gray-500 truncate mt-1">
                            {formConfig.description}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {formConfig.sections.length}
                      </TableCell>
                      <TableCell>
                        <Badge className={`${formConfig.isActive ? "bg-green-500" : "bg-gray-500"} text-white flex items-center gap-1`}>
                          {formConfig.isActive ? <CheckCircle className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                          {formConfig.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {new Date(formConfig.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {new Date(formConfig.updatedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setSelectedForm(formConfig)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setFormData({
                                  title: formConfig.title,
                                  description: formConfig.description,
                                  sections: formConfig.sections
                                })
                                setSelectedForm(formConfig)
                                setIsEditDialogOpen(true)
                              }}
                            >
                              <Edit2 className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleToggleActive(formConfig.id, !formConfig.isActive)}
                            >
                              {formConfig.isActive ? "Deactivate" : "Activate"}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDuplicateForm(formConfig)}
                            >
                              <Copy className="mr-2 h-4 w-4" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleExportForm(formConfig)}
                            >
                              <Download className="mr-2 h-4 w-4" />
                              Export
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDeleteForm(formConfig.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="lg:hidden">
            {filteredFormConfigs.length === 0 ? (
              <div className="p-8 text-center">
                <div className="flex flex-col items-center gap-2">
                  <FormInput className="h-8 w-8 text-gray-400" />
                  <p className="text-gray-500">No form configurations found</p>
                  {searchTerm && <p className="text-sm text-gray-400">Try adjusting your search</p>}
                </div>
              </div>
            ) : (
              <div className="space-y-3 p-3 sm:p-4">
                {filteredFormConfigs.map((formConfig) => (
                  <Card key={formConfig.id} className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 truncate">
                            {formConfig.title}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {formConfig.description}
                          </p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 shrink-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setSelectedForm(formConfig)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setFormData({
                                  title: formConfig.title,
                                  description: formConfig.description,
                                  sections: formConfig.sections
                                })
                                setSelectedForm(formConfig)
                                setIsEditDialogOpen(true)
                              }}
                            >
                              <Edit2 className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleToggleActive(formConfig.id, !formConfig.isActive)}
                            >
                              {formConfig.isActive ? "Deactivate" : "Activate"}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDuplicateForm(formConfig)}
                            >
                              <Copy className="mr-2 h-4 w-4" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleExportForm(formConfig)}
                            >
                              <Download className="mr-2 h-4 w-4" />
                              Export
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDeleteForm(formConfig.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Layers className="h-3 w-3" />
                          {formConfig.sections.length} sections
                        </Badge>
                        <Badge className={`${formConfig.isActive ? "bg-green-500" : "bg-gray-500"} text-white flex items-center gap-1`}>
                          {formConfig.isActive ? <CheckCircle className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                          {formConfig.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>Created: {new Date(formConfig.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>Updated: {new Date(formConfig.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create Form Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Form Configuration</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Form Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter form title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                placeholder="Enter form description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateForm} disabled={isUpdating}>
              {isUpdating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Create Form
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Form Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto bg-white border-0 shadow-2xl backdrop-blur-none opacity-100 rounded-xl">
          <DialogHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100 rounded-t-xl p-6 -m-6 mb-6">
            <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Edit2 className="h-5 w-5 text-white" />
              </div>
              Edit Form Configuration
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Form Title</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter form title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  placeholder="Enter form description"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900">Sections</h4>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddSection}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Section
                </Button>
              </div>

              {formData.sections.length === 0 ? (
                <p className="text-gray-500 text-sm">No sections configured yet. Add a section to get started.</p>
              ) : (
                <div className="space-y-4">
                  {formData.sections.map((section, sectionIndex) => (
                    <Card key={section.id} className="p-4">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900 mb-1">{section.title}</h5>
                            <p className="text-sm text-gray-600">{section.description}</p>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditSection(sectionIndex, section)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteSection(sectionIndex)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h6 className="text-sm font-medium text-gray-700">Questions ({section.questions.length})</h6>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleAddQuestion(sectionIndex)}
                              className="flex items-center gap-2"
                            >
                              <Plus className="h-3 w-3" />
                              Add Question
                            </Button>
                          </div>

                          {section.questions.length === 0 ? (
                            <p className="text-gray-500 text-sm">No questions in this section.</p>
                          ) : (
                            <div className="space-y-2">
                              {section.questions.map((question, questionIndex) => (
                                <div
                                  key={question.id}
                                  className="flex items-center justify-between p-3 border rounded-lg bg-gray-50"
                                >
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium text-gray-900 truncate">
                                        {question.label}
                                      </span>
                                      {question.required && (
                                        <Badge variant="outline" className="text-xs text-red-600">
                                          Required
                                        </Badge>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                      <Badge variant="outline" className="text-xs">
                                        {question.type}
                                      </Badge>
                                      <span className="text-xs text-gray-500">
                                        Order: {question.order}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 ml-4">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleEditQuestion(sectionIndex, questionIndex, question)}
                                    >
                                      <Edit2 className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeleteQuestion(sectionIndex, questionIndex)}
                                      className="text-red-600 hover:text-red-700"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter className="bg-gray-50 border-t border-gray-100 rounded-b-xl p-6 -m-6 mt-6 flex justify-end gap-3">
            <Button 
              variant="outline" 
              onClick={() => setIsEditDialogOpen(false)}
              className="px-6 py-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateForm} 
              disabled={isUpdating}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 px-6 py-2 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Update Form
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Form Details Dialog */}
      {selectedForm && !isEditDialogOpen && (
        <Dialog open={!!selectedForm} onOpenChange={() => setSelectedForm(null)}>
          <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto bg-white border-0 shadow-2xl backdrop-blur-none opacity-100 rounded-xl">
            <DialogHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100 rounded-t-xl p-6 -m-6 mb-6">
              <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                {selectedForm.title}
              </DialogTitle>
              <p className="text-gray-600 mt-2">{selectedForm.description}</p>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className={`h-4 w-4 ${selectedForm.isActive ? 'text-green-600' : 'text-gray-500'}`} />
                      <span className="text-sm font-medium text-gray-700">Status</span>
                    </div>
                    <Badge className={`${selectedForm.isActive ? "bg-green-500" : "bg-gray-500"} text-white flex items-center gap-1 w-fit`}>
                      {selectedForm.isActive ? <CheckCircle className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                      {selectedForm.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Layers className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-medium text-gray-700">Sections</span>
                    </div>
                    <div className="text-2xl font-bold text-purple-900">{selectedForm.sections.length}</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <FormInput className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-gray-700">Questions</span>
                    </div>
                    <div className="text-2xl font-bold text-green-900">{selectedForm.sections.reduce((sum: number, section: any) => sum + section.questions.length, 0)}</div>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-orange-600" />
                      <span className="text-sm font-medium text-gray-700">Created</span>
                    </div>
                    <div className="text-sm font-medium text-orange-900">{new Date(selectedForm.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 text-lg flex items-center gap-2">
                  <Layers className="h-5 w-5 text-blue-600" />
                  Form Sections
                </h4>
                {selectedForm.sections.length === 0 ? (
                  <div className="text-center py-8">
                    <FormInput className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No sections configured yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedForm.sections.map((section: any, index: number) => (
                      <Card key={section.id || index} className="border-0 bg-white shadow-lg hover:shadow-xl transition-all duration-300">
                        <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-100 rounded-t-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <div className="p-1 bg-blue-500 rounded text-white text-sm font-bold">
                                  {index + 1}
                                </div>
                                {section.title}
                              </CardTitle>
                              <CardDescription className="text-gray-600 mt-1">
                                {section.description}
                              </CardDescription>
                            </div>
                            <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                              {section.questions?.length || 0} questions
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            {section.questions?.map((question: any, qIndex: number) => (
                              <div key={question.id || qIndex} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-gray-900 truncate">
                                      {question.label}
                                    </span>
                                    {question.required && (
                                      <Badge variant="outline" className="text-xs text-red-600 border-red-200 bg-red-50">
                                        Required
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                      {question.type}
                                    </Badge>
                                    <span className="text-xs text-gray-500">
                                      Order: {question.order}
                                    </span>
                                    {question.options && (
                                      <span className="text-xs text-gray-500">
                                        {question.options.length} options
                                      </span>
                                    )}
                                    {question.validation && (
                                      <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">
                                        Validated
                                      </Badge>
                                    )}
                                    {question.dependsOn && (
                                      <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                                        Conditional
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <DialogFooter className="bg-gray-50 border-t border-gray-100 rounded-b-xl p-6 -m-6 mt-6 flex justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={() => setSelectedForm(null)}
                className="px-6 py-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
              >
                Close
              </Button>
              <Button 
                onClick={() => {
                  setFormData({
                    title: selectedForm.title,
                    description: selectedForm.description,
                    sections: selectedForm.sections
                  })
                  setSelectedForm(selectedForm)
                  setIsEditDialogOpen(true)
                }}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 px-6 py-2 font-semibold"
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Edit Form
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Question Edit Dialog */}
      <Dialog open={isQuestionEditDialogOpen} onOpenChange={setIsQuestionEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Question</DialogTitle>
          </DialogHeader>
          {editingQuestion && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="question-id">Question ID</Label>
                <Input
                  id="question-id"
                  value={editingQuestion.id}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, id: e.target.value })}
                  placeholder="Enter question ID"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="question-type">Question Type</Label>
                <Select
                  value={editingQuestion.type}
                  onValueChange={(value) => setEditingQuestion({ ...editingQuestion, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select question type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="textarea">Textarea</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="phone">Phone</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="select">Select</SelectItem>
                    <SelectItem value="radio">Radio</SelectItem>
                    <SelectItem value="checkbox">Checkbox</SelectItem>
                    <SelectItem value="file">File Upload</SelectItem>
                    <SelectItem value="dependent-dropdown">Dependent Dropdown</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="question-label">Question Label</Label>
                <Input
                  id="question-label"
                  value={editingQuestion.label}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, label: e.target.value })}
                  placeholder="Enter question label"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="question-placeholder">Placeholder</Label>
                <Input
                  id="question-placeholder"
                  value={editingQuestion.placeholder}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, placeholder: e.target.value })}
                  placeholder="Enter placeholder text"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="question-order">Order</Label>
                <Input
                  id="question-order"
                  type="number"
                  value={editingQuestion.order}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, order: parseInt(e.target.value) || 1 })}
                  placeholder="Enter question order"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="question-required"
                  checked={editingQuestion.required}
                  onCheckedChange={(checked) => setEditingQuestion({ ...editingQuestion, required: checked })}
                />
                <Label htmlFor="question-required">Required</Label>
              </div>
              
              {(editingQuestion.type === "select" || editingQuestion.type === "radio" || editingQuestion.type === "checkbox") && (
                <div className="space-y-2">
                  <Label htmlFor="question-options">Options (one per line)</Label>
                  <Textarea
                    id="question-options"
                    value={editingQuestion.options?.join("\n") || ""}
                    onChange={(e) => setEditingQuestion({
                      ...editingQuestion,
                      options: e.target.value.split("\n").filter(option => option.trim())
                    })}
                    rows={4}
                    placeholder="Enter options, one per line"
                  />
                </div>
              )}

              {editingQuestion.type === "file" && (
                <div className="space-y-2">
                  <Label htmlFor="question-validation">Validation Message</Label>
                  <Input
                    id="question-validation"
                    value={editingQuestion.validation?.message || ""}
                    onChange={(e) => setEditingQuestion({
                      ...editingQuestion,
                      validation: { ...editingQuestion.validation, message: e.target.value }
                    })}
                    placeholder="Enter validation message"
                  />
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsQuestionEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveQuestion}>
              Save Question
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Section Edit Dialog */}
      <Dialog open={isSectionEditDialogOpen} onOpenChange={setIsSectionEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Section</DialogTitle>
          </DialogHeader>
          {editingSection && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="section-id">Section ID</Label>
                <Input
                  id="section-id"
                  value={editingSection.id}
                  onChange={(e) => setEditingSection({ ...editingSection, id: e.target.value })}
                  placeholder="Enter section ID"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="section-title">Section Title</Label>
                <Input
                  id="section-title"
                  value={editingSection.title}
                  onChange={(e) => setEditingSection({ ...editingSection, title: e.target.value })}
                  placeholder="Enter section title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="section-description">Description</Label>
                <Textarea
                  id="section-description"
                  value={editingSection.description}
                  onChange={(e) => setEditingSection({ ...editingSection, description: e.target.value })}
                  rows={3}
                  placeholder="Enter section description"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="section-order">Order</Label>
                <Input
                  id="section-order"
                  type="number"
                  value={editingSection.order}
                  onChange={(e) => setEditingSection({ ...editingSection, order: parseInt(e.target.value) || 1 })}
                  placeholder="Enter section order"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSectionEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSection}>
              Save Section
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 