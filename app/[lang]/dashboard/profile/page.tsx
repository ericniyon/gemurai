"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Phone, Edit, Save, X, Calendar, Star, Target, BookOpen, DollarSign, Package, Building, Link as LinkIcon } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { ClientOnly } from "@/components/client-only"
import { hasPermission } from "@/lib/auth"
import { type AuthUser } from "@/lib/token"

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

/** Build empty profile for initial/loading state */
function emptyProfileData(): ProfileData {
  return {
    id: "",
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "",
    nationalId: "",
    maritalStatus: "",
    email: "",
    phone: "",
    alternatePhone: "",
    preferredContact: "phone",
    province: "",
    district: "",
    sector: "",
    cell: "",
    village: "",
    streetAddress: "",
    educationLevel: "",
    fieldOfStudy: "",
    languages: [],
    computerSkills: [],
    hasWorkExperience: false,
    currentEmployment: "",
    previousJobs: "",
    motivation: "",
    goals: "",
    availability: "",
    productPreferences: [],
    profilePhoto: undefined,
    dccLevel: undefined,
    totalEarnings: "RWF 0",
    completedCourses: 0,
    profileCompleteness: 0,
    joinDate: undefined,
    skills: [],
    incomeGoals: [],
    learningTrainings: [],
    locationPreferences: [],
    otherSkills: "",
    otherPreviousRole: "",
  }
}

/** Map API profile response to ProfileData and compute completeness */
function apiDataToProfileData(data: {
  id: string
  name: string
  email: string
  phone?: string | null
  avatar?: string | null
  nationalId?: string
  gender?: string
  district?: string
  createdAt?: string
  dccLevel?: string | null
  totalSales?: string
  monthlySales?: string
  productsAvailable?: number
}): ProfileData {
  const parts = (data.name || "").trim().split(/\s+/)
  const firstName = parts[0] ?? ""
  const lastName = parts.slice(1).join(" ") ?? ""
  const filled = [
    data.name,
    data.email,
    data.phone,
    data.nationalId,
    data.gender,
    data.district,
  ].filter(Boolean).length
  const profileCompleteness = Math.min(100, Math.round((filled / 6) * 100))
  return {
    ...emptyProfileData(),
    id: data.id,
    firstName,
    lastName,
    email: data.email ?? "",
    phone: data.phone ?? "",
    nationalId: data.nationalId ?? "",
    gender: data.gender ?? "",
    district: data.district ?? "",
    profilePhoto: data.avatar ?? undefined,
    joinDate: data.createdAt,
    dccLevel: data.dccLevel ?? undefined,
    totalEarnings: data.totalSales ?? "RWF 0",
    completedCourses: 0,
    profileCompleteness,
  }
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

const TOKEN_KEY = "Gemurai_token"

function ProfileContent({ lang }: { lang: string }) {
  const { user } = useAuth()
  const [profileData, setProfileData] = useState<ProfileData>(() => emptyProfileData())
  const [profileLoading, setProfileLoading] = useState(true)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const lastFetchedProfileRef = useRef<ProfileData | null>(null)
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

  // Fetch profile and MCC information
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null

    const fetchProfileAndMcc = async () => {
      if (!user) {
        setProfileLoading(false)
        setLoadingMcc(false)
        return
      }

      try {
        const response = await fetch("/api/v1/users/profile", {
          headers: { Authorization: `Bearer ${token}` },
        })
        const result = await response.json().catch(() => ({ success: false }))
        const data = result.data

        if (response.ok && data) {
          const mapped = apiDataToProfileData({
            id: data.id,
            name: data.name,
            email: data.email,
            phone: data.phone,
            avatar: data.avatar,
            nationalId: data.nationalId,
            gender: data.gender,
            district: data.district,
            createdAt: data.createdAt,
            dccLevel: data.dccLevel,
            totalSales: data.totalSales,
            monthlySales: data.monthlySales,
            productsAvailable: data.productsAvailable,
          })
          setProfileData(mapped)
          lastFetchedProfileRef.current = mapped
          setProfileError(null)
        } else {
          setProfileError("Failed to load profile")
        }

        // MCC: use same parsed data
        if (data?.mccId || user.role === "MCC_MANAGER") {
          const mccResponse = await fetch(
            `/api/v1/mcc/${data?.mccId || user.mccId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          )

          if (mccResponse.ok) {
            const mccData = await mccResponse.json()
            setMccInfo({
              id: mccData.id || data?.mccId || "",
              name: mccData.name || "Unknown MCC",
              code: mccData.code,
              location: mccData.location || "",
              region: mccData.region,
              address: mccData.address,
              role: user.role === "MCC_MANAGER" ? "Manager" : "Staff",
              isManager: user.role === "MCC_MANAGER",
              joinDate: data?.createdAt,
            })

            const mccId = mccData.id || data?.mccId
            if (mccId) {
              try {
                const dashboardResponse = await fetch(`/api/v1/mcc/dashboard?mccId=${mccId}`, {
                  headers: { Authorization: `Bearer ${token}` },
                })

                if (dashboardResponse.ok) {
                  const dashboardData = await dashboardResponse.json()
                  const customersResponse = await fetch(`/api/v1/mcc/customers?mccId=${mccId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                  })
                  const customersData = customersResponse.ok ? await customersResponse.json() : { meta: { total: 0 } }

                  let suppliersCount = 0
                  try {
                    const suppliersResponse = await fetch(`/api/v1/mcc/suppliers?mccId=${mccId}`, {
                      headers: { Authorization: `Bearer ${token}` },
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
                console.error("Error fetching MCC stats:", error)
              }
            }
          }
        }
      } catch (error) {
        console.error("Error fetching profile / MCC:", error)
        setProfileError("Failed to load profile")
      } finally {
        setProfileLoading(false)
        setLoadingMcc(false)
      }
    }

    fetchProfileAndMcc()
  }, [user, retryCount])

  const updateProfileData = (field: keyof ProfileData, value: any) => {
    setProfileData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    const token = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null
    try {
      const name = [profileData.firstName, profileData.lastName].filter(Boolean).join(" ") || profileData.firstName || profileData.lastName
      const res = await fetch("/api/v1/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name || undefined,
          email: profileData.email || undefined,
          phone: profileData.phone || undefined,
          avatar: profileData.profilePhoto || undefined,
          nationalId: profileData.nationalId || undefined,
          gender: profileData.gender || undefined,
          district: profileData.district || undefined,
        }),
      })
      const result = await res.json().catch(() => ({}))
      if (res.ok && result.data) {
        const mapped = apiDataToProfileData({
          id: result.data.id,
          name: result.data.name,
          email: result.data.email,
          phone: result.data.phone,
          avatar: result.data.avatar,
          nationalId: result.data.nationalId,
          gender: result.data.gender,
          district: result.data.district,
          createdAt: result.data.createdAt ?? result.data.updatedAt,
          dccLevel: result.data.dccLevel,
          totalSales: result.data.totalSales,
          monthlySales: result.data.monthlySales,
          productsAvailable: result.data.productsAvailable,
        })
        setProfileData(mapped)
        lastFetchedProfileRef.current = mapped
        toast({
          title: "Profile Updated",
          description: "Your changes have been saved successfully.",
        })
        setIsEditing(false)
        setEditingSection(null)
      } else {
        toast({
          title: "Update Failed",
          description: result.message || "Failed to update profile. Please try again.",
          variant: "destructive",
        })
      }
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
    if (lastFetchedProfileRef.current) {
      setProfileData(lastFetchedProfileRef.current)
    }
    setIsEditing(false)
    setEditingSection(null)
  }

  const getInitials = (firstName: string, lastName: string) => {
    if (!firstName && !lastName) return "?"
    return `${(firstName || " ")[0]}${(lastName || " ")[0]}`.toUpperCase().replace(" ", "?")
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50/40">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-gray-600">Please sign in to view your profile.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50/40">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (profileError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50/40">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-red-600 mb-4">{profileError}</p>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setProfileError(null)
                setProfileLoading(true)
                setRetryCount((c) => c + 1)
              }}
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const displayName = [profileData.firstName, profileData.lastName].filter(Boolean).join(" ") || "Profile"
  const stats = [
    { icon: BookOpen, label: "Courses", value: String(profileData.completedCourses ?? 0), color: "text-blue-600" },
    { icon: DollarSign, label: "Earnings", value: profileData.totalEarnings || "RWF 0", color: "text-emerald-600" },
    { icon: Target, label: "Complete", value: `${profileData.profileCompleteness ?? 0}%`, color: "text-violet-600" },
    { icon: Star, label: "Level", value: profileData.dccLevel || "—", color: "text-amber-600" },
  ]

  return (
    <div className="min-h-screen bg-slate-50/80">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Profile</h1>
          <p className="text-slate-600 mt-1">Your account and personal information</p>
        </div>

        {/* Profile hero card */}
        <Card className="mb-6 border-slate-200/80 shadow-sm overflow-hidden">
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-start gap-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20 rounded-2xl border-2 border-slate-100 shadow-inner">
                  <AvatarImage src={profileData.profilePhoto || undefined} alt={displayName} />
                  <AvatarFallback className="rounded-2xl bg-slate-200 text-slate-700 text-xl font-semibold">
                    {getInitials(profileData.firstName, profileData.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{displayName}</h2>
                  <div className="flex flex-wrap gap-2 mt-1.5">
                    {user?.role && (
                      <Badge variant="secondary" className="font-medium text-slate-700">
                        {user.role}
                      </Badge>
                    )}
                    {profileData.dccLevel && (
                      <Badge className="bg-blue-600/10 text-blue-700 border-0">{profileData.dccLevel}</Badge>
                    )}
                  </div>
                  {profileData.email && (
                    <p className="text-sm text-slate-500 mt-2">{profileData.email}</p>
                  )}
                  {profileData.phone && (
                    <p className="text-sm text-slate-500 flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5" />
                      {profileData.phone}
                    </p>
                  )}
                  {profileData.joinDate && (
                    <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      Joined {new Date(profileData.joinDate).toLocaleDateString("en-US", { month: "short", year: "numeric", day: "numeric" })}
                    </p>
                  )}
                </div>
              </div>
              <div className="sm:ml-auto flex items-center gap-2">
                {!isEditing ? (
                  canEdit && (
                    <Button onClick={() => setIsEditing(true)} size="sm" className="gap-2">
                      <Edit className="h-4 w-4" />
                      Edit profile
                    </Button>
                  )
                ) : (
                  <>
                    <Button variant="outline" size="sm" onClick={handleCancel} className="gap-2">
                      <X className="h-4 w-4" />
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleSave} disabled={isSaving} className="gap-2">
                      {isSaving ? (
                        <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      Save
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100">
              {stats.map(({ icon: Icon, label, value, color }) => (
                <div key={label} className="rounded-xl bg-slate-50/80 px-4 py-3">
                  <Icon className={`h-4 w-4 ${color} mb-1.5`} />
                  <p className="text-lg font-semibold text-slate-900">{value}</p>
                  <p className="text-xs text-slate-500">{label}</p>
                </div>
              ))}
            </div>

            {/* Completeness */}
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-slate-600">Profile completeness</span>
                <span className="font-medium text-slate-900">{profileData.profileCompleteness ?? 0}%</span>
              </div>
              <Progress value={profileData.profileCompleteness ?? 0} className="h-2 bg-slate-100" />
            </div>
          </CardContent>
        </Card>

        {/* Personal information */}
        <Card className="mb-6 border-slate-200/80 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Personal information</CardTitle>
            <CardDescription>Details used for your account and communications.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First name</Label>
                    <Input
                      id="firstName"
                      value={profileData.firstName}
                      onChange={(e) => updateProfileData("firstName", e.target.value)}
                      placeholder="First name"
                      className="bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last name</Label>
                    <Input
                      id="lastName"
                      value={profileData.lastName}
                      onChange={(e) => updateProfileData("lastName", e.target.value)}
                      placeholder="Last name"
                      className="bg-white"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => updateProfileData("email", e.target.value)}
                    placeholder="you@example.com"
                    className="bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => updateProfileData("phone", e.target.value)}
                    placeholder="+250 ..."
                    className="bg-white"
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nationalId">National ID</Label>
                    <Input
                      id="nationalId"
                      value={profileData.nationalId}
                      onChange={(e) => updateProfileData("nationalId", e.target.value)}
                      placeholder="National ID"
                      className="bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select
                      value={profileData.gender || "none"}
                      onValueChange={(v) => updateProfileData("gender", v === "none" ? "" : v)}
                    >
                      <SelectTrigger id="gender" className="bg-white">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">—</SelectItem>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="district">District</Label>
                  <Input
                    id="district"
                    value={profileData.district}
                    onChange={(e) => updateProfileData("district", e.target.value)}
                    placeholder="District"
                    className="bg-white"
                  />
                </div>
              </>
            ) : (
              <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                <div>
                  <dt className="text-slate-500 font-medium">Name</dt>
                  <dd className="text-slate-900 mt-0.5">{displayName || "—"}</dd>
                </div>
                <div>
                  <dt className="text-slate-500 font-medium">Email</dt>
                  <dd className="text-slate-900 mt-0.5">{profileData.email || "—"}</dd>
                </div>
                <div>
                  <dt className="text-slate-500 font-medium">Phone</dt>
                  <dd className="text-slate-900 mt-0.5">{profileData.phone || "—"}</dd>
                </div>
                <div>
                  <dt className="text-slate-500 font-medium">National ID</dt>
                  <dd className="text-slate-900 mt-0.5">{profileData.nationalId || "—"}</dd>
                </div>
                <div>
                  <dt className="text-slate-500 font-medium">Gender</dt>
                  <dd className="text-slate-900 mt-0.5 capitalize">{profileData.gender || "—"}</dd>
                </div>
                <div>
                  <dt className="text-slate-500 font-medium">District</dt>
                  <dd className="text-slate-900 mt-0.5">{profileData.district || "—"}</dd>
                </div>
              </dl>
            )}
          </CardContent>
        </Card>

        {/* MCC card (when linked) */}
        {mccInfo && (
          <Card className="mb-6 border-slate-200/80 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-50">
                    <Building className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-semibold">{mccInfo.name}</CardTitle>
                    <CardDescription className="text-sm">{mccInfo.location}{mccInfo.code ? ` · ${mccInfo.code}` : ""}</CardDescription>
                  </div>
                </div>
                {mccInfo.isManager && (
                  <Link href={`/${lang}/dashboard`}>
                    <Button size="sm" className="gap-2">
                      <LinkIcon className="h-4 w-4" />
                      Dashboard
                    </Button>
                  </Link>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-4 text-sm">
                <span className="text-slate-600">Role: <strong className="text-slate-900">{mccInfo.role}</strong></span>
                {mccInfo.joinDate && (
                  <span className="text-slate-600">
                    Joined: <strong className="text-slate-900">{new Date(mccInfo.joinDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</strong>
                  </span>
                )}
              </div>
              {mccStats && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100">
                  <div>
                    <p className="text-xs text-slate-500">Customers</p>
                    <p className="text-lg font-semibold text-slate-900">{mccStats.customers}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Suppliers</p>
                    <p className="text-lg font-semibold text-slate-900">{mccStats.suppliers}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Collections</p>
                    <p className="text-lg font-semibold text-slate-900">{mccStats.collections}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Sales</p>
                    <p className="text-lg font-semibold text-slate-900">{mccStats.sales}</p>
                  </div>
                </div>
              )}
              <div className="flex flex-wrap gap-2 pt-2">
                <Link href={`/${lang}/dashboard/products`}>
                  <Button variant="outline" size="sm">Products</Button>
                </Link>
                <Link href={`/${lang}/dashboard/mcc/customers`}>
                  <Button variant="outline" size="sm">Customers</Button>
                </Link>
                <Link href={`/${lang}/dashboard/mcc/sales`}>
                  <Button variant="outline" size="sm">Sales</Button>
                </Link>
                <Link href={`/${lang}/dashboard/inventory`}>
                  <Button variant="outline" size="sm">Inventory</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
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
