"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Upload,
  Download,
  FileSpreadsheet,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
  Info,
  X,
} from "lucide-react"
import { toast } from "sonner"
import {
  parseCSV,
  generateCSV,
  downloadCSV,
  downloadExcel,
  readFileAsText,
  getFarmerImportTemplate,
  getCollectionImportTemplate,
  getInputUsageImportTemplate,
  FARMER_IMPORT_COLUMNS,
  COLLECTION_IMPORT_COLUMNS,
  INPUT_USAGE_IMPORT_COLUMNS,
  ParsedCSV,
  TemplateColumn,
} from "@/lib/utils/csv-utils"

type DataType = "farmers" | "collections" | "inputUsage"

interface BulkImportExportProps {
  dataType: DataType
  data?: Record<string, unknown>[]
  onImport?: (data: Record<string, string>[]) => Promise<{ success: number; errors: Array<{ row: number; message: string }> }>
  onExport?: () => Promise<Record<string, unknown>[]>
  exportFileName?: string
}

const DATA_TYPE_CONFIG: Record<DataType, {
  label: string
  labelPlural: string
  template: () => string
  columns: TemplateColumn[]
  icon: typeof FileSpreadsheet
}> = {
  farmers: {
    label: "Farmer",
    labelPlural: "Farmers",
    template: getFarmerImportTemplate,
    columns: FARMER_IMPORT_COLUMNS,
    icon: FileSpreadsheet,
  },
  collections: {
    label: "Collection",
    labelPlural: "Collections",
    template: getCollectionImportTemplate,
    columns: COLLECTION_IMPORT_COLUMNS,
    icon: FileSpreadsheet,
  },
  inputUsage: {
    label: "Input Usage",
    labelPlural: "Input Usage Records",
    template: getInputUsageImportTemplate,
    columns: INPUT_USAGE_IMPORT_COLUMNS,
    icon: FileSpreadsheet,
  },
}

export function BulkImportExport({
  dataType,
  data,
  onImport,
  onExport,
  exportFileName,
}: BulkImportExportProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"import" | "export">("import")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [parsedData, setParsedData] = useState<ParsedCSV | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [importProgress, setImportProgress] = useState(0)
  const [importResults, setImportResults] = useState<{
    success: number
    errors: Array<{ row: number; message: string }>
  } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const config = DATA_TYPE_CONFIG[dataType]

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setSelectedFile(file)
    setImportResults(null)

    try {
      const content = await readFileAsText(file)
      const parsed = parseCSV(content, {
        requiredColumns: config.columns.filter((c) => c.required).map((c) => c.label),
      })
      setParsedData(parsed)

      if (parsed.errors.length > 0) {
        toast.warning(`Found ${parsed.errors.length} validation warnings`)
      }
    } catch (error) {
      toast.error("Failed to parse file")
      setSelectedFile(null)
      setParsedData(null)
    }
  }

  const handleImport = async () => {
    if (!parsedData || !onImport) return

    setIsProcessing(true)
    setImportProgress(0)

    try {
      // Map parsed data to expected format
      const mappedData = parsedData.rows.map((row) => {
        const mapped: Record<string, string> = {}
        for (const col of config.columns) {
          mapped[col.name] = (row as Record<string, string>)[col.label] || ""
        }
        return mapped
      })

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setImportProgress((prev) => Math.min(prev + 10, 90))
      }, 200)

      const results = await onImport(mappedData)

      clearInterval(progressInterval)
      setImportProgress(100)
      setImportResults(results)

      if (results.success > 0) {
        toast.success(`Successfully imported ${results.success} ${config.labelPlural.toLowerCase()}`)
      }
      if (results.errors.length > 0) {
        toast.error(`${results.errors.length} rows failed to import`)
      }
    } catch (error) {
      toast.error("Import failed")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleExport = async (format: "csv" | "excel") => {
    setIsProcessing(true)

    try {
      let exportData: Record<string, unknown>[]

      if (onExport) {
        exportData = await onExport()
      } else if (data) {
        exportData = data
      } else {
        toast.error("No data to export")
        return
      }

      const filename = exportFileName || `${dataType}_export_${new Date().toISOString().slice(0, 10)}`

      if (format === "csv") {
        const csv = generateCSV(exportData, {
          columnLabels: Object.fromEntries(config.columns.map((c) => [c.name, c.label])),
        })
        downloadCSV(csv, filename)
      } else {
        downloadExcel(exportData, filename, config.labelPlural)
      }

      toast.success(`${config.labelPlural} exported successfully`)
      setIsOpen(false)
    } catch (error) {
      toast.error("Export failed")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownloadTemplate = () => {
    const template = config.template()
    downloadCSV(template, `${dataType}_import_template`)
    toast.success("Template downloaded")
  }

  const resetImport = () => {
    setSelectedFile(null)
    setParsedData(null)
    setImportResults(null)
    setImportProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <>
      <Button variant="outline" onClick={() => setIsOpen(true)} className="gap-2">
        <FileSpreadsheet className="h-4 w-4" />
        Import/Export
      </Button>

      <Dialog open={isOpen} onOpenChange={(open) => {
        setIsOpen(open)
        if (!open) resetImport()
      }}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <config.icon className="h-5 w-5 text-blue-500" />
              Bulk {config.labelPlural} Operations
            </DialogTitle>
            <DialogDescription>
              Import from CSV/Excel or export existing data
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "import" | "export")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="import" className="gap-2">
                <Upload className="h-4 w-4" />
                Import
              </TabsTrigger>
              <TabsTrigger value="export" className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </TabsTrigger>
            </TabsList>

            <TabsContent value="import" className="space-y-4">
              {/* Template Download */}
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-blue-700 mb-2">
                        Download the template to see the required format and column headers.
                      </p>
                      <Button variant="outline" size="sm" onClick={handleDownloadTemplate} className="gap-2">
                        <FileText className="h-4 w-4" />
                        Download Template
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* File Upload */}
              <div className="space-y-2">
                <Label>Select CSV File</Label>
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileSelect}
                  disabled={isProcessing}
                />
              </div>

              {/* Preview */}
              {parsedData && !importResults && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center justify-between">
                      Preview
                      <Badge variant="secondary">{parsedData.validRows} rows found</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {parsedData.errors.length > 0 && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <p className="text-sm font-medium text-amber-800 mb-1">Validation Warnings:</p>
                        <ul className="text-xs text-amber-700 space-y-1">
                          {parsedData.errors.slice(0, 3).map((err, i) => (
                            <li key={i}>Row {err.row}: {err.message}</li>
                          ))}
                          {parsedData.errors.length > 3 && (
                            <li>... and {parsedData.errors.length - 3} more</li>
                          )}
                        </ul>
                      </div>
                    )}

                    <div className="text-sm text-gray-600">
                      <p><strong>Columns detected:</strong> {parsedData.headers.join(", ")}</p>
                    </div>

                    {isProcessing && (
                      <div className="space-y-2">
                        <Progress value={importProgress} />
                        <p className="text-sm text-gray-500 text-center">Importing... {importProgress}%</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Import Results */}
              {importResults && (
                <Card className={importResults.errors.length > 0 ? "border-amber-300" : "border-green-300"}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      {importResults.errors.length === 0 ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                      )}
                      Import Complete
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex gap-4">
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span>{importResults.success} successful</span>
                      </div>
                      {importResults.errors.length > 0 && (
                        <div className="flex items-center gap-2 text-red-600">
                          <X className="h-4 w-4" />
                          <span>{importResults.errors.length} failed</span>
                        </div>
                      )}
                    </div>

                    {importResults.errors.length > 0 && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 max-h-32 overflow-y-auto">
                        <p className="text-sm font-medium text-red-800 mb-1">Errors:</p>
                        <ul className="text-xs text-red-700 space-y-1">
                          {importResults.errors.map((err, i) => (
                            <li key={i}>Row {err.row}: {err.message}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <Button variant="outline" size="sm" onClick={resetImport}>
                      Import More
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="export" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Export {config.labelPlural}</CardTitle>
                  <CardDescription>
                    Download all {config.labelPlural.toLowerCase()} data in your preferred format
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      variant="outline"
                      onClick={() => handleExport("csv")}
                      disabled={isProcessing}
                      className="h-20 flex-col gap-2"
                    >
                      <FileText className="h-6 w-6 text-green-600" />
                      <span>Export as CSV</span>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleExport("excel")}
                      disabled={isProcessing}
                      className="h-20 flex-col gap-2"
                    >
                      <FileSpreadsheet className="h-6 w-6 text-blue-600" />
                      <span>Export as Excel</span>
                    </Button>
                  </div>

                  {data && (
                    <p className="text-sm text-gray-500 text-center">
                      {data.length} records available for export
                    </p>
                  )}

                  {isProcessing && (
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Preparing export...
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            {activeTab === "import" && parsedData && !importResults && (
              <Button
                onClick={handleImport}
                disabled={isProcessing || !onImport}
                className="gap-2"
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                Import {parsedData.validRows} {config.labelPlural}
              </Button>
            )}
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
