"use client"

import { useEffect, useState } from "react"
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
import { hasPermission } from "@/lib/auth"
import { type AuthUser } from "@/lib/token"
import { formServiceTranslations } from "@/lib/translations/form-service"

interface ProfileData {
  id: string
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: string
  nationalId: string
  maritalStatus: string
  email: string
  phone: string
  alternatePhone: string
  preferredContact: string
  province: string
  district: string
  sector: string
  cell: string
  village: string
  streetAddress: string
  educationLevel: string
  fieldOfStudy: string
  languages: string[]
  computerSkills: string[]
  hasWorkExperience: boolean
  currentEmployment: string
  previousJobs: string
  motivation: string
  goals: string
  availability: string
  productPreferences: string[]
  profilePhoto?: string
  dccLevel?: string
  totalEarnings?: string
  completedCourses?: number
  profileCompleteness?: number
  joinDate?: string
  skills: string[]
  incomeGoals: string[]
  learningTrainings: string[]
  locationPreferences: string[]
  otherSkills: string
  otherPreviousRole: string
}

const mockProfileData: ProfileData = {
  id: "user123",
  firstName: "John",
  lastName: "Doe",
  dateOfBirth: "1990-01-01",
  gender: "male",
  nationalId: "1234567890",
  maritalStatus: "single",
  email: "john.doe@example.com",
  phone: "+250 781234567",
  alternatePhone: "+250 789876543",
  preferredContact: "phone",
  province: "Kigali",
  district: "Gasabo",
  sector: "Kimironko",
  cell: "Kibagabaga",
  village: "Nyagatovu",
  streetAddress: "KG 123 St",
  educationLevel: "bachelor",
  fieldOfStudy: "Business Administration",
  languages: ["English", "Kinyarwanda", "French"],
  computerSkills: ["Microsoft Office", "Internet", "Email"],
  hasWorkExperience: true,
  currentEmployment: "employed",
  previousJobs: "Sales Representative at XYZ Company",
  motivation: "I want to help my community grow through digital solutions.",
  goals: "To become a successful digital community champion.",
  availability: "full-time",
  productPreferences: ["Margin-based", "Trend-based / Fast moving"],
  profilePhoto: "/placeholder.svg",
  dccLevel: "Level 1",
  totalEarnings: "RWF 150,000",
  completedCourses: 5,
  profileCompleteness: 85,
  joinDate: "2024-01-01",
  skills: ["Computer Literacy", "Digital Marketing", "Sales"],
  incomeGoals: ["Commission based", "Sales volume", "Fixed Income", "Sales volume"],
  learningTrainings: [],
  locationPreferences: [],
  otherSkills: "",
  otherPreviousRole: "",
}

function canEditProfile(user: AuthUser | null, profileId: string): boolean {
  if (!user) {
    return false
  }

  // Users can edit their own profile
  if (user.id === profileId) {
    return true
  }

  // DCC and Employer can edit profiles they manage
  if (user.role === 'DCC' || user.role === 'EMPLOYER') {
    return hasPermission(user, 'users.edit')
  }

  return false
}

function ProfileContent({ lang }: { lang: string }) {
  const { user } = useAuth()
  const [profileData, setProfileData] = useState<ProfileData>(mockProfileData)
  const [isEditing, setIsEditing] = useState(false)
  const [editingSection, setEditingSection] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  const canEdit = user && canEditProfile(user, profileData.id)

  const updateProfileData = (field: keyof ProfileData, value: any) => {
    setProfileData((prev) => ({ ...prev, [field]: value }))
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
                    {profileData.joinDate ? (
                      `Joined ${new Date(profileData.joinDate).toLocaleDateString()}`
                    ) : (
                      "Join date not available"
                    )}
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
                value: (profileData.completedCourses ?? 0).toString(),
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="firstName" className="text-xs font-medium text-gray-700">
                      First Name
                    </Label>
                    <Input
                      id="firstName"
                      value={profileData.firstName}
                      onChange={(e) => updateProfileData("firstName", e.target.value)}
                      disabled={!isEditing || !canEdit}
                      className={`h-9 text-sm transition-all duration-300 ${
                        !isEditing || !canEdit
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
                      disabled={!isEditing || !canEdit}
                      className={`h-9 text-sm transition-all duration-300 ${
                        !isEditing || !canEdit
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
                      disabled={!isEditing || !canEdit}
                      className={`h-9 text-sm transition-all duration-300 ${
                        !isEditing || !canEdit
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
                      disabled={!isEditing || !canEdit}
                      className="flex space-x-4 pt-1"
                    >
                      {["male", "female", "other"].map((gender) => (
                        <div key={gender} className="flex items-center space-x-1.5">
                          <RadioGroupItem value={gender} id={gender} disabled={!isEditing || !canEdit} className="w-3.5 h-3.5" />
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
                      disabled={!isEditing || !canEdit}
                      className={`h-9 text-sm transition-all duration-300 ${
                        !isEditing || !canEdit
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
                      disabled={!isEditing || !canEdit}
                    >
                      <SelectTrigger
                        className={`h-9 text-sm ${!isEditing || !canEdit ? "bg-gray-50/50 border-0 shadow-none" : "shadow-sm"}`}
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
                      disabled={!isEditing || !canEdit}
                      className={`h-9 text-sm transition-all duration-300 ${
                        !isEditing || !canEdit
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
                      disabled={!isEditing || !canEdit}
                      className={`h-9 text-sm transition-all duration-300 ${
                        !isEditing || !canEdit
                          ? "bg-gray-50/50 border-0 shadow-none"
                          : "focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 shadow-sm"
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="alternatePhone" className="text-xs font-medium text-gray-700">
                      {lang === 'rw' ? formServiceTranslations.rw.questions.alternatePhone.label : formServiceTranslations.en.questions.alternatePhone.label}
                    </Label>
                    <Input
                      id="alternatePhone"
                      value={profileData.alternatePhone}
                      onChange={(e) => updateProfileData("alternatePhone", e.target.value)}
                      disabled={!isEditing || !canEdit}
                      className={`h-9 text-sm transition-all duration-300 ${
                        !isEditing || !canEdit
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
                      disabled={!isEditing || !canEdit}
                    >
                      <SelectTrigger
                        className={`h-9 text-sm ${!isEditing || !canEdit ? "bg-gray-50/50 border-0 shadow-none" : "shadow-sm"}`}
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
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="province" className="text-xs font-medium text-gray-700">
                        {lang === 'rw' ? formServiceTranslations.rw.questions.province.label : formServiceTranslations.en.questions.province.label}
                      </Label>
                      <Select
                        value={profileData.province}
                        onValueChange={(value) => updateProfileData("province", value)}
                        disabled={!isEditing || !canEdit}
                      >
                        <SelectTrigger
                          className={`h-9 text-sm ${!isEditing || !canEdit ? "bg-gray-50/50 border-0 shadow-none" : "shadow-sm"}`}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="eastern">{lang === 'rw' ? "Uburasirazuba" : "Eastern"}</SelectItem>
                          <SelectItem value="northern">{lang === 'rw' ? "Amajyaruguru" : "Northern"}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="district" className="text-xs font-medium text-gray-700">
                        {lang === 'rw' ? formServiceTranslations.rw.questions.district.label : formServiceTranslations.en.questions.district.label}
                      </Label>
                      <Select
                        value={profileData.district}
                        onValueChange={(value) => updateProfileData("district", value)}
                        disabled={!profileData.province || !isEditing || !canEdit}
                      >
                        <SelectTrigger
                          className={`h-9 text-sm ${!isEditing || !canEdit ? "bg-gray-50/50 border-0 shadow-none" : "shadow-sm"}`}
                        >
                          <SelectValue placeholder={!profileData.province ? 
                            (lang === 'rw' ? formServiceTranslations.rw.questions.province.placeholder : formServiceTranslations.en.questions.province.placeholder) : 
                            (lang === 'rw' ? formServiceTranslations.rw.questions.district.placeholder : formServiceTranslations.en.questions.district.placeholder)} />
                        </SelectTrigger>
                        <SelectContent>
                          {profileData.province === "northern" && (
                            <SelectItem value="musanze">{lang === 'rw' ? "Musanze" : "Musanze"}</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="sector" className="text-xs font-medium text-gray-700">
                        {lang === 'rw' ? formServiceTranslations.rw.questions.sector.label : formServiceTranslations.en.questions.sector.label}
                      </Label>
                      <Select
                        value={profileData.sector}
                        onValueChange={(value) => {
                          updateProfileData("sector", value);
                          updateProfileData("cell", "");
                          updateProfileData("village", "");
                        }}
                        disabled={!profileData.district || !isEditing || !canEdit}
                      >
                        <SelectTrigger
                          className={`h-9 text-sm ${!isEditing || !canEdit ? "bg-gray-50/50 border-0 shadow-none" : "shadow-sm"}`}
                        >
                          <SelectValue placeholder={!profileData.district ? 
                            (lang === 'rw' ? formServiceTranslations.rw.questions.district.placeholder : formServiceTranslations.en.questions.district.placeholder) : 
                            (lang === 'rw' ? formServiceTranslations.rw.questions.sector.placeholder : formServiceTranslations.en.questions.sector.placeholder)} />
                        </SelectTrigger>
                        <SelectContent>
                          {profileData.district === "musanze" && (
                            <>
                              <SelectItem value="busogo">{lang === 'rw' ? "Busogo" : "Busogo"}</SelectItem>
                              <SelectItem value="muhoza">{lang === 'rw' ? "Muhoza" : "Muhoza"}</SelectItem>
                              <SelectItem value="rwaza">{lang === 'rw' ? "Rwaza" : "Rwaza"}</SelectItem>
                              <SelectItem value="nkotsi">{lang === 'rw' ? "Nkotsi" : "Nkotsi"}</SelectItem>
                            </>
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="cell" className="text-xs font-medium text-gray-700">
                        Cell
                      </Label>
                      <Select
                        value={profileData.cell}
                        onValueChange={(value) => {
                          updateProfileData("cell", value);
                          updateProfileData("village", "");
                        }}
                        disabled={!profileData.sector || !isEditing || !canEdit}
                      >
                        <SelectTrigger
                          className={`h-9 text-sm ${!isEditing || !canEdit ? "bg-gray-50/50 border-0 shadow-none" : "shadow-sm"}`}
                        >
                          <SelectValue placeholder={!profileData.sector ? "Select Sector first" : "Select Cell"} />
                        </SelectTrigger>
                        <SelectContent>
                          {profileData.sector === "busogo" && (
                            <>
                              <SelectItem value="gisesero">{lang === 'rw' ? "Gisesero" : "Gisesero"}</SelectItem>
                              <SelectItem value="kavumu">{lang === 'rw' ? "Kavumu" : "Kavumu"}</SelectItem>
                              <SelectItem value="nyagisozi">{lang === 'rw' ? "Nyagisozi" : "Nyagisozi"}</SelectItem>
                              <SelectItem value="sahara">{lang === 'rw' ? "Sahara" : "Sahara"}</SelectItem>
                            </>
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="village" className="text-xs font-medium text-gray-700">
                        Village
                      </Label>
                      <Select
                        value={profileData.village}
                        onValueChange={(value) => updateProfileData("village", value)}
                        disabled={!profileData.cell || !isEditing || !canEdit}
                      >
                        <SelectTrigger
                          className={`h-9 text-sm ${!isEditing || !canEdit ? "bg-gray-50/50 border-0 shadow-none" : "shadow-sm"}`}
                        >
                          <SelectValue placeholder={!profileData.cell ? "Select Cell first" : "Select Village"} />
                        </SelectTrigger>
                        <SelectContent>
                          {profileData.sector === "busogo" && profileData.cell === "gisesero" && (
                            <>
                              <SelectItem value="gahanga">{lang === 'rw' ? "Gahanga" : "Gahanga"}</SelectItem>
                              <SelectItem value="jabiro">{lang === 'rw' ? "Jabiro" : "Jabiro"}</SelectItem>
                              <SelectItem value="kabaya">{lang === 'rw' ? "Kabaya" : "Kabaya"}</SelectItem>
                              <SelectItem value="nengo">{lang === 'rw' ? "Nengo" : "Nengo"}</SelectItem>
                            </>
                          )}
                          {profileData.sector === "busogo" && profileData.cell === "kavumu" && (
                            <>
                              <SelectItem value="gatovu">{lang === 'rw' ? "Gatovu" : "Gatovu"}</SelectItem>
                              <SelectItem value="karema">{lang === 'rw' ? "Karema" : "Karema"}</SelectItem>
                              <SelectItem value="karuriza">{lang === 'rw' ? "Karuriza" : "Karuriza"}</SelectItem>
                              <SelectItem value="mutaboneka">{lang === 'rw' ? "Mutaboneka" : "Mutaboneka"}</SelectItem>
                              <SelectItem value="rugeshi">{lang === 'rw' ? "Rugeshi" : "Rugeshi"}</SelectItem>
                            </>
                          )}
                          {profileData.sector === "busogo" && profileData.cell === "nyagisozi" && (
                            <>
                              <SelectItem value="cyasure">{lang === 'rw' ? "Cyasure" : "Cyasure"}</SelectItem>
                              <SelectItem value="gora">{lang === 'rw' ? "Gora" : "Gora"}</SelectItem>
                              <SelectItem value="kabwenge">{lang === 'rw' ? "Kabwenge" : "Kabwenge"}</SelectItem>
                              <SelectItem value="kirezi">{lang === 'rw' ? "Kirezi" : "Kirezi"}</SelectItem>
                              <SelectItem value="rurembo">{lang === 'rw' ? "Rurembo" : "Rurembo"}</SelectItem>
                            </>
                          )}
                          {profileData.sector === "busogo" && profileData.cell === "sahara" && (
                            <>
                              <SelectItem value="nyarubuye">{lang === 'rw' ? "Nyarubuye" : "Nyarubuye"}</SelectItem>
                              <SelectItem value="nyiragaju">{lang === 'rw' ? "Nyiragaju" : "Nyiragaju"}</SelectItem>
                              <SelectItem value="rubaya">{lang === 'rw' ? "Rubaya" : "Rubaya"}</SelectItem>
                              <SelectItem value="ryamukutsi">{lang === 'rw' ? "Ryamukutsi" : "Ryamukutsi"}</SelectItem>
                            </>
                          )}
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



                  <div className="space-y-1.5">
                    <Label htmlFor="streetAddress" className="text-xs font-medium text-gray-700">
                      Street Address
                    </Label>
                    <Input
                      id="streetAddress"
                      value={profileData.streetAddress}
                      onChange={(e) => updateProfileData("streetAddress", e.target.value)}
                      disabled={!isEditing || !canEdit}
                      className={`h-9 text-sm transition-all duration-300 ${
                        !isEditing || !canEdit
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
                      {lang === 'rw' ? formServiceTranslations.rw.questions.education.label : formServiceTranslations.en.questions.education.label}
                    </Label>
                    <Select
                      value={profileData.educationLevel}
                      onValueChange={(value) => updateProfileData("educationLevel", value)}
                      disabled={!isEditing || !canEdit}
                    >
                      <SelectTrigger
                        className={`h-9 text-sm ${!isEditing || !canEdit ? "bg-gray-50/50 border-0 shadow-none" : "shadow-sm"}`}
                      >
                        <SelectValue placeholder={lang === 'rw' ? formServiceTranslations.rw.questions.education.placeholder : formServiceTranslations.en.questions.education.placeholder} />
                      </SelectTrigger>
                      <SelectContent>
                        {(lang === 'rw' ? formServiceTranslations.rw.questions.education.options : formServiceTranslations.en.questions.education.options).map((option) => (
                          <SelectItem key={option} value={option.toLowerCase().replace(/\s+/g, '-')}>{option}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="fieldOfStudy" className="text-xs font-medium text-gray-700">
                      {lang === 'rw' ? formServiceTranslations.rw.questions.fieldOfStudy.label : formServiceTranslations.en.questions.fieldOfStudy.label}
                    </Label>
                    <Input
                      id="fieldOfStudy"
                      value={profileData.fieldOfStudy}
                      onChange={(e) => updateProfileData("fieldOfStudy", e.target.value)}
                      disabled={!isEditing || !canEdit}
                      placeholder={lang === 'rw' ? formServiceTranslations.rw.questions.fieldOfStudy.placeholder : formServiceTranslations.en.questions.fieldOfStudy.placeholder}
                      className={`h-9 text-sm transition-all duration-300 ${
                        !isEditing || !canEdit
                          ? "bg-gray-50/50 border-0 shadow-none"
                          : "focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 shadow-sm"
                      }`}
                    />
                  </div>
                </div>

                {/* Skills Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-1.5">
                    <Label className="text-sm font-semibold text-gray-900">
                      {lang === 'rw' ? formServiceTranslations.rw.questions.skills.label : formServiceTranslations.en.questions.skills.label}
                    </Label>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {(lang === 'rw' ? formServiceTranslations.rw.questions.skills.options : formServiceTranslations.en.questions.skills.options).map((skill) => (
                      <div
                        key={skill}
                        className="flex items-center space-x-1.5 p-2 bg-gray-50/50 rounded-lg hover:bg-gray-100/50 transition-colors duration-300"
                      >
                        <Checkbox
                          id={skill}
                          checked={(profileData.skills ?? []).includes(skill)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              updateProfileData("skills", [...(profileData.skills ?? []), skill])
                            } else {
                              updateProfileData(
                                "skills",
                                (profileData.skills ?? []).filter((s) => s !== skill)
                              )
                            }
                          }}
                          className="w-3.5 h-3.5"
                          disabled={!isEditing || !canEdit}
                        />
                        <Label htmlFor={skill} className="text-xs font-medium cursor-pointer">
                          {skill}
                        </Label>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="otherSkills" className="text-xs font-medium text-gray-700">
                      {lang === 'rw' ? formServiceTranslations.rw.questions.otherSkills.label : formServiceTranslations.en.questions.otherSkills.label}
                    </Label>
                    <Textarea
                      id="otherSkills"
                      value={profileData.otherSkills}
                      onChange={(e) => updateProfileData("otherSkills", e.target.value)}
                      disabled={!isEditing || !canEdit}
                      placeholder={lang === 'rw' ? formServiceTranslations.rw.questions.otherSkills.placeholder : formServiceTranslations.en.questions.otherSkills.placeholder}
                      className={`h-24 text-sm transition-all duration-300 ${
                        !isEditing || !canEdit
                          ? "bg-gray-50/50 border-0 shadow-none"
                          : "focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 shadow-sm"
                      }`}
                    />
                  </div>
                </div>

                {/* Languages Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-1.5">
                    <Label className="text-sm font-semibold text-gray-900">
                      {lang === 'rw' ? formServiceTranslations.rw.questions.languages.label : formServiceTranslations.en.questions.languages.label}
                    </Label>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {(lang === 'rw' ? formServiceTranslations.rw.questions.languages.options : formServiceTranslations.en.questions.languages.options).map((language) => (
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
                          disabled={!isEditing || !canEdit}
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
                    disabled={!isEditing || !canEdit}
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-1.5 p-2 bg-green-50/50 rounded-lg">
                      <RadioGroupItem value="true" id="hasExp" disabled={!isEditing || !canEdit} className="w-3.5 h-3.5" />
                      <Label htmlFor="hasExp" className="text-xs font-medium text-green-700 cursor-pointer">
                        Yes, I have experience
                      </Label>
                    </div>
                    <div className="flex items-center space-x-1.5 p-2 bg-gray-50/50 rounded-lg">
                      <RadioGroupItem value="false" id="noExp" disabled={!isEditing || !canEdit} className="w-3.5 h-3.5" />
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
                        disabled={!isEditing || !canEdit}
                      >
                        <SelectTrigger
                          className={`h-9 text-sm ${!isEditing || !canEdit ? "bg-gray-50/50 border-0 shadow-none" : "shadow-sm"}`}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="employed">Employed</SelectItem>
                          <SelectItem value="self-employed">Self-Employed</SelectItem>
                          <SelectItem value="unemployed">Unemployed</SelectItem>
                          <SelectItem value="student">Student</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="previousJobs" className="text-xs font-medium text-gray-700">
                        {lang === 'rw' ? formServiceTranslations.rw.questions.previousRoles.label : formServiceTranslations.en.questions.previousRoles.label}
                      </Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {(lang === 'rw' ? formServiceTranslations.rw.questions.previousRoles.options : formServiceTranslations.en.questions.previousRoles.options).map((role) => (
                          <div
                            key={role}
                            className="flex items-center space-x-1.5 p-2 bg-gray-50/50 rounded-lg hover:bg-gray-100/50 transition-colors duration-300"
                          >
                            <Checkbox
                              id={role}
                              checked={(profileData.previousJobs ?? []).includes(role)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  updateProfileData("previousJobs", [...(profileData.previousJobs ?? []), role])
                                } else {
                                  updateProfileData(
                                    "previousJobs",
                                    (profileData.previousJobs ?? []).filter((r) => r !== role)
                                  )
                                }
                              }}
                              className="w-3.5 h-3.5"
                              disabled={!isEditing || !canEdit}
                            />
                            <Label htmlFor={role} className="text-xs font-medium cursor-pointer">
                              {role}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {(profileData.previousJobs ?? []).includes("Ibindi") && (
                      <div className="space-y-1.5">
                        <Label htmlFor="otherPreviousRole" className="text-xs font-medium text-gray-700">
                          {lang === 'rw' ? formServiceTranslations.rw.questions.otherEngagement.label : formServiceTranslations.en.questions.otherEngagement.label}
                        </Label>
                        <Textarea
                          id="otherPreviousRole"
                          value={profileData.otherPreviousRole}
                          onChange={(e) => updateProfileData("otherPreviousRole", e.target.value)}
                          disabled={!isEditing || !canEdit}
                          placeholder={lang === 'rw' ? formServiceTranslations.rw.questions.otherEngagement.placeholder : formServiceTranslations.en.questions.otherEngagement.placeholder}
                          className={`h-24 text-sm transition-all duration-300 ${
                            !isEditing || !canEdit
                              ? "bg-gray-50/50 border-0 shadow-none"
                              : "focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 shadow-sm"
                          }`}
                        />
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="animate-in fade-in-50 duration-500">
            <Card className="bg-white/80 backdrop-blur-sm shadow-sm rounded-xl overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-pink-50 rounded-lg">
                    <Heart className="w-4 h-4 text-pink-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-900">Preferences</CardTitle>
                    <CardDescription className="text-xs text-gray-600">
                      Your personal preferences and goals
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="motivation" className="text-xs font-medium text-gray-700">
                    What motivates you?
                  </Label>
                  <Textarea
                    id="motivation"
                    value={profileData.motivation}
                    onChange={(e) => updateProfileData("motivation", e.target.value)}
                    disabled={!isEditing || !canEdit}
                    className={`h-24 text-sm transition-all duration-300 ${
                      !isEditing || !canEdit
                        ? "bg-gray-50/50 border-0 shadow-none"
                        : "focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 shadow-sm"
                    }`}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="goals" className="text-xs font-medium text-gray-700">
                    What are your goals?
                  </Label>
                  <Textarea
                    id="goals"
                    value={profileData.goals}
                    onChange={(e) => updateProfileData("goals", e.target.value)}
                    disabled={!isEditing || !canEdit}
                    className={`h-24 text-sm transition-all duration-300 ${
                      !isEditing || !canEdit
                        ? "bg-gray-50/50 border-0 shadow-none"
                        : "focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 shadow-sm"
                    }`}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="availability" className="text-xs font-medium text-gray-700">
                    Availability
                  </Label>
                  <Select
                    value={profileData.availability}
                    onValueChange={(value) => updateProfileData("availability", value)}
                    disabled={!isEditing || !canEdit}
                  >
                    <SelectTrigger
                      className={`h-9 text-sm ${!isEditing || !canEdit ? "bg-gray-50/50 border-0 shadow-none" : "shadow-sm"}`}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full-time">Full-Time</SelectItem>
                      <SelectItem value="part-time">Part-Time</SelectItem>
                      <SelectItem value="flexible">Flexible</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-1.5">
                    <Label className="text-sm font-semibold text-gray-900">Product Preferences</Label>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {[
                      "Margin-based",
                      "Trend-based / Fast moving",
                      "Seasonal",
                      "Slow moving",
                      "High demand",
                      "Low demand",
                    ].map((preference) => (
                      <div
                        key={preference}
                        className="flex items-center space-x-1.5 p-2 bg-gray-50/50 rounded-lg hover:bg-gray-100/50 transition-colors duration-300"
                      >
                        <Checkbox
                          id={preference}
                          checked={profileData.productPreferences.includes(preference)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              updateProfileData("productPreferences", [...profileData.productPreferences, preference])
                            } else {
                              updateProfileData(
                                "productPreferences",
                                profileData.productPreferences.filter((p) => p !== preference),
                              )
                            }
                          }}
                          disabled={!isEditing || !canEdit}
                          className="w-3.5 h-3.5"
                        />
                        <Label htmlFor={preference} className="text-xs font-medium cursor-pointer">
                          {preference}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default function ProfilePage({ params: { lang } }: { params: { lang: string } }) {
  return (
    <ClientOnly>
      <ProfileContent lang={lang} />
    </ClientOnly>
  )
}