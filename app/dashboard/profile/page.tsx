"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  User,
  Phone,
  MapPin,
  GraduationCap,
  Briefcase,
  Heart,
  Edit,
  Save,
  X,
  Camera,
  Calendar,
  Star,
  Target,
  BookOpen,
  Award,
  DollarSign,
  Info,
  TrendingUp,
  Package,
  Globe,
  Building,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { ClientOnly } from "@/components/client-only"
import { formServiceTranslations } from "@/lib/translations/form-service"

interface ProfileData {
  // Personal Information
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: string
  nationalId: string
  maritalStatus: string

  // Contact Information
  email: string
  phone: string
  alternatePhone: string
  preferredContact: string

  // Address Information
  province: string
  district: string
  sector: string
  cell: string
  village: string
  streetAddress: string

  // Education & Skills
  educationLevel: string
  fieldOfStudy: string
  skills: string[]
  languages: string[]

  // Work Experience
  hasWorkExperience: boolean
  currentEmployment: string
  previousJobs: string

  // Motivation & Goals
  motivation: string
  goals: string
  availability: string

  // DCC Specific
  joinDate: string
  dccLevel: string
  totalEarnings: string
  completedCourses: number
  profilePhoto?: string
  profileCompleteness: number

  // DCC Preferences
  incomeGoals: string[]
  learningTrainings: string[]
  locationPreferences: string[]
  productPreferences: string[]
}

const mockProfileData: ProfileData = {
  firstName: "Jean",
  lastName: "Uwimana",
  dateOfBirth: "1995-03-15",
  gender: "male",
  nationalId: "1 1995 8 0123456 7 89",
  maritalStatus: "married",
  email: "jean.uwimana@example.com",
  phone: "+250 788 123 456",
  alternatePhone: "+250 722 987 654",
  preferredContact: "phone",
  province: "kigali",
  district: "Gasabo",
  sector: "Kimironko",
  cell: "Bibare",
  village: "Kagugu",
  streetAddress: "KG 15 Ave, House #45",
  educationLevel: "bachelor",
  fieldOfStudy: "Business Administration",
  skills: ["Computer Literacy", "Sales", "Customer Service", "Digital Marketing"],
  languages: ["Kinyarwanda", "English", "French"],
  hasWorkExperience: true,
  currentEmployment: "selfemployed",
  previousJobs:
    "Worked as a sales representative at MTN Rwanda for 3 years. Managed customer relationships and achieved 120% of sales targets consistently.",
  motivation:
    "I want to help my community access better healthcare products and services while building a sustainable income for my family.",
  goals: "To become a top-performing DCC and eventually open my own health products distribution center.",
  availability: "fulltime",
  joinDate: "2024-01-15",
  dccLevel: "Level 3",
  totalEarnings: "RWF 245,000",
  completedCourses: 12,
  profilePhoto: "/placeholder.svg?height=150&width=150",
  profileCompleteness: 92,
  // DCC Preferences
  incomeGoals: ["Commission based"],
  learningTrainings: ["Product knowledge", "Sales & negotiation training"],
  locationPreferences: ["Urban", "Rural"],
  productPreferences: ["Margin-based", "Trend-based / Fast moving"],
}

function ProfileContent() {
  const [profileData, setProfileData] = useState<ProfileData>(mockProfileData)
  const [isEditing, setIsEditing] = useState(false)
  const [editingSection, setEditingSection] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()

  const updateProfileData = (field: keyof ProfileData, value: any) => {
    setProfileData((prev) => ({ ...prev, [field]: value }))
  }

  // Check if user can edit personal information
  const canEditPersonalInfo = () => {
    if (!user) return false
    
    // DCC users cannot edit personal information
    if (user.role === 'DCC') {
      return false
    }
    
    // Other roles can edit
    return true
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast({
        title: "Profile Updated",
        description: "Your changes have been saved successfully.",
      })

      setIsEditing(false)
      setEditingSection(null)
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setProfileData(mockProfileData) // Reset to original data
    setIsEditing(false)
    setEditingSection(null)
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 animate-in fade-in-50 duration-700">
      {/* Refined Header */}
      <div className="bg-white/80 backdrop-blur-sm mb-6 animate-in slide-in-from-top-4 duration-700">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Profile Info */}
            <div className="flex items-center gap-4 animate-in slide-in-from-left-4 duration-700 delay-100">
              <div className="relative group">
                <Avatar className="w-16 h-16 shadow-lg transition-all duration-500 group-hover:shadow-xl group-hover:scale-105">
                  <AvatarImage
                    src={profileData.profilePhoto || "/placeholder.svg"}
                    alt={`${profileData.firstName} ${profileData.lastName}`}
                  />
                  <AvatarFallback className="text-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white font-medium">
                    {getInitials(profileData.firstName, profileData.lastName)}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute -bottom-1 -right-1 rounded-full w-6 h-6 p-0 bg-white shadow-md hover:shadow-lg transition-all duration-300 hover:scale-110"
                >
                  <Camera className="w-2.5 h-2.5" />
                </Button>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-xl font-semibold text-gray-900">
                    {profileData.firstName} {profileData.lastName}
                  </h1>
                  <Badge variant="secondary" className="bg-blue-50 text-blue-700 text-xs font-medium px-2 py-0.5">
                    {profileData.dccLevel}
                  </Badge>
                </div>
                <p className="text-gray-600 text-sm mb-2">Digital Community Champion</p>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Joined {new Date(profileData.joinDate).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Award className="w-3 h-3" />
                    {profileData.completedCourses} courses
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 animate-in slide-in-from-right-4 duration-700 delay-200">
              {!isEditing ? (
                <Button
                  onClick={() => setIsEditing(true)}
                  size="sm"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 text-sm transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg"
                >
                  <Edit className="mr-1.5 h-3.5 w-3.5" />
                  Edit Profile
                </Button>
              ) : (
                <>
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    size="sm"
                    className="px-4 py-2 text-sm transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-md"
                  >
                    <X className="mr-1.5 h-3.5 w-3.5" />
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    size="sm"
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 py-2 text-sm transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg"
                  >
                    {isSaving ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin mr-1.5" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-1.5 h-3.5 w-3.5" />
                        Save
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 animate-in slide-in-from-bottom-4 duration-700 delay-300">
            {[
              {
                icon: BookOpen,
                label: "Courses",
                value: profileData.completedCourses.toString(),
                color: "text-blue-600",
                bg: "bg-blue-50",
              },
              {
                icon: DollarSign,
                label: "Earnings",
                value: profileData.totalEarnings,
                color: "text-green-600",
                bg: "bg-green-50",
              },
              {
                icon: Target,
                label: "Complete",
                value: `${profileData.profileCompleteness}%`,
                color: "text-purple-600",
                bg: "bg-purple-50",
              },
              {
                icon: Star,
                label: "Level",
                value: profileData.dccLevel,
                color: "text-orange-600",
                bg: "bg-orange-50",
              },
            ].map((stat, index) => (
              <div
                key={stat.label}
                className="bg-white/70 backdrop-blur-sm rounded-xl p-3 hover:bg-white/90 transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-md animate-in slide-in-from-bottom-4 duration-700"
                style={{ animationDelay: `${400 + index * 100}ms` }}
              >
                <div className={`inline-flex p-1.5 rounded-lg ${stat.bg} mb-2`}>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <p className="text-lg font-semibold text-gray-900 mb-0.5">{stat.value}</p>
                <p className="text-xs text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Progress Bar */}
          <div className="mt-4 animate-in slide-in-from-bottom-4 duration-700 delay-700">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-gray-700">Profile Completeness</span>
              <span className="text-xs font-semibold text-gray-900">{profileData.profileCompleteness}%</span>
            </div>
            <Progress value={profileData.profileCompleteness} className="h-1.5 bg-gray-200" />
            <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1">
              <Info className="w-3 h-3" />
              Complete your profile to unlock all features
            </p>
          </div>
        </div>
      </div>

      {/* Refined Tabs Section */}
      <div className="max-w-6xl mx-auto px-4 pb-6">
        <Tabs defaultValue="personal" className="space-y-4 animate-in slide-in-from-bottom-4 duration-700 delay-300">
          <TabsList className="grid w-full grid-cols-5 bg-white/80 backdrop-blur-sm rounded-xl p-1 h-10 shadow-sm">
            {[
              { value: "personal", label: "Personal", icon: User },
              { value: "contact", label: "Contact", icon: Phone },
              { value: "education", label: "Education", icon: GraduationCap },
              { value: "experience", label: "Experience", icon: Briefcase },
              { value: "preferences", label: "Preferences", icon: Heart },
            ].map((tab, index) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="rounded-lg font-medium text-xs data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all duration-300 flex items-center gap-1.5 h-8"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <tab.icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Personal Information Tab */}
          <TabsContent value="personal" className="animate-in fade-in-50 duration-500">
            <Card className="bg-white/80 backdrop-blur-sm shadow-sm rounded-xl overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-blue-50 rounded-lg">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-900">Personal Information</CardTitle>
                    <CardDescription className="text-xs text-gray-600">
                      Your basic personal details and identification
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                {/* DCC Restriction Notice */}
                {user?.role === 'DCC' && !canEditPersonalInfo() && (
                  <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <Info className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-amber-800 mb-1">Personal Information Locked</h4>
                      <p className="text-sm text-amber-700">
                        As a DCC user, your personal information is protected and can only be modified by administrators. 
                        If you need to update any personal details, please contact support or an administrator.
                      </p>
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="firstName" className="text-xs font-medium text-gray-700">
                      First Name
                    </Label>
                    <Input
                      id="firstName"
                      value={profileData.firstName}
                      onChange={(e) => updateProfileData("firstName", e.target.value)}
                      disabled={!isEditing || !canEditPersonalInfo()}
                      className={`h-9 text-sm transition-all duration-300 ${
                        !isEditing || !canEditPersonalInfo()
                          ? "bg-gray-50/50 border-0 shadow-none"
                          : "focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 shadow-sm"
                      }`}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="lastName" className="text-xs font-medium text-gray-700">
                      Last Name
                    </Label>
                    <Input
                      id="lastName"
                      value={profileData.lastName}
                      onChange={(e) => updateProfileData("lastName", e.target.value)}
                      disabled={!isEditing || !canEditPersonalInfo()}
                      className={`h-9 text-sm transition-all duration-300 ${
                        !isEditing || !canEditPersonalInfo()
                          ? "bg-gray-50/50 border-0 shadow-none"
                          : "focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 shadow-sm"
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="dateOfBirth" className="text-xs font-medium text-gray-700">
                      Date of Birth
                    </Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={profileData.dateOfBirth}
                      onChange={(e) => updateProfileData("dateOfBirth", e.target.value)}
                      disabled={!isEditing || !canEditPersonalInfo()}
                      className={`h-9 text-sm transition-all duration-300 ${
                        !isEditing || !canEditPersonalInfo()
                          ? "bg-gray-50/50 border-0 shadow-none"
                          : "focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 shadow-sm"
                      }`}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-gray-700">Gender</Label>
                    <RadioGroup
                      value={profileData.gender}
                      onValueChange={(value) => updateProfileData("gender", value)}
                      disabled={!isEditing || !canEditPersonalInfo()}
                      className="flex space-x-4 pt-1"
                    >
                      {["male", "female", "other"].map((gender) => (
                        <div key={gender} className="flex items-center space-x-1.5">
                          <RadioGroupItem value={gender} id={gender} disabled={!isEditing || !canEditPersonalInfo()} className="w-3.5 h-3.5" />
                          <Label htmlFor={gender} className="text-xs font-medium capitalize cursor-pointer">
                            {gender}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="nationalId" className="text-xs font-medium text-gray-700">
                      National ID Number
                    </Label>
                    <Input
                      id="nationalId"
                      value={profileData.nationalId}
                      onChange={(e) => updateProfileData("nationalId", e.target.value)}
                      disabled={!isEditing || !canEditPersonalInfo()}
                      className={`h-9 text-sm transition-all duration-300 ${
                        !isEditing || !canEditPersonalInfo()
                          ? "bg-gray-50/50 border-0 shadow-none"
                          : "focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 shadow-sm"
                      }`}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="maritalStatus" className="text-xs font-medium text-gray-700">
                      Marital Status
                    </Label>
                    <Select
                      value={profileData.maritalStatus}
                      onValueChange={(value) => updateProfileData("maritalStatus", value)}
                      disabled={!isEditing || !canEditPersonalInfo()}
                    >
                      <SelectTrigger
                        className={`h-9 text-sm ${!isEditing || !canEditPersonalInfo() ? "bg-gray-50/50 border-0 shadow-none" : "shadow-sm"}`}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single">Single</SelectItem>
                        <SelectItem value="married">Married</SelectItem>
                        <SelectItem value="divorced">Divorced</SelectItem>
                        <SelectItem value="widowed">Widowed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contact Information Tab */}
          <TabsContent value="contact" className="animate-in fade-in-50 duration-500">
            <Card className="bg-white/80 backdrop-blur-sm shadow-sm rounded-xl overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-green-50 rounded-lg">
                    <Phone className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-900">Contact & Address</CardTitle>
                    <CardDescription className="text-xs text-gray-600">
                      Your contact information and address details
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs font-medium text-gray-700">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => updateProfileData("email", e.target.value)}
                      disabled={!isEditing}
                      className={`h-9 text-sm transition-all duration-300 ${
                        !isEditing
                          ? "bg-gray-50/50 border-0 shadow-none"
                          : "focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 shadow-sm"
                      }`}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className="text-xs font-medium text-gray-700">
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      value={profileData.phone}
                      onChange={(e) => updateProfileData("phone", e.target.value)}
                      disabled={!isEditing}
                      className={`h-9 text-sm transition-all duration-300 ${
                        !isEditing
                          ? "bg-gray-50/50 border-0 shadow-none"
                          : "focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 shadow-sm"
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="alternatePhone" className="text-xs font-medium text-gray-700">
                      {formServiceTranslations.en.questions.alternatePhone.label}
                    </Label>
                    <Input
                      id="alternatePhone"
                      value={profileData.alternatePhone}
                      onChange={(e) => updateProfileData("alternatePhone", e.target.value)}
                      disabled={!isEditing}
                      className={`h-9 text-sm transition-all duration-300 ${
                        !isEditing
                          ? "bg-gray-50/50 border-0 shadow-none"
                          : "focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 shadow-sm"
                      }`}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="preferredContact" className="text-xs font-medium text-gray-700">
                      Preferred Contact Method
                    </Label>
                    <Select
                      value={profileData.preferredContact}
                      onValueChange={(value) => updateProfileData("preferredContact", value)}
                      disabled={!isEditing}
                    >
                      <SelectTrigger
                        className={`h-9 text-sm ${!isEditing ? "bg-gray-50/50 border-0 shadow-none" : "shadow-sm"}`}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="phone">Phone Call</SelectItem>
                        <SelectItem value="sms">SMS</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Address Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2.5 pt-3">
                    <div className="p-1.5 bg-blue-50 rounded-lg">
                      <MapPin className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">Address Information</h3>
                      <p className="text-xs text-gray-600">Your residential address details</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="province" className="text-xs font-medium text-gray-700">
                        Province
                      </Label>
                      <Select
                        value={profileData.province}
                        onValueChange={(value) => updateProfileData("province", value)}
                        disabled={!isEditing}
                      >
                        <SelectTrigger
                          className={`h-9 text-sm ${!isEditing ? "bg-gray-50/50 border-0 shadow-none" : "shadow-sm"}`}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="kigali">Kigali City</SelectItem>
                          <SelectItem value="eastern">Eastern</SelectItem>
                          <SelectItem value="northern">Northern Province</SelectItem>
                          <SelectItem value="southern">Southern Province</SelectItem>
                          <SelectItem value="western">Western Province</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="district" className="text-xs font-medium text-gray-700">
                        District
                      </Label>
                      <Input
                        id="district"
                        value={profileData.district}
                        onChange={(e) => updateProfileData("district", e.target.value)}
                        disabled={!isEditing}
                        className={`h-9 text-sm transition-all duration-300 ${
                          !isEditing
                            ? "bg-gray-50/50 border-0 shadow-none"
                            : "focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 shadow-sm"
                        }`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[
                      { id: "sector", label: "Sector", value: profileData.sector },
                      { id: "cell", label: "Cell", value: profileData.cell },
                      { id: "village", label: "Village", value: profileData.village },
                    ].map((field) => (
                      <div key={field.id} className="space-y-1.5">
                        <Label htmlFor={field.id} className="text-xs font-medium text-gray-700 capitalize">
                          {field.label}
                        </Label>
                        <Input
                          id={field.id}
                          value={field.value}
                          onChange={(e) => updateProfileData(field.id as keyof ProfileData, e.target.value)}
                          disabled={!isEditing}
                          className={`h-9 text-sm transition-all duration-300 ${
                            !isEditing
                              ? "bg-gray-50/50 border-0 shadow-none"
                              : "focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 shadow-sm"
                          }`}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="streetAddress" className="text-xs font-medium text-gray-700">
                      Street Address
                    </Label>
                    <Input
                      id="streetAddress"
                      value={profileData.streetAddress}
                      onChange={(e) => updateProfileData("streetAddress", e.target.value)}
                      disabled={!isEditing}
                      className={`h-9 text-sm transition-all duration-300 ${
                        !isEditing
                          ? "bg-gray-50/50 border-0 shadow-none"
                          : "focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 shadow-sm"
                      }`}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Education & Skills Tab */}
          <TabsContent value="education" className="animate-in fade-in-50 duration-500">
            <Card className="bg-white/80 backdrop-blur-sm shadow-sm rounded-xl overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-purple-50 rounded-lg">
                    <GraduationCap className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-900">Education & Skills</CardTitle>
                    <CardDescription className="text-xs text-gray-600">
                      Your educational background and skill set
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="educationLevel" className="text-xs font-medium text-gray-700">
                      Education Level
                    </Label>
                    <Select
                      value={profileData.educationLevel}
                      onValueChange={(value) => updateProfileData("educationLevel", value)}
                      disabled={!isEditing}
                    >
                      <SelectTrigger
                        className={`h-9 text-sm ${!isEditing ? "bg-gray-50/50 border-0 shadow-none" : "shadow-sm"}`}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="primary">Primary Education</SelectItem>
                        <SelectItem value="secondary">Secondary Education</SelectItem>
                        <SelectItem value="tvet">TVET Certificate</SelectItem>
                        <SelectItem value="diploma">Diploma</SelectItem>
                        <SelectItem value="bachelor">Bachelor's Degree</SelectItem>
                        <SelectItem value="master">Master's Degree</SelectItem>
                        <SelectItem value="phd">PhD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="fieldOfStudy" className="text-xs font-medium text-gray-700">
                      Field of Study
                    </Label>
                    <Input
                      id="fieldOfStudy"
                      value={profileData.fieldOfStudy}
                      onChange={(e) => updateProfileData("fieldOfStudy", e.target.value)}
                      disabled={!isEditing}
                      className={`h-9 text-sm transition-all duration-300 ${
                        !isEditing
                          ? "bg-gray-50/50 border-0 shadow-none"
                          : "focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 shadow-sm"
                      }`}
                    />
                  </div>
                </div>

                {/* Skills Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-1.5">
                    <Label className="text-sm font-semibold text-gray-900">Professional Skills</Label>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {[
                      "Computer Literacy",
                      "Digital Marketing",
                      "Sales",
                      "Customer Service",
                      "Data Entry",
                      "Social Media",
                      "Photography",
                      "Writing",
                      "Translation",
                      "Teaching",
                      "Healthcare",
                      "Agriculture",
                    ].map((skill) => (
                      <div
                        key={skill}
                        className="flex items-center space-x-1.5 p-2 bg-gray-50/50 rounded-lg hover:bg-gray-100/50 transition-colors duration-300"
                      >
                        <Checkbox
                          id={skill}
                          checked={profileData.skills.includes(skill)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              updateProfileData("skills", [...profileData.skills, skill])
                            } else {
                              updateProfileData(
                                "skills",
                                profileData.skills.filter((s) => s !== skill),
                              )
                            }
                          }}
                          disabled={!isEditing}
                          className="w-3.5 h-3.5"
                        />
                        <Label htmlFor={skill} className="text-xs font-medium cursor-pointer">
                          {skill}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Languages Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-1.5">
                    <Label className="text-sm font-semibold text-gray-900">Languages</Label>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {["Kinyarwanda", "English", "French", "Swahili"].map((language) => (
                      <div
                        key={language}
                        className="flex items-center space-x-1.5 p-2 bg-gray-50/50 rounded-lg hover:bg-gray-100/50 transition-colors duration-300"
                      >
                        <Checkbox
                          id={language}
                          checked={profileData.languages.includes(language)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              updateProfileData("languages", [...profileData.languages, language])
                            } else {
                              updateProfileData(
                                "languages",
                                profileData.languages.filter((l) => l !== language),
                              )
                            }
                          }}
                          disabled={!isEditing}
                          className="w-3.5 h-3.5"
                        />
                        <Label htmlFor={language} className="text-xs font-medium cursor-pointer">
                          {language}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Work Experience Tab */}
          <TabsContent value="experience" className="animate-in fade-in-50 duration-500">
            <Card className="bg-white/80 backdrop-blur-sm shadow-sm rounded-xl overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-orange-50 rounded-lg">
                    <Briefcase className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-900">Work Experience</CardTitle>
                    <CardDescription className="text-xs text-gray-600">
                      Your professional background and experience
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-gray-900">Do you have work experience?</Label>
                  <RadioGroup
                    value={profileData.hasWorkExperience.toString()}
                    onValueChange={(value) => updateProfileData("hasWorkExperience", value === "true")}
                    disabled={!isEditing}
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-1.5 p-2 bg-green-50/50 rounded-lg">
                      <RadioGroupItem value="true" id="hasExp" disabled={!isEditing} className="w-3.5 h-3.5" />
                      <Label htmlFor="hasExp" className="text-xs font-medium text-green-700 cursor-pointer">
                        Yes, I have experience
                      </Label>
                    </div>
                    <div className="flex items-center space-x-1.5 p-2 bg-gray-50/50 rounded-lg">
                      <RadioGroupItem value="false" id="noExp" disabled={!isEditing} className="w-3.5 h-3.5" />
                      <Label htmlFor="noExp" className="text-xs font-medium text-gray-700 cursor-pointer">
                        No experience yet
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {profileData.hasWorkExperience && (
                  <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="space-y-1.5">
                      <Label htmlFor="currentEmployment" className="text-xs font-medium text-gray-700">
                        Current Employment Status
                      </Label>
                      <Select
                        value={profileData.currentEmployment}
                        onValueChange={(value) => updateProfileData("currentEmployment", value)}
                        disabled={!isEditing}
                      >
                        <SelectTrigger
                          className={`h-9 text-sm ${!isEditing ? "bg-gray-50/50 border-0 shadow-none" : "shadow-sm"}`}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="employed">Employed Full-time</SelectItem>
                          <SelectItem value="parttime">Employed Part-time</SelectItem>
                          <SelectItem value="selfemployed">Self-employed</SelectItem>
                          <SelectItem value="unemployed">Unemployed</SelectItem>
                          <SelectItem value="student">Student</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="previousJobs" className="text-xs font-medium text-gray-700">
                        Previous Work Experience
                      </Label>
                      <Textarea
                        id="previousJobs"
                        value={profileData.previousJobs}
                        onChange={(e) => updateProfileData("previousJobs", e.target.value)}
                        disabled={!isEditing}
                        className={`text-sm transition-all duration-300 ${
                          !isEditing
                            ? "bg-gray-50/50 border-0 shadow-none"
                            : "focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 shadow-sm"
                        }`}
                        rows={3}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="motivation" className="text-xs font-medium text-gray-700">
                    Why did you join Gemurai?
                  </Label>
                  <Textarea
                    id="motivation"
                    value={profileData.motivation}
                    onChange={(e) => updateProfileData("motivation", e.target.value)}
                    disabled={!isEditing}
                    className={`text-sm transition-all duration-300 ${
                      !isEditing
                        ? "bg-gray-50/50 border-0 shadow-none"
                        : "focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 shadow-sm"
                    }`}
                    rows={2}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="goals" className="text-xs font-medium text-gray-700">
                    Your Goals
                  </Label>
                  <Textarea
                    id="goals"
                    value={profileData.goals}
                    onChange={(e) => updateProfileData("goals", e.target.value)}
                    disabled={!isEditing}
                    className={`text-sm transition-all duration-300 ${
                      !isEditing
                        ? "bg-gray-50/50 border-0 shadow-none"
                        : "focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 shadow-sm"
                    }`}
                    rows={2}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="availability" className="text-xs font-medium text-gray-700">
                    Availability
                  </Label>
                  <Select
                    value={profileData.availability}
                    onValueChange={(value) => updateProfileData("availability", value)}
                    disabled={!isEditing}
                  >
                    <SelectTrigger
                      className={`h-9 text-sm ${!isEditing ? "bg-gray-50/50 border-0 shadow-none" : "shadow-sm"}`}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fulltime">Full-time (40+ hours/week)</SelectItem>
                      <SelectItem value="parttime">Part-time (20-39 hours/week)</SelectItem>
                      <SelectItem value="flexible">Flexible (10-19 hours/week)</SelectItem>
                      <SelectItem value="weekend">Weekends only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* DCC Preferences Tab */}
          <TabsContent value="preferences" className="animate-in fade-in-50 duration-500">
            <div className="space-y-6">
              {/* Income Goals */}
            <Card className="bg-white/80 backdrop-blur-sm shadow-sm rounded-xl overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-green-50 rounded-lg">
                      <DollarSign className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                      <CardTitle className="text-lg font-semibold text-gray-900">Income goals</CardTitle>
                    <CardDescription className="text-xs text-gray-600">
                        Let us know how much you want to earn based on your income goals.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {[
                      "Commission based",
                      "Sales volume",
                      "Fixed Income",
                      "Sales volume",
                    ].map((goal) => (
                      <div
                        key={goal}
                        className="flex items-center space-x-3 p-3 bg-gray-50/50 rounded-lg hover:bg-gray-100/50 transition-colors duration-300"
                      >
                        <Checkbox
                          id={`income-${goal}`}
                          checked={profileData.incomeGoals.includes(goal)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              updateProfileData("incomeGoals", [...profileData.incomeGoals, goal])
                            } else {
                              updateProfileData(
                                "incomeGoals",
                                profileData.incomeGoals.filter((g) => g !== goal),
                              )
                            }
                          }}
                          disabled={!isEditing}
                          className="w-4 h-4"
                        />
                        <Label htmlFor={`income-${goal}`} className="text-sm font-medium cursor-pointer">
                          {goal}
                  </Label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Learning and Growth / Trainings */}
              <Card className="bg-white/80 backdrop-blur-sm shadow-sm rounded-xl overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-blue-50 rounded-lg">
                      <BookOpen className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold text-gray-900">Learning and Growth / Trainings</CardTitle>
                      <CardDescription className="text-xs text-gray-600">
                        set preferences for skills or knowledge areas to enhance your ability to sell or trade effectively
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {[
                      "Product knowledge",
                      "Sales & negotiation training",
                      "Customer relationship management",
                      "E-commerce platform usage / Platform proficiency",
                      "Financial literacy",
                    ].map((training) => (
                      <div
                        key={training}
                        className="flex items-center space-x-3 p-3 bg-gray-50/50 rounded-lg hover:bg-gray-100/50 transition-colors duration-300"
                      >
                        <Checkbox
                          id={`training-${training}`}
                          checked={profileData.learningTrainings.includes(training)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              updateProfileData("learningTrainings", [...profileData.learningTrainings, training])
                            } else {
                              updateProfileData(
                                "learningTrainings",
                                profileData.learningTrainings.filter((t) => t !== training),
                              )
                            }
                          }}
                    disabled={!isEditing}
                          className="w-4 h-4"
                        />
                        <Label htmlFor={`training-${training}`} className="text-sm font-medium cursor-pointer">
                          {training}
                        </Label>
                  </div>
                    ))}
                </div>
                </CardContent>
              </Card>

              {/* Location Preferences */}
              <Card className="bg-white/80 backdrop-blur-sm shadow-sm rounded-xl overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-purple-50 rounded-lg">
                      <MapPin className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold text-gray-900">Location Preferences</CardTitle>
                      <CardDescription className="text-xs text-gray-600">
                        choose preferred regions for your operations based on logistics, familiarity, or market potential
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                <div className="space-y-3">
                    {[
                      "Urban",
                      "Rural",
                      "Online",
                    ].map((location) => (
                      <div
                        key={location}
                        className="flex items-center space-x-3 p-3 bg-gray-50/50 rounded-lg hover:bg-gray-100/50 transition-colors duration-300"
                      >
                        <Checkbox
                          id={`location-${location}`}
                          checked={profileData.locationPreferences.includes(location)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              updateProfileData("locationPreferences", [...profileData.locationPreferences, location])
                            } else {
                              updateProfileData(
                                "locationPreferences",
                                profileData.locationPreferences.filter((l) => l !== location),
                              )
                            }
                          }}
                          disabled={!isEditing}
                          className="w-4 h-4"
                        />
                        <Label htmlFor={`location-${location}`} className="text-sm font-medium cursor-pointer flex items-center gap-2">
                          {location === "Urban" && <Building className="w-4 h-4 text-gray-500" />}
                          {location === "Rural" && <MapPin className="w-4 h-4 text-gray-500" />}
                          {location === "Online" && <Globe className="w-4 h-4 text-gray-500" />}
                          {location}
                        </Label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Products */}
              <Card className="bg-white/80 backdrop-blur-sm shadow-sm rounded-xl overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-orange-50 rounded-lg">
                      <Package className="w-4 h-4 text-orange-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold text-gray-900">Products</CardTitle>
                      <CardDescription className="text-xs text-gray-600">
                        choose preferred regions for your operations based on logistics, familiarity, or market potential
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-3 mb-6">
                    {[
                      "Margin-based",
                      "Trend-based / Fast moving",
                      "Online",
                    ].map((product) => (
                      <div
                        key={product}
                        className="flex items-center space-x-3 p-3 bg-gray-50/50 rounded-lg hover:bg-gray-100/50 transition-colors duration-300"
                      >
                        <Checkbox
                          id={`product-${product}`}
                          checked={profileData.productPreferences.includes(product)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              updateProfileData("productPreferences", [...profileData.productPreferences, product])
                            } else {
                              updateProfileData(
                                "productPreferences",
                                profileData.productPreferences.filter((p) => p !== product),
                              )
                            }
                          }}
                          disabled={!isEditing}
                          className="w-4 h-4"
                        />
                        <Label htmlFor={`product-${product}`} className="text-sm font-medium cursor-pointer flex items-center gap-2">
                          {product === "Margin-based" && <DollarSign className="w-4 h-4 text-gray-500" />}
                          {product === "Trend-based / Fast moving" && <TrendingUp className="w-4 h-4 text-gray-500" />}
                          {product === "Online" && <Globe className="w-4 h-4 text-gray-500" />}
                          {product}
                        </Label>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>


            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  return (
    <ClientOnly fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    }>
      <ProfileContent />
    </ClientOnly>
  )
}
