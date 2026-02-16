"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { Badge } from "@/components/ui/badge"
import Swal from "sweetalert2"
import { Plus, Settings, Trash2, Info, Loader2, ChevronLeft, ChevronRight } from "lucide-react"

const PER_PAGE = 5

export function QualitySchemaBuilder() {
  const [commodities, setCommodities] = useState<any[]>([])
  const [isLoadingCommodities, setIsLoadingCommodities] = useState(true)
  const [selectedCommodity, setSelectedCommodity] = useState<string>("")
  const [qualityFields, setQualityFields] = useState<any[]>([])
  const [qualityRules, setQualityRules] = useState<any[]>([])
  const [fieldsPage, setFieldsPage] = useState(1)
  const [rulesPage, setRulesPage] = useState(1)
  const [isFieldDialogOpen, setIsFieldDialogOpen] = useState(false)
  const [isRuleDialogOpen, setIsRuleDialogOpen] = useState(false)
  const [isAddingField, setIsAddingField] = useState(false)
  const [isAddingRule, setIsAddingRule] = useState(false)
  const [fieldFormData, setFieldFormData] = useState({
    fieldName: "",
    fieldType: "NUMERIC",
    dataType: "DECIMAL",
    options: [] as string[],
    optionsText: "", // For easier input of dropdown options
    isMandatory: false,
    displayOrder: 0,
    description: "",
  })
  const [ruleFormData, setRuleFormData] = useState({
    qualityFieldId: "none",
    ruleName: "",
    ruleType: "PASS",
    thresholdValue: "",
    thresholdOperator: ">",
    impactOnPricing: false,
    pricingMultiplier: "",
    errorMessage: "",
  })

  useEffect(() => {
    fetchCommodities()
  }, [])

  useEffect(() => {
    if (selectedCommodity) {
      fetchCommodityDetails()
    }
  }, [selectedCommodity])

  // Reset pagination when data changes
  useEffect(() => {
    setFieldsPage(1)
  }, [selectedCommodity, qualityFields.length])
  useEffect(() => {
    setRulesPage(1)
  }, [selectedCommodity, qualityRules.length])

  const fetchCommodities = async () => {
    setIsLoadingCommodities(true)
    try {
      const token = localStorage.getItem("Gemurai_token")
      const response = await fetch("/api/v1/admin/commodity-studio/commodities", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setCommodities(data.data || [])
      }
    } catch (error) {
      console.error("Error fetching commodities:", error)
    } finally {
      setIsLoadingCommodities(false)
    }
  }

  const fetchCommodityDetails = async () => {
    try {
      const token = localStorage.getItem("Gemurai_token")
      const response = await fetch(
        `/api/v1/admin/commodity-studio/commodities/${selectedCommodity}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      if (response.ok) {
        const data = await response.json()
        setQualityFields(data.data?.qualityFields || [])
        setQualityRules(data.data?.qualityRules || [])
      }
    } catch (error) {
      console.error("Error fetching commodity details:", error)
    }
  }

  const handleAddField = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedCommodity || !fieldFormData.fieldName) {
      await Swal.fire({
        icon: "warning",
        title: "Validation",
        text: "Please select a commodity and enter field name.",
        timer: 2000,
        showConfirmButton: false,
      })
      return
    }

    setIsAddingField(true)
    try {
      const token = localStorage.getItem("Gemurai_token")
      const response = await fetch(
        `/api/v1/admin/commodity-studio/commodities/${selectedCommodity}/quality-fields`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...fieldFormData,
            displayOrder: fieldFormData.displayOrder || qualityFields.length,
          }),
        }
      )

      const result = await response.json()

      if (response.ok && result.success) {
        await Swal.fire({
          icon: "success",
          title: "Quality field added",
          text: "The quality field was added successfully.",
          timer: 2000,
          showConfirmButton: false,
        })
        setIsFieldDialogOpen(false)
        setFieldFormData({
          fieldName: "",
          fieldType: "NUMERIC",
          dataType: "DECIMAL",
          options: [],
          optionsText: "",
          isMandatory: false,
          displayOrder: 0,
          description: "",
        })
        fetchCommodityDetails()
      } else {
        await Swal.fire({
          icon: "error",
          title: "Failed to add field",
          text: result.error || "Could not add quality field.",
          timer: 2000,
          showConfirmButton: false,
        })
      }
    } catch (error) {
      console.error("Error adding quality field:", error)
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to add quality field. Please try again.",
        timer: 2000,
        showConfirmButton: false,
      })
    } finally {
      setIsAddingField(false)
    }
  }

  const handleAddRule = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedCommodity || !ruleFormData.ruleName) {
      await Swal.fire({
        icon: "warning",
        title: "Validation",
        text: "Please select a commodity and enter rule name.",
        timer: 2000,
        showConfirmButton: false,
      })
      return
    }

    setIsAddingRule(true)
    try {
      const token = localStorage.getItem("Gemurai_token")
      const response = await fetch(
        `/api/v1/admin/commodity-studio/commodities/${selectedCommodity}/quality-rules`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...ruleFormData,
            qualityFieldId: ruleFormData.qualityFieldId === "none" ? undefined : ruleFormData.qualityFieldId,
            thresholdValue: ruleFormData.thresholdValue
              ? parseFloat(ruleFormData.thresholdValue)
              : undefined,
            pricingMultiplier: ruleFormData.pricingMultiplier
              ? parseFloat(ruleFormData.pricingMultiplier)
              : undefined,
          }),
        }
      )

      const result = await response.json()

      if (response.ok && result.success) {
        await Swal.fire({
          icon: "success",
          title: "Quality rule added",
          text: "The quality rule was added successfully.",
          timer: 2000,
          showConfirmButton: false,
        })
        setIsRuleDialogOpen(false)
        setRuleFormData({
          qualityFieldId: "none",
          ruleName: "",
          ruleType: "PASS",
          thresholdValue: "",
          thresholdOperator: ">",
          impactOnPricing: false,
          pricingMultiplier: "",
          errorMessage: "",
        })
        fetchCommodityDetails()
      } else {
        await Swal.fire({
          icon: "error",
          title: "Failed to add rule",
          text: result.error || "Could not add quality rule.",
          timer: 2000,
          showConfirmButton: false,
        })
      }
    } catch (error) {
      console.error("Error adding quality rule:", error)
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to add quality rule. Please try again.",
        timer: 2000,
        showConfirmButton: false,
      })
    } finally {
      setIsAddingRule(false)
    }
  }

  const selectedCommodityData = commodities.find((c) => c.id === selectedCommodity)

  return (
    <div className="space-y-6 overflow-visible">
      <Card className="border-2 border-blue-200 shadow-sm min-h-[520px] overflow-visible">
        <CardHeader className="border-b border-blue-200">
          <div className="flex items-center gap-3">
            <Settings className="h-6 w-6 text-blue-600" />
            <div>
              <CardTitle className="text-2xl font-bold text-blue-900">Quality Schema Builder</CardTitle>
              <CardDescription className="text-gray-600 mt-1">
                Define dynamic quality fields (Fat %, Moisture %, Grade, etc.) and validation rules without code changes. Quality forms load automatically at collection center intake.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-2">
            <Label className="text-base font-semibold text-gray-700">Select Commodity</Label>
            {isLoadingCommodities ? (
              <div className="flex h-11 w-full items-center gap-2 rounded-lg border-2 border-blue-200 bg-slate-50 px-4 text-sm text-slate-600 dark:bg-slate-800/50 dark:text-slate-400">
                <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                <span>Loading commodities...</span>
              </div>
            ) : (
              <SearchableSelect
                value={selectedCommodity}
                onValueChange={setSelectedCommodity}
                options={commodities.map((c) => ({
                  label: `${c.name} (${c.code})`,
                  value: c.id,
                }))}
                placeholder="Select a commodity"
                searchPlaceholder="Search commodities..."
                emptyText="No commodity found."
                className="h-11 border-2 border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
            )}
          </div>

          {selectedCommodity && (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-lg border-2 border-blue-200">
                <div>
                  <h3 className="font-bold text-lg text-blue-900">
                    Quality Fields for {selectedCommodityData?.name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    These fields will appear dynamically in collection forms at collection center intake
                  </p>
                </div>
                <Button 
                  onClick={() => setIsFieldDialogOpen(true)}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Field
                </Button>
              </div>

              {qualityFields.length === 0 ? (
                <div className="text-center py-12 text-gray-500 border-2 border-dashed border-blue-200 rounded-lg">
                  <Settings className="h-12 w-12 mx-auto mb-3 text-blue-400" />
                  <p className="font-medium">No quality fields defined</p>
                  <p className="text-sm mt-1">Add your first quality field to get started</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    {(() => {
                      const sorted = [...qualityFields].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
                      const totalFields = sorted.length
                      const totalPagesFields = Math.max(1, Math.ceil(totalFields / PER_PAGE))
                      const from = (fieldsPage - 1) * PER_PAGE
                      const to = Math.min(from + PER_PAGE, totalFields)
                      const paginatedFields = sorted.slice(from, to)
                      return (
                        <>
                          {paginatedFields.map((field) => (
                            <Card key={field.id} className="border-2 border-blue-200 hover:border-blue-400 transition-all duration-200 shadow-sm hover:shadow-md">
                              <CardContent className="pt-5 pb-5">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 flex-wrap mb-2">
                                      <span className="font-bold text-lg text-blue-900">{field.fieldName}</span>
                                      <Badge variant="outline" className="border-blue-300 text-blue-700 font-semibold">{field.fieldType}</Badge>
                                      <Badge variant="outline" className="border-indigo-300 text-indigo-700 font-semibold">{field.dataType}</Badge>
                                      {field.isMandatory && (
                                        <Badge variant="outline" className="border-red-300 text-red-700 font-semibold">Required</Badge>
                                      )}
                                      {field.options && Array.isArray(field.options) && field.options.length > 0 && (
                                        <Badge variant="outline" className="border-purple-300 text-purple-700 font-semibold">
                                          {field.options.length} option(s)
                                        </Badge>
                                      )}
                                    </div>
                                    {field.description && (
                                      <p className="text-sm text-gray-700 mt-2 pl-1 border-l-2 border-blue-200 pl-3">{field.description}</p>
                                    )}
                                    {field.options && Array.isArray(field.options) && field.options.length > 0 && (
                                      <div className="mt-3 flex flex-wrap gap-2">
                                        {field.options.map((opt: string, idx: number) => (
                                          <Badge key={idx} variant="outline" className="border-blue-200 text-blue-700 text-xs font-medium">
                                            {opt}
                                          </Badge>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                          {totalPagesFields > 1 && (
                            <div className="flex items-center justify-between pt-4 pb-2 border-t border-blue-100">
                              <p className="text-sm text-gray-600">
                                Showing {from + 1}–{to} of {totalFields} fields
                              </p>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setFieldsPage((p) => Math.max(1, p - 1))}
                                  disabled={fieldsPage <= 1}
                                  className="border-blue-200"
                                >
                                  <ChevronLeft className="h-4 w-4" />
                                  Previous
                                </Button>
                                <span className="text-sm font-medium text-gray-700 px-2">
                                  Page {fieldsPage} of {totalPagesFields}
                                </span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setFieldsPage((p) => Math.min(totalPagesFields, p + 1))}
                                  disabled={fieldsPage >= totalPagesFields}
                                  className="border-blue-200"
                                >
                                  Next
                                  <ChevronRight className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </>
                      )
                    })()}
                  </div>
                </>
              )}

              <div className="flex items-center justify-between pt-6 border-t-2 border-blue-200">
                <div>
                  <h3 className="font-bold text-lg text-blue-900">Quality Rules</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Define validation rules with thresholds (pass/fail/conditional) and optional pricing impact
                  </p>
                </div>
                <Button 
                  onClick={() => setIsRuleDialogOpen(true)}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Rule
                </Button>
              </div>

              {/* List existing quality rules */}
              {qualityRules.length === 0 ? (
                <div className="mt-4 text-center py-8 text-gray-500 border-2 border-dashed border-blue-200 rounded-lg">
                  <Settings className="h-10 w-10 mx-auto mb-2 text-blue-400" />
                  <p className="font-medium">No quality rules defined</p>
                  <p className="text-sm mt-1">Add a rule to validate quality data at collection time</p>
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {(() => {
                    const activeRules = qualityRules.filter((r: any) => r.isActive !== false)
                    const totalRules = activeRules.length
                    const totalPagesRules = Math.max(1, Math.ceil(totalRules / PER_PAGE))
                    const fromR = (rulesPage - 1) * PER_PAGE
                    const toR = Math.min(fromR + PER_PAGE, totalRules)
                    const paginatedRules = activeRules.slice(fromR, toR)
                    return (
                      <>
                        {paginatedRules.map((rule: any) => (
                          <Card key={rule.id} className="border-2 border-indigo-200 hover:border-indigo-400 transition-all shadow-sm">
                            <CardContent className="pt-4 pb-4">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap mb-1">
                                    <span className="font-bold text-blue-900">{rule.ruleName}</span>
                                    <Badge variant="outline" className="border-indigo-300 text-indigo-700 font-semibold">{rule.ruleType}</Badge>
                                    {rule.impactOnPricing && (
                                      <Badge variant="outline" className="border-amber-300 text-amber-700 font-semibold">Affects pricing</Badge>
                                    )}
                                  </div>
                                  {rule.qualityField?.fieldName && (
                                    <p className="text-sm text-gray-600 mt-1">Field: {rule.qualityField.fieldName}</p>
                                  )}
                                  {(rule.thresholdValue != null || rule.thresholdOperator) && (
                                    <p className="text-sm text-gray-600 mt-0.5">
                                      Threshold: {rule.thresholdOperator ?? ""} {rule.thresholdValue != null ? rule.thresholdValue : ""}
                                    </p>
                                  )}
                                  {rule.impactOnPricing && rule.pricingMultiplier != null && (
                                    <p className="text-sm text-amber-700 mt-0.5">Pricing multiplier: {rule.pricingMultiplier}</p>
                                  )}
                                  {rule.errorMessage && (
                                    <p className="text-sm text-gray-500 mt-1 italic">&quot;{rule.errorMessage}&quot;</p>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                        {totalPagesRules > 1 && (
                          <div className="flex items-center justify-between pt-4 pb-2 border-t border-indigo-100">
                            <p className="text-sm text-gray-600">
                              Showing {fromR + 1}–{toR} of {totalRules} rules
                            </p>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setRulesPage((p) => Math.max(1, p - 1))}
                                disabled={rulesPage <= 1}
                                className="border-indigo-200"
                              >
                                <ChevronLeft className="h-4 w-4" />
                                Previous
                              </Button>
                              <span className="text-sm font-medium text-gray-700 px-2">
                                Page {rulesPage} of {totalPagesRules}
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setRulesPage((p) => Math.min(totalPagesRules, p + 1))}
                                disabled={rulesPage >= totalPagesRules}
                                className="border-indigo-200"
                              >
                                Next
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </>
                    )
                  })()}
                </div>
              )}

              {/* How Quality Rules Work */}
              {selectedCommodity && (
                <Card className="mt-6 border-2 border-blue-200 shadow-sm">
                  <CardContent className="pt-5 pb-5">
                    <div className="flex items-start gap-4">
                      <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-bold text-blue-900 mb-2">How Quality Rules Work:</p>
                        <ul className="text-sm text-gray-700 space-y-2 list-none">
                          <li className="flex items-start gap-2">
                            <span className="text-blue-600 font-bold mt-0.5">•</span>
                            <span>Rules validate quality data at collection time</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-blue-600 font-bold mt-0.5">•</span>
                            <span>Threshold rules can pass, fail, or conditionally accept based on values</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-blue-600 font-bold mt-0.5">•</span>
                            <span>Pricing multipliers can increase/decrease price based on quality</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-blue-600 font-bold mt-0.5">•</span>
                            <span>Quality forms load dynamically based on fields defined here</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Quality Field Dialog */}
      <Dialog open={isFieldDialogOpen} onOpenChange={setIsFieldDialogOpen}>
        <DialogContent className="max-w-2xl border-2 border-blue-200 bg-white opacity-100">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
          <DialogHeader className="pb-4 border-b border-blue-100">
            <DialogTitle className="text-2xl font-bold text-blue-900">Add Quality Field</DialogTitle>
            <DialogDescription className="text-blue-700 mt-2">
              Define a quality field for <span className="font-semibold">{selectedCommodityData?.name}</span>
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddField} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fieldName" className="text-base font-semibold text-gray-700">
                Field Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="fieldName"
                value={fieldFormData.fieldName}
                onChange={(e) =>
                  setFieldFormData({ ...fieldFormData, fieldName: e.target.value })
                }
                placeholder="e.g. Fat %, Moisture %, Grade"
                className="border-2 border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fieldType" className="text-base font-semibold text-gray-700">Field Type</Label>
                <SearchableSelect
                  value={fieldFormData.fieldType}
                  onValueChange={(value) => {
                    setFieldFormData({
                      ...fieldFormData,
                      fieldType: value as any,
                      options: value !== "DROPDOWN" ? [] : fieldFormData.options,
                      optionsText: value !== "DROPDOWN" ? "" : fieldFormData.optionsText,
                    })
                  }}
                  options={[
                    { label: "Numeric (e.g. Fat %, Moisture %)", value: "NUMERIC" },
                    { label: "Dropdown (e.g. Grade A, B, C)", value: "DROPDOWN" },
                    { label: "Boolean (Yes/No)", value: "BOOLEAN" },
                    { label: "Indicator (Visual indicator)", value: "INDICATOR" },
                    { label: "Text (Free text input)", value: "TEXT" },
                  ]}
                  placeholder="Select field type"
                  searchPlaceholder="Search field type..."
                  emptyText="No field type found."
                  className="border-2 border-blue-200 focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataType" className="text-base font-semibold text-gray-700">Data Type</Label>
                <SearchableSelect
                  value={fieldFormData.dataType}
                  onValueChange={(value) =>
                    setFieldFormData({ ...fieldFormData, dataType: value as any })
                  }
                  options={[
                    { label: "Percentage (e.g. 3.5%)", value: "PERCENTAGE" },
                    { label: "Decimal (e.g. 3.5)", value: "DECIMAL" },
                    { label: "Integer (e.g. 5)", value: "INTEGER" },
                    { label: "String (Text)", value: "STRING" },
                    { label: "Boolean (True/False)", value: "BOOLEAN" },
                  ]}
                  placeholder="Select data type"
                  searchPlaceholder="Search data type..."
                  emptyText="No data type found."
                  className="border-2 border-blue-200 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Dropdown options input - only show for DROPDOWN field type */}
            {fieldFormData.fieldType === "DROPDOWN" && (
              <div className="space-y-2">
                <Label htmlFor="optionsText" className="text-base font-semibold text-gray-700">
                  Dropdown Options <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="optionsText"
                  value={fieldFormData.optionsText}
                  onChange={(e) => {
                    const options = e.target.value.split(',').map(opt => opt.trim()).filter(opt => opt.length > 0)
                    setFieldFormData({ 
                      ...fieldFormData, 
                      optionsText: e.target.value,
                      options: options
                    })
                  }}
                  placeholder="Enter options separated by commas (e.g. Grade A, Grade B, Grade C)"
                  rows={3}
                  className="border-2 border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  required={fieldFormData.fieldType === "DROPDOWN"}
                />
                <p className="text-xs text-gray-500">
                  Separate multiple options with commas
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="description" className="text-base font-semibold text-gray-700">Description</Label>
              <Textarea
                id="description"
                value={fieldFormData.description}
                onChange={(e) =>
                  setFieldFormData({ ...fieldFormData, description: e.target.value })
                }
                placeholder="Field description"
                rows={3}
                className="border-2 border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-none"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isMandatory"
                checked={fieldFormData.isMandatory}
                onChange={(e) =>
                  setFieldFormData({ ...fieldFormData, isMandatory: e.target.checked })
                }
                className="rounded"
              />
              <Label htmlFor="isMandatory">Mandatory field</Label>
            </div>

            <DialogFooter className="gap-2 pt-4 border-t border-blue-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsFieldDialogOpen(false)}
                className="border-blue-200 hover:bg-blue-50"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isAddingField}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white disabled:opacity-70"
              >
                {isAddingField ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add Field"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Quality Rule Dialog */}
      <Dialog open={isRuleDialogOpen} onOpenChange={setIsRuleDialogOpen}>
        <DialogContent className="max-w-2xl border-2 border-blue-200 bg-white opacity-100">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
          <DialogHeader className="pb-4 border-b border-blue-100">
            <DialogTitle className="text-2xl font-bold text-blue-900">Add Quality Rule</DialogTitle>
            <DialogDescription className="text-blue-700 mt-2">
              Define validation rules for <span className="font-semibold">{selectedCommodityData?.name}</span>
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddRule} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ruleName" className="text-base font-semibold text-gray-700">
                Rule Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="ruleName"
                value={ruleFormData.ruleName}
                onChange={(e) =>
                  setRuleFormData({ ...ruleFormData, ruleName: e.target.value })
                }
                placeholder="e.g. Moisture must be below 14%"
                className="border-2 border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="qualityFieldId" className="text-base font-semibold text-gray-700">Quality Field (Optional)</Label>
              <SearchableSelect
                value={ruleFormData.qualityFieldId}
                onValueChange={(value) =>
                  setRuleFormData({ ...ruleFormData, qualityFieldId: value })
                }
                options={[
                  { label: "General Rule", value: "none" },
                  ...qualityFields.map((field) => ({
                    label: field.fieldName,
                    value: field.id,
                  })),
                ]}
                placeholder="Select field (optional)"
                searchPlaceholder="Search quality field..."
                emptyText="No quality field found."
                className="border-2 border-blue-200 focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ruleType" className="text-base font-semibold text-gray-700">Rule Type</Label>
                <SearchableSelect
                  value={ruleFormData.ruleType}
                  onValueChange={(value) =>
                    setRuleFormData({ ...ruleFormData, ruleType: value as any })
                  }
                  options={[
                    { label: "Pass", value: "PASS" },
                    { label: "Fail", value: "FAIL" },
                    { label: "Conditional", value: "CONDITIONAL" },
                    { label: "Warning", value: "WARNING" },
                  ]}
                  placeholder="Select rule type"
                  searchPlaceholder="Search rule type..."
                  emptyText="No rule type found."
                  className="border-2 border-blue-200 focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="thresholdOperator" className="text-base font-semibold text-gray-700">Operator</Label>
                <SearchableSelect
                  value={ruleFormData.thresholdOperator}
                  onValueChange={(value) =>
                    setRuleFormData({ ...ruleFormData, thresholdOperator: value })
                  }
                  options={[
                    { label: "Greater than (>)", value: ">" },
                    { label: "Less than (<)", value: "<" },
                    { label: "Greater or equal (>=)", value: ">=" },
                    { label: "Less or equal (<=)", value: "<=" },
                    { label: "Equal (==)", value: "==" },
                    { label: "Not equal (!=)", value: "!=" },
                  ]}
                  placeholder="Select operator"
                  searchPlaceholder="Search operator..."
                  emptyText="No operator found."
                  className="border-2 border-blue-200 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="thresholdValue" className="text-base font-semibold text-gray-700">Threshold Value</Label>
              <Input
                id="thresholdValue"
                type="number"
                step="0.01"
                value={ruleFormData.thresholdValue}
                onChange={(e) =>
                  setRuleFormData({ ...ruleFormData, thresholdValue: e.target.value })
                }
                placeholder="e.g. 14"
                style={{ border: '2px solid lightblue' }}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="impactOnPricing"
                checked={ruleFormData.impactOnPricing}
                onChange={(e) =>
                  setRuleFormData({ ...ruleFormData, impactOnPricing: e.target.checked })
                }
                className="rounded"
              />
              <Label htmlFor="impactOnPricing">Impact on pricing</Label>
            </div>

            {ruleFormData.impactOnPricing && (
              <div className="space-y-2">
                <Label htmlFor="pricingMultiplier" className="text-base font-semibold text-gray-700">Pricing Multiplier</Label>
                <Input
                  id="pricingMultiplier"
                  type="number"
                  step="0.01"
                  value={ruleFormData.pricingMultiplier}
                  onChange={(e) =>
                    setRuleFormData({ ...ruleFormData, pricingMultiplier: e.target.value })
                  }
                  placeholder="e.g. 1.1 for 10% increase"
                  className="border-2 border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="errorMessage" className="text-base font-semibold text-gray-700">Error Message</Label>
              <Input
                id="errorMessage"
                value={ruleFormData.errorMessage}
                onChange={(e) =>
                  setRuleFormData({ ...ruleFormData, errorMessage: e.target.value })
                }
                placeholder="Error message to display"
                className="border-2 border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <DialogFooter className="gap-2 pt-4 border-t border-blue-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsRuleDialogOpen(false)}
                className="border-blue-200 hover:bg-blue-50"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isAddingRule}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white disabled:opacity-70"
              >
                {isAddingRule ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add Rule"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
