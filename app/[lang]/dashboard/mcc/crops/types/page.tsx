"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/use-auth"
import { useParams } from "next/navigation"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import {
  Database,
  Plus,
  RefreshCw,
  Loader2,
  Edit,
  Trash2,
  Wheat,
  Tag,
  DollarSign,
  Ruler,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const defaultFormData = {
  name: "",
  code: "",
  unitOfMeasure: "kg",
  defaultPricePerUnit: 0,
  qualityStandards: {
    maxMoisture: 14,
    acceptableGrades: ["A", "B"],
    maxForeignMatter: 2,
  },
}

export default function CropTypesPage() {
  const { user } = useAuth()
  const params = useParams()
  const lang = (params?.lang as string) || "en"

  const [cropTypes, setCropTypes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingType, setEditingType] = useState<any>(null)
  const [formData, setFormData] = useState(defaultFormData)

  const fetchCropTypes = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem("Gemurai_token")
      const response = await fetch("/api/v1/mcc/crops/types", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setCropTypes(data.data || [])
      } else {
        const err = await response.json()
        toast.error(err.error || "Failed to load crop types")
      }
    } catch (error) {
      console.error("Error fetching crop types:", error)
      toast.error("Failed to load crop types")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (user) fetchCropTypes()
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const token = localStorage.getItem("Gemurai_token")
      const url = editingType
        ? `/api/v1/mcc/crops/types/${editingType.id}`
        : "/api/v1/mcc/crops/types"

      const response = await fetch(url, {
        method: editingType ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()
      if (response.ok) {
        toast.success(editingType ? "Crop type updated" : "Crop type created")
        setIsFormOpen(false)
        setEditingType(null)
        setFormData(defaultFormData)
        fetchCropTypes()
      } else {
        throw new Error(data.error || "Failed to save crop type")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save crop type")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (type: any) => {
    setEditingType(type)
    const qs = type.qualityStandards || {}
    setFormData({
      name: type.name,
      code: type.code,
      unitOfMeasure: type.unitOfMeasure || "kg",
      defaultPricePerUnit: type.defaultPricePerUnit ?? 0,
      qualityStandards: {
        maxMoisture: qs.maxMoisture ?? 14,
        acceptableGrades: Array.isArray(qs.acceptableGrades) ? qs.acceptableGrades : ["A", "B"],
        maxForeignMatter: qs.maxForeignMatter ?? 2,
      },
    })
    setIsFormOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this crop type?")) return
    try {
      const token = localStorage.getItem("Gemurai_token")
      const response = await fetch(`/api/v1/mcc/crops/types/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        toast.success("Crop type deleted")
        fetchCropTypes()
      } else {
        const data = await response.json()
        throw new Error(data.error || "Failed to delete crop type")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete crop type")
    }
  }

  const openAddDialog = () => {
    setEditingType(null)
    setFormData(defaultFormData)
    setIsFormOpen(true)
  }

  const activeCount = cropTypes.filter((t) => t.isActive !== false).length
  const inputClasses =
    "rounded-xl border border-emerald-200/80 bg-white text-sm shadow-sm transition focus:border-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:ring-offset-0"

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/40">
      <div className="relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-180px] right-[-120px] h-[420px] w-[420px] rounded-full bg-gradient-to-br from-emerald-500/20 via-green-400/10 to-teal-400/10 blur-3xl" />
          <div className="absolute bottom-[-160px] left-[-160px] h-[380px] w-[380px] rounded-full bg-gradient-to-tr from-amber-400/15 via-emerald-400/10 to-blue-400/5 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto w-full px-0 py-10">
          <nav className="mb-6 flex items-center gap-2 text-sm px-4 sm:px-6">
            <Link
              href={`/${lang}/dashboard`}
              className="text-slate-500 hover:text-slate-900 transition-colors"
            >
              Dashboard
            </Link>
            <span className="text-slate-400">/</span>
            <Link
              href={`/${lang}/dashboard/mcc`}
              className="text-slate-500 hover:text-slate-900 transition-colors"
            >
              MCC
            </Link>
            <span className="text-slate-400">/</span>
            <Link
              href={`/${lang}/dashboard/mcc/crops`}
              className="text-slate-500 hover:text-slate-900 transition-colors"
            >
              Crops
            </Link>
            <span className="text-slate-400">/</span>
            <span className="font-medium text-[#059669]">Types</span>
          </nav>

          <header className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between px-4 sm:px-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-3 rounded-full bg-white/80 px-4 py-1.5 shadow-sm ring-1 ring-gray-200">
                <Database className="h-4 w-4 text-emerald-600" />
                <span className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                  MCC Manager • Crops
                </span>
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                  Crop Types
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-gray-600 sm:text-base">
                  Manage crop type definitions, units, default prices and quality standards
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  onClick={fetchCropTypes}
                  disabled={isLoading}
                  className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-white/70 px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition-all duration-300 hover:border-emerald-300 hover:bg-white hover:shadow-md disabled:cursor-not-allowed"
                >
                  <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                  Refresh
                </Button>
                <Button
                  onClick={openAddDialog}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all duration-300 hover:from-emerald-700 hover:to-teal-700 hover:shadow-xl hover:shadow-emerald-500/30"
                >
                  <Plus className="h-4 w-4" />
                  Add Crop Type
                </Button>
              </div>
            </div>
          </header>

          {/* Summary Cards */}
          <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4 px-4 sm:px-6 mb-8">
            <Card className="relative overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
              <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-b from-emerald-100/50 via-teal-100/30 to-transparent" />
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
                      Total Types
                    </CardTitle>
                    <p className="mt-1 text-3xl font-bold text-gray-900">{cropTypes.length}</p>
                  </div>
                  <div className="rounded-2xl bg-emerald-50 p-3">
                    <Database className="h-6 w-6 text-emerald-500" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Crop type definitions</p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
              <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-b from-blue-100/50 via-indigo-100/30 to-transparent" />
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-semibold uppercase tracking-wide text-blue-600">
                      Active
                    </CardTitle>
                    <p className="mt-1 text-3xl font-bold text-gray-900">{activeCount}</p>
                  </div>
                  <div className="rounded-2xl bg-blue-50 p-3">
                    <Wheat className="h-6 w-6 text-blue-500" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Available for collections</p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden rounded-3xl border border-amber-100 bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
              <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-b from-amber-100/50 via-orange-100/30 to-transparent" />
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-semibold uppercase tracking-wide text-amber-600">
                      Inactive
                    </CardTitle>
                    <p className="mt-1 text-3xl font-bold text-gray-900">
                      {cropTypes.length - activeCount}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-amber-50 p-3">
                    <Tag className="h-6 w-6 text-amber-500" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Disabled types</p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
              <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-b from-slate-100/50 to-transparent" />
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-semibold uppercase tracking-wide text-slate-600">
                      Units
                    </CardTitle>
                    <p className="mt-1 text-lg font-bold text-gray-900">
                      {[...new Set(cropTypes.map((t) => t.unitOfMeasure || "kg"))].join(", ") || "—"}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-3">
                    <Ruler className="h-6 w-6 text-slate-500" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Unit of measure</p>
              </CardContent>
            </Card>
          </section>

          {/* Table Card */}
          <div className="w-full px-4 sm:px-6">
            <Card className="overflow-hidden rounded-2xl border border-gray-200 bg-white/80 shadow-lg backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-white to-emerald-50/50 border-b border-gray-100 px-6">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                  <Database className="h-5 w-5 text-emerald-600" />
                  Crop Types
                </CardTitle>
                <CardDescription>
                  {cropTypes.length} crop type(s) defined
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 px-6">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <Loader2 className="h-10 w-10 animate-spin text-emerald-600 mb-4" />
                    <p className="text-sm text-gray-500">Loading crop types...</p>
                  </div>
                ) : cropTypes.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-100">
                      <Database className="h-10 w-10 text-slate-400" />
                    </div>
                    <p className="font-semibold text-gray-900 mb-1">No crop types yet</p>
                    <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
                      Add crop types (e.g. Maize, Beans, Coffee) to use them when recording collections.
                    </p>
                    <Button
                      onClick={openAddDialog}
                      className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Crop Type
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-gray-200">
                    <Table>
                      <TableHeader className="bg-gray-50/50">
                        <TableRow className="border-b border-gray-200 hover:bg-transparent">
                          <TableHead className="font-semibold text-gray-700">Name</TableHead>
                          <TableHead className="font-semibold text-gray-700">Code</TableHead>
                          <TableHead className="font-semibold text-gray-700">Unit</TableHead>
                          <TableHead className="font-semibold text-gray-700">Default Price</TableHead>
                          <TableHead className="font-semibold text-gray-700">Quality Standards</TableHead>
                          <TableHead className="font-semibold text-gray-700">Status</TableHead>
                          <TableHead className="font-semibold text-gray-700 text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {cropTypes.map((type) => (
                          <TableRow
                            key={type.id}
                            className="border-b border-gray-100 hover:bg-emerald-50/30 transition-colors"
                          >
                            <TableCell className="font-medium text-gray-900">{type.name}</TableCell>
                            <TableCell className="text-gray-600">{type.code}</TableCell>
                            <TableCell className="text-gray-600">{type.unitOfMeasure}</TableCell>
                            <TableCell className="text-gray-600">
                              RF {Number(type.defaultPricePerUnit ?? 0).toLocaleString()}
                            </TableCell>
                            <TableCell className="text-gray-600">
                              {type.qualityStandards ? (
                                <div className="text-xs space-y-0.5">
                                  {type.qualityStandards.maxMoisture != null && (
                                    <div>Moisture ≤{type.qualityStandards.maxMoisture}%</div>
                                  )}
                                  {type.qualityStandards.acceptableGrades?.length > 0 && (
                                    <div>
                                      Grades: {Array.isArray(type.qualityStandards.acceptableGrades)
                                        ? type.qualityStandards.acceptableGrades.join(", ")
                                        : "—"}
                                    </div>
                                  )}
                                  {!type.qualityStandards.maxMoisture &&
                                    !type.qualityStandards.acceptableGrades?.length && (
                                      <span className="text-gray-400">Not set</span>
                                    )}
                                </div>
                              ) : (
                                <span className="text-gray-400">Not set</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={type.isActive !== false ? "default" : "secondary"}
                                className={type.isActive !== false ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100" : ""}
                              >
                                {type.isActive !== false ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEdit(type)}
                                  className="rounded-lg text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(type.id)}
                                  className="rounded-lg text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl rounded-3xl border border-emerald-100 bg-white shadow-2xl p-0 overflow-hidden">
          <DialogHeader className="bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent border-b border-emerald-100 px-6 pt-6 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25">
                <Database className="h-6 w-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold text-gray-900">
                  {editingType ? "Edit Crop Type" : "Add Crop Type"}
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-600 mt-0.5">
                  Define name, code, unit and default price. Optionally set quality standards.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                  Name <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="e.g. Maize, Beans, Coffee"
                  className={inputClasses}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code" className="text-sm font-medium text-gray-700">
                  Code <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value.toUpperCase().replace(/\s/g, "") })
                  }
                  required
                  placeholder="e.g. MAIZE, BEANS"
                  className={inputClasses}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unitOfMeasure" className="text-sm font-medium text-gray-700">
                  Unit of measure <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="unitOfMeasure"
                  value={formData.unitOfMeasure}
                  onChange={(e) => setFormData({ ...formData, unitOfMeasure: e.target.value })}
                  required
                  placeholder="kg, bags, tons"
                  className={inputClasses}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="defaultPricePerUnit" className="text-sm font-medium text-gray-700">
                  Default price per unit (RF) <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="defaultPricePerUnit"
                  type="number"
                  min={0}
                  step="0.01"
                  value={formData.defaultPricePerUnit || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      defaultPricePerUnit: parseFloat(e.target.value) || 0,
                    })
                  }
                  required
                  className={inputClasses}
                />
              </div>
            </div>

            <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/40 px-4 py-4">
              <Label className="text-sm font-semibold text-gray-800">Quality standards (optional)</Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxMoisture" className="text-xs font-medium text-gray-600">
                    Max moisture %
                  </Label>
                  <Input
                    id="maxMoisture"
                    type="number"
                    min={0}
                    step="0.01"
                    value={formData.qualityStandards.maxMoisture ?? ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        qualityStandards: {
                          ...formData.qualityStandards,
                          maxMoisture: e.target.value ? parseFloat(e.target.value) : undefined,
                        },
                      })
                    }
                    className={inputClasses}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxForeignMatter" className="text-xs font-medium text-gray-600">
                    Max foreign matter %
                  </Label>
                  <Input
                    id="maxForeignMatter"
                    type="number"
                    min={0}
                    step="0.01"
                    value={formData.qualityStandards.maxForeignMatter ?? ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        qualityStandards: {
                          ...formData.qualityStandards,
                          maxForeignMatter: e.target.value ? parseFloat(e.target.value) : undefined,
                        },
                      })
                    }
                    className={inputClasses}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="acceptableGrades" className="text-xs font-medium text-gray-600">
                    Acceptable grades
                  </Label>
                  <Input
                    id="acceptableGrades"
                    value={
                      Array.isArray(formData.qualityStandards.acceptableGrades)
                        ? formData.qualityStandards.acceptableGrades.join(", ")
                        : ""
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        qualityStandards: {
                          ...formData.qualityStandards,
                          acceptableGrades: e.target.value
                            ? e.target.value.split(",").map((g) => g.trim()).filter(Boolean)
                            : [],
                        },
                      })
                    }
                    placeholder="A, B, C"
                    className={inputClasses}
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end border-t border-gray-100 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsFormOpen(false)}
                className="rounded-xl border border-emerald-200 text-sm font-semibold text-emerald-700 hover:bg-emerald-50"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-70"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {editingType ? "Updating…" : "Creating…"}
                  </>
                ) : editingType ? (
                  "Update crop type"
                ) : (
                  "Create crop type"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
