"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { ClientOnly } from "@/components/client-only"
import { useToast } from "@/hooks/use-toast"
import {
  Plus,
  Edit2,
  Trash2,
  Save,
  Eye,
  EyeOff,
  Settings,
  GripVertical,
  Copy,
  FileText,
  HelpCircle,
  CheckSquare,
  Calendar,
  Phone,
  Mail,
  Hash,
  Type,
  List,
  ToggleLeft,
  Upload,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Loader2,
  Download,
  FileJson,
  FileSpreadsheet,
  FileImage,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  getFormConfig,
  saveFormConfig,
  type FormSection,
  type FormQuestion,
  type FormConfig,
} from "@/lib/form-service"

interface NewSection {
  title: string
  description: string
  order: number
}

interface NewQuestion {
  type: string
  label: string
  placeholder: string
  required: boolean
  order: number
  options: string[]
  sectionId: string
}

const QUESTION_TYPES = [
  { value: "text", label: "Text Input", icon: Type },
  { value: "textarea", label: "Long Text", icon: FileText },
  { value: "email", label: "Email", icon: Mail },
  { value: "phone", label: "Phone", icon: Phone },
  { value: "number", label: "Number", icon: Hash },
  { value: "date", label: "Date", icon: Calendar },
  { value: "select", label: "Dropdown", icon: List },
  { value: "radio", label: "Radio Buttons", icon: CheckSquare },
  { value: "checkbox", label: "Checkboxes", icon: CheckSquare },
  { value: "file", label: "File Upload", icon: Upload },
  { value: "dependent-dropdown", label: "Location Picker", icon: List },
  { value: "switch", label: "Yes/No Switch", icon: ToggleLeft },
]

function DynamicFormManagementContent() {
  const { user } = useAuth()
  const { toast } = useToast()

  // Form state
  const [formConfig, setFormConfig] = useState<FormConfig | null>(null)
  const [sections, setSections] = useState<FormSection[]>([])
  const [formTitle, setFormTitle] = useState("")
  const [formDescription, setFormDescription] = useState("")
  const [isFormActive, setIsFormActive] = useState(true)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // UI state
  const [selectedTab, setSelectedTab] = useState("sections")
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
  const [previewMode, setPreviewMode] = useState(false)

  // Dialog states
  const [showSectionDialog, setShowSectionDialog] = useState(false)
  const [showQuestionDialog, setShowQuestionDialog] = useState(false)
  const [editingSection, setEditingSection] = useState<FormSection | null>(null)
  const [editingQuestion, setEditingQuestion] = useState<{section: FormSection, question: FormQuestion} | null>(null)
  const [targetSectionId, setTargetSectionId] = useState<string>("")

  // Form data for dialogs
  const [newSection, setNewSection] = useState<NewSection>({
    title: "",
    description: "",
    order: 1,
  })
  const [newQuestion, setNewQuestion] = useState<NewQuestion>({
    type: "text",
    label: "",
    placeholder: "",
    required: false,
    order: 1,
    options: [],
    sectionId: "",
  })
  const [optionInput, setOptionInput] = useState("")

  // Load form configuration
  useEffect(() => {
    loadFormConfig()
  }, [])

  const loadFormConfig = async () => {
    try {
      setLoading(true)
      const config = getFormConfig()
      setFormConfig(config)
      setSections(config.sections)
      setFormTitle(config.title)
      setFormDescription(config.description)
      setIsFormActive(config.isActive)
      
      // Expand first section by default
      if (config.sections.length > 0) {
        setExpandedSections(new Set([config.sections[0].id]))
      }
    } catch (error) {
      console.error("Error loading form config:", error)
      toast({
        title: "Error",
        description: "Failed to load form configuration",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const saveForm = async () => {
    try {
      setSaving(true)
      
      if (!formConfig) return

      const updatedConfig: FormConfig = {
      ...formConfig,
      title: formTitle,
      description: formDescription,
      sections: sections,
        isActive: isFormActive,
      updatedAt: new Date().toISOString(),
    }

    saveFormConfig(updatedConfig)
      setFormConfig(updatedConfig)

      toast({
        title: "Success",
        description: "Form configuration saved successfully!",
      })
    } catch (error) {
      console.error("Error saving form:", error)
      toast({
        title: "Error",
        description: "Failed to save form configuration",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  // Section management
  const handleCreateSection = () => {
    const nextOrder = Math.max(...sections.map(s => s.order), 0) + 1
    setNewSection({
      title: "",
      description: "",
      order: nextOrder,
    })
    setEditingSection(null)
    setShowSectionDialog(true)
  }

  const handleEditSection = (section: FormSection) => {
    setNewSection({
      title: section.title,
      description: section.description,
      order: section.order,
    })
    setEditingSection(section)
    setShowSectionDialog(true)
  }

  const handleSaveSection = () => {
    if (!newSection.title.trim()) {
      toast({
        title: "Validation Error",
        description: "Section title is required",
        variant: "destructive",
      })
      return
    }

    if (editingSection) {
      // Update existing section
      setSections(prev => prev.map(section => 
        section.id === editingSection.id
          ? {
              ...section,
              title: newSection.title,
              description: newSection.description,
              order: newSection.order,
            }
          : section
      ))
    } else {
      // Create new section
      const newSectionData: FormSection = {
        id: `section-${Date.now()}`,
        title: newSection.title,
        description: newSection.description,
        order: newSection.order,
        questions: [],
      }
      setSections(prev => [...prev, newSectionData])
    }

    setShowSectionDialog(false)
    setNewSection({ title: "", description: "", order: 1 })
    setEditingSection(null)

    toast({
      title: "Success",
      description: editingSection ? "Section updated successfully!" : "Section created successfully!",
    })
  }

  const handleDeleteSection = (sectionId: string) => {
    setSections(prev => prev.filter(section => section.id !== sectionId))
    toast({
      title: "Success",
      description: "Section deleted successfully!",
    })
  }

  const handleDuplicateSection = (section: FormSection) => {
    const duplicatedSection: FormSection = {
      ...section,
      id: `section-${Date.now()}`,
      title: `${section.title} (Copy)`,
      order: Math.max(...sections.map(s => s.order), 0) + 1,
      questions: section.questions.map(q => ({
        ...q,
        id: `q${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      })),
    }
    setSections(prev => [...prev, duplicatedSection])
    toast({
      title: "Success",
      description: "Section duplicated successfully!",
    })
  }

  // Question management
  const handleCreateQuestion = (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId)
    if (!section) return

    const nextOrder = Math.max(...section.questions.map(q => q.order), 0) + 1
    setNewQuestion({
      type: "text",
      label: "",
      placeholder: "",
      required: false,
      order: nextOrder,
      options: [],
      sectionId,
    })
    setTargetSectionId(sectionId)
    setEditingQuestion(null)
    setShowQuestionDialog(true)
  }

  const handleEditQuestion = (section: FormSection, question: FormQuestion) => {
    setNewQuestion({
      type: question.type,
      label: question.label,
      placeholder: question.placeholder,
      required: question.required,
      order: question.order,
      options: question.options || [],
      sectionId: section.id,
    })
    setTargetSectionId(section.id)
    setEditingQuestion({ section, question })
    setShowQuestionDialog(true)
  }

  const handleSaveQuestion = () => {
    if (!newQuestion.label.trim()) {
      toast({
        title: "Validation Error",
        description: "Question label is required",
        variant: "destructive",
      })
      return
    }

    if (editingQuestion) {
      // Update existing question
      setSections(prev => prev.map(section => 
        section.id === editingQuestion.section.id
          ? {
              ...section,
              questions: section.questions.map(question =>
                question.id === editingQuestion.question.id
                  ? {
                      ...question,
                      type: newQuestion.type,
                      label: newQuestion.label,
                      placeholder: newQuestion.placeholder,
                      required: newQuestion.required,
                      order: newQuestion.order,
                      options: needsOptions(newQuestion.type) ? newQuestion.options : undefined,
                    }
                  : question
              ),
            }
          : section
      ))
    } else {
      // Create new question
      const newQuestionData: FormQuestion = {
        id: `q${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: newQuestion.type,
        label: newQuestion.label,
        placeholder: newQuestion.placeholder,
        required: newQuestion.required,
        order: newQuestion.order,
        options: needsOptions(newQuestion.type) ? newQuestion.options : undefined,
      }

      setSections(prev => prev.map(section => 
        section.id === targetSectionId
          ? {
              ...section,
              questions: [...section.questions, newQuestionData].sort((a, b) => a.order - b.order),
            }
          : section
      ))
    }

    setShowQuestionDialog(false)
    setNewQuestion({
      type: "text",
      label: "",
      placeholder: "",
      required: false,
      order: 1,
      options: [],
      sectionId: "",
    })
    setEditingQuestion(null)
    setOptionInput("")

    toast({
      title: "Success",
      description: editingQuestion ? "Question updated successfully!" : "Question created successfully!",
    })
  }

  const handleDeleteQuestion = (sectionId: string, questionId: string) => {
    setSections(prev => prev.map(section => 
      section.id === sectionId
        ? {
            ...section,
            questions: section.questions.filter(q => q.id !== questionId),
          }
        : section
    ))
    toast({
      title: "Success",
      description: "Question deleted successfully!",
    })
  }

  const handleDuplicateQuestion = (sectionId: string, question: FormQuestion) => {
    const duplicatedQuestion: FormQuestion = {
      ...question,
      id: `q${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      label: `${question.label} (Copy)`,
      order: question.order + 0.1,
    }

    setSections(prev => prev.map(section => 
      section.id === sectionId
        ? {
            ...section,
            questions: [...section.questions, duplicatedQuestion].sort((a, b) => a.order - b.order),
          }
        : section
    ))
    toast({
      title: "Success",
      description: "Question duplicated successfully!",
    })
  }

  // Utility functions
  const needsOptions = (type: string) => {
    return ["select", "radio", "checkbox"].includes(type)
  }

  const addOption = () => {
    if (optionInput.trim()) {
      setNewQuestion(prev => ({
        ...prev,
        options: [...prev.options, optionInput.trim()],
      }))
      setOptionInput("")
    }
  }

  const removeOption = (index: number) => {
    setNewQuestion(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }))
  }

  const toggleSectionExpansion = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId)
      } else {
        newSet.add(sectionId)
      }
      return newSet
    })
  }

  const getQuestionTypeIcon = (type: string) => {
    const questionType = QUESTION_TYPES.find(qt => qt.value === type)
    return questionType ? questionType.icon : HelpCircle
  }

  const getQuestionTypeLabel = (type: string) => {
    const questionType = QUESTION_TYPES.find(qt => qt.value === type)
    return questionType ? questionType.label : type
  }

  const moveSection = (sectionId: string, direction: "up" | "down") => {
    setSections(prev => {
      const currentIndex = prev.findIndex(s => s.id === sectionId)
      if (currentIndex === -1) return prev

      const newSections = [...prev]
      if (direction === "up" && currentIndex > 0) {
        [newSections[currentIndex], newSections[currentIndex - 1]] = 
        [newSections[currentIndex - 1], newSections[currentIndex]]
      } else if (direction === "down" && currentIndex < prev.length - 1) {
        [newSections[currentIndex], newSections[currentIndex + 1]] = 
        [newSections[currentIndex + 1], newSections[currentIndex]]
      }

      // Update order numbers
      return newSections.map((section, index) => ({
        ...section,
        order: index + 1,
      }))
    })
  }

  const moveQuestion = (sectionId: string, questionId: string, direction: "up" | "down") => {
    setSections(prev => prev.map(section => {
      if (section.id !== sectionId) return section

      const currentIndex = section.questions.findIndex(q => q.id === questionId)
      if (currentIndex === -1) return section

      const newQuestions = [...section.questions]
      if (direction === "up" && currentIndex > 0) {
        [newQuestions[currentIndex], newQuestions[currentIndex - 1]] = 
        [newQuestions[currentIndex - 1], newQuestions[currentIndex]]
      } else if (direction === "down" && currentIndex < section.questions.length - 1) {
        [newQuestions[currentIndex], newQuestions[currentIndex + 1]] = 
        [newQuestions[currentIndex + 1], newQuestions[currentIndex]]
      }

      // Update order numbers
      return {
        ...section,
        questions: newQuestions.map((question, index) => ({
          ...question,
          order: index + 1,
        })),
      }
    }))
  }

  // Export functions
  const exportAsJSON = () => {
    if (!formConfig) return

    const exportData = {
      ...formConfig,
      exportedAt: new Date().toISOString(),
      exportedBy: user?.email || 'Unknown User',
    }

    const dataStr = JSON.stringify(exportData, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `${formConfig.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_form_config.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()

    toast({
      title: "Export Successful",
      description: "Form configuration exported as JSON",
    })
  }

  const exportAsCSV = () => {
    if (!formConfig) return

    // Prepare CSV data
    const csvRows: string[] = []
    
    // Header row
    csvRows.push('Section,Section Description,Question ID,Question Label,Question Type,Required,Options,Order')
    
    // Data rows
    formConfig.sections.forEach(section => {
      section.questions.forEach(question => {
        const options = question.options ? question.options.join(';') : ''
        const row = [
          `"${section.title}"`,
          `"${section.description}"`,
          question.id,
          `"${question.label}"`,
          question.type,
          question.required ? 'Yes' : 'No',
          `"${options}"`,
          question.order.toString()
        ].join(',')
        csvRows.push(row)
      })
    })

    const csvString = csvRows.join('\n')
    const dataUri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvString)
    
    const exportFileDefaultName = `${formConfig.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_form_structure.csv`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()

    toast({
      title: "Export Successful",
      description: "Form structure exported as CSV",
    })
  }

  const exportAsPDF = () => {
    if (!formConfig) return

    // Create a printable HTML version
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      toast({
        title: "Export Failed",
        description: "Please allow popups to export as PDF",
        variant: "destructive",
      })
      return
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${formConfig.title} - Form Configuration</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
          .header { border-bottom: 2px solid #1e3a8a; padding-bottom: 20px; margin-bottom: 30px; }
          .section { margin-bottom: 30px; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; }
          .section-title { color: #1e3a8a; font-size: 18px; font-weight: bold; margin-bottom: 10px; }
          .section-desc { color: #6b7280; margin-bottom: 20px; }
          .question { margin-bottom: 15px; padding: 10px; background-color: #f9fafb; border-radius: 4px; }
          .question-label { font-weight: bold; color: #374151; }
          .question-meta { font-size: 12px; color: #6b7280; margin-top: 5px; }
          .required { color: #dc2626; }
          .options { margin-top: 5px; font-size: 14px; }
          .export-info { margin-top: 30px; padding: 15px; background-color: #f3f4f6; border-radius: 8px; font-size: 12px; color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${formConfig.title}</h1>
          <p>${formConfig.description}</p>
          <p><strong>Status:</strong> ${formConfig.isActive ? 'Active' : 'Inactive'}</p>
          <p><strong>Total Sections:</strong> ${formConfig.sections.length}</p>
          <p><strong>Total Questions:</strong> ${formConfig.sections.reduce((total, section) => total + section.questions.length, 0)}</p>
        </div>
        
        ${formConfig.sections.map(section => `
          <div class="section">
            <div class="section-title">${section.title}</div>
            <div class="section-desc">${section.description}</div>
            ${section.questions.map(question => `
              <div class="question">
                <div class="question-label">
                  Q${question.order}: ${question.label}
                  ${question.required ? '<span class="required">*</span>' : ''}
                </div>
                <div class="question-meta">
                  Type: ${question.type.toUpperCase()} | ID: ${question.id}
                  ${question.placeholder ? ` | Placeholder: "${question.placeholder}"` : ''}
                </div>
                ${question.options ? `<div class="options">Options: ${question.options.join(', ')}</div>` : ''}
              </div>
            `).join('')}
          </div>
        `).join('')}
        
        <div class="export-info">
          <p><strong>Export Information:</strong></p>
          <p>Exported on: ${new Date().toLocaleString()}</p>
          <p>Exported by: ${user?.email || 'Unknown User'}</p>
          <p>Form ID: ${formConfig.id}</p>
        </div>
      </body>
      </html>
    `

    printWindow.document.write(htmlContent)
    printWindow.document.close()
    
    // Small delay to ensure content is loaded
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 500)

    toast({
      title: "Export Initiated",
      description: "Print dialog opened for PDF export",
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading form configuration...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-navy-900">
                Dynamic Form Builder
              </CardTitle>
              <CardDescription>
                Create and manage dynamic application forms with sections and questions
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Label htmlFor="form-active">Form Active</Label>
                <Switch
                  id="form-active"
                  checked={isFormActive}
                  onCheckedChange={setIsFormActive}
                />
                <Badge variant={isFormActive ? "default" : "secondary"}>
                  {isFormActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              <Button
                onClick={() => setPreviewMode(!previewMode)}
                variant="outline"
                className="gap-2"
              >
                {previewMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {previewMode ? "Edit Mode" : "Preview Mode"}
              </Button>
              
              {/* Export Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Download className="h-4 w-4" />
                    Export
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={exportAsJSON} className="gap-2">
                    <FileJson className="h-4 w-4 text-blue-500" />
                    Export as JSON
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={exportAsCSV} className="gap-2">
                    <FileSpreadsheet className="h-4 w-4 text-green-500" />
                    Export as CSV
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={exportAsPDF} className="gap-2">
                    <FileImage className="h-4 w-4 text-red-500" />
                    Export as PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Button onClick={saveForm} disabled={saving} className="bg-navy-900 hover:bg-navy-800">
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Form
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="form-title">Form Title</Label>
              <Input
                id="form-title"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Enter form title"
                disabled={previewMode}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="form-description">Form Description</Label>
              <Textarea
                id="form-description"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Enter form description"
                rows={3}
                disabled={previewMode}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Sections</p>
                <p className="text-2xl font-bold text-navy-900">{sections.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <HelpCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Questions</p>
                <p className="text-2xl font-bold text-navy-900">
                  {sections.reduce((total, section) => total + section.questions.length, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Required Questions</p>
                <p className="text-2xl font-bold text-navy-900">
                  {sections.reduce((total, section) => 
                    total + section.questions.filter(q => q.required).length, 0
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Form Status</p>
                <p className="text-lg font-bold text-navy-900">
                  {isFormActive ? "Active" : "Inactive"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Sections & Questions</CardTitle>
              <CardDescription>
                Manage form sections and their questions
              </CardDescription>
            </div>
            {!previewMode && (
              <Button onClick={handleCreateSection} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Section
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sections.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No sections yet</h3>
                <p className="text-gray-500 mb-4">
                  Create your first section to start building your form
                </p>
                {!previewMode && (
                  <Button onClick={handleCreateSection} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Create First Section
                  </Button>
                )}
              </div>
            ) : (
              sections.sort((a, b) => a.order - b.order).map((section, sectionIndex) => (
                <Collapsible
                  key={section.id}
                  open={expandedSections.has(section.id)}
                  onOpenChange={() => toggleSectionExpansion(section.id)}
                >
                  <Card className="border-2 hover:border-navy-200 transition-colors">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CollapsibleTrigger className="flex items-center gap-3 hover:text-navy-600 transition-colors">
                          {expandedSections.has(section.id) ? (
                            <ChevronDown className="h-5 w-5" />
                          ) : (
                            <ChevronRight className="h-5 w-5" />
                          )}
                          <div className="text-left">
                            <div className="flex items-center gap-3">
                              <Badge variant="outline" className="text-xs">
                                Section {section.order}
                              </Badge>
                              <h3 className="text-lg font-semibold">{section.title}</h3>
                              <Badge variant="secondary" className="text-xs">
                                {section.questions.length} questions
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{section.description}</p>
                          </div>
                        </CollapsibleTrigger>

                        {!previewMode && (
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => moveSection(section.id, "up")}
                                disabled={sectionIndex === 0}
                              >
                                <ChevronDown className="h-4 w-4 rotate-180" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => moveSection(section.id, "down")}
                                disabled={sectionIndex === sections.length - 1}
                              >
                                <ChevronDown className="h-4 w-4" />
                              </Button>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Settings className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEditSection(section)}>
                                  <Edit2 className="h-4 w-4 mr-2" />
                                  Edit Section
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDuplicateSection(section)}>
                                  <Copy className="h-4 w-4 mr-2" />
                                  Duplicate Section
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => handleDeleteSection(section.id)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete Section
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        )}
                      </div>
                    </CardHeader>

                    <CollapsibleContent>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        {section.questions.length === 0 ? (
                          <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                            <HelpCircle className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                            <p className="text-gray-500 mb-3">No questions in this section</p>
                            {!previewMode && (
                              <Button
                                onClick={() => handleCreateQuestion(section.id)}
                                variant="outline"
                                size="sm"
                                className="gap-2"
                              >
                                <Plus className="h-4 w-4" />
                                Add First Question
                              </Button>
                            )}
                          </div>
                        ) : (
                          <>
                            {section.questions
                              .sort((a, b) => a.order - b.order)
                              .map((question, questionIndex) => {
                                const QuestionIcon = getQuestionTypeIcon(question.type)
                                return (
                                  <div
                                    key={question.id}
                                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors"
                                  >
                                    <div className="flex items-center gap-3 flex-1">
                                      <div className="p-2 bg-white rounded-lg shadow-sm">
                                        <QuestionIcon className="h-4 w-4 text-navy-600" />
                                      </div>
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                          <span className="font-medium text-gray-900">
                                            Q{question.order}. {question.label}
                                          </span>
                                          {question.required && (
                                            <Badge variant="destructive" className="text-xs">
                                              Required
                                            </Badge>
                                          )}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                          <Badge variant="outline" className="text-xs">
                                            {getQuestionTypeLabel(question.type)}
                                          </Badge>
                                          {question.placeholder && (
                                            <span>• {question.placeholder}</span>
                                          )}
                                          {question.options && question.options.length > 0 && (
                                            <span>• {question.options.length} options</span>
                                          )}
                                        </div>
                                      </div>
                                    </div>

                                    {!previewMode && (
                                      <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-1">
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => moveQuestion(section.id, question.id, "up")}
                                            disabled={questionIndex === 0}
                                          >
                                            <ChevronDown className="h-4 w-4 rotate-180" />
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => moveQuestion(section.id, question.id, "down")}
                                            disabled={questionIndex === section.questions.length - 1}
                                          >
                                            <ChevronDown className="h-4 w-4" />
                                          </Button>
                                        </div>
                                        <DropdownMenu>
                                          <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm">
                                              <Settings className="h-4 w-4" />
                                            </Button>
                                          </DropdownMenuTrigger>
                                          <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleEditQuestion(section, question)}>
                                              <Edit2 className="h-4 w-4 mr-2" />
                                              Edit Question
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleDuplicateQuestion(section.id, question)}>
                                              <Copy className="h-4 w-4 mr-2" />
                                              Duplicate Question
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem 
                                              onClick={() => handleDeleteQuestion(section.id, question.id)}
                                              className="text-red-600"
                                            >
                                              <Trash2 className="h-4 w-4 mr-2" />
                                              Delete Question
                                            </DropdownMenuItem>
                                          </DropdownMenuContent>
                                        </DropdownMenu>
                                      </div>
                                    )}
                                  </div>
                                )
                              })}
                            {!previewMode && (
                              <div className="text-center pt-2">
                                <Button
                                  onClick={() => handleCreateQuestion(section.id)}
                                  variant="outline"
                                  size="sm"
                                  className="gap-2"
                                >
                                  <Plus className="h-4 w-4" />
                                  Add Question
                                </Button>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Section Dialog */}
      <Dialog open={showSectionDialog} onOpenChange={setShowSectionDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingSection ? "Edit Section" : "Create New Section"}
            </DialogTitle>
            <DialogDescription>
              {editingSection ? "Update section information" : "Add a new section to your form"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="section-title">Section Title *</Label>
              <Input
                id="section-title"
                value={newSection.title}
                onChange={(e) => setNewSection(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Personal Information"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="section-description">Section Description</Label>
              <Textarea
                id="section-description"
                value={newSection.description}
                onChange={(e) => setNewSection(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of this section"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="section-order">Display Order</Label>
              <Input
                id="section-order"
                type="number"
                min="1"
                value={newSection.order}
                onChange={(e) => setNewSection(prev => ({ ...prev, order: parseInt(e.target.value) || 1 }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSectionDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSection}>
              {editingSection ? "Update Section" : "Create Section"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Question Dialog */}
      <Dialog open={showQuestionDialog} onOpenChange={setShowQuestionDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingQuestion ? "Edit Question" : "Create New Question"}
            </DialogTitle>
            <DialogDescription>
              {editingQuestion ? "Update question details" : "Add a new question to the section"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="question-type">Question Type *</Label>
                <Select value={newQuestion.type} onValueChange={(value) => setNewQuestion(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select question type" />
                  </SelectTrigger>
                  <SelectContent>
                    {QUESTION_TYPES.map((type) => {
                      const Icon = type.icon
                      return (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            {type.label}
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="question-order">Display Order</Label>
                <Input
                  id="question-order"
                  type="number"
                  min="1"
                  value={newQuestion.order}
                  onChange={(e) => setNewQuestion(prev => ({ ...prev, order: parseInt(e.target.value) || 1 }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="question-label">Question Label *</Label>
              <Input
                id="question-label"
                value={newQuestion.label}
                onChange={(e) => setNewQuestion(prev => ({ ...prev, label: e.target.value }))}
                placeholder="e.g., What is your first name?"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="question-placeholder">Placeholder Text</Label>
              <Input
                id="question-placeholder"
                value={newQuestion.placeholder}
                onChange={(e) => setNewQuestion(prev => ({ ...prev, placeholder: e.target.value }))}
                placeholder="e.g., Enter your first name"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="question-required"
                checked={newQuestion.required}
                onCheckedChange={(checked) => setNewQuestion(prev => ({ ...prev, required: checked }))}
              />
              <Label htmlFor="question-required">Required Field</Label>
            </div>

            {needsOptions(newQuestion.type) && (
              <div className="space-y-3">
                <Label>Options</Label>
                <div className="space-y-2">
                  {newQuestion.options.map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...newQuestion.options]
                          newOptions[index] = e.target.value
                          setNewQuestion(prev => ({ ...prev, options: newOptions }))
                        }}
                        placeholder={`Option ${index + 1}`}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeOption(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex items-center gap-2">
                    <Input
                      value={optionInput}
                      onChange={(e) => setOptionInput(e.target.value)}
                      placeholder="Enter new option"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          addOption()
                        }
                      }}
                    />
                    <Button type="button" onClick={addOption} variant="outline" size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowQuestionDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveQuestion}>
              {editingQuestion ? "Update Question" : "Create Question"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function DynamicFormManagement() {
  return (
    <ClientOnly fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Loading form management...</p>
        </div>
      </div>
    }>
      <DynamicFormManagementContent />
    </ClientOnly>
  )
} 