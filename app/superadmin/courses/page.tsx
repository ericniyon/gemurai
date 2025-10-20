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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { 
  MoreHorizontal, 
  Search, 
  Plus, 
  Eye, 
  Edit2, 
  Trash2, 
  BookOpen,
  Clock,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  Download,
  Loader2,
  GraduationCap,
  Users,
  TrendingUp,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

interface Course {
  id: string
  title: string
  description: string
  duration: string
  level: string
  category: string
  price: number
  isPublished: boolean
  createdAt: string
  updatedAt: string
}

const COURSE_LEVELS = ["Beginner", "Intermediate", "Advanced"] as const
const COURSE_CATEGORIES = ["Technical", "Business", "Soft Skills", "Other"] as const

const COURSE_LEVEL_COLORS = {
  Beginner: "bg-green-500",
  Intermediate: "bg-yellow-500", 
  Advanced: "bg-red-500"
} as const

const COURSE_CATEGORY_ICONS = {
  Technical: GraduationCap,
  Business: TrendingUp,
  "Soft Skills": Users,
  Other: BookOpen
} as const

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [levelFilter, setLevelFilter] = useState("all")
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    duration: "",
    level: COURSE_LEVELS[0],
    category: COURSE_CATEGORIES[0],
    price: 0,
    isPublished: false,
  })
  const { toast } = useToast()

  const fetchCourses = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch("/api/v1/superadmin/courses", {
        credentials: "include"
      })
      const data = await response.json()
      if (data.success) {
        setCourses(data.courses || [])
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      console.error("Error fetching courses:", error)
      setError(error instanceof Error ? error.message : "Failed to fetch courses")
      toast({
        title: "Error",
        description: "Failed to fetch courses",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCourses()
  }, [])

  const handleCreateCourse = async () => {
    try {
      setIsUpdating(true)
      const response = await fetch("/api/v1/superadmin/courses", {
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
          description: "Course created successfully",
        })
        fetchCourses()
        setIsCreateDialogOpen(false)
        setFormData({
          title: "",
          description: "",
          duration: "",
          level: COURSE_LEVELS[0],
          category: COURSE_CATEGORIES[0],
          price: 0,
          isPublished: false,
        })
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create course",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleUpdateCourse = async () => {
    if (!selectedCourse) return

    try {
      setIsUpdating(true)
      const response = await fetch(`/api/v1/superadmin/courses/${selectedCourse.id}`, {
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
          description: "Course updated successfully",
        })
        fetchCourses()
        setIsEditDialogOpen(false)
        setSelectedCourse(null)
        setFormData({
          title: "",
          description: "",
          duration: "",
          level: COURSE_LEVELS[0],
          category: COURSE_CATEGORIES[0],
          price: 0,
          isPublished: false,
        })
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update course",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleTogglePublish = async (courseId: string, isPublished: boolean) => {
    try {
      const response = await fetch(`/api/v1/superadmin/courses/${courseId}/publish`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isPublished }),
        credentials: "include"
      })

      const data = await response.json()
      if (data.success) {
        toast({
          title: "Success",
          description: `Course ${isPublished ? "published" : "unpublished"} successfully`,
        })
        fetchCourses()
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update course status",
        variant: "destructive",
      })
    }
  }

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm("Are you sure you want to delete this course?")) return

    try {
      const response = await fetch(`/api/v1/superadmin/courses/${courseId}`, {
        method: "DELETE",
        credentials: "include"
      })

      const data = await response.json()
      if (data.success) {
        toast({
          title: "Success",
          description: "Course deleted successfully",
        })
        fetchCourses()
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete course",
        variant: "destructive",
      })
    }
  }

  const handleExportCourses = () => {
    const csvContent = [
      ["Title", "Category", "Level", "Duration", "Price", "Status", "Created At"],
      ...filteredCourses.map(course => [
        course.title,
        course.category,
        course.level,
        course.duration,
        `RWF ${course.price.toLocaleString()}`,
        course.isPublished ? "Published" : "Draft",
        new Date(course.createdAt).toLocaleDateString()
      ])
    ].map(row => row.join(",")).join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "courses.csv"
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const filteredCourses = courses.filter((course) => {
    if (categoryFilter !== "all" && course.category !== categoryFilter) {
      return false
    }
    if (levelFilter !== "all" && course.level !== levelFilter) {
      return false
    }

    const searchString = searchTerm.toLowerCase()
    return (
      course.title.toLowerCase().includes(searchString) ||
      course.description.toLowerCase().includes(searchString)
    )
  })

  const stats = {
    total: courses.length,
    published: courses.filter(course => course.isPublished).length,
    draft: courses.filter(course => !course.isPublished).length,
    technical: courses.filter(course => course.category === "Technical").length,
    business: courses.filter(course => course.category === "Business").length,
    softSkills: courses.filter(course => course.category === "Soft Skills").length,
    other: courses.filter(course => course.category === "Other").length,
    beginner: courses.filter(course => course.level === "Beginner").length,
    intermediate: courses.filter(course => course.level === "Intermediate").length,
    advanced: courses.filter(course => course.level === "Advanced").length,
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <p className="text-gray-600">Loading courses...</p>
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
            <Button onClick={fetchCourses} variant="outline">
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
            Courses Management
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-500">
            Create and manage learning courses
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCourses}
            className="flex items-center justify-center gap-2 h-12 sm:h-9 px-3 sm:px-4"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            className="flex items-center justify-center gap-2 h-12 sm:h-9 px-3 sm:px-4"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Course</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <Card>
          <CardContent className="p-3 sm:p-4 md:p-5">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1 pr-2">
                <p className="text-sm font-medium text-gray-500">Total Courses</p>
                <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mt-1">
                  {stats.total}
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-blue-50 rounded-full shrink-0">
                <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-3 sm:p-4 md:p-5">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1 pr-2">
                <p className="text-sm font-medium text-gray-500">Published</p>
                <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mt-1">
                  {stats.published}
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
                <p className="text-sm font-medium text-gray-500">Draft</p>
                <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mt-1">
                  {stats.draft}
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-gray-50 rounded-full shrink-0">
                <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-3 sm:p-4 md:p-5">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1 pr-2">
                <p className="text-sm font-medium text-gray-500">Technical</p>
                <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mt-1">
                  {stats.technical}
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-purple-50 rounded-full shrink-0">
                <GraduationCap className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-4 sm:mb-6">
        <CardContent className="p-3 sm:p-4 md:p-5">
          <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
            <div className="flex-1 min-w-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by title or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 sm:h-10"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-[180px] h-12 sm:h-10">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {COURSE_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger className="w-full sm:w-[180px] h-12 sm:h-10">
                  <SelectValue placeholder="Filter by level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  {COURSE_LEVELS.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-3 sm:p-4 md:p-5">
          <CardTitle className="text-base sm:text-lg md:text-xl">
            Courses ({filteredCourses.length})
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Manage and organize your course catalog
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="hidden lg:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Course</TableHead>
                  <TableHead className="w-[120px]">Category</TableHead>
                  <TableHead className="w-[120px]">Level</TableHead>
                  <TableHead className="w-[100px]">Duration</TableHead>
                  <TableHead className="w-[100px]">Price</TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead className="w-[120px]">Created</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCourses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <BookOpen className="h-8 w-8 text-gray-400" />
                        <p className="text-gray-500">No courses found</p>
                        {searchTerm && <p className="text-sm text-gray-400">Try adjusting your search</p>}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCourses.map((course) => {
                    const CategoryIcon = COURSE_CATEGORY_ICONS[course.category as keyof typeof COURSE_CATEGORY_ICONS] || BookOpen
                    
                    return (
                      <TableRow key={course.id}>
                        <TableCell>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 truncate">
                              {course.title}
                            </p>
                            <p className="text-sm text-gray-500 truncate mt-1">
                              {course.description}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="flex items-center gap-1 w-fit">
                            <CategoryIcon className="h-3 w-3" />
                            {course.category}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${COURSE_LEVEL_COLORS[course.level as keyof typeof COURSE_LEVEL_COLORS]} text-white`}>
                            {course.level}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {course.duration}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            RWF {course.price.toLocaleString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${course.isPublished ? "bg-green-500" : "bg-gray-500"} text-white flex items-center gap-1`}>
                            {course.isPublished ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                            {course.isPublished ? "Published" : "Draft"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {new Date(course.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setSelectedCourse(course)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setFormData({
                                    title: course.title,
                                    description: course.description,
                                    duration: course.duration,
                                    level: course.level as typeof COURSE_LEVELS[number],
                                    category: course.category as typeof COURSE_CATEGORIES[number],
                                    price: course.price,
                                    isPublished: course.isPublished,
                                  })
                                  setSelectedCourse(course)
                                  setIsEditDialogOpen(true)
                                }}
                              >
                                <Edit2 className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleTogglePublish(course.id, !course.isPublished)}
                              >
                                {course.isPublished ? "Unpublish" : "Publish"}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => handleDeleteCourse(course.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>

          <div className="lg:hidden">
            {filteredCourses.length === 0 ? (
              <div className="p-8 text-center">
                <div className="flex flex-col items-center gap-2">
                  <BookOpen className="h-8 w-8 text-gray-400" />
                  <p className="text-gray-500">No courses found</p>
                  {searchTerm && <p className="text-sm text-gray-400">Try adjusting your search</p>}
                </div>
              </div>
            ) : (
              <div className="space-y-3 p-3 sm:p-4">
                {filteredCourses.map((course) => {
                  const CategoryIcon = COURSE_CATEGORY_ICONS[course.category as keyof typeof COURSE_CATEGORY_ICONS] || BookOpen
                  
                  return (
                    <Card key={course.id} className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 truncate">
                              {course.title}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {course.description}
                            </p>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 shrink-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setSelectedCourse(course)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setFormData({
                                    title: course.title,
                                    description: course.description,
                                    duration: course.duration,
                                    level: course.level as typeof COURSE_LEVELS[number],
                                    category: course.category as typeof COURSE_CATEGORIES[number],
                                    price: course.price,
                                    isPublished: course.isPublished,
                                  })
                                  setSelectedCourse(course)
                                  setIsEditDialogOpen(true)
                                }}
                              >
                                <Edit2 className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleTogglePublish(course.id, !course.isPublished)}
                              >
                                {course.isPublished ? "Unpublish" : "Publish"}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => handleDeleteCourse(course.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className="flex items-center gap-1">
                            <CategoryIcon className="h-3 w-3" />
                            {course.category}
                          </Badge>
                          <Badge className={`${COURSE_LEVEL_COLORS[course.level as keyof typeof COURSE_LEVEL_COLORS]} text-white`}>
                            {course.level}
                          </Badge>
                          <Badge className={`${course.isPublished ? "bg-green-500" : "bg-gray-500"} text-white flex items-center gap-1`}>
                            {course.isPublished ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                            {course.isPublished ? "Published" : "Draft"}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{course.duration}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            <span>RWF {course.price.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(course.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create Course Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Course</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter course title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                placeholder="Enter course description"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Duration</Label>
                <Input
                  id="duration"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="e.g., 2 weeks, 3 months"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price (RWF)</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="level">Level</Label>
                <Select value={formData.level} onValueChange={(value) => setFormData({ ...formData, level: value as typeof COURSE_LEVELS[number] })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COURSE_LEVELS.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value as typeof COURSE_CATEGORIES[number] })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COURSE_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="isPublished"
                checked={formData.isPublished}
                onCheckedChange={(checked) => setFormData({ ...formData, isPublished: checked })}
              />
              <Label htmlFor="isPublished">Publish immediately</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateCourse} disabled={isUpdating}>
              {isUpdating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Create Course
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Course Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Course</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter course title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                placeholder="Enter course description"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-duration">Duration</Label>
                <Input
                  id="edit-duration"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="e.g., 2 weeks, 3 months"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-price">Price (RWF)</Label>
                <Input
                  id="edit-price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-level">Level</Label>
                <Select value={formData.level} onValueChange={(value) => setFormData({ ...formData, level: value as typeof COURSE_LEVELS[number] })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COURSE_LEVELS.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-category">Category</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value as typeof COURSE_CATEGORIES[number] })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COURSE_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-isPublished"
                checked={formData.isPublished}
                onCheckedChange={(checked) => setFormData({ ...formData, isPublished: checked })}
              />
              <Label htmlFor="edit-isPublished">Published</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateCourse} disabled={isUpdating}>
              {isUpdating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Update Course
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Course Details Dialog */}
      {selectedCourse && !isEditDialogOpen && (
        <Dialog open={!!selectedCourse} onOpenChange={() => setSelectedCourse(null)}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Course Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{selectedCourse.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{selectedCourse.description}</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-500">Category</p>
                    <Badge variant="outline" className="flex items-center gap-1 w-fit">
                      {(() => {
                        const CategoryIcon = COURSE_CATEGORY_ICONS[selectedCourse.category as keyof typeof COURSE_CATEGORY_ICONS] || BookOpen
                        return <CategoryIcon className="h-3 w-3" />
                      })()}
                      {selectedCourse.category}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-500">Level</p>
                    <Badge className={`${COURSE_LEVEL_COLORS[selectedCourse.level as keyof typeof COURSE_LEVEL_COLORS]} text-white`}>
                      {selectedCourse.level}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-500">Duration</p>
                    <p className="text-gray-900">{selectedCourse.duration}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-500">Price</p>
                    <p className="text-gray-900">RWF {selectedCourse.price.toLocaleString()}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <Badge className={`${selectedCourse.isPublished ? "bg-green-500" : "bg-gray-500"} text-white flex items-center gap-1`}>
                      {selectedCourse.isPublished ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                      {selectedCourse.isPublished ? "Published" : "Draft"}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-500">Created</p>
                    <p className="text-gray-900">{new Date(selectedCourse.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
} 