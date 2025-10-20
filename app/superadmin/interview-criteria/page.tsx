"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Plus, Edit, Trash2, Save, X, CheckCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface InterviewCriteria {
  id: string
  name: string
  description: string
  maxScore: number
  weight: number
  isActive: boolean
}

export default function InterviewCriteriaPage() {
  const [criteria, setCriteria] = useState<InterviewCriteria[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingCriteria, setEditingCriteria] = useState<InterviewCriteria | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { toast } = useToast()

  // Form state for new/edit criteria
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    maxScore: 10,
    weight: 1.0
  })

  useEffect(() => {
    loadCriteria()
  }, [])

  const loadCriteria = async () => {
    try {
      const response = await fetch("/api/v1/admin/interview-criteria", {
        credentials: "include",
      })
      const data = await response.json()
      
      if (data.success) {
        setCriteria(data.criteria)
      } else {
        toast({
          title: "Error",
          description: "Failed to load interview criteria",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error loading criteria:", error)
      toast({
        title: "Error",
        description: "Failed to load interview criteria",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const url = editingCriteria 
        ? `/api/v1/admin/interview-criteria/${editingCriteria.id}`
        : "/api/v1/admin/interview-criteria"
      
      const method = editingCriteria ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
        credentials: "include",
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: editingCriteria 
            ? "Interview criteria updated successfully" 
            : "Interview criteria added successfully",
        })
        
        // Reset form and reload
        setFormData({ name: "", description: "", maxScore: 10, weight: 1.0 })
        setEditingCriteria(null)
        setIsDialogOpen(false)
        await loadCriteria()
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      console.error("Error saving criteria:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save criteria",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (criteria: InterviewCriteria) => {
    setEditingCriteria(criteria)
    setFormData({
      name: criteria.name,
      description: criteria.description,
      maxScore: criteria.maxScore,
      weight: criteria.weight
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this criteria?")) return

    try {
      const response = await fetch(`/api/v1/admin/interview-criteria/${id}`, {
        method: "DELETE",
        credentials: "include",
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "Interview criteria deleted successfully",
        })
        await loadCriteria()
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      console.error("Error deleting criteria:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete criteria",
        variant: "destructive",
      })
    }
  }

  const handleAddNew = () => {
    setEditingCriteria(null)
    setFormData({ name: "", description: "", maxScore: 10, weight: 1.0 })
    setIsDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading interview criteria...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Interview Criteria Management</h1>
          <p className="text-sm text-gray-500">
            Manage interview scoring criteria for the Interview Guide and Interview Scoring functionality
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddNew}>
              <Plus className="mr-2 h-4 w-4" />
              Add Criteria
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] bg-white border shadow-xl backdrop-blur-none opacity-100">
            <DialogHeader>
              <DialogTitle>
                {editingCriteria ? "Edit Interview Criteria" : "Add New Interview Criteria"}
              </DialogTitle>
              <DialogDescription>
                {editingCriteria 
                  ? "Update the interview criteria details below."
                  : "Add a new interview criteria for scoring candidates."
                }
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Criteria Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Communication Skills"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe what this criteria evaluates..."
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="maxScore">Maximum Score</Label>
                  <Input
                    id="maxScore"
                    type="number"
                    min="1"
                    max="20"
                    value={formData.maxScore}
                    onChange={(e) => setFormData({ ...formData, maxScore: parseInt(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="weight">Weight</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="5.0"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) })}
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {editingCriteria ? "Update" : "Add"}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {criteria.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Interview Criteria</h3>
                <p className="text-gray-500 mb-4">
                  No interview criteria have been added yet. Add your first criteria to get started.
                </p>
                <Button onClick={handleAddNew}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Criteria
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          criteria.map((criterion) => (
            <Card key={criterion.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {criterion.name}
                      <Badge variant={criterion.isActive ? "default" : "secondary"}>
                        {criterion.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </CardTitle>
                    <CardDescription>{criterion.description}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Max: {criterion.maxScore}</Badge>
                    <Badge variant="outline">Weight: {criterion.weight}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(criterion)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(criterion.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
} 