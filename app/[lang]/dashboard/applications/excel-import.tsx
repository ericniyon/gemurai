"use client"

import { useState, useRef } from "react"
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Loader2, Download, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface ImportResult {
  imported: Array<{
    id: string
    name: string
    email: string
    phone: string
  }>
  errors: Array<{
    row: number
    error: string
  }>
  total: number
  successful: number
  failed: number
}

export function ExcelImport({ onImportComplete }: { onImportComplete?: () => void }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        toast({
          title: "Invalid File Type",
          description: "Please select an Excel file (.xlsx or .xls)",
          variant: "destructive",
        })
        return
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please select a file smaller than 10MB",
          variant: "destructive",
        })
        return
      }

      setSelectedFile(file)
    }
  }

  const handleImport = async () => {
    if (!selectedFile) {
      toast({
        title: "No File Selected",
        description: "Please select an Excel file to import",
        variant: "destructive",
      })
      return
    }

    setIsImporting(true)
    setImportResult(null)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      const response = await fetch('/api/applications/import-excel', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (result.success) {
        setImportResult(result.data)
        toast({
          title: "Import Successful",
          description: `Successfully imported ${result.data.successful} applications`,
        })
        
        // Call the callback to refresh the applications list
        if (onImportComplete) {
          onImportComplete()
        }
      } else {
        toast({
          title: "Import Failed",
          description: result.message || "Failed to import applications",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Import error:", error)
      toast({
        title: "Import Error",
        description: "An error occurred while importing the file",
        variant: "destructive",
      })
    } finally {
      setIsImporting(false)
    }
  }

  const handleReset = () => {
    setSelectedFile(null)
    setImportResult(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const downloadTemplate = () => {
    // Create a simple template with required fields
    const templateData = [
      ['First Name', 'Last Name', 'Email', 'Phone', 'National ID', 'Province', 'District', 'Education', 'Work Experience'],
      ['John', 'Doe', 'john.doe@example.com', '+250700000000', '1234567890123456', 'Kigali', 'Gasabo', 'Bachelor Degree', '5 years'],
      ['Jane', 'Smith', 'jane.smith@example.com', '+250700000001', '1234567890123457', 'Kigali', 'Kicukiro', 'High School', '2 years'],
    ]

    // Convert to CSV format
    const csvContent = templateData.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'application_template.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 font-semibold px-6 py-3 rounded-xl">
          <Upload className="h-4 w-4 mr-2" />
          Import Excel
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Import Applications from Excel
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Instructions */}
          <Card className="card blue bordered rounded-xl bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-blue-900">Required Fields:</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <Badge variant="outline" className="bg-blue-100 text-blue-800">First Name</Badge>
                  <Badge variant="outline" className="bg-blue-100 text-blue-800">Last Name</Badge>
                  <Badge variant="outline" className="bg-blue-100 text-blue-800">Email</Badge>
                  <Badge variant="outline" className="bg-blue-100 text-blue-800">Phone</Badge>
                </div>
                <p className="text-sm text-blue-700">
                  Additional columns will be stored as form data. Maximum file size: 10MB
                </p>
              </div>
            </CardContent>
          </Card>

          {/* File Upload */}
          <Card className="card elevated rounded-xl">
            <CardHeader>
              <CardTitle className="text-lg font-serif">Upload Excel File</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                {!selectedFile ? (
                  <div className="space-y-3">
                    <Upload className="h-12 w-12 mx-auto text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">
                        Click to select or drag and drop an Excel file
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Supports .xlsx and .xls files
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Select File
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <FileSpreadsheet className="h-8 w-8 mx-auto text-green-600" />
                    <div>
                      <p className="font-medium text-green-900">{selectedFile.name}</p>
                      <p className="text-sm text-gray-600">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <div className="flex gap-2 justify-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Change File
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleReset}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleImport}
                  disabled={!selectedFile || isImporting}
                  className="flex-1"
                >
                  {isImporting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Import Applications
                    </>
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={downloadTemplate}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Template
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Import Results */}
          {importResult && (
            <Card className="card elevated rounded-xl">
              <CardHeader>
                <CardTitle className="text-lg font-serif">Import Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {importResult.successful}
                    </div>
                    <div className="text-sm text-green-700">Successful</div>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {importResult.failed}
                    </div>
                    <div className="text-sm text-red-700">Failed</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {importResult.total}
                    </div>
                    <div className="text-sm text-blue-700">Total</div>
                  </div>
                </div>

                {/* Successful Imports */}
                {importResult.imported.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Successfully Imported ({importResult.imported.length})
                    </h4>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {importResult.imported.map((app, index) => (
                        <div key={app.id} className="text-sm p-2 bg-green-50 rounded">
                          {app.name} - {app.email}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Errors */}
                {importResult.errors.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      Errors ({importResult.errors.length})
                    </h4>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {importResult.errors.map((error, index) => (
                        <div key={index} className="text-sm p-2 bg-red-50 rounded">
                          Row {error.row}: {error.error}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
} 