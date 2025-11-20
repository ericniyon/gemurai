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
  Droplets,
  Users,
  Activity,
  Link as LinkIcon,
  ShoppingCart,
  Truck,
  Milk,
  Receipt,
  Warehouse,
  Wallet,
  ArrowRight,
  Box,
  ShoppingBag,
  FileText,
} from "lucide-react"
import Link from "next/link"
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

interface MCCInfo {
  id: string
  name: string
  code?: string
  location: string
  region?: string
  address?: string
  role: string
  isManager: boolean
  joinDate?: string
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
  const [mccInfo, setMccInfo] = useState<MCCInfo | null>(null)
  const [loadingMcc, setLoadingMcc] = useState(true)
  const [mccStats, setMccStats] = useState<{
    customers: number
    suppliers: number
    collections: number
    sales: number
    inventory: number
    rentals: number
  } | null>(null)
  const { toast } = useToast()

  const canEdit = user && canEditProfile(user, profileData.id)

  // Fetch MCC information
  useEffect(() => {
    const fetchMccInfo = async () => {
      if (!user) {
        setLoadingMcc(false)
        return
      }

      try {
        const response = await fetch('/api/v1/users/profile', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          // Check if user has MCC association
          if (data.data?.mccId || user.role === 'MCC_MANAGER') {
            // Fetch MCC details
            const mccResponse = await fetch(`/api/v1/mcc/${data.data?.mccId || user.mccId}`, {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
              },
            })
            
            if (mccResponse.ok) {
              const mccData = await mccResponse.json()
              setMccInfo({
                id: mccData.id || data.data?.mccId || '',
                name: mccData.name || 'Unknown MCC',
                code: mccData.code,
                location: mccData.location || '',
                region: mccData.region,
                address: mccData.address,
                role: user.role === 'MCC_MANAGER' ? 'Manager' : 'Staff',
                isManager: user.role === 'MCC_MANAGER',
                joinDate: data.data?.createdAt,
              })

              // Fetch MCC statistics
              const mccId = mccData.id || data.data?.mccId
              if (mccId) {
                try {
                  // Fetch dashboard stats
                  const dashboardResponse = await fetch(`/api/v1/mcc/dashboard?mccId=${mccId}`, {
                    headers: {
                      'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    },
                  })
                  
                  if (dashboardResponse.ok) {
                    const dashboardData = await dashboardResponse.json()
                    // Fetch customers count
                    const customersResponse = await fetch(`/api/v1/mcc/customers?mccId=${mccId}`, {
                      headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                      },
                    })
                    const customersData = customersResponse.ok ? await customersResponse.json() : { meta: { total: 0 } }
                    
                    // Fetch suppliers count (if API exists)
                    let suppliersCount = 0
                    try {
                      const suppliersResponse = await fetch(`/api/v1/mcc/suppliers?mccId=${mccId}`, {
                        headers: {
                          'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        },
                      })
                      if (suppliersResponse.ok) {
                        const suppliersData = await suppliersResponse.json()
                        suppliersCount = suppliersData.meta?.total || 0
                      }
                    } catch (e) {
                      // Suppliers API might not exist
                    }

                    setMccStats({
                      customers: customersData.meta?.total || 0,
                      suppliers: suppliersCount,
                      collections: dashboardData.data?.dailyVolume?.collections || 0,
                      sales: dashboardData.data?.salesStats?.totalSales || 0,
                      inventory: 0, // Will be fetched separately if needed
                      rentals: 0, // Will be fetched separately if needed
                    })
                  }
                } catch (error) {
                  console.error('Error fetching MCC stats:', error)
                }
              }
            }
          }
        }
      } catch (error) {
        console.error('Error fetching MCC info:', error)
      } finally {
        setLoadingMcc(false)
      }
    }

    fetchMccInfo()
  }, [user])

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/40 relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-180px] right-[-120px] h-[420px] w-[420px] rounded-full bg-gradient-to-br from-blue-500/20 via-indigo-400/10 to-purple-400/10 blur-3xl" />
        <div className="absolute bottom-[-160px] left-[-160px] h-[380px] w-[380px] rounded-full bg-gradient-to-tr from-emerald-400/15 via-sky-400/10 to-blue-400/5 blur-3xl" />
      </div>

      <div className="relative z-10">
        {/* Header Section */}
        <div className="relative z-10 mx-auto w-full px-0 py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <div className="inline-flex items-center gap-3 rounded-full bg-white/80 px-4 py-1.5 shadow-sm ring-1 ring-gray-200 mb-4">
                <User className="h-4 w-4 text-blue-600" />
                <span className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                  Profile Management
                </span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-2">
                My Profile
              </h1>
              <p className="text-lg text-gray-600">
                Manage your personal information and preferences
              </p>
            </div>
          </div>
        </div>

        {/* Profile Header Card */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <Card className="bg-white/90 backdrop-blur-sm border-2 border-blue-100 rounded-3xl shadow-xl overflow-hidden">
            <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Profile Info */}
                <div className="flex items-center gap-4">
              <div className="relative group">
                    <Avatar className="w-20 h-20 shadow-lg transition-all duration-500 group-hover:shadow-xl group-hover:scale-105 ring-4 ring-blue-100">
                  <AvatarImage
                    src={profileData.profilePhoto || "/placeholder.svg"}
                    alt={`${profileData.firstName} ${profileData.lastName}`}
                  />
                      <AvatarFallback className="text-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-semibold">
                    {getInitials(profileData.firstName, profileData.lastName)}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="sm"
                  variant="outline"
                      className="absolute -bottom-1 -right-1 rounded-full w-7 h-7 p-0 bg-white shadow-md hover:shadow-lg transition-all duration-300 hover:scale-110 border-2 border-blue-200"
                >
                      <Camera className="w-3.5 h-3.5 text-blue-600" />
                </Button>
              </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-2xl font-bold text-gray-900">
                    {profileData.firstName} {profileData.lastName}
                      </h2>
                      {profileData.dccLevel && (
                        <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-semibold px-3 py-1">
                    {profileData.dccLevel}
                  </Badge>
                      )}
                      {user?.role && (
                        <Badge variant="outline" className="border-blue-200 text-blue-700 text-xs font-medium px-3 py-1">
                          {user.role}
                        </Badge>
                      )}
                </div>
                    <p className="text-gray-600 text-sm mb-3">{profileData.email}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      {profileData.joinDate && (
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4" />
                          Joined {new Date(profileData.joinDate).toLocaleDateString()}
                        </span>
                      )}
                      {profileData.completedCourses !== undefined && (
                        <span className="flex items-center gap-1.5">
                          <Award className="w-4 h-4" />
                          {profileData.completedCourses} courses completed
                  </span>
                      )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
                <div className="flex items-center gap-3">
              {!isEditing ? (
                <Button
                  onClick={() => setIsEditing(true)}
                      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all duration-300 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl hover:shadow-blue-500/30"
                >
                      <Edit className="h-4 w-4" />
                  Edit Profile
                </Button>
              ) : (
                <>
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                        className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-white/70 px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition-all duration-300 hover:border-blue-300 hover:bg-white hover:shadow-md"
                  >
                        <X className="h-4 w-4" />
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all duration-300 hover:from-emerald-700 hover:to-teal-700 hover:shadow-xl hover:shadow-emerald-500/30 disabled:opacity-50"
                  >
                    {isSaving ? (
                      <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                            <Save className="h-4 w-4" />
                            Save Changes
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Stats Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-blue-100">
            {[
              {
                icon: BookOpen,
                label: "Courses",
                value: (profileData.completedCourses ?? 0).toString(),
                color: "text-blue-600",
                    bg: "bg-gradient-to-br from-blue-500/20 to-blue-600/10",
                    border: "border-blue-200",
              },
              {
                icon: DollarSign,
                label: "Earnings",
                    value: profileData.totalEarnings || "RWF 0",
                    color: "text-emerald-600",
                    bg: "bg-gradient-to-br from-emerald-500/20 to-emerald-600/10",
                    border: "border-emerald-200",
              },
              {
                icon: Target,
                label: "Complete",
                    value: `${profileData.profileCompleteness ?? 0}%`,
                color: "text-purple-600",
                    bg: "bg-gradient-to-br from-purple-500/20 to-purple-600/10",
                    border: "border-purple-200",
              },
              {
                icon: Star,
                label: "Level",
                    value: profileData.dccLevel || "N/A",
                color: "text-orange-600",
                    bg: "bg-gradient-to-br from-orange-500/20 to-orange-600/10",
                    border: "border-orange-200",
              },
            ].map((stat, index) => (
              <div
                key={stat.label}
                    className={`rounded-2xl border ${stat.border} ${stat.bg} p-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}
              >
                    <div className={`inline-flex p-2 rounded-xl ${stat.bg} mb-3`}>
                      <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                    <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Progress Bar */}
              {profileData.profileCompleteness !== undefined && (
                <div className="mt-6 pt-6 border-t border-blue-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700">Profile Completeness</span>
                    <span className="text-sm font-bold text-gray-900">{profileData.profileCompleteness}%</span>
            </div>
                  <Progress value={profileData.profileCompleteness} className="h-2.5 bg-gray-200" />
                  <p className="text-xs text-gray-500 mt-2 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5" />
              Complete your profile to unlock all features
            </p>
          </div>
              )}
            </CardContent>
          </Card>
      </div>

        {/* MCC Information Section */}
        {mccInfo && (
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
            <section>
              <div className="mb-4">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 shadow-sm ring-1 ring-gray-200">
                  <Droplets className="h-3.5 w-3.5 text-blue-600" />
                  <span className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                    MCC Association
                  </span>
      </div>
              </div>
              <Card className="bg-white/90 backdrop-blur-sm border-2 border-blue-100 rounded-3xl shadow-xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-50/50 to-indigo-50/30 border-b border-blue-100 pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-xl">
                        <Building className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                        <CardTitle className="text-xl font-bold text-gray-900">{mccInfo.name}</CardTitle>
                        <CardDescription className="text-sm text-gray-600 mt-1">
                          {mccInfo.location}
                    </CardDescription>
                  </div>
                    </div>
                    {mccInfo.isManager && (
                      <Link href={`/${lang}/dashboard`}>
                        <Button
                          variant="outline"
                          className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-white/70 px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition-all duration-300 hover:border-blue-300 hover:bg-white hover:shadow-md"
                        >
                          <LinkIcon className="h-4 w-4" />
                          Go to Dashboard
                        </Button>
                      </Link>
                    )}
                </div>
              </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {mccInfo.code && (
                      <div className="rounded-xl border border-blue-100 bg-blue-50/40 px-4 py-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Package className="w-4 h-4 text-blue-600" />
                          <span className="text-xs font-semibold text-gray-600 uppercase">Code</span>
                  </div>
                        <p className="text-lg font-bold text-gray-900">{mccInfo.code}</p>
                  </div>
                    )}
                    <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 px-4 py-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-4 h-4 text-indigo-600" />
                        <span className="text-xs font-semibold text-gray-600 uppercase">Role</span>
                </div>
                      <p className="text-lg font-bold text-gray-900">{mccInfo.role}</p>
                  </div>
                    {mccInfo.region && (
                      <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 px-4 py-3">
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="w-4 h-4 text-emerald-600" />
                          <span className="text-xs font-semibold text-gray-600 uppercase">Region</span>
                        </div>
                        <p className="text-lg font-bold text-gray-900">{mccInfo.region}</p>
                  </div>
                    )}
                    {mccInfo.joinDate && (
                      <div className="rounded-xl border border-purple-100 bg-purple-50/40 px-4 py-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="w-4 h-4 text-purple-600" />
                          <span className="text-xs font-semibold text-gray-600 uppercase">Joined</span>
                </div>
                        <p className="text-lg font-bold text-gray-900">
                          {new Date(mccInfo.joinDate).toLocaleDateString()}
                        </p>
                  </div>
                    )}
                  </div>
                  {mccInfo.address && (
                    <div className="mt-4 pt-4 border-t border-blue-100">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                        <div>
                          <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Address</p>
                          <p className="text-sm text-gray-700">{mccInfo.address}</p>
                </div>
                      </div>
                    </div>
                  )}
              </CardContent>
            </Card>
            </section>
          </div>
        )}

        {/* MCC Operations Section */}
        {mccInfo && (
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
            <section>
              <div className="mb-6">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 shadow-sm ring-1 ring-gray-200 mb-4">
                  <Activity className="h-3.5 w-3.5 text-blue-600" />
                  <span className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                    MCC Operations
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Operations Overview</h2>
                <p className="text-sm text-gray-600">
                  Quick access to all MCC management sections
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Products Card */}
                <Link href={`/${lang}/dashboard/products`}>
                  <Card className="bg-white/90 backdrop-blur-sm border-2 border-violet-100 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
                    <CardHeader className="bg-gradient-to-r from-violet-50/50 to-purple-50/30 border-b border-violet-100 pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-gradient-to-br from-violet-500/20 to-purple-500/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                            <Box className="w-6 h-6 text-violet-600" />
                  </div>
                  <div>
                            <CardTitle className="text-lg font-bold text-gray-900">Products</CardTitle>
                    <CardDescription className="text-xs text-gray-600">
                              Manage product catalog
                    </CardDescription>
                  </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-violet-600 group-hover:translate-x-1 transition-all duration-300" />
                </div>
              </CardHeader>
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-3xl font-bold text-gray-900 mb-1">
                            —
                          </p>
                          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                            Product Catalog
                          </p>
                  </div>
                  </div>
                    </CardContent>
                  </Card>
                </Link>

                {/* Inventory Card */}
                <Link href={`/${lang}/dashboard/inventory`}>
                  <Card className="bg-white/90 backdrop-blur-sm border-2 border-cyan-100 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
                    <CardHeader className="bg-gradient-to-r from-cyan-50/50 to-blue-50/30 border-b border-cyan-100 pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                            <Package className="w-6 h-6 text-cyan-600" />
                  </div>
                          <div>
                            <CardTitle className="text-lg font-bold text-gray-900">Inventory</CardTitle>
                            <CardDescription className="text-xs text-gray-600">
                              Stock management & tracking
                            </CardDescription>
                        </div>
                  </div>
                        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-cyan-600 group-hover:translate-x-1 transition-all duration-300" />
                </div>
                    </CardHeader>
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-3xl font-bold text-gray-900 mb-1">
                            —
                          </p>
                          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                            Stock Management
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>

                {/* Purchases/Procurements Card */}
                <Link href={`/${lang}/dashboard/mcc/suppliers`}>
                  <Card className="bg-white/90 backdrop-blur-sm border-2 border-rose-100 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
                    <CardHeader className="bg-gradient-to-r from-rose-50/50 to-pink-50/30 border-b border-rose-100 pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-gradient-to-br from-rose-500/20 to-pink-500/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                            <ShoppingBag className="w-6 h-6 text-rose-600" />
                  </div>
                          <div>
                            <CardTitle className="text-lg font-bold text-gray-900">Purchases</CardTitle>
                            <CardDescription className="text-xs text-gray-600">
                              Procurement & purchase orders
                            </CardDescription>
                          </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-rose-600 group-hover:translate-x-1 transition-all duration-300" />
                      </div>
                    </CardHeader>
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-3xl font-bold text-gray-900 mb-1">
                            —
                          </p>
                          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                            Procurement Orders
                          </p>
                  </div>
                </div>
              </CardContent>
            </Card>
                </Link>

                {/* Customers Card */}
                <Link href={`/${lang}/dashboard/mcc/customers`}>
                  <Card className="bg-white/90 backdrop-blur-sm border-2 border-blue-100 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
                    <CardHeader className="bg-gradient-to-r from-blue-50/50 to-indigo-50/30 border-b border-blue-100 pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                            <ShoppingCart className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                            <CardTitle className="text-lg font-bold text-gray-900">Customers</CardTitle>
                    <CardDescription className="text-xs text-gray-600">
                              Manage customer relationships
                    </CardDescription>
                  </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-300" />
                </div>
              </CardHeader>
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-3xl font-bold text-gray-900 mb-1">
                            {mccStats?.customers ?? '—'}
                          </p>
                          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                            Total Customers
                          </p>
                  </div>
                  </div>
                    </CardContent>
                  </Card>
                </Link>

                {/* Suppliers Card */}
                <Link href={`/${lang}/dashboard/mcc/suppliers`}>
                  <Card className="bg-white/90 backdrop-blur-sm border-2 border-emerald-100 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
                    <CardHeader className="bg-gradient-to-r from-emerald-50/50 to-teal-50/30 border-b border-emerald-100 pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                            <Truck className="w-6 h-6 text-emerald-600" />
                  </div>
                          <div>
                            <CardTitle className="text-lg font-bold text-gray-900">Suppliers</CardTitle>
                            <CardDescription className="text-xs text-gray-600">
                              Manage supplier network
                            </CardDescription>
                  </div>
                </div>
                        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all duration-300" />
                    </div>
                    </CardHeader>
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-3xl font-bold text-gray-900 mb-1">
                            {mccStats?.suppliers ?? '—'}
                          </p>
                          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                            Total Suppliers
                          </p>
                    </div>
                  </div>
                    </CardContent>
                  </Card>
                </Link>

                {/* Collections Card */}
                <Link href={`/${lang}/dashboard/mcc/collections`}>
                  <Card className="bg-white/90 backdrop-blur-sm border-2 border-purple-100 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
                    <CardHeader className="bg-gradient-to-r from-purple-50/50 to-pink-50/30 border-b border-purple-100 pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                            <Droplets className="w-6 h-6 text-purple-600" />
                    </div>
                          <div>
                            <CardTitle className="text-lg font-bold text-gray-900">Collections</CardTitle>
                            <CardDescription className="text-xs text-gray-600">
                              Track milk collections
                            </CardDescription>
                    </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all duration-300" />
                      </div>
                    </CardHeader>
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-3xl font-bold text-gray-900 mb-1">
                            {mccStats?.collections ?? '—'}
                          </p>
                          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                            Today's Collections
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>

                {/* Sales Card */}
                <Link href={`/${lang}/dashboard/mcc/sales`}>
                  <Card className="bg-white/90 backdrop-blur-sm border-2 border-orange-100 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
                    <CardHeader className="bg-gradient-to-r from-orange-50/50 to-amber-50/30 border-b border-orange-100 pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-gradient-to-br from-orange-500/20 to-amber-500/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                            <Receipt className="w-6 h-6 text-orange-600" />
                    </div>
                          <div>
                            <CardTitle className="text-lg font-bold text-gray-900">Sales</CardTitle>
                            <CardDescription className="text-xs text-gray-600">
                              Manage sales transactions
                            </CardDescription>
                  </div>
                    </div>
                        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-orange-600 group-hover:translate-x-1 transition-all duration-300" />
                      </div>
                    </CardHeader>
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between">
                    <div>
                          <p className="text-3xl font-bold text-gray-900 mb-1">
                            {mccStats?.sales ?? '—'}
                          </p>
                          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                            Total Sales
                          </p>
                    </div>
                  </div>
                    </CardContent>
                  </Card>
                </Link>

                {/* Inventory & Rentals Card */}
                <Link href={`/${lang}/dashboard/mcc/inventory-rentals`}>
                  <Card className="bg-white/90 backdrop-blur-sm border-2 border-indigo-100 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
                    <CardHeader className="bg-gradient-to-r from-indigo-50/50 to-blue-50/30 border-b border-indigo-100 pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-gradient-to-br from-indigo-500/20 to-blue-500/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                            <Warehouse className="w-6 h-6 text-indigo-600" />
                          </div>
                          <div>
                            <CardTitle className="text-lg font-bold text-gray-900">Inventory & Rentals</CardTitle>
                            <CardDescription className="text-xs text-gray-600">
                              Manage assets and equipment
                            </CardDescription>
                          </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all duration-300" />
                      </div>
                    </CardHeader>
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-3xl font-bold text-gray-900 mb-1">
                            {mccStats?.inventory ?? '—'}
                          </p>
                          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                            Assets & Equipment
                          </p>
                  </div>
                </div>
              </CardContent>
            </Card>
                </Link>

                {/* Ikofi Card */}
                <Link href={`/${lang}/dashboard/mcc/ikofi`}>
                  <Card className="bg-white/90 backdrop-blur-sm border-2 border-teal-100 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
                    <CardHeader className="bg-gradient-to-r from-teal-50/50 to-cyan-50/30 border-b border-teal-100 pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-gradient-to-br from-teal-500/20 to-cyan-500/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                            <Wallet className="w-6 h-6 text-teal-600" />
                  </div>
                  <div>
                            <CardTitle className="text-lg font-bold text-gray-900">Ikofi</CardTitle>
                    <CardDescription className="text-xs text-gray-600">
                              Financial services & payments
                    </CardDescription>
                  </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-teal-600 group-hover:translate-x-1 transition-all duration-300" />
                </div>
              </CardHeader>
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-3xl font-bold text-gray-900 mb-1">
                            —
                          </p>
                          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                            Financial Services
                          </p>
                  </div>
                  </div>
                    </CardContent>
                  </Card>
                </Link>
                </div>
            </section>
          </div>
        )}

        {/* MCC Profile Section */}
        {mccInfo && (
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
            <section>
              <div className="mb-6">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 shadow-sm ring-1 ring-gray-200 mb-4">
                  <User className="h-3.5 w-3.5 text-blue-600" />
                  <span className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                    MCC Profile
                  </span>
                  </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">MCC Profile Information</h2>
                <p className="text-sm text-gray-600">
                  Your MCC-related profile details and information
                </p>
                      </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* MCC Details Card */}
                <Card className="bg-white/90 backdrop-blur-sm border-2 border-blue-100 rounded-3xl shadow-xl overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-blue-50/50 to-indigo-50/30 border-b border-blue-100 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-xl">
                        <Building className="w-6 h-6 text-blue-600" />
                  </div>
                      <div>
                        <CardTitle className="text-xl font-bold text-gray-900">MCC Details</CardTitle>
                        <CardDescription className="text-sm text-gray-600 mt-1">
                          Basic MCC information
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 space-y-5">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between pb-4 border-b border-blue-100">
                        <div className="flex items-center gap-3">
                          <Package className="w-5 h-5 text-blue-600" />
                          <div>
                            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">MCC Code</p>
                            <p className="text-lg font-bold text-gray-900">{mccInfo.code || 'N/A'}</p>
                          </div>
                  </div>
                </div>

                      <div className="flex items-start justify-between pb-4 border-b border-blue-100">
                        <div className="flex items-center gap-3">
                          <MapPin className="w-5 h-5 text-emerald-600" />
                          <div>
                            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Location</p>
                            <p className="text-lg font-bold text-gray-900">{mccInfo.location}</p>
                  </div>
                      </div>
                  </div>

                      {mccInfo.region && (
                        <div className="flex items-start justify-between pb-4 border-b border-blue-100">
                          <div className="flex items-center gap-3">
                            <Globe className="w-5 h-5 text-indigo-600" />
                            <div>
                              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Region</p>
                              <p className="text-lg font-bold text-gray-900">{mccInfo.region}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {mccInfo.address && (
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <MapPin className="w-5 h-5 text-purple-600 mt-0.5" />
                            <div>
                              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Address</p>
                              <p className="text-sm text-gray-700">{mccInfo.address}</p>
                            </div>
                          </div>
                        </div>
                      )}
                </div>
              </CardContent>
            </Card>

                {/* Role & Access Card */}
                <Card className="bg-white/90 backdrop-blur-sm border-2 border-indigo-100 rounded-3xl shadow-xl overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-indigo-50/50 to-purple-50/30 border-b border-indigo-100 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-xl">
                        <Users className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                        <CardTitle className="text-xl font-bold text-gray-900">Role & Access</CardTitle>
                        <CardDescription className="text-sm text-gray-600 mt-1">
                          Your role and permissions
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
                  <CardContent className="p-6 space-y-5">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between pb-4 border-b border-indigo-100">
                        <div className="flex items-center gap-3">
                          <Award className="w-5 h-5 text-indigo-600" />
                          <div>
                            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Role</p>
                            <Badge className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold px-3 py-1.5">
                              {mccInfo.role}
                            </Badge>
                    </div>
                    </div>
                </div>

                      {mccInfo.isManager && (
                        <div className="flex items-start justify-between pb-4 border-b border-indigo-100">
                          <div className="flex items-center gap-3">
                            <Star className="w-5 h-5 text-amber-600" />
                            <div>
                              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Manager Status</p>
                              <p className="text-lg font-bold text-gray-900">Active Manager</p>
                    </div>
                          </div>
                        </div>
                      )}

                      {mccInfo.joinDate && (
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <Calendar className="w-5 h-5 text-teal-600" />
                            <div>
                              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Joined Date</p>
                              <p className="text-lg font-bold text-gray-900">
                                {new Date(mccInfo.joinDate).toLocaleDateString('en-US', { 
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric' 
                                })}
                              </p>
                          </div>
                      </div>
                        </div>
                      )}
                    </div>

                    {mccInfo.isManager && (
                      <div className="mt-6 pt-6 border-t border-indigo-100">
                        <Link href={`/${lang}/dashboard`}>
                          <Button className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all duration-300 hover:from-indigo-700 hover:to-purple-700 hover:shadow-xl hover:shadow-indigo-500/30">
                            <LinkIcon className="h-4 w-4" />
                            Go to MCC Dashboard
                          </Button>
                        </Link>
                  </div>
                )}
              </CardContent>
            </Card>

                {/* Statistics Overview Card */}
                {mccStats && (
                  <Card className="bg-white/90 backdrop-blur-sm border-2 border-emerald-100 rounded-3xl shadow-xl overflow-hidden lg:col-span-2">
                    <CardHeader className="bg-gradient-to-r from-emerald-50/50 to-teal-50/30 border-b border-emerald-100 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-xl">
                          <TrendingUp className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                          <CardTitle className="text-xl font-bold text-gray-900">Statistics Overview</CardTitle>
                          <CardDescription className="text-sm text-gray-600 mt-1">
                            Key metrics and statistics
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
                    <CardContent className="p-6">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="rounded-xl border border-blue-100 bg-blue-50/40 px-4 py-4">
                          <div className="flex items-center gap-2 mb-2">
                            <ShoppingCart className="w-4 h-4 text-blue-600" />
                            <span className="text-xs font-semibold text-gray-600 uppercase">Customers</span>
                </div>
                          <p className="text-2xl font-bold text-gray-900">{mccStats.customers}</p>
                          <p className="text-xs text-gray-500 mt-1">Total registered</p>
                </div>

                        <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 px-4 py-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Truck className="w-4 h-4 text-emerald-600" />
                            <span className="text-xs font-semibold text-gray-600 uppercase">Suppliers</span>
                          </div>
                          <p className="text-2xl font-bold text-gray-900">{mccStats.suppliers}</p>
                          <p className="text-xs text-gray-500 mt-1">Active suppliers</p>
                </div>

                        <div className="rounded-xl border border-purple-100 bg-purple-50/40 px-4 py-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Droplets className="w-4 h-4 text-purple-600" />
                            <span className="text-xs font-semibold text-gray-600 uppercase">Collections</span>
                  </div>
                          <p className="text-2xl font-bold text-gray-900">{mccStats.collections}</p>
                          <p className="text-xs text-gray-500 mt-1">Today's count</p>
                      </div>

                        <div className="rounded-xl border border-orange-100 bg-orange-50/40 px-4 py-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Receipt className="w-4 h-4 text-orange-600" />
                            <span className="text-xs font-semibold text-gray-600 uppercase">Sales</span>
                          </div>
                          <p className="text-2xl font-bold text-gray-900">{mccStats.sales}</p>
                          <p className="text-xs text-gray-500 mt-1">Total transactions</p>
                  </div>
                </div>
              </CardContent>
            </Card>
                )}
              </div>
            </section>
          </div>
        )}
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
